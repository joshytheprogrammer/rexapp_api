const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/User');

router.post('/login', async (req, res) => {
  res.send('working')
});

module.exports = router