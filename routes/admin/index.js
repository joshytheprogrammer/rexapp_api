const express = require('express');
const auth = require('./auth');
const create = require('./create');
const views = require('./view');
const edit = require('./edit');

const adminRouter = express.Router();

adminRouter.use('/auth', auth);
adminRouter.use('/create', create);
adminRouter.use('/view', views);
adminRouter.use('/edit', edit);

module.exports = adminRouter;
