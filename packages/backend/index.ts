import { connect, set } from 'mongoose';
import * as util from 'util';

import { config } from './src/configuration/environment';
import { app } from './src/configuration/express';
import { loggerFile } from './src/configuration/logger';

connect(config.mongo.host, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(() => {
  loggerFile.debug('Mongoose connected');
}).catch((error) => {
  loggerFile.error('Mongoose NOT Connected', error);
});

// print mongoose logs in dev env
if (config.mongooseDebug) {
  set('debug', (collectionName: any, method: any, query: any, doc: any) => {
    loggerFile.debug(`${collectionName}.${method}`, util.inspect(query, false, 20), doc);
  });
}

const server = app.listen(config.port, () => {
  loggerFile.debug(`server started on http://localhost:${config.port} (${config.env})`);
});