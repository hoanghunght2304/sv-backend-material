import { AppEvent, LogEvent, JobEvent } from 'rabbit-event-source';
import Material from '../../models/material.model';
import { serviceName } from '../../../config/vars';
import eventBus from '../event-bus';

const modelName = 'material';
const queueName = `${serviceName}.${modelName}.crud_material_to_inventory`;

function registerMaterialEvent() {
    /**
     * Add material
     *
     * @param {Material} model
     */
    eventBus.on(Material.Events.MATERIAL_CREATED, async ({ user, model }) => {
        try {
            // event add material to inventory
            const jobSyncMaterial = new JobEvent({
                name: queueName,
                source: Material.EVENT_SOURCE,
                created_by: model.created_by,
                created_at: new Date(),
                data: {
                    event_type: 'create',
                    item: model
                }
            });

            await jobSyncMaterial.save();
        } catch (ex) {
            console.log(`Cannot add material: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot add material: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'materials',
                message: `${user.id} đã tạo mới nguyên phụ liệu: ${model.id}`,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: model.created_by,
                data: model
            }).save();
        }
    });

    /**
     * Update material
     *
     * @param {Material} model
     */
    eventBus.on(Material.Events.MATERIAL_UPDATED, async ({ user, model }) => {
        try {
            // event add material to inventory
            const jobSyncMaterial = new JobEvent({
                name: queueName,
                source: Material.EVENT_SOURCE,
                created_by: model.created_by,
                created_at: new Date(),
                data: {
                    event_type: 'replace',
                    item: Object.assign(
                        { id: model.id },
                        model.new
                    )
                }
            });
            await jobSyncMaterial.save();
        } catch (ex) {
            console.log(`Cannot update material: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot update material: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'materials',
                message: `${user.id} cập nhật nguyên phụ liệu: ${model.id}`,
                event: AppEvent.Events.APP_EVENT_UPDATED,
                created_by: user,
                data: model
            }).save();
        }
    });

    /**
     * Delete material
     *
     * @param {Material} model
     */
    eventBus.on(Material.Events.MATERIAL_DELETED, async ({ user, model }) => {
        try {
            // event add material to inventory
            const jobSyncMaterial = new JobEvent({
                name: queueName,
                source: Material.EVENT_SOURCE,
                created_by: model.created_by,
                created_at: new Date(),
                data: {
                    event_type: 'delete',
                    item: model
                }
            });
            await jobSyncMaterial.save();
        } catch (ex) {
            console.log(`Cannot delete material: ${model.id}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot delete material: ${model.id}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        } finally {
            new AppEvent({
                source: 'materials',
                message: `${user.id} xóa nguyên phụ liệu: ${model.id}`,
                event: AppEvent.Events.APP_EVENT_DELETED,
                created_by: user,
                data: model
            }).save();
        }
    });
}
module.exports = {
    registerMaterialEvent
};

