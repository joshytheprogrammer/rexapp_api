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

    // Overwrite the user's cart with the data sent from the client.
    user.cart = cart;
    await user.save();

    return res.status(200).json({ message: 'Cart synced successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while syncing the cart.' });
  }
});

module.exports = router