import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model } from 'sequelize';
import { isEqual, includes, values, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/event-bus';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Material extends Model { }

/**
 * Currencies for material
 */
Material.Currencies = {
    VND: 'VND',
    USD: 'USD'
};

/**
 * Units for material
 */
Material.Units = {
    M: 'm',
    BO: 'bộ',
    TO: 'tờ',
    CAI: 'cái',
    DOI: 'đôi',
    GAM: 'gam',
    HOP: 'hộp',
    CUON: 'cuộn',
    QUYEN: 'quyển',
    CHIEC: 'chiếc',
    THUNG: 'thùng'
};

/**
 * Genders
 */
Material.Genders = {
    MALE: 'Male',
    FEMALE: 'Female',
    UNKNOWN: 'unknown'
};

/**
 * User Schema
 * @public
 */

Material.init(
    {
        /** material attributes */
        id: {
            type: DataTypes.STRING(50),
            validate: {
                isLowercase: true
            },
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            default: null
        },

        /** material detail */
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        images: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },
        properties: {
            type: DataTypes.JSONB,
            defaultValue: {
                unit: null,
                season: null,
                gender: null
            }
        },
        attributes: {
            type: DataTypes.ARRAY(DataTypes.STRING),
            defaultValue: []
        },

        /** price detail */
        currency: {
            type: DataTypes.STRING(20),
            validate: {
                isUppercase: true
            },
            values: values(Material.Currencies),
            defaultValue: Material.Currencies.VND
        },
        origin_price: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0
            },
            defaultValue: 0
        },
        price: {
            type: DataTypes.INTEGER,
            validate: {
                min: 0
            },
            defaultValue: 0
        },

        /** collection management */
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        tableName: 'tbl_materials'
    }
);


// materialSchema.index(
//     {
//         updated_at: 1,
//         created_at: 1,
//         'categories.id': 1,
//         unit: 1,
//         'attribute.id': 1,
//         currency: 1,
//         price: 1,
//         name: 1
//     }
// );


/**
 * Register event emiter
 */
Material.EVENT_SOURCE = `${serviceName}.material`;
Material.Events = {
    MATERIAL_CREATED: `${serviceName}.material.created`,
    MATERIAL_UPDATED: `${serviceName}.material.updated`,
    MATERIAL_DELETED: `${serviceName}.material.deleted`
};


/**
 * Add your
 * - validations
 * - virtuals
 */
Material.addHook('afterCreate', (model) => {
    const data = model.dataValues;
    eventBus.emit(
        Material.Events.MATERIAL_CREATED,
        {
            user: data.created_by,
            model: data,
        }
    );
});

Material.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);
    eventBus.emit(
        Material.Events.MATERIAL_UPDATED,
        {
            user: params.updated_by,
            model: {
                id: newModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged),
            }
        }
    );
});

Material.addHook('afterDestroy', (model, options) => {
    const { params } = options;
    eventBus.emit(
        Material.Events.MATERIAL_DELETED,
        {
            user: params.updated_by,
            model: model.dataValues,
        }
    );
});

/**
 * Transform postgre model to expose object
 */
Material.transform = (model) => {
    const transformed = {};
    const fields = [
        /** material attributes */
        'id',
        'type',
        'description',

        /** material detail */
        'name',
        'images',
        'properties',
        'attributes',

        /** material price */
        'currency',
        'origin_price',
        'price',

        /** collection manager */
        'is_active',
        'created_by',
        'created_at',
        'updated_at'
    ];

    fields.forEach((field) => {
        transformed[field] = model[field];
    });

    transformed.created_at = moment(model.created_at).unix();
    transformed.updated_at = moment(model.updated_at).unix();
    return transformed;
};

/**
 * Get all changed properties
 *
 * @public
 * @param {Object} data newModel || oleModel
 */
Material.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        /** material attributes */
        'type',
        'description',

        /** material detail */
        'name',
        'images',
        'properties',
        'attributes',

        /** material price */
        'currency',
        'origin_price',
        'price'
    ];

    /** get all changable properties */
    Object.keys(newModel).forEach((field) => {
        if (includes(allChangableProperties, field)) {
            changedProperties.push(field);
        }
    });

    /** get data changed */
    const dataChanged = [];
    changedProperties.forEach(field => {
        if (!isEqual(newModel[field], oldModel[field])) {
            dataChanged.push(field);
        }
    });

    return dataChanged;
};
/**
 * Get Material By Id
 *
 * @public
 * @param {String} materialId
 */
Material.getMaterialById = async (materialId) => {
    try {
        const material = await Material.findByPk(materialId);
        if (!material) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return material;
    } catch (ex) {
        throw (ex);
    }
};

/**
* Check duplicate id
*
* @public
* @param {String} id
*/
Material.checkDuplicateById = async (materialId) => {
    try {
        const material = await Material.findByPk(materialId);
        if (material) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.BAD_REQUEST
            });
        }
        return true;
    } catch (ex) {
        throw ex;
    }
};

Material.sync({});

/**
 * @typedef Material
 */
export default Material;
