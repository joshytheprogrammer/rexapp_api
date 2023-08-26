const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const validateToken = require('../middleware/validateToken');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required!' });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'User not found!' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid username or password!' });
    }

    // Prepare user data
    const userData = {
      id: user._id,
      name: user.username,
    };

    // Generate tokens
    const accessToken = jwt.sign({ user: userData }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '10080m' });
    const refreshToken = jwt.sign({ user: userData }, process.env.REFRESH_TOKEN_SECRET);

    // Set tokens as cookies
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.cookie('refreshToken', refreshToken, { httpOnly: true });

    return res.status(200).json({ message: 'Login successful!' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});
 
router.post('/signup', async (req, res) => {
  // Check if username and password are provided
  const { username, email, password } = req.body;
  console.log(req.body)

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

  res.status(201).json({ message: 'User created successfully!' });

  // Hash the password and add the new user to the array
  // const hashedPassword = bcrypt.hashSync(password, 10);
 
  // const newUser = new User({
  //   username: req.body.username,
  //   email: req.body.email,
  //   password: hashedPassword,
  //   isAdmin: false,
  // })

  // try {
  //   await newUser.save()
  //   res.status(201).json({ message: 'User created successfully!' });
  // } catch (err) {
  //   res.status(500).json(err);
  // }
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
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token is required!' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const accessToken = jwt.sign({ username: decoded.username }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '20m' });
    return res.status(200).json({ accessToken });
  } catch (err) {
    return res.status(401).json({ message: 'Invalid refresh token!' });
  }
});


router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Logged out successfully!' });
});

module.exports = router