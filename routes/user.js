const router = require('express').Router();
const User = require('../models/User');
const validateToken = require('../middleware/validateToken');

// Apply validateToken middleware to routes that require authentication
router.use(validateToken);

router.post('/change-username', validateToken, async (req, res) => {
  const newUsername = req.body.newUsername;

  // Validate new username
  if (!newUsername) {
    return res.status(400).json({ message: 'New username is required!' });
  }

  // Check if the new username is already taken
  const usernameExists = await User.findOne({ username: newUsername });
  if (usernameExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Update the username in the database
  try {
    const userId = req.user.id; // Assuming you're using validateToken middleware
    const user = await User.findByIdAndUpdate(userId, { username: newUsername }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Username updated successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating the username' });
  }
});



module.exports = router