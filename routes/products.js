const router = require('express').Router();
const Product = require('../models/Product');
const mongoose = require('mongoose');
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

    let aggregationPipeline = [
      { $sample: {size: limit} } // Use the parsed limit value
    ];

    if (req.query.filters) {
      const filters = JSON.parse(req.query.filters);
      aggregationPipeline.unshift({ $match: filters });
    }

    if (req.query.sort) {
      const sortField = req.query.sort;
      aggregationPipeline.push({ $sort: { [sortField]: 1 } });
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').reduce((accumulator, field) => {
        accumulator[field] = 1;
        return accumulator;
      }, {});
      aggregationPipeline.push({ $project: fields });
    }

    const products = await Product.aggregate(aggregationPipeline);

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

router.get('/byId/:id', async (req, res) => {
  try {
    const productID = req.params.id;

    if (!productID) {
      return res.status(401).json({ message: 'No product ID sent!' });
    }

    const product = await Product.findById(productID);

    if (!product) {
      return res.status(200).json({ message: 'No product found with that ID!' });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the product.' });
  }
});

router.get('/bySlug/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const searchId = req.query.sID;

    if (!slug) {
      return res.status(400).json({ message: 'No product ID sent!' });
    }

    const product = await Product.findOne({ slug: slug });

    if (!product) {
      return res.status(400).json({ message: 'No product found with that slug!' });
    }

    res.status(200).json({ product });

    if (searchId) {
      const search = await Search.findById(searchId);

      if (search) {
        search.visitedProductId = product._id;
        await search.save();
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the product.' });
  }
});

router.get('/byCatId/:categoryId', async (req, res) => {
  try {
    const categoryId = req.params.categoryId;

    // Validate if categoryId is a valid ObjectId
    if (!mongoose.isValidObjectId(categoryId)) {
      return res.status(400).json({ message: 'Invalid category ID' });
    }

    // Use the $match and $sample aggregation stages to get random products by category
    const products = await Product.aggregate([
      {
        $match: {
          categories:  { $elemMatch: { $eq: new mongoose.Types.ObjectId(categoryId) } },
        },
      },
      {
        $sample: { size: 10 }, // Adjust the size as needed
      },
    ]);

    res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching products' });
  }
});

module.exports = router