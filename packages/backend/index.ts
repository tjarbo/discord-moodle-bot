import { config } from './src/configuration/environment';
import { app } from './src/configuration/express';
import { loggerFile } from './src/configuration/logger';

const server = app.listen(config.port, () => {
  loggerFile.debug(`server started on http://localhost:${config.port} (${config.env})`);
}); 