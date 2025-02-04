const Joi = require('joi');

const schoolValidator = {
    create: Joi.object({
        name: Joi.string().required().min(3).max(100),
        address: Joi.object({
            street: Joi.string().required(),
            city: Joi.string().required(),
            state: Joi.string().required(),
            country: Joi.string().required(),
            zipCode: Joi.string().required()
        }),
        contactInfo: Joi.object({
            email: Joi.string().email().required(),
            phone: Joi.string().required(),
            website: Joi.string().uri().optional()
        })
    }),

    update: Joi.object({
        name: Joi.string().min(3).max(100),
        address: Joi.object({
            street: Joi.string(),
            city: Joi.string(),
            state: Joi.string(),
            country: Joi.string(),
            zipCode: Joi.string()
        }),
        contactInfo: Joi.object({
            email: Joi.string().email(),
            phone: Joi.string(),
            website: Joi.string().uri().optional()
        }),
        status: Joi.string().valid('active', 'inactive', 'suspended')
    })
};

module.exports = schoolValidator;