const router = require('express').Router();
const validateAdminToken = require('../../middleware/validateAdminToken');
const Product = require('../../models/Product'); 
const User = require('../../models/User'); 
const Category = require('../../models/Category');
const sendMail = require('../../utils/mailer'); 

router.use(validateAdminToken);

router.post('/product/byId/', async (req, res) => {
  try {
    const {product} = req.body;

    if (!product) {
      return res.status(400).json({ message: 'No product ID sent!' });
    }

    await Product.findByIdAndUpdate(product._id, product)

    return res.status(200).json({ message: "Product updated successfully!"});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the product.' });
  }
});

module.exports = router;
