import { DataTypes, Model } from 'sequelize';
import { values } from 'lodash';

import postgres from '../../config/postgres';

/**
 * Create connection
 */
const sequelize = postgres.connect();

class AttributeDetail extends Model { }

AttributeDetail.Currencies = {
    VND: 'VND',
    USD: 'USD'
};

/**
 * Attribute Detail Schema
 * @public
 */
AttributeDetail.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        attribute_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        category_id: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        price: {
            type: DataTypes.INTEGER
        },
        currency: {
            type: DataTypes.STRING(20),
            validate: {
                isUppercase: true
            },
            values: values(AttributeDetail.Currencies),
            defaultValue: AttributeDetail.Currencies.VND
        },
        created_by: {
            type: DataTypes.JSONB,
            allowNull: false,
            defaultValue: {
                id: null,
                name: null
            }
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: () => new Date()
        }
    },
    {
        timestamps: false,
        sequelize: sequelize,
        tableName: 'tbl_attribute_details'
    }
);

/**
 * Methods
 */
AttributeDetail.transform = (model) => {
    const transformed = {};
    const fields = [
        'name',
        'price'
    ];

    transformed.id = model.category_id;
    fields.forEach((field) => {
        transformed[field] = model[field];
    });
    return transformed;
};

/**
 * Get categories by attribute id
 *
 * @public
 * @param {String} id
 */
AttributeDetail.getCategories = async (id) => {
    try {
        const categories = await AttributeDetail.findAll({
            where: {
                attribute_id: id
            }
        });
        return categories.map(
            x => AttributeDetail.transform(x)
        );
    } catch (ex) {
        throw (ex);
    }
};

AttributeDetail.sync({});
/**
 * @typedef AttributeDetail
 */
export default AttributeDetail;
