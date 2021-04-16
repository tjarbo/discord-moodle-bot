import { connect, set } from 'mongoose';
import { RegistrationToken } from './src/controllers/authentication/registrationToken.schema';
import * as util from 'util';
import { config } from './src/configuration/environment';
import { app } from './src/configuration/express';
import { loggerFile } from './src/configuration/logger';
import { Administrator } from './src/controllers/administrator/administrator.schema';
import { continuousFetchAndNotify } from './src/controllers/moodle';
import { MoodleSettings } from './src/controllers/moodle/schemas/moodle.schema';

connect(config.mongo.host, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }).then(async() => {
  loggerFile.debug('Mongoose connected');

  Administrator.findOne({ $and: [{ 'devices': { $ne: [] }}, { 'devices': { $ne: null }}] }).then(user => {
      if (user !== null) return; // An admin already exists!

      // No admin have been found -> Create a registration token
      // and print it into the logs
      new RegistrationToken().save().then(token => {
        loggerFile.info('No administrator found!');
        loggerFile.info(`Visit ${config.rp.origin}/register and use to following token: ${token.key}`);
        loggerFile.info(`This token is valid for 15 minutes.`);
      });
  });

  MoodleSettings.findOne()
  .then((moodleSettings) => {
    if (moodleSettings) return;

    const moodleSettingsObj = {
      refreshRate: config.moodle.fetchInterval
    };

    new MoodleSettings(moodleSettingsObj).save();
    loggerFile.debug(`Initialized moodle settings with .env values`);

  }).finally(async () => {
    // First call of fetchAndNotify depending on the database interval
    const interval = await MoodleSettings.getRefreshRate();
    const nextFetch = Math.floor((Date.now() + interval) / 1000);
    await MoodleSettings.findOneAndUpdate({}, { $set: { nextFetch }});
    setTimeout(continuousFetchAndNotify, interval);
  });

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
