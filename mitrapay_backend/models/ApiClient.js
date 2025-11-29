// models/ApiClient.js
const mongoose = require("mongoose");
const crypto = require("crypto");

const apiClientSchema = new mongoose.Schema({
  clientId: {
    type: String,
    unique: true,
    required: true,
  },
  clientSecret: {
    type: String,
    required: true,
  },
  name: { type: String }, // optional: client company/app name
  domain: { type: String }, // optional: restrict requests by origin
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-generate clientId & secret before saving
apiClientSchema.pre("validate", function (next) {
  if (!this.clientId) {
    this.clientId = crypto.randomBytes(8).toString("hex");
  }
  if (!this.clientSecret) {
    this.clientSecret = crypto.randomBytes(16).toString("hex");
  }
  next();
});

module.exports = mongoose.model("ApiClient", apiClientSchema);
