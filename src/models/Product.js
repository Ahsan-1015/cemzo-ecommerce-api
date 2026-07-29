const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Product title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      index: true
    },
    image: {
      type: String,
      required: [true, 'Product image URL is required'],
      trim: true
    },
    sku: {
      type: String,
      required: [true, 'Product SKU is required'],
      trim: true,
      uppercase: true
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price must be greater than or equal to 0']
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    reservedStock: {
      type: Number,
      min: [0, 'Reserved stock cannot be negative'],
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      }
    }
  }
);

// Virtual property for available stock
productSchema.virtual('availableStock').get(function () {
  return Math.max(0, this.stock - this.reservedStock);
});

// Enable virtuals in JSON outputs
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Text index for search functionality across title, description, category, and sku
productSchema.index({ title: 'text', description: 'text', category: 'text', sku: 'text' });

// Partial unique index for SKU (enforces uniqueness only among non-deleted products)
productSchema.index({ sku: 1 }, { unique: true, partialFilterExpression: { isDeleted: false } });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
