const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  partNumber: { type: String, required: true, unique: true },
  specification: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  price: {
    type: {
      min: { type: Number, required: true },
      max: { type: Number, required: true }
    },
    required: true
  },
  imageURL: { type: String }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
