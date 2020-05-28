import appEvent from './app-event';
import attribuiteEvent from './attribute-event';
import materialEvent from './material-event';

export default {
    register: () => {
        // register any event emitter || event rabbitmq here
        appEvent.register();
        attribuiteEvent.register();
        materialEvent.register();
    }
};
