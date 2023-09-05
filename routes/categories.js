const router = require('express').Router();
const Category = require('../models/Category');
const Search = require('../models/Search');

router.get('/all', async (req, res) => {
  try {
    // Define the initial aggregation pipeline
    const aggregationPipeline = [];

    // Check if filters are provided
    if (req.query.filters) {
      const filters = JSON.parse(req.query.filters);
      aggregationPipeline.push({ $match: filters });
    }

    // Check if fields are provided
    if (req.query.fields) {
      const fields = req.query.fields.split(',').reduce((accumulator, field) => {
        accumulator[field] = 1;
        return accumulator;
      }, {});
      aggregationPipeline.push({ $project: fields });
    }

    // Check if sort is provided
    if (req.query.sort) {
      const sortField = req.query.sort;
      aggregationPipeline.push({ $sort: { [sortField]: 1 } });
    }

    // Parse and validate the limit
    let limit = parseInt(req.query.limit, 10);
    if (isNaN(limit) || limit <= 0) {
      limit = 10; // Default limit if not provided or invalid
    }

    // Add $sample stage to get random documents
    aggregationPipeline.push({ $sample: { size: limit } });

    // Execute the aggregation pipeline
    const categories = await Category.aggregate(aggregationPipeline);

    return res.status(200).json({ categories });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
});


router.get('/categories/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const searchId = req.query.search_id;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({ message: 'Category not found.' });
    }

    if (searchId) {
      const search = await Search.findById(searchId);

      if (search) {
        search.visitedCategoryId = category._id;
        await search.save();
      }
    }

    return res.status(200).json({ category });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the category.' });
  }
});


module.exports = router