import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import Type from '../../../common/models/type.model';

/**
 * List
 *
 * @public
 * @param {Parameters} query
 * @returns {Promise<Type[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await Type.findAndCountAll({
            where: req.conditions,
            order: [
                ['created_at', 'DESC']
            ],
            limit: req.query.limit,
            offset: req.query.skip
        });

        return res.json({
            code: 0,
            count: result.count,
            data: result.rows.map(
                group => Type.transform(group)
            )
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};

/**
 * Create
 *
 * @public
 * @param {Type} body
 * @returns {Promise<Type>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);
    req.body.id = req.body.id.toLowerCase();
    return Type.create(
        req.body
    ).then((data) => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: Type.transform(data)
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Detail
 *
 * @public
 * @param {String} id
 * @returns {Promise<Type>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Type.transform(req.locals.type) });

/**
 * Update
 *
 * @public
 * @param {Type} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const { user, type: oldModel } = req.locals;
    const dataChanged = Type.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  update existing item */
    const data = pick(req.body, dataChanged);
    data.updated_at = new Date();
    return Type.update(
        data,
        {
            where: {
                id: oldModel.id
            },
            params: {
                user: pick(user, ['id', 'name']),
            },
            individualHooks: true
        }
    ).then(() => {
        res.json({
            code: 0,
            message: messages.UPDATE_SUCCESS
        });
    }).catch(ex => {
        ErrorHandler(ex, req, res, next);
    });
};

/**
 * Remove
 *
 * @public
 * @param {String} id
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { user, type } = req.locals;
        await Type.destroy({
            where: {
                id: type.id
            },
            params: {
                updated_by: pick(user, ['id', 'name'])
            },
            individualHooks: true
        });
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
