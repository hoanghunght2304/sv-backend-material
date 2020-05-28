import httpStatus from 'http-status';
import moment from 'moment-timezone';
import { isEqual, includes } from 'lodash';
import { DataTypes, Model } from 'sequelize';

import postgres from '../../config/postgres';
import { serviceName } from '../../config/vars';
import APIException from '../utils/APIException';
import messages from '../../config/messages';

/**
 * Create connection
 */
const sequelize = postgres.connect();
class Type extends Model { }

Type.init(
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
        tableName: 'tbl_types'
    }
);

/**
 * Register event emiter
 */
Type.EVENT_SOURCE = `${serviceName}.material`;
Type.Events = {
    MATERIAL_CREATE: `${serviceName}.material.create`
};


/**
 * Methods
 */
Type.transform = (model) => {
    const transformed = {};
    const fields = [
        /** for info type */
        'id',
        'name',
        'description',

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
 *
 * @public
 * @param {String} TypeId
 */
Type.getTypeById = async (TypeId) => {
    try {
        const type = await Type.findByPk(TypeId);
        if (!type) {
            throw new APIException({
                status: httpStatus.NOT_FOUND,
                message: messages.NOT_FOUND
            });
        }
        return type;
    } catch (ex) {
        throw (ex);
    }
};

/**
 * Statics
 */
Type.getChangedProperties = ({ newModel, oldModel }) => {
    const changedProperties = [];
    const allChangableProperties = ['name', 'description'];

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

Type.checkDuplicateTypeId = async (typeId) => {
    try {
        const type = await Type.findByPk(typeId);
        if (type) {
            throw new APIException({
                status: httpStatus.BAD_REQUEST,
                message: messages.TYPES_EXISTS
            });
        }
        return true;
    } catch (ex) {
        throw (ex);
    }
};

Type.sync({});


/**
 * @typedef Type
 */
export default Type;
