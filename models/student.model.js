const mongoose = require('mongoose');
const baseSchema = require('./base.schema');

const studentSchema = new mongoose.Schema({
    ...baseSchema,
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other']
    },
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    classroom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Classroom'
    },
    guardianInfo: {
        name: String,
        relationship: String,
        contact: String,
        email: String
    },
    academicRecord: [{
        year: String,
        grade: String,
        classroom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Classroom'
        },
        status: {
            type: String,
            enum: ['active', 'transferred', 'graduated', 'withdrawn'],
            default: 'active'
        }
    }]
});

studentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Generate enrollment number before saving
studentSchema.pre('save', async function(next) {
    if (!this.enrollmentNumber) {
        const year = new Date().getFullYear().toString().substr(-2);
        const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.enrollmentNumber = `${year}${randomNum}`;
    }
    next();
});

module.exports = mongoose.model('Student', studentSchema);