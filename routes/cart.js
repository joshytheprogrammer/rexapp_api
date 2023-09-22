const router = require('express').Router();
const User = require('../models/User');
const validateToken = require('../middleware/validateToken');
const mongoose = require('mongoose');
const sendMail = require('../utils/mailer');

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
    const upUser = await user.save();

    // Find the most recent order for the user
    const mostRecentOrder = upUser.orders[user.orders.length - 1];

    if (!mostRecentOrder) {
      return res.status(500).json({ message: 'Unable to retrieve the most recent order.' });
    }

    // Access the default MongoDB _id of the most recent order
    const order_id = mostRecentOrder._id.toString();

    res.status(200).json({ message: 'Order placed successfully.', orderId: order_id });

    sendCheckoutMail(user, order_id)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred during checkout.' });
  }
});

function sendCheckoutMail(user, order_id) {
  const emailDetails = {
    to: user.email,
    subject: `Thank you for your order `,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Received</title>
      </head>
      <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Order Received - ${order_id}</h2>
              <p>Dear ${user.username},</p>
              <p>We have received your order and are excited to serve you. Below are the details of your order:</p>

              <p>We will be reaching out to you with the next three (3) business days with the current price quote of each of the products you ordered. This email will also contain the means of payment.</p>

              <p>After payment, your order will be processed and shipped to the address you have saved with us. If you do not have an address saved, it is recommended you do so <a href="https://app.rexapp.ng/account/my" style="color: #007bff;"> here</a></p>

              <p>To track the status of your order, please click on the following link:</p>
              <p><a href="https://app.rexapp.ng/orders?order=${order_id}" style="color: #007bff;">Track Your Order</a></p>

              <h4>Order Notes:</h4>
              <p>
                  Upon receiving your order, please inspect the contents to ensure everything is in order. If you have any questions or concerns, please don't hesitate to contact our dedicated support team at <a href="mailto:support@rexapp.com">support@rexapp.com</a>.
              </p>

              <p>Thank you for choosing RexApp for your shopping needs.</p>

              <p>Best Regards,<br>RexApp Team</p>
          </div>
      </body>
      </html>
    `,
  };

  sendMail(emailDetails).catch((error) => {
    console.error('Error sending email:', error);
  });

  const emailDetails2 = {
    to: 'admin@rexapp.ng',
    subject: `Attention required!!!`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Received</title>
      </head>
      <body>
        <div style="font-family: Georgia, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">A new order has been placed - ${order_id}</h2>
            <p>You can attend to it <a href="https://admin.rexapp.ng/view/orders?order=${order_id}">here</a></p>

            <p>This email was autogenerated by the rexapp API. Please do not reply.</p>
        </div>
      </body>
      </html>
    `
  };

  sendMail(emailDetails2).catch((error) => {
    console.error('Error sending email:', error);
  });
}

module.exports = router