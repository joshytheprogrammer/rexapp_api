const express = require('express');
const auth = require('./auth');

const adminRouter = express.Router();


adminRouter.use('/auth', auth);

module.exports = adminRouter;
