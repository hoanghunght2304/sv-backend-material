import attributeEvent from '../common/services/managers/attribute.manager';

export default {
    register: () => {
        /** register customer event */
        attributeEvent.registerAttributeEvent();
    }
};
