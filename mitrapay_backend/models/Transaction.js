const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["credit", "debit"], required: true },
  amount: { type: Number, required: true },
  balanceAfter: { type: Number },
  'Beneficiary Name': { type: String },
  'Beneficiary Account No': { type: String },
  'BIC / SWIFT / IFSC Code': { type: String },
  'Beneficiary Bank Name': { type: String },
  utr: { type: String },
  Bank_Utr: { type: String },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
