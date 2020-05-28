import materialEvent from '../common/services/managers/material.manager';

export default {
    register: () => {
        /** register customer event */
        materialEvent.registerMaterialEvent();
    }
};
