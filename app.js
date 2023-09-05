const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');

const auth = require('./routes/auth');
const products = require('./routes/products');
const categories = require('./routes/categories');
const cart = require('./routes/cart');
const search = require('./routes/search');
const user = require('./routes/user');

const admin = require('./routes/admin/index');

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000', optionsSuccessStatus: 200 }));
app.use(bodyParser.json());

const mongoUrl = process.env.NODE_ENV === 'development' ? process.env.DEV_MONGO_URL : process.env.PROD_MONGO_URL;

mongoose
  .connect(mongoUrl)
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });

app.use('/api/auth', auth);
app.use('/api/products', products);
app.use('/api/categories', categories);
app.use('/api/cart', cart);
app.use('/api/search', search);
app.use('/api/user', user);
app.use('/api/admin', admin);

module.exports = app;
