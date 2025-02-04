const mongoose = require('mongoose');
const baseSchema = require('./base.schema');

const classroomSchema = new mongoose.Schema({
    ...baseSchema,
    name: {
        type: String,
        required: true,
        trim: true
    },
    school: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'School',
        required: true
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    grade: {
        type: String,
        required: true
    },
    section: String,
    resources: [{
        type: String,
        enum: ['projector', 'smartboard', 'computers', 'laboratory']
    }],
    currentStudentCount: {
        type: Number,
        default: 0
    },
    academicYear: {
        type: String,
        required: true
    }
});

classroomSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Classroom', classroomSchema);