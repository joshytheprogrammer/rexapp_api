const mongoose = require('mongoose');

const searchSchema = new mongoose.Schema({
  searchTerm: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
  visitedProductId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Reference to Product model
  visitedCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // Reference to Category model
  createdAt: { type: Date, default: Date.now }
});

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;
