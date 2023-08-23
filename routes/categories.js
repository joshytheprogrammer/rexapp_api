const router = require('express').Router();
const Category = require('../models/Category');
const Search = require('../models/Search');

router.get('/all', async (req, res) => {
  try {
    const categories = await Category.find();
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