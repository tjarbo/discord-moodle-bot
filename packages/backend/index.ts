import { connect, set } from 'mongoose';
import * as util from 'util';
import { config } from './src/configuration/environment';
import { app } from './src/configuration/express';
import { loggerFile } from './src/configuration/logger';
import { getRefreshRate } from './src/controllers/refreshRate/refreshRate';
import { Administrator } from './src/controllers/administrator/administrator.schema';
import { fetchAndNotify } from './src/controllers/moodle';

connect(config.mongo.host, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(async() => {
  loggerFile.debug('Mongoose connected');

  Administrator.findOne({'userName': config.admin.name}).then((user) => {
    if (user) return; // If env-admin already exits - skip setup

    // add env-admin to database
    const userObj = {
      userName: config.admin.name,
      userId: config.admin.id,
    };

    new Administrator(userObj).save();
  });

  // First call of fetchAndNotify depending on the database interval
  const interval = await getRefreshRate();
  setTimeout(fetchAndNotify,interval);

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
