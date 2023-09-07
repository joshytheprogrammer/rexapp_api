const router = require('express').Router();
const validateAdminToken = require('../../middleware/validateAdminToken');
const Product = require('../../models/Product'); 
const Category = require('../../models/Category'); 

router.use(validateAdminToken);

router.get('/categories/all', async (req, res) => {
  try {
    const categories = await Category.find({}, '_id name').sort({ name: 1 });

    // Send the categories as a JSON response
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching categories.' });
  }
});

module.exports = router;
