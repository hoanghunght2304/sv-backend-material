import { values } from 'lodash';
import Joi from 'joi';
import Material from '../../../common/models/material.model';

module.exports = {
    // GET v1/materials
    listValidation: {
        query: {
            skip: Joi.number()
                .min(0)
                .default(0),
            limit: Joi.number()
                .min(10)
                .max(5000)
                .default(20),
            keyword: Joi.string()
                .allow(null, '')
                .trim(),
            units: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            types: Joi.array()
                .items(Joi.string())
                .allow(null, ''),
            currency: Joi.string()
                .only(values(Material.Currencies))
                .allow(null, ''),
            min_price: Joi.number()
                .allow(null, '')
                .min(0),
            max_price: Joi.number()
                .allow(null, '')
                .min(0),

            by_date: Joi.string()
                .only(['create', 'update'])
                .default('create')
                .allow(null, ''),
            start_time: Joi.date()
                .allow(null, ''),
            end_time: Joi.date()
                .allow(null, '')
        }
    },

    // POST v1/materials
    createValidation: {
        body: {
            id: Joi.string()
                .lowercase()
                .required(),
            type: Joi.string()
                .required(),
            description: Joi.string()
                .max(500)
                .default(null),
            /** material detail */

            name: Joi.string()
                .max(100)
                .required(),
            images: Joi.array()
                .allow(null, '')
                .default([]),
            properties: Joi.object({
                unit: Joi.string()
                    .only(values(Material.Units))
                    .required(),
                season: Joi.string()
                    .default(null, ''),
                gender: Joi.string()
                    .only(values(Material.Genders))
                    .default(Material.Genders.MALE)
            })
                .required(),
            attributes: Joi.array()
                .items(Joi.string())
                .default([]),

            /** price detail */
            currency: Joi.string()
                .uppercase()
                .only(values(Material.Currencies))
                .default(Material.Currencies.VND),
            origin_price: Joi.number()
                .min(0)
                .default(0),
            price: Joi.number()
                .min(0)
                .default(0)
        }
    },

    // PUT v1/materials/:id
    updateValidation: {
        body: {
            type: Joi.string()
                .allow(null, ''),
            description: Joi.string()
                .max(500)
                .allow(null, ''),

            /** material detail */
            name: Joi.string()
                .max(100)
                .allow(null, ''),
            images: Joi.array()
                .allow(null, ''),
            properties: Joi.object({
                unit: Joi.string()
                    .only(values(Material.Units))
                    .allow(null, ''),
                season: Joi.string()
                    .allow(null, '')
                    .default(null, ''),
                gender: Joi.string()
                    .only(values(Material.Genders))
                    .allow(null, '')
            })
                .allow(null, ''),
            attributes: Joi.array()
                .items(
                    Joi.string()
                )
                .allow(null, ''),

            /** price detail */
            currency: Joi.string()
                .uppercase()
                .only(values(Material.Currencies))
                .allow(null, ''),
            origin_price: Joi.number()
                .min(0)
                .allow(null, ''),
            price: Joi.number()
                .min(0)
                .allow(null, '')
        }
    }
};
