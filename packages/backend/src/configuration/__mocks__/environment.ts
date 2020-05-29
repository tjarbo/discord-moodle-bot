export const config = {
    admin: {
      id: '1234567890123456789',
      name: 'testuser#00000',
    },
    discordToken: 'xxxxxxxxxxxxxx',
    env: 'test',
    jwt: {
      secret: 'secret',
      expiresIn: '6h',
    },
    mongo: {
      host: 'mongodb://localhost:27017/fmdb',
      port: 27017
    },
    mongooseDebug: true,
    port: 4040,
    moodle: {
        baseURL: 'https://moodle.example.com',
        reminderTimeLeft: 86400,
        token: 'MOODLETOKEN123',
        useCourseShortname: true,
        userId: 123456
    },
  };
