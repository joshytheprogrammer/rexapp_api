const jwt = require('jsonwebtoken');

const validateAdminToken = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers.authorization;

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ message: 'Authentication failed: Token missing' });
  }

  try {
    // Verify the token using your secret key
    const decodedToken = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN_SECRET);

    // Check if the decoded token contains a userId
    if (!decodedToken.userId) {
      return res.status(401).json({ message: 'Authentication failed: Invalid token' });
    }

    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token' });
  }
}

module.exports = validateAdminToken;
