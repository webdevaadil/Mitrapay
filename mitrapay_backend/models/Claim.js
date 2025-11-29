// models/Claim.js

const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    phone: {
        type: mongoose.Schema.Types.Number,
    },
    claimby: {
        required: true,
        type: Array
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    ifsc: {
        type: String,
        required: true
    },


    Payment_By: [
        {
            email: { type: String, trim: true, lowercase: true },
            name: { type: String, trim: true },
            role: { type: String, trim: true },
        },
    ],



    Amount: {
        type: Number,
        required: true
    },
    utr: {
        type: String,
    },
    Bank_Utr: {
        type: String,
    },
    status: {
        type: String,
        required: true
    },
    remark: {
        type: String,
    },

    CLAIMstatus: {
        type: String,
        required: true
    },
    Date: {
        type: Date,
        default: Date.now
    },
    payoutdate: {
        type: Date,
        default: Date.now
    },
},
    {
        timestamps: true,
        // Adds createdAt and updatedAt
    });

module.exports = mongoose.model('Claims', ClaimSchema);
