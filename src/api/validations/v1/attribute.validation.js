import Joi from 'joi';

module.exports = {
    // GET v1/material-attributes
    listValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(1)
                .max(1000)
                .default(20),
            keyword: Joi.string()
                .trim()
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, ''),
            by_date: Joi.string()
                .only('create', 'update')
        }
    },

    // POST v1/material-attributes
    createValidation: {
        body: {
            id: Joi.string()
                .max(100)
                .required(),
            name: Joi.string()
                .max(100)
                .required(),
            description: Joi.string()
                .max(500)
                .allow(null, ''),
            categories: Joi.array()
                .items({
                    id: Joi.string()
                        .required(),
                    price: Joi.number()
                        .required(),
                    currency: Joi.string()
                        .allow(null, '')
                        .default('VND')
                })
                .min(1)
                .required()
        }
    },

    // PUT v1/material-attributes/:id
    updateValidation: {
        body: {
            name: Joi.string()
                .min(1)
                .max(100),
            description: Joi.string()
                .min(1)
                .max(255)
                .allow(null, ''),
            categories: Joi.array()
                .items({
                    id: Joi.string()
                        .required(),
                    price: Joi.number()
                        .required(),
                    currency: Joi.string()
                        .allow(null, '')
                        .default('VND')
                })
                .allow(null, ''),
        }
    }
};
