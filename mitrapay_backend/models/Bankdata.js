const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: { type: String, unique: true },
  phone: { type: String },
  credit: String,
  status: String,
  // Add more fields if needed
});

const Bankdata = mongoose.model('Bankdata', userSchema);

module.exports = Bankdata