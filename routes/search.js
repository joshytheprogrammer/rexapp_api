const router = require('express').Router();
const Product = require('../models/Product');
const Category = require('../models/Category');
const Search = require('../models/Search');
const { splitQueryIntoKeywords, calculateScore, getClickedItems, sortByPopularity, filterUniqueItems } = require('../utils/searchUtils');

router.get('/exec', async (req, res) => {
  const searchQuery = req.query.q; // Get the search query from the query parameter

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  if (searchQuery.length < 3) {
    return res.status(400).json({ message: 'Search query must be greater than three characters.' });
  }

  const keywords = splitQueryIntoKeywords(searchQuery);

  const matchingProducts = await Product.find({
    $or: keywords.map(keyword => ({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { manufacturer: { $regex: keyword, $options: 'i' } },
        { imageURL: { $regex: keyword, $options: 'i' } },
        { partNumber: { $regex: keyword, $options: 'i' } },
        { specification: { $regex: keyword, $options: 'i' } }
      ]
    }))
  });

  const matchingCategories = await Category.find({
    $or: keywords.map(keyword => ({
      $or: [
        { name: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { imageURL: { $regex: keyword, $options: 'i' } },
      ]
    }))
  });
  // Calculate scores for products and categories
  const productsWithScore = matchingProducts.map(product => ({
    product,
    score: calculateScore(
      [product.name, product.description, product.partNumber, product.specification, product.imageURL],
      keywords
    )
  }));
  
  const categoriesWithScore = matchingCategories.map(category => ({
    category,
    score: calculateScore(
      [category.name, category.description, category.imageURL],
      keywords
    )
  }));

  // Sort products and categories by score in descending order
  const sortedProducts = productsWithScore.sort((a, b) => b.score - a.score);
  
  const sortedCategories = categoriesWithScore.sort((a, b) => b.score - a.score);

  const userId = req.user ? req.user.id : null; // Assuming you have userId available from validateToken middleware
  const search = new Search({
    searchTerm: searchQuery,
    userId,
    visitedProductId: null,
    visitedCategoryId: null
  });

  await search.save();
  
  const similarSearches = await Search.find({
    searchTerm: searchQuery 
  });

  const clickedProducts = await getClickedItems(similarSearches, Product);
  // console.log({clickedProducts: clickedProducts})

  const clickedCategories = await getClickedItems(similarSearches, Category);

  // Merge clicked products/categories with sorted products/categories
  const mergedProducts = [...clickedProducts, ...sortedProducts.map(item => item.product)];
  
  const mergedCategories = [...clickedCategories, ...sortedCategories.map(item => item.category)];

  // Create frequency maps
  const productFrequencyMap = new Map();
  const categoryFrequencyMap = new Map();

  mergedProducts.forEach(product => {
    const productId = product._id.toString();
    if (productFrequencyMap.has(productId)) {
      productFrequencyMap.set(productId, productFrequencyMap.get(productId) + 1);
    } else {
      productFrequencyMap.set(productId, 1);
    }
  });

  mergedCategories.forEach(category => {
    const categoryId = category._id.toString();
    if (categoryFrequencyMap.has(categoryId)) {
      categoryFrequencyMap.set(categoryId, categoryFrequencyMap.get(categoryId) + 1);
    } else {
      categoryFrequencyMap.set(categoryId, 1);
    }
  });

  // Sort merged products and categories by popularity
  const sortedMergedProducts = sortByPopularity(mergedProducts, productFrequencyMap);
  const sortedMergedCategories = sortByPopularity(mergedCategories, categoryFrequencyMap);

  // Filter merged products and categories for uniqueness
  const uniqueMergedProducts = filterUniqueItems(sortedMergedProducts);
  const uniqueMergedCategories = filterUniqueItems(sortedMergedCategories);

  return res.status(200).json({
    searchId: search._id,
    products: uniqueMergedProducts,
    categories: uniqueMergedCategories
  });
});

module.exports = router;
