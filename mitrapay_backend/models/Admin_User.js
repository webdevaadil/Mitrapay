const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  Name: {
    type: String,
  },
  User_name: {
    type: String,
  },
  email: {
    type: String,
  },
  Password: {
    type: String,
    select: false
  },
  Phone: {
    type: Number,
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
  creditlimit: {
    type: String
  },
  otp: {
    type: String,
  },
  otpExpiry: {
    type: String,
  },
  Key: {
    type: String,

  },


});


userSchema.pre("save", async function (next) {
  if (!this.isModified("Password")) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.Password = await bcrypt.hash(this.Password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.Password);
};
userSchema.methods.getSignedToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.secret, {
    expiresIn: "24h",
  });
};
userSchema.methods.getresetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 100;
  return resetToken;
};
const SuperAdmin = mongoose.model("SuperAdmin", userSchema);
module.exports = SuperAdmin
