const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const user_userSchema = new mongoose.Schema({
  Name: {
    type: String,
  },
  User_name: {
    type: String,
  },
  // Subadmin: {
  //   type: String,
  // },
  email: {
    type: String,
  },
  Password: {
    type: String,
    select: false,
  },
  Phone: {
    type: String,
  },
  status: {
    type: String,
  },
  Pages: {
    type: Array,
  },
  role: {
    type: String,
  },
  Key: {
    type: Number,
    select: false,
  },
  CreatedBy: [
    {
      email: String,
      Name: String,
      role: String,
    },
  ],
  otp: {
    type: String,
  },
  otpExpiry: {
    type: String,
  },

  Subadmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subadmin",
  },
  credit: {
    type: Number,
    default: 0
  },
  apiKey: {
    type: String,
    unique: true,
    sparse: true, // allows some users to not have keys
    select: false
  },
  token: { type: String, default: null },
});

user_userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});

user_userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};
user_userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.secret, {
    expiresIn: "2h",
  });
};
user_userSchema.methods.getresetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 100;
  return resetToken;
};
const User = mongoose.model("User", user_userSchema);
module.exports = User;
