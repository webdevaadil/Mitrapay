const mongoose = require('mongoose');

const BulkpayoutUserfile = new mongoose.Schema({
    fileName: {
        type: String,
        requried: true
    },
    filepath: {
        type: String,
        required: true
    },
    uploadedBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        role: {
            type: String,
            enum: ['Super_Admin', 'Sub_Admin','User'], // Add all possible model names you use
            required: true
        },
        Name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bulkpayoutfiles', BulkpayoutUserfile);
