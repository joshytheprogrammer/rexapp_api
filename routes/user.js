const router = require('express').Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const validateToken = require('../middleware/validateToken');

// Apply validateToken middleware to routes that require authentication
router.use(validateToken);

router.get('/profile', validateToken, async (req, res) => {
  try {
    const userId = req.user.id; // Assuming you're using validateToken middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Exclude sensitive fields (like password) from the response
    const { password, resetPassword, cart, ...profile } = user.toObject();

    return res.status(200).json({ profile });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the profile' });
  }
});

router.post('/change-name', validateToken, async (req, res) => {
  const { firstName, lastName } = req.body;

  // Validate first and last name fields
  if (!firstName || !lastName) {
    return res.status(400).json({ message: 'Both first and last names are required!' });
  }

  try {
    const userId = req.user.id; // Assuming you're using validateToken middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user's first and last names
    user.firstName = firstName;
    user.lastName = lastName;

    await user.save();

    return res.status(200).json({ message: 'Names updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating names' });
  }
});

router.post('/change-username', validateToken, async (req, res) => {
  const newUsername = req.body.username;

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

router.post('/change-email', validateToken, async (req, res) => {
  const newEmail = req.body.email;

  // Validate new email
  if (!newEmail) {
    return res.status(400).json({ message: 'New email is required!' });
  }

  // Check if the new email is already taken
  const emailExists = await User.findOne({ email: newEmail });
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }

  // Update the email in the database
  try {
    const userId = req.user.id; // Assuming you're using validateToken middleware
    const user = await User.findByIdAndUpdate(userId, { email: newEmail }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Email updated successfully', user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating the email' });
  }
});

router.post('/change-password', validateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Validate current and new passwords
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'Current password and new password are required!' });
  }

  if (currentPassword === newPassword) {
    return res.status(400).json({ message: 'Password cannot be the same!' });
  }

  try {
    const userId = req.user.id; 
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the current password matches
    if (!bcrypt.compareSync(currentPassword, user.password)) {
      return res.status(401).json({ message: 'Invalid current password '});
    }

    // Hash and update the new password in the database
    const hashedNewPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while changing the password' });
  }
});

router.post('/change-address', validateToken, async (req, res) => {
  const { street, city, state, landmark } = req.body;

  // Validate address fields
  if (!street || !city || !state || !landmark) {
    return res.status(400).json({ message: 'All address fields are required!' });
  }

  try {
    const userId = req.user.id; // Assuming you're using validateToken middleware
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the address details
    user.address.street = street;
    user.address.city = city;
    user.address.state = state;
    user.address.landmark = landmark;

    await user.save();

    return res.status(200).json({ message: 'Address details updated successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating address details' });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the user with the provided email exists
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a reset token and expiry time
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // Token expires in 1 hour

    // Update user document with reset token and expiry time
    const hashedResetToken = await bcrypt.hash(resetToken, 10);

    // Store the hashed reset token and expiry time in user document
    user.resetPassword.token = hashedResetToken;
    user.resetPassword.expires = resetTokenExpiry;
    await user.save();

    // Send an email to the user with the reset token
    const transporter = nodemailer.createTransport({
      // Configure your email transport (SMTP, API, etc.)
    });

    const mailOptions = {
      from: 'your@example.com',
      to: user.email,
      subject: 'Password Reset',
      text: `You are receiving this email because you (or someone else) have requested to reset your password. Please click the following link to reset your password:\n\n
        ${process.env.CLIENT_URL}/reset-password?resetToken=${resetToken}\n\n
        If you did not request this, please ignore this email and your password will remain unchanged.`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error sending email' });
      }

      return res.status(200).json({ message: 'Password reset email sent successfully' });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

// Route to handle password reset using the reset token
router.post('/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find the user with the provided reset token and validate expiration
    const user = await User.findOne({
      'resetPassword.token': resetToken,
      'resetPassword.expires': { $gte: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash the new password and update it in the user document
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    user.resetPassword.token = undefined; // Invalidate the reset token
    user.resetPassword.expires = undefined;
    await user.save();

    return res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});

module.exports = router