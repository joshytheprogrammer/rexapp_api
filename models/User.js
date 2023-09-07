const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  isAdmin: { type: Boolean, default: false},
  resetPassword: {
    token: {type: String },
    expires: {}
  },
  address: {
    street: {type: String, default: ''},
    city: {type: String, default: ''},
    state: {type: String, default: ''},
    landmark: {type: String, default: ''}
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
      ],
      orderDate: { type: Date, default: Date.now },
    }
  ]
});

const User = mongoose.model('User', userSchema);

module.exports = User;
