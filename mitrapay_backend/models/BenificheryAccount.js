const mongoose = require("mongoose");

const beneficiaryAccountSchema = new mongoose.Schema({
  "Beneficiary Code": {
    type: String,
    trim: true,
    required: [true, "Beneficiary Code is required"],
  },
  "Beneficiary Name": {
    type: String,
    trim: true,
    required: [true, "Beneficiary Name is required"],
  },
  "Beneficiary Address 1": {
    type: String,
    trim: true,
    required: [true, "Beneficiary Address is required"],
  },
  "Beneficiary Account No": {
    type: String,
    trim: true,
    required: [true, "Beneficiary Account No is required"],
  },
  "BIC / SWIFT / IFSC Code": {
    type: String,
    trim: true,
    required: [true, "IFSC Code is required"],
  },
  "Beneficiary Bank Name": {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Bank Name is required"],
  },
  "Payment Method Name": {
    type: String,
    trim: true,
    lowercase: true,
    required: [true, "Payment Method is required"],
  },
  "Effective From": {
    type: String,
    trim: true,
    required: [true, "Effective From date is required"],
  },
  remark: {
    type: String,
    trim: true,
    default: "",
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdBy: [
    {
      email: { type: String, trim: true, lowercase: true },
      name: { type: String, trim: true },
      role: { type: String, trim: true },
    },
  ],
  updatedBy: [
    {
      email: { type: String, trim: true, lowercase: true },
      name: { type: String, trim: true },
      role: { type: String, trim: true },
    },
  ],
}, {
  timestamps: true,
  versionKey: false,
});

module.exports = mongoose.model("BeneficiaryAccount", beneficiaryAccountSchema);
