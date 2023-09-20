const router = require('express').Router();
const validateAdminToken = require('../../middleware/validateAdminToken');
const Product = require('../../models/Product'); 
const User = require('../../models/User'); 
const Category = require('../../models/Category');
const sendMail = require('../../utils/mailer'); 

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

router.get('/users', async (req, res) => {
  try {
    // Find all users who are not admins
    const users = await User.find({ isAdmin: false });

    return res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching users.' });
  }
});

router.get('/products', async (req, res) => {
  try {
    // Find all users who are not admins
    const products = await Product.find({});

    return res.status(200).json({ products });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching products.' });
  }
});

router.get('/orders', async (req, res) => {
  try {
    // Find all users who are not admins
    const usersWithOrders = await User.find({ isAdmin: false });

    if (!usersWithOrders || usersWithOrders.length === 0) {
      return res.status(404).json({ message: 'No users with orders found.' });
    }

    // Extract orders from each user and flatten them into one array
    const allOrders = usersWithOrders.map(user => user.orders).flat();

    return res.status(200).json({ orders: allOrders });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching orders.' });
  }
});

router.get('/orders/:id', async (req, res) => {
  try {
    const orderId = req.params.id;

    if (!orderId) {
      return res.status(400).json({ message: 'Invalid order ID.' });
    }

    // Find the order by ID in the users' orders
    const usersWithOrders = await User.findOne({ 'orders._id': orderId });

    if (!usersWithOrders || usersWithOrders.length === 0) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Extract the order from the user's orders
    const order = usersWithOrders.orders.find(order => order._id.toString() === orderId);

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    const { password, resetPassword, cart, preferences, isAdmin, profilePic, orders, ...data} = usersWithOrders.toObject();

    return res.status(200).json({ order, data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the order.' });
  }
});

router.get('/products/byId/:id', async (req, res) => {
  try {
    const productID = req.params.id;

    if (!productID) {
      return res.status(401).json({ message: 'No product ID sent!' });
    }

    const product = await Product.findById(productID);

    if (!product) {
      return res.status(200).json({ message: 'No product found with that ID!' });
    }

    return res.status(200).json({ product: product });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the product.' });
  }
});

router.post('/order/complete', async (req, res) => {
  try {
    const { userId, orderId } = req.body;

    if (!userId || !orderId) {
      return res.status(400).json({ message: 'Invalid user or order ID.' });
    }

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Find the order in the user's orders array
    const orderToUpdate = user.orders.find(order => order._id.toString() === orderId);

    if (!orderToUpdate) {
      return res.status(404).json({ message: 'Order not found for this user.' });
    }

    // Update the order's status to 'completed'
    orderToUpdate.status = 'completed';

    // Save the updated user
    await user.save();

    res.status(200).json({ message: 'Order marked as completed.' });

    sendFulfillMessage(user.username, user.email, orderId)
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while completing the order.' });
  }
});

function sendFulfillMessage(username, email, orderId) {
  const emailDetails = {
    to: email,
    subject: `Goodday ${username}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Rexapp update</title>
    </head>
    <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>This mail is to inform you that the order - ${orderId} has had its status changed to completed.</p>
          <p>No action is required from you.</p>
          <p>This is an autogenerated email, please do not reply here.</p>
        </div>
    </body>
    </html>
    `
  };

  sendMail(emailDetails).catch((error) => {
    console.error('Error sending email:', error);
  });
}

module.exports = router;
