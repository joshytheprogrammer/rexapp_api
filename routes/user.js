const router = require('express').Router();
const User = require('../models/User');
const validateToken = require('../middleware/validateToken');

// Apply validateToken middleware to routes that require authentication
router.use(validateToken);



module.exports = router