const router = require('express').Router();
const Category = require('../models/Category');
const Search = require('../models/Search');

router.get('/all', async (req, res) => {
  // GET /api/categories/all?filters={"name": "Electronics"}&limit=10&fields=_id,name&sort=name
  try {
    let query = Category.find();

    if (req.query.filters) {
      const filters = JSON.parse(req.query.filters);
      query = query.where(filters);
    }

    if (req.query.fields) {
      const fields = req.query.fields.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortField = req.query.sort;
      query = query.sort(sortField);
    }

    let limit = parseInt(req.query.limit) || null;
    if (limit !== null) {
      query = query.limit(limit);
    }

    const categories = await query.exec();
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