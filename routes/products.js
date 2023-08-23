const router = require('express').Router();
const Product = require('../models/Product');
const Search = require('../models/Search');

router.get('/random', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit);
    
    if(!limit) {
      limit = 10;
    }

    // Check if limit is a valid number
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ message: 'Invalid limit parameter.' });
    }

    const products = await Product.aggregate([
      { $sample: {size: limit} }, // Use the parsed limit value
      {
        $project: {
          _id: 1,
          name: 1,
          category: 1,
          price: 1,
          imageURL: 1
        }
      }
    ]);

    if (!products.length) {
      return res.status(200).json({ message: 'No products found.' });
    }

    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching products.' });
  }
});

router.get('/recent', async (req, res) => {
  try {
    let limit = parseInt(req.query.limit);
    
    if (!limit) {
      limit = 10;
    }

    // Check if limit is a valid number
    if (isNaN(limit) || limit <= 0) {
      return res.status(400).json({ message: 'Invalid limit parameter.' });
    }

    const products = await Product.find()
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order for recent products
      .limit(limit);

    if (!products.length) {
      return res.status(200).json({ message: 'No products found.' });
    }

    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching products.' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const productID = req.params.id;
    const searchId = req.query.search_id;

    if (!productID) {
      return res.status(401).json({ message: 'No product ID sent!' });
    }

    const product = await Product.findById(productID);

    if (!product) {
      return res.status(200).json({ message: 'No product found with that ID!' });
    }

    if (searchId) {
      const search = await Search.findById(searchId);

      if (search) {
        search.visitedProductId = productID;
        await search.save();
      }
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the product.' });
  }
});


module.exports = router