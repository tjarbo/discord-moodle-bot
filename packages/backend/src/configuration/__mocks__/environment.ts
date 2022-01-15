export const config = {
  connectorLogLifetime: 1,
  discordToken: 'xxxxxxxxxxxxxx',
  discordChannel: 'xxxxxxxxxxxxxx',
  env: 'test',
  jwt: {
    secret: 'secret',
    expiresIn: '6h',
  },
  language: 'en',
  logToFile: false,
  mongo: {
    host: 'mongodb://localhost:27017/fmdb',
  },
  mongooseDebug: true,
  moodle: {
    baseURL: 'https://moodle.example.com',
    fetchInterval: '12',
    reminderTimeLeft: 86400,
    token: 'MOODLETOKEN123',
    useCourseShortname: true,
    userId: 123456,
  },
  port: 8080,
  registrationTokenLifetime: 123,
  rp: {
    name: 'Unit Test',
    id: 'localhost',
    origin: 'http://localhost',
  },
};
