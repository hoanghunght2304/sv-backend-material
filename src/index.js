import app from './config/express';
import { port, env } from './config/vars';
import provider from './providers/index';
import persistent from './config/persistent';

/**
 * open persistent connection
 * service will shutdown when any database disconnect or error.
 */
persistent
    .connect()
    .then(() => {
        // register provider
        provider.register();

        // listen to requests
        const server = app.listen(port, () =>
            console.info(`Server started on port ${port} (${env})`)
        );

        function terminate(exitCode) {
            return () => {
                console.log('Terminating');
                server.close(() => {
                    persistent.disconnect().then(() => {
                        process.exit(exitCode);
                    });
                });
            };
        }

        // handle close
        process.on('SIGINT', terminate(0));
        process.on('SIGTERM', terminate(0));
        process.on('SIGUSR1', terminate(-1));
    })
    .catch((err) => {
        console.log(err);
        process.exit(-1);
    });

/**
 * Exports express
 * @public
 */
export default app;
