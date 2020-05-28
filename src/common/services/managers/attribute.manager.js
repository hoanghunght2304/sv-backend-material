import { AppEvent, LogEvent } from 'rabbit-event-source';
import AttributeDetail from '../../models/attribute-detail.model';
import Atrribute from '../../models/attribute.model';
import eventBus from '../event-bus';

function registerAttributeEvent() {
    /**
     * Add attribute price follow category id when attribute created
     *
     * @param {Atrribute} model
     * @param {Category[]} attribute
     */
    eventBus.on(Atrribute.Events.MATERIAL_CREATE, async ({ model, categories = [] }) => {
        try {
            const operations = [];
            categories.map(
                x => operations.push({
                    price: x.price,
                    category_id: x.id,
                    currency: x.currency,
                    attribute_id: model.id,
                    created_by: model.created_by,
                    created_at: new Date(),
                    updated_at: new Date()
                })
            );
            await AttributeDetail.bulkCreate(operations);
        } catch (ex) {
            console.log(`Cannot add attribute: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot add attribute: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'attributes',
                message: `${model.created_by.id} đã tạo mới loại chất: ${model.id}`,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: model.created_by,
                data: model
            }).save();
        }
    });

    /**
     * Update attribute price follow category id when attribute updated
     *
     * @param {Object} user
     * @param {Object} model
     * @param {Category[]} categories
     */
    eventBus.on(Atrribute.Events.MATERIAL_UPDATE, async ({ user, model, categories = [] }) => {
        try {
            categories.map(x => {
                AttributeDetail.update(
                    {
                        price: x.price,
                        currency: x.currency,
                        updated_at: new Date()
                    },
                    {
                        where: {
                            category_id: x.id,
                            attribute_id: model.id
                        }
                    }
                );
                return true;
            });
        } catch (ex) {
            console.log(`Cannot update price attribute: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot update price attribute: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'attributes',
                message: `${user.id} cập nhật loại chất: ${model.id}`,
                event: AppEvent.Events.APP_EVENT_UPDATED,
                created_by: user,
                data: model
            }).save();
        }
    });
}
module.exports = {
    registerAttributeEvent
};

