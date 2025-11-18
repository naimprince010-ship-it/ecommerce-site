const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// helper: valid ObjectId চেক
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// GET /api/products - Get all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

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
  const { name, description, category } = req.body;
  const price =
    typeof req.body.price !== 'undefined' ? Number(req.body.price) : undefined;

  if (!name || typeof price === 'undefined' || Number.isNaN(price)) {
    return res.status(400).json({ message: 'Name and numeric price are required' });
  }

  try {
    const imageUrl = req.file?.path || req.body.imageUrl;

    const product = new Product({ name, price, description, imageUrl, category });
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
  if (typeof update.price !== 'undefined') {
    const priceNumber = Number(update.price);
    if (Number.isNaN(priceNumber)) {
      return res.status(400).json({ message: 'Price must be a number' });
    }
    update.price = priceNumber;
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

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
