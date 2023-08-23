const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  profilePic: { type: String },
  resetPassword: {
    token: {type: String },
    expires: {}
  },
  address: {
    street: String,
    city: String,
    state: String,
    landmark: String
  },
  preferences: {
    receivePromotions: { type: Boolean, default: true },
    notificationFrequency: { type: String, default: 'daily' }
  },
  cart: [
    {
      partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
      quantity: { type: Number, default: 1 }
    }
  ],
  orders: [
    {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
      items: [
        {
          partId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          quantity: Number
        }
      ]
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
