const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
    },
    regularPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    discountPrice: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value) {
          return typeof this.regularPrice !== 'number' || value < this.regularPrice;
        },
        message: 'Discount price must be lower than regular price',
      },
    },
    isSuperDeal: {
      type: Boolean,
      default: false,
    },
    dealStart: {
      type: Date,
    },
    dealEnd: {
      type: Date,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    imageUrl: {
      type: String,
    },
    category: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!this.regularPrice || this.regularPrice <= 0) return 0;
  const percent = ((this.regularPrice - this.discountPrice) / this.regularPrice) * 100;
  return Math.round(percent);
});

module.exports = mongoose.model('Product', productSchema);
