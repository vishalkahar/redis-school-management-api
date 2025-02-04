const mongoose = require('mongoose');
const baseSchema = require('./base.schema');

const schoolSchema = new mongoose.Schema({
    ...baseSchema,
    name: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
    },
    contactInfo: {
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: String,
        website: String
    },
    administrators: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
});

// Update timestamps on save
schoolSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('School', schoolSchema);