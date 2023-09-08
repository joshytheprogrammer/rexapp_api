const router = require('express').Router();
const User = require('../models/User');
const validateToken = require('../middleware/validateToken');

// Apply validateToken middleware to routes that require authentication
router.use(validateToken);

router.post('/add', async (req, res) => {
  const { partId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Check if the product is already in the cart
    const cartItemIndex = user.cart.findIndex(item => item.partId.toString() === partId);

    if (cartItemIndex !== -1) {
      // Product already in the cart, update quantity
      user.cart[cartItemIndex].quantity += quantity;
    } else {
      // Product not in the cart, add it
      user.cart.push({ partId, quantity });
    }

    await user.save();

    return res.status(200).json({ message: 'Product added to cart successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while adding to cart.' });
  }
});

router.post('/remove', async (req, res) => {
  const { partId } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find and remove the product from the cart
    user.cart = user.cart.filter(item => item.partId.toString() !== partId);
    await user.save();

    return res.status(200).json({ message: 'Product removed from cart successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while removing from cart.' });
  }
});

router.get('/', async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({ cart: user.cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching cart.' });
  }
});

router.post('/update-quantity', async (req, res) => {
  const { partId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the product in the cart and update the quantity
    const cartItem = user.cart.find(item => item.partId.toString() === partId);

    if (cartItem) {
      cartItem.quantity = quantity;
      await user.save();
      return res.status(200).json({ message: 'Cart item quantity updated successfully.' });
    } else {
      return res.status(404).json({ message: 'Product not found in cart.' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating cart item quantity.' });
  }
});

router.post('/sync-cart', async (req, res) => {
  const userId = req.user.id;
  const { cart } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    
    user.cart = cart;
    await user.save();

    return res.status(200).json({ message: 'Cart synced successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while syncing the cart.' });
  }
});

router.post('/checkout', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you have authentication middleware
    const { cart } = req.body;

    // Validate that the user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: 'User not found.' });
    }
    
    if (!cart) {
      return res.status(400).json({ message: 'At least one product required.' });
    }

    if (!Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ message: 'Invalid cart format.' });
    }

    // Create a new order
    const order = {
      status: 'pending',
      items: [],
      orderDate: Date.now(),
    };

    // Iterate through the cart and add items to the order
    for (const item of cart) {
      order.items.push({
        partId: item.partId,
        quantity: item.quantity,
      });
    }

    // Add the order to the user's orders array
    user.orders.push(order);

    // Clear the user's cart
    user.cart = [];

    // Save the updated user document
    await user.save();

    return res.status(200).json({ message: 'Order placed successfully.', orderId: order._id });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during checkout.' });
  }
});

module.exports = router