import { pick } from 'lodash';

import messages from '../../../config/messages';
import { handler as ErrorHandler } from '../../middlewares/errors';

import Material from '../../../common/models/material.model';

/**
 * List
 *
 * @public
 * @param query
 * @permision MATERIAL_LIST
 * @returns {Promise<Material[]>, APIException>}
 */
exports.list = async (req, res, next) => {
    try {
        const result = await Material.findAndCountAll({
            where: req.conditions,
            order: [
                ['name', 'ASC']
            ],
            limit: req.query.limit,
            offset: req.query.skip
        });

        return res.json({
            code: 0,
            count: result.count,
            data: result.rows.map(
                material => Material.transform(material)
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
 * @param {Material} body
 * @permision MATERIAL_CREATE
 * @returns {Promise<Material>, APIException>}
 */
exports.create = async (req, res, next) => {
    const { user } = req.locals;
    req.body.created_by = pick(user, ['id', 'name']);
    return Material.create(req.body)
        .then((data) => {
            res.json({
                code: 0,
                message: messages.CREATE_SUCCESS,
                data: Material.transform(data)
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
 * @permision MATERIAL_DETAIL
 * @returns {Promise<Material>, APIException>}
 */
exports.detail = async (req, res, next) => res.json({ code: 0, data: Material.transform(req.locals.material) });

/**
 * Update
 *
 * @public
 * @param {Material} body
 * @permission MATERIAL_UPDATE
 * @returns {Promise<>, APIException>}
 */
exports.update = async (req, res, next) => {
    const {
        user,
        material: oldModel
    } = req.locals;
    const dataChanged = Material.getChangedProperties({
        oldModel: oldModel,
        newModel: req.body
    });

    /**  replace existing item */
    const params = pick(req.body, dataChanged);
    params.updated_at = new Date();
    return Material.update(
        params,
        {
            where: {
                id: oldModel.id
            },
            params: {
                updated_by: pick(user, ['id', 'name'])
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
 * @permission MATERIAL_DELETE
 * @returns {Promise<>, APIException>}
 */
exports.delete = async (req, res, next) => {
    try {
        const { material, user } = req.locals;
        await Material.destroy({
            where: {
                id: material.id
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
