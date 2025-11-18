const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const computeDiscountFields = [
  {
    $addFields: {
      discountPercent: {
        $cond: [
          { $gt: ['$regularPrice', 0] },
          {
            $round: [
              {
                $multiply: [
                  {
                    $subtract: [
                      1,
                      {
                        $divide: ['$discountPrice', '$regularPrice'],
                      },
                    ],
                  },
                  100,
                ],
              },
              0,
            ],
          },
          0,
        ],
      },
    },
  },
];

// GET /api/products - Get all products with super deals prioritized
router.get('/', async (req, res) => {
  try {
    const products = await Product.aggregate([
      ...computeDiscountFields,
      { $sort: { isSuperDeal: -1, discountPercent: -1, createdAt: -1 } },
    ]);
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// GET /api/products/deals - Get current super deals
router.get('/deals', async (req, res) => {
  const now = new Date();
  try {
    const deals = await Product.aggregate([
      {
        $match: {
          isSuperDeal: true,
          $and: [
            {
              $or: [
                { dealStart: { $exists: false } },
                { dealStart: null },
                { dealStart: { $lte: now } },
              ],
            },
            {
              $or: [
                { dealEnd: { $exists: false } },
                { dealEnd: null },
                { dealEnd: { $gt: now } },
              ],
            },
          ],
        },
      },
      ...computeDiscountFields,
      { $sort: { discountPercent: -1, createdAt: -1 } },
      { $limit: 10 },
    ]);

    res.json(deals);
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ message: 'Failed to fetch deals' });
  }
});

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/products/:id - Get a single product by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
});

// Allow JSON-only requests to skip Multer so the existing JSON API shape keeps working
const maybeUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return upload.single('image')(req, res, next);
  }
  return next();
};

// POST /api/products - Create a new product
router.post('/', auth, maybeUpload, async (req, res) => {
  const { name, description, category, isSuperDeal, dealStart, dealEnd, stock } = req.body;
  const regularPrice =
    typeof req.body.regularPrice !== 'undefined' ? Number(req.body.regularPrice) : undefined;
  const discountPrice =
    typeof req.body.discountPrice !== 'undefined' ? Number(req.body.discountPrice) : undefined;

  if (
    !name ||
    typeof regularPrice === 'undefined' ||
    Number.isNaN(regularPrice) ||
    typeof discountPrice === 'undefined' ||
    Number.isNaN(discountPrice)
  ) {
    return res.status(400).json({ message: 'Name, regular price and discount price are required' });
  }

  if (discountPrice >= regularPrice) {
    return res
      .status(400)
      .json({ message: 'Discount price must be lower than regular price' });
  }

  try {
    const imageUrl = req.file?.path || req.body.imageUrl;
    const product = new Product({
      name,
      description,
      category,
      regularPrice,
      discountPrice,
      isSuperDeal: isSuperDeal === 'true' || isSuperDeal === true,
      dealStart: dealStart ? new Date(dealStart) : undefined,
      dealEnd: dealEnd ? new Date(dealEnd) : undefined,
      stock: typeof stock !== 'undefined' ? Number(stock) : undefined,
      imageUrl,
    });

    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
});

// PUT /api/products/:id - Update a product
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }
  const update = { ...req.body };
  if (typeof update.regularPrice !== 'undefined') {
    const priceNumber = Number(update.regularPrice);
    if (Number.isNaN(priceNumber)) {
      return res.status(400).json({ message: 'Regular price must be a number' });
    }
    update.regularPrice = priceNumber;
  }

  if (typeof update.discountPrice !== 'undefined') {
    const discountNumber = Number(update.discountPrice);
    if (Number.isNaN(discountNumber)) {
      return res.status(400).json({ message: 'Discount price must be a number' });
    }
    update.discountPrice = discountNumber;
  }

  if (typeof update.stock !== 'undefined') {
    const stockNumber = Number(update.stock);
    if (Number.isNaN(stockNumber)) {
      return res.status(400).json({ message: 'Stock must be a number' });
    }
    update.stock = stockNumber;
  }

  if (typeof update.isSuperDeal !== 'undefined') {
    update.isSuperDeal = update.isSuperDeal === 'true' || update.isSuperDeal === true;
  }

  if (update.dealStart) {
    update.dealStart = new Date(update.dealStart);
  }

  if (update.dealEnd) {
    update.dealEnd = new Date(update.dealEnd);
  }

  try {
    const existing = await Product.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const targetRegularPrice =
      typeof update.regularPrice !== 'undefined' ? update.regularPrice : existing.regularPrice;
    const targetDiscountPrice =
      typeof update.discountPrice !== 'undefined'
        ? update.discountPrice
        : existing.discountPrice;

    if (targetRegularPrice <= 0 || targetDiscountPrice >= targetRegularPrice) {
      return res
        .status(400)
        .json({ message: 'Discount price must be lower than regular price' });
    }

    Object.assign(existing, update);
    const updatedProduct = await existing.save();

    res.json(updatedProduct);
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// DELETE /api/products/:id - Delete a product
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return res.status(400).json({ message: 'Invalid product ID' });
  }
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

module.exports = router;
