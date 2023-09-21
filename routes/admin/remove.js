const router = require('express').Router();
const validateAdminToken = require('../../middleware/validateAdminToken');
const Product = require('../../models/Product'); 
const User = require('../../models/User'); 
const Category = require('../../models/Category');

router.use(validateAdminToken);

router.post('/product/byId/', async (req, res) => {
  try {
    const {productId} = req.body;

    if (!productId) {
      return res.status(400).json({ message: 'No product ID sent!' });
    }

    await Product.findByIdAndDelete(productId)

    return res.status(200).json({ message: "Product deleted successfully!"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while deleting the product.' });
  }
});

router.post('/category/byId/', async (req, res) => {
  try {
    const {categoryId} = req.body;

    if (!categoryId) {
      return res.status(400).json({ message: 'No category ID sent!' });
    }

    await Category.findByIdAndDelete(categoryId)

    return res.status(200).json({ message: "Category deleted successfully!"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while deleting the category.' });
  }
});

module.exports = router;
