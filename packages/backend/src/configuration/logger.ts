import log4js from 'log4js';
import {config} from './environment';

const configLogger = {
    appenders: {
      default: {
        type: 'stdout',
        layout: {
          type: 'pattern',
          pattern: '[%d{ISO8601}] %m',
      }},
      server: {
        type: 'file',
        filename: 'log/server.log',
        maxLogSize: 10485760,
        layout: {
          type: 'pattern',
          pattern: '[%d{ISO8601}] %m',
      }
    }},
    categories: {
      default: { appenders: ['default'], level: 'all'},
      production: { appenders: ['server'], level: 'all'},
    }

};

// if development then print in console, else in log
const logTyp = config.env === 'development' ? 'default' : 'production';
export const loggerFile = log4js.configure(configLogger).getLogger(logTyp);
export const loggerMiddleware = log4js.connectLogger(loggerFile, {level: 'auto'});