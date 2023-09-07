const express = require('express');
const auth = require('./auth');
const create = require('./create');
const views = require('./view')

const adminRouter = express.Router();

adminRouter.use('/auth', auth);
adminRouter.use('/create', create);
adminRouter.use('/view', views);

module.exports = adminRouter;
