import { AppEvent, LogEvent } from 'rabbit-event-source';
import { serviceName } from '../../../config/vars';
import eventBus from '../event-bus';

function registerAppEvent() {
    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_CREATED, async ({
        source,
        message,
        data,
        user
    }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_CREATED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_CREATED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_CREATED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_UPDATED, async ({
        source,
        data,
        message,
        user
    }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_UPDATED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_UPDATED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_UPDATED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event create.
     * @public
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_DELETED, async ({
        source,
        message,
        data,
        user
    }) => {
        try {
            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_DELETED,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_DELETED} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_DELETED} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });

    /**
     * Create history event payment.
     * @public
     * @param {Object} source
     * @param {Object} user
     * @param {Object} data
     */
    eventBus.on(AppEvent.Events.APP_EVENT_PAYMENT, async ({
        source,
        user,
        data
    }) => {
        try {
            let message = '';
            if (data.new.total_unpaid === 0) {
                message = `Đơn hàng: ${data.id} đã được thanh toán xong.`;
            } else {
                message = `Đơn hàng: ${data.id} đã thanh toán thêm ${data.new.payment.total_paid - data.old.payment.total_paid}.`;
            }

            const appEvent = new AppEvent({
                source: source,
                message: message,
                event: AppEvent.Events.APP_EVENT_PAYMENT,
                created_by: user,
                data: data
            });
            await appEvent.save();
        } catch (ex) {
            console.log(`Cannot create history for ${AppEvent.Events.APP_EVENT_PAYMENT} at: ${serviceName}`);
            new LogEvent({
                code: ex.code || 500,
                message: `Cannot create history for ${AppEvent.Events.APP_EVENT_PAYMENT} at: ${serviceName}`,
                errors: ex.errors || null,
                stack: ex.stack || null
            }).save();
        }
    });
}

module.exports = {
    registerAppEvent
};

