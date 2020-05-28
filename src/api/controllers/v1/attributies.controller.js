import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';
import Attribute from '../../../common/models/attribute.model';
import AttributeDetail from '../../../common/models/attribute-detail.model';

/**
 * List
 *
 * @public
 * @param {Parameters} query
 * @returns {Promise<Attribute[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await Attribute.findAndCountAll({
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
                group => Attribute.transform(group)
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
 * @param {Attribute} body
 * @returns {Promise<Attribute>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);
    return Attribute.create(
        req.body,
        {
            params: {
                categories: req.body.categories
            }
        }
    ).then((data) => {
        res.json({
            code: 0,
            message: messages.CREATE_SUCCESS,
            data: Attribute.transform(data)
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
 * @returns {Promise<Attribute>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Attribute.transform(req.locals.attributes) });

/**
 * Update
 *
 * @public
 * @param {Attribute} body
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const { user, attributes: oldModel } = req.locals;
    const dataChanged = Attribute.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  update existing item */
    const data = pick(req.body, dataChanged);
    data.updated_at = new Date();
    return Attribute.update(
        data,
        {
            where: {
                id: oldModel.id
            },
            params: {
                updated_by: pick(user, ['id', 'name']),
                categories: req.body.categories
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
        const { user, attributes } = req.locals;
        await Attribute.destroy({
            where: {
                id: attributes.id
            },
            params: {
                updated_by: pick(user, ['id', 'name'])
            },
            individualHooks: true
        });
        await AttributeDetail.destroy({
            where: {
                attribute_id: attributes.id
            }
        });
        return res.json({
            code: 0,
            message: messages.REMOVE_SUCCESS
        });
    } catch (ex) {
        return ErrorHandler(ex, req, res, next);
    }
};
