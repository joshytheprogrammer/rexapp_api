const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true }],
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  partNumber: { type: String, required: true, unique: true },
  specification: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  imageURL: { type: String }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
