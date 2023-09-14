const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validateToken = require('../middleware/validateToken');
const User = require('../models/User');
const sendMail = require('../utils/mailer');


router.post('/login', async (req, res) => {
  // Check if username and password are provided
  try{
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required!' });
    }
  
    // Check if the username exists
    const user = await User.findOne({username: req.body.username})

    try {
      if(!user) {
        res.status(401).json({ message: 'User not found!!!' })
        return
      }
    } catch(e) {
      console.error(e)
      return 
    }
  
    // Check if the password is correct
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid username or password!' });
    }

    // Prepare user data
    const data = {
      id: user._id,
      name: user.username
    }

    // Generate tokens
    const accessToken = jwt.sign({ user: data }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10080m' });
    const refreshToken = jwt.sign({ user: data }, process.env.REFRESH_TOKEN_SECRET);

    res.status(200).json({ accessToken, refreshToken });
    sendLoginMail(user.username, user.email);
  } catch(e) {
    console.error('An error occurred while logging in: ', e)
  }
});
 
router.post('/signup', async (req, res) => {
  // Check if username and password are provided
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required!' });
  }

  const emailExists = await User.findOne({ email });
  if (emailExists) {
    return res.status(400).json({ message: 'Email already exists' });
  }
  
  // Check if user with same username already exists
  const usernameExists = await User.findOne({ username });
  if (usernameExists) {
    return res.status(400).json({ message: 'Username already exists' });
  }

  // Hash the password and add the new user to the array
  const hashedPassword = bcrypt.hashSync(password, 10);
 
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashedPassword,
    isAdmin: false,
  })

  try {
    await newUser.save()
    res.status(201).json({ message: 'User created successfully!' });

    sendNewUserMail(username, email)
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/me', validateToken, (req, res) => {
  // Access user information from req.user object
  const user = req.user;

  // Handle request logic...
  if(!user) {
    res.status(401).json({message: "User not found"});
    return
  }
  
  res.status(200).json({"data": user})
});
 
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required!' });
  }
 
  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
 
    // Generate a new access token
    const accessToken = jwt.sign({ username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token!' });
  }
});

router.post('/logout', (req, res) => {
  // Invalidate the refresh token
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required!' });
  }

  try {
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    return res.status(200).json({ message: 'Logged out successfully!' });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token!' });
  }
});

function sendNewUserMail(username, email) {
  const emailDetails = {
    to: email,
    subject: `Welcome ${username}`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to RexApp</title>
      </head>
      <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #333;">Welcome to RexApp</h2>
              <p>Dear ${username},</p>
              <p>Thank you for joining the RexApp family, your destination for all your automobile needs. We are delighted to have you on board!</p>

              <p>At RexApp, we are committed to providing you with a seamless shopping experience. Whether you're looking for parts, accessories, or expert advice, we've got you covered.</p>

              <p>If you have any questions or need assistance, our dedicated support team is just an email away at <a href="mailto:support@rexapp.com">support@rexapp.com</a>. We're here to assist you with any inquiries or requests you may have.</p>

              <p>Thank you for choosing RexApp for your automotive needs. We look forward to serving you.</p>

              <p>Best Regards,<br>RexApp Team</p>
          </div>
      </body>
      </html>
    `
  };

  sendMail(emailDetails).catch((error) => {
    console.error('Error sending email:', error);
  });

  const emailDetails2 = {
    to: 'admin@rexapp.ng',
    subject: `RexApp Information - New User`,
    html: `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to RexApp</title>
      </head>
      <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <p>This mail is to inform you that a new user has joined the family.</p>
          <p>No action is required from you at the moment.</p>
        </div>
      </body>
      </html>
    `
  };

  sendMail(emailDetails2).catch((error) => {
    console.error('Error sending email:', error);
  });
}

function sendLoginMail(username, email) {
  const emailDetails = {
    to: email,
    subject: `Welcome ${username}`,
    html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome back</title>
    </head>
    <body>
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">Welcome back, ${username}!</h2>
            <p>Thank you for returning to RexApp, your trusted destination for all your automobile needs. We're excited to have you back!</p>
    
            <p>If you haven't logged in recently, we recommend changing your password as soon as possible to ensure the security of your account. You can update your password in your account settings.</p>
    
            <p>If you have any questions or need assistance, our dedicated support team is just an email away at <a href="mailto:support@rexapp.com">support@rexapp.com</a>. We're here to assist you with any inquiries or requests you may have.</p>
    
            <p>Thank you for choosing RexApp for your automotive needs. We look forward to serving you once again.</p>
    
            <p>Best Regards,<br>RexApp Team</p>
        </div>
    </body>
    </html>
    `
  };

  sendMail(emailDetails).catch((error) => {
    console.error('Error sending email:', error);
  });
}


module.exports = router