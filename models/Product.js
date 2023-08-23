const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  manufacturer: { type: String, required: true },
  description: { type: String, required: true },
  partNumber: { type: String, required: true, unique: true }, // Make partNumber unique
  specification: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true }, // How many items are left.
  imageURL: { type: String }
});

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
