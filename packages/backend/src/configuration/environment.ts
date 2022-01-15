import { boolean, number, object, string } from '@hapi/joi';
import { config as dotenvConfig } from 'dotenv';

export const allowedLocales = ['en', 'de'];

// require and configure dotenv, will load vars in .env in PROCESS.ENV
dotenvConfig();

// define validation for all the env vars
const envVarsSchema = object({
  CONNECTOR_LOG_LIFETIME: string()
    .default('31d')
    .description('Defines how long log entries/items will be stored'),
  DISCORD_CHANNEL: string()
    .description('Channel ID to receive notifications.'),
  DISCORD_TOKEN: string()
    .description('Discord Token for bot.'),
  JWT_SECRET: string()
    .required()
    .description('Used to validate a jwt. Use a strong secret!'),
  JWT_EXPIRESIN: string()
    .default('10m')
    .description('Defines how long a user will be logged in.'),
  LANGUAGE: string()
    .allow(...allowedLocales)
    .default('en')
    .description('Defines the language for all notification messages.'),
  LOG_TO_FILE: boolean()
    .default(false)
    .description('Defines whether logs are written to filesystem or not'),
  MONGO_HOST: string()
    .required()
    .description('Path to your mongodb instance.'),
  MONGOOSE_DEBUG: boolean()
    .when('NODE_ENV', {
      is: string().equal('development'),
      then: boolean().default(true),
      otherwise: boolean().default(false),
    }),
  MOODLE_BASE_URL: string()
    .required()
    .uri()
    .description('URL of your Moodle instance, eg. https://moodle.example.com .'),
  MOODLE_FETCH_INTERVAL: number()
    .default(900000)
    .description('Interval to look for updates on Moodle (in ms).'),
  MOODLE_REMINDER_TIME_LEFT: number()
    .default(86400)
    .description('Send notification if deadline is within given time (in seconds).'),
  MOODLE_TOKEN: string()
    .required()
    .description('Token to communicate with Moodle-Webservice API.'),
  MOODLE_USE_COURSE_SHORTNAME: boolean()
    .default(true)
    .description('Whether to use short- or fullname of the courses in the discord message.'),
  MOODLE_USERID: number()
    .required()
    .description('Moodle user Id required to fetch course details.'),
  NODE_ENV: string()
    .allow('development')
    .allow('production')
    .allow('test')
    .allow('provision')
    .default('production'),
  PORT: number()
    .default(4040)
    .description('Defines the port the webserver will listen on.'),
  REGISTRATION_TOKEN_LIFETIME: string()
    .default('15m')
    .description('Defines how long a registration token can be used until it expires.'),
  RP_NAME: string()
    .default('Notification Service')
    .description('Human-readable title of the website for webauthn.'),
  RP_ID: string()
    .when('NODE_ENV', {
      is: string().equal('development'),
      then: string().default('localhost'),
      otherwise: string().min(8).required(),
    })
    .description('Unique identifier of the website for webauthn.'),
  RP_ORIGIN: string()
    .uri()
    .required()
    .description('URL your service will be available from. Compare with CORS.'),
}).unknown()
  .required();

type EnvVars = { [key: string]: string | number | boolean }

const { error, value: envVars } = envVarsSchema.validate(process.env);
const envDescriptionLink = 'https://github.com/tjarbo/discord-moodle-bot/wiki/What-is-inside-.env%3F';
if (error) throw new Error(`Config validation error: ${error.message} \nSee ${envDescriptionLink} for more information`);

export const config = {
  connectorLogLifetime: envVars.CONNECTOR_LOG_LIFETIME as string,
  discordChannel: envVars.DISCORD_CHANNEL as string,
  discordToken: envVars.DISCORD_TOKEN as string,
  env: envVars.NODE_ENV as string,
  jwt: {
    secret: envVars.JWT_SECRET as string,
    expiresIn: envVars.JWT_EXPIRESIN as string,
  },
  language: envVars.LANGUAGE as string,
  logToFile: envVars.LOG_TO_FILE as boolean,
  mongo: {
    host: envVars.MONGO_HOST as string,
  },
  mongooseDebug: envVars.MONGOOSE_DEBUG as boolean,
  moodle: {
    baseURL: envVars.MOODLE_BASE_URL as string,
    fetchInterval: envVars.MOODLE_FETCH_INTERVAL as number,
    reminderTimeLeft: envVars.MOODLE_REMINDER_TIME_LEFT as number,
    token:   envVars.MOODLE_TOKEN as string,
    useCourseShortname: envVars.MOODLE_USE_COURSE_SHORTNAME as boolean,
    userId:  envVars.MOODLE_USERID as number,
  },
  port: envVars.PORT as number,
  registrationTokenLifetime: envVars.REGISTRATION_TOKEN_LIFETIME as string,
  rp: {
    name: envVars.RP_NAME  as string,
    id: envVars.RP_ID as string,
    origin: envVars.RP_ORIGIN  as string,
  },
};
