import { boolean, number, object, string } from '@hapi/joi';
import { config as dotenvConfig } from 'dotenv';

// require and configure dotenv, will load vars in .env in PROCESS.ENV
dotenvConfig();

// define validation for all the env vars
const envVarsSchema = object({
  NODE_ENV: string()
    .allow('development')
    .allow('production')
    .allow('test')
    .allow('provision')
    .default('development'),
  SERVER_PORT: number()
    .default(4040),
  MONGOOSE_DEBUG: boolean()
    .when('NODE_ENV', {
      is: string().equal('development'),
      then: boolean().default(true),
      otherwise: boolean().default(false)
    }),
  MONGO_HOST: string().required()
    .description('Mongo DB host url'),
  MONGO_PORT: number()
    .default(27017),
  DISCORD_TOKEN: string().required()
  .description('Discord Token for bot'),
  ADMIN_ID: string().required()
  .description('Discord ID of the admin'),
  ADMIN_NAME: string().required().regex(/[a-z]+#[0-9]+/)
  .description('Discord username#0000 of the admin'),
  JWT_SECRET: string().required(),
  JWT_EXPIRESIN: string().required(),
}).unknown()
  .required();

const { error, value: envVars } = envVarsSchema.validate(process.env);
if (error) throw new Error(`Config validation error: ${error.message}`);

export const config = {
  admin: {
    id: envVars.ADMIN_ID,
    name: envVars.ADMIN_NAME,
  },
  discordToken: envVars.DISCORD_TOKEN,
  env: envVars.NODE_ENV,
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRESIN,
  },
  mongo: {
    host: envVars.MONGO_HOST,
    port: envVars.MONGO_PORT
  },
  mongooseDebug: envVars.MONGOOSE_DEBUG,
  port: envVars.SERVER_PORT,
};
