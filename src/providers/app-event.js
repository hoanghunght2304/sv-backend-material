import appEvent from '../common/services/managers/app-event-manager';

export default {
    register: () => {
        /** register app event */
        appEvent.registerAppEvent();
    }
};
