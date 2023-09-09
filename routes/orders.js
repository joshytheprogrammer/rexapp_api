const router = require('express').Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const validateToken = require('../middleware/validateToken');

// Apply validateToken middleware to routes that require authentication
router.use(validateToken);

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Query the User model for the specified user's orders
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Sort the user's orders by date/time ordered and status
    user.orders.sort((a, b) => {
      if (a.orderDate > b.orderDate) return -1;
      if (a.orderDate < b.orderDate) return 1;
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });

    res.status(200).json({ orders: user.orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while fetching orders.' });
  }
});

router.get('/byId/:id', async (req, res) => {
  const userId = req.user.id;
  const orderId = req.params.id;

  if (!mongoose.Types.ObjectId.isValid(orderId)) {
    return res.status(400).json({ message: 'Invalid order ID.' });
  }

  try {
    const user = await User.findById(userId); 

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }

    const order = user.orders.find(order => order._id.toString() === orderId);

    if (!order) {
      return res.status(400).json({ message: 'Order not found.' });
    }

    // Return the found order
    return res.status(200).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the order.' });
  }
});


module.exports = router;