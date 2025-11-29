const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  "Beneficiary Code": {
    type: String,
    trim: true,
  },
  "Beneficiary Name": {
    type: String,
    trim: true,
  },
  "Beneficiary Address 1": {
    type: String,
    // required: true,
    trim: true,
  },
  "Beneficiary Account No": {
    type: String,
    trim: true,
  },
  "BIC / SWIFT / IFSC Code": {
    type: String,
    trim: true,
    // uppercase: true,
  },
  "Beneficiary Bank Name": {
    type: String,
    trim: true,
    lowercase: true,
    // match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  "Payment Method Name": {
    type: String,
    trim: true,
    lowercase: true,
    // match: [/.+\@.+\..+/, "Please enter a valid email address"],
  },
  Amount: {
    type: Number,
    required: true,
  },
  Payment_By: [
    {
      email: { type: String, trim: true, lowercase: true },
      name: { type: String, trim: true },
      role: { type: String, trim: true },
    },

  ],
  status: {
    type: String,
    default: "Processing",
      required: true,


  },
  
  Credit_status: {
    type: String,
  },
  order_id: {
    type: String,
  },
  transaction_id: {
    type: String,
  },

  utr: {
    type: String,
  },
  Bank_Utr: {
    type: String,
  },
  remark: {
    type: String,
  },
  Availble_balance: {
    type: String,
  },
},
  {
    timestamps: true, 
    ref: "Payout"
    // Adds createdAt and updatedAt
  }
);


const Payout = mongoose.model("Payout", userSchema);
module.exports = Payout;
