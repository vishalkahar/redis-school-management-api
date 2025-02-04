const Joi = require('joi');
const mongoose = require('mongoose');

const studentValidator = {
    create: Joi.object({
        firstName: Joi.string().required().min(2).max(50),
        lastName: Joi.string().required().min(2).max(50),
        dateOfBirth: Joi.date().required().max('now'),
        gender: Joi.string().valid('male', 'female', 'other').required(),
        school: Joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('Invalid school ID');
            }
            return value;
        }),
        classroom: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('Invalid classroom ID');
            }
            return value;
        }),
        guardianInfo: Joi.object({
            name: Joi.string().required(),
            relationship: Joi.string().required(),
            contact: Joi.string().required(),
            email: Joi.string().email().required()
        }).required()
    }),

    update: Joi.object({
        firstName: Joi.string().min(2).max(50),
        lastName: Joi.string().min(2).max(50),
        dateOfBirth: Joi.date().max('now'),
        gender: Joi.string().valid('male', 'female', 'other'),
        classroom: Joi.string().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('Invalid classroom ID');
            }
            return value;
        }),
        guardianInfo: Joi.object({
            name: Joi.string(),
            relationship: Joi.string(),
            contact: Joi.string(),
            email: Joi.string().email()
        })
    }),

    transfer: Joi.object({
        newClassroom: Joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('Invalid classroom ID');
            }
            return value;
        }),
        reason: Joi.string().required()
    })
};

module.exports = studentValidator;