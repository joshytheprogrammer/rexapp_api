const router = require('express').Router();
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

module.exports = router;