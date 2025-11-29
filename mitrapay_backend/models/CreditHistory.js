// models/CreditHistory.js

const mongoose = require('mongoose');

const creditHistorySchema = new mongoose.Schema({
    User: {
        type: mongoose.Schema.Types.Array,
        required: true
    },
    modifiedBy: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        model: {
            type: String,
            enum: [ 'Super_Admin', 'Sub_Admin'], // Add all possible model names you use
            required: true
        },
        Name: {
            type: String,
            required: true
        }
    },
    amount: {
        type: Number,
        required: true
    },
    operation: {
        type: String,
        enum: ['credit_added', 'credit_removed'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
creditHistorySchema.virtual('modifier', {
    ref: (doc) => doc.modifiedBy.model,
    localField: 'modifiedBy.id',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('CreditHistory', creditHistorySchema);
