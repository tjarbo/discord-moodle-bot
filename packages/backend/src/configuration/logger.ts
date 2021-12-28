import log4js from 'log4js';
import { config } from './environment';

const configLogger = {
    appenders: {
      default: {
        type: 'stdout',
        layout: {
          type: 'pattern',
          pattern: '%m',
      }},
      file: {
        type: 'file',
        filename: 'log/server.log',
        maxLogSize: 10485760,
        layout: {
          type: 'pattern',
          pattern: '[%d{ISO8601}] %m',
      }
    }},
    categories: {
      all: { appenders: ['default', 'file'], level: 'all'},
      default: { appenders: ['default'], level: 'all'},
    }

};

const logTyp = config.logsToFile ? 'all' : 'default';
export const loggerFile = log4js.configure(configLogger).getLogger(logTyp);
export const loggerMiddleware = log4js.connectLogger(loggerFile, {level: 'auto'});
