const express = require('express');
const auth = require('./auth');
const create = require('./create');

const adminRouter = express.Router();

adminRouter.use('/auth', auth);
adminRouter.use('/create', create);

module.exports = adminRouter;
