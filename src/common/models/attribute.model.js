import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { DataTypes, Model } from 'sequelize';
import { isEqual, includes, pick, keys } from 'lodash';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';
import eventBus from '../services/event-bus';
import AttributeDetail from '../models/attribute-detail.model';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Attribute extends Model { }

Attribute.init(
    {
        id: {
            type: DataTypes.STRING,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(500),
            defaultValue: null
        },
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
        tableName: 'tbl_attributes'
    }
);

/**
 * Register event emiter
 */
Attribute.EVENT_SOURCE = `${serviceName}.material`;
Attribute.Events = {
    MATERIAL_CREATE: `${serviceName}.material.create`,
    MATERIAL_UPDATE: `${serviceName}.material.update`
};

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */
Attribute.addHook('afterCreate', (model, options) => {
    const { categories } = options.params;
    eventBus.emit(
        Attribute.Events.MATERIAL_CREATE,
        {
            model: model.dataValues,
            categories: categories
        }
    );
});

Attribute.addHook('afterUpdate', (model, options) => {
    const { params } = options;
    const newModel = model.dataValues;
    const oldModel = model._previousDataValues;
    const dataChanged = keys(model._changed);
    eventBus.emit(
        Attribute.Events.MATERIAL_UPDATE,
        {
            user: params.updated_by,
            categories: params.categories,
            model: {
                id: newModel.id,
                old: pick(oldModel, dataChanged),
                new: pick(newModel, dataChanged)
            }
        }
    );
});

/**
 * Methods
 */
Attribute.transform = (model) => {
    const transformed = {};
    const fields = [
        /** for info attribute */
        'id',
        'name',
        'description',
        'categories',

        /** for collection manager */
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
 * Get changed properties
 * @public
 */
Attribute.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = [
        'name',
        'description',
        'categories'
    ];

    /** get all changable properties */
    allChangableProperties.forEach((field) => {
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
 *
 * @public
 * @param {String} AttributeId
 */
Attribute.getAttributeById = async (id) => {
    try {
        const categories = await AttributeDetail.getCategories(id);
        const attribute = await Attribute.findByPk(id);
        if (!attribute) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return Object.assign(
            attribute,
            {
                categories: categories
            }
        );
    } catch (ex) {
        throw (ex);
    }
};

Attribute.checkDuplicateAttributeId = async (atttributeId) => {
    try {
        const attribute = await Attribute.findByPk(atttributeId);
        if (attribute) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.ATTRIBUTE_EXISTS
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};

Attribute.sync({});

/**
 * @typedef Attribute
 */
export default Attribute;
