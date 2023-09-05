const router = require('express').Router();
const validateAdminToken = require('../../middleware/validateAdminToken');
const Product = require('../../models/Product'); 
const Category = require('../../models/Category'); 

router.use(validateAdminToken);

// Create a new product
router.post('/product', async (req, res) => {
  try {
    // Extract product data from the request body
    const { name, categories, manufacturer, description, partNumber, specification, rating, price, stock, imageURL } = req.body;

    if (!name || !categories || !manufacturer || !description || !partNumber || !specification || !rating || !price || !stock) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Create a new product instance
    const newProduct = new Product({
      name,
      categories,
      manufacturer,
      description,
      partNumber,
      specification,
      rating,
      price: { min: price.min, max: price.max },
      stock,
      imageURL,
    });

    // Save the product to the database
    const savedProduct = await newProduct.save();

    res.status(201).json({ product: savedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the product.' });
  }
});

router.post('/category', async (req, res) => {
  try {
    // Extract category data from the request body
    const { name, slug, imageURL, description } = req.body;

    // Verify that all required data is present
    if (!name || !slug || !imageURL) {
      return res.status(400).json({ message: 'All required fields must be provided.' });
    }

    // Create a new category instance
    const newCategory = new Category({
      name,
      slug,
      imageURL,
      description,
    });

    // Save the category to the database
    const savedCategory = await newCategory.save();

    res.status(201).json({ category: savedCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while creating the category.' });
  }
});

module.exports = router;
