const Joi = require('joi');
const mongoose = require('mongoose');

const classroomValidator = {
    create: Joi.object({
        name: Joi.string().required().min(2).max(50),
        school: Joi.string().required().custom((value, helpers) => {
            if (!mongoose.Types.ObjectId.isValid(value)) {
                return helpers.error('Invalid school ID');
            }
            return value;
        }),
        capacity: Joi.number().required().min(1).max(100),
        grade: Joi.string().required(),
        section: Joi.string().optional(),
        resources: Joi.array().items(
            Joi.string().valid('projector', 'smartboard', 'computers', 'laboratory')
        ),
        academicYear: Joi.string().required().pattern(/^\d{4}-\d{4}$/)
    }),

    update: Joi.object({
        name: Joi.string().min(2).max(50),
        capacity: Joi.number().min(1).max(100),
        grade: Joi.string(),
        section: Joi.string(),
        resources: Joi.array().items(
            Joi.string().valid('projector', 'smartboard', 'computers', 'laboratory')
        ),
        academicYear: Joi.string().pattern(/^\d{4}-\d{4}$/)
    })
};

module.exports = classroomValidator;