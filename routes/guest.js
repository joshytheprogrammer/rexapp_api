const router = require('express').Router();
const User = require('../models/User');
const Product = require('../models/Product');

const sendMail = require('../utils/mailer');

router.post('/calculateSubtotal', async (req, res) => {
  try {
    const { cart } = req.body;

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Invalid cart format.' });
    }

    // Fetch the prices of products based on partIds
    const partIds = cart.map(item => item.partId);
    const products = await Product.find({ _id: { $in: partIds } });

    // Calculate the total minimum and maximum subtotals
    let minSubtotal = 0;
    let maxSubtotal = 0;

    cart.forEach(item => {
      const product = products.find(p => p._id.equals(item.partId));

      if (product) {
        // Account for the quantity in the cart
        const minPrice = product.price.min * item.quantity;
        const maxPrice = product.price.max * item.quantity;

        minSubtotal += minPrice;
        maxSubtotal += maxPrice;
      }
    });

    return res.status(200).json({ minSubtotal, maxSubtotal });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while calculating subtotals.' });
  }
});
module.exports = router;
