import { Op } from 'sequelize';
import { handler as ErrorHandel } from './errors';
import Material from '../../common/models/material.model';

/**
 * Load filter conditions append to req.
 */
exports.condition = (req, res, next) => {
    try {
        const params = !req.query ? {} : req.query;

        /** setup conditions */
        let start; let end;
        if (params.start_time && params.end_time) {
            start = new Date(params.start_time); end = new Date(params.end_time);
            start.setHours(0, 0, 0, 0); end.setHours(23, 59, 59, 999);
        }

        /** setup conditions */
        const conditions = {
            is_active: true
        };
        if (params.units) {
            conditions['properties.unit'] = {
                [Op.in]: params.units
            };
        }
        if (params.types) {
            conditions.type = { [Op.in]: params.types };
        }
        if (params.currency) {
            conditions.currency = {
                [Op.iLike]: `%${params.currency}%`
            };
        }
        if (params.min_price && params.max_price) {
            conditions.price = {
                [Op.gte]: params.min_price,
                [Op.lte]: params.max_price
            };
        }
        if (params.min_price && !params.max_price) {
            conditions.price = {
                [Op.gte]: params.min_price
            };
        }
        if (params.max_price && !params.min_price) {
            conditions.price = {
                [Op.lte]: params.max_price
            };
        }
        if (params.by_date === 'create' && start && end) {
            conditions.created_at = {
                [Op.gte]: start,
                [Op.lte]: end
            };
        }
        if (params.by_date === 'update' && start && end) {
            conditions.updated_at = {
                [Op.gte]: start,
                [Op.lte]: end
            };
        }
        if (params.keyword) {
            conditions[Op.or] = [
                {
                    id: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
                {
                    name: {
                        [Op.iLike]: `%${params.keyword}%`
                    }
                },
            ];
        }
        req.conditions = conditions;

        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Load item by id add to req locals.
 */
exports.load = async (req, res, next) => {
    try {
        const material = await Material.getMaterialById(req.params.id);
        req.locals = req.locals ? req.locals : {};
        req.locals.material = material;
        return next();
    } catch (ex) {
        return ErrorHandel(ex, req, res, next);
    }
};

/**
 * Check duplicate id.
 */
exports.checkDuplicateById = async (req, res, next) => {
    try {
        await Material.checkDuplicateById(req.body.id || req.body._id);
        return next();
    } catch (ex) {
        throw ErrorHandel(ex, req, res, next);
    }
};
