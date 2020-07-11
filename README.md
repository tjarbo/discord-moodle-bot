# 🤖 Fancy-Moodle-Discord-Bot 

![Node CI](https://github.com/tjarbo/discord-moodle-bot/workflows/Node%20CI/badge.svg?branch=master)
![Build with Buefy](https://img.shields.io/badge/build%20with-buefy-7957d5)
![GitHub issues](https://img.shields.io/github/issues/tjarbo/discord-moodle-bot)
![GitHub](https://img.shields.io/github/license/tjarbo/discord-moodle-bot)
![Build for Discord](https://img.shields.io/badge/build%20for-discord-blueviolet)

The FMDB notifies you on a discord server about new activities on the Moodle platform. The current implementation includes:

- Notification of new or changed files 
- Notification of new assignments
- Notification of assignments due soon 

## ✈️ Get started

The set-up is a somewhat more complex process. Therefore we have created a separate Wiki article for this purpose. You can find it [here](#). 
> ⚠️ According to the current status, the article could unfortunately not yet be created. 

## ⚒️ Development

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites ⚗️

- Local MongoDB installation on port 27017 (https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
- Node with NPM is installed (https://nodejs.org/en/download/)

#### Installing modules 📁
Run `npm i` at the root of the repository.

#### Create .env file 🔐
The backend will fail, if wrong environments variables are provided. If no .env file is provided, please create `packages/backend/.env` with following content:
```
ADMIN_ID=00000...000
ADMIN_NAME=username#00000
DISCORD_CHANNEL=00000...000
DISCORD_TOKEN=XXXXXX....XXX
JWT_SECRET=ChooseTheSecretWisely
JWT_EXPIRESIN=1h
MONGO_HOST=mongodb://localhost:27017/fmdb
MONGOOSE_DEBUG=true
MOODLE_BASE_URL=https://moodle.example.com/
MOODLE_FETCH_INTERVAL=1000
MOODLE_REMINDER_TIME_LEFT=86400
MOODLE_TOKEN=XXXXXXXXXXXXXXXXX
MOODLE_USE_COURSE_SHORTNAME=true
MOODLE_USERID=00000
NODE_ENV=development
SERVER_PORT=4040
```

Attention: For coding use get functions first if defined!
Example: getDiscordChannel() and getRefreshRate() instead of
config constants discordChannel and fetchInterval.

### Start development 🛫
Run `npm run start` at the root of the directory.

### Links 🔗 (In most cases)
- The frontend can be opened under http://localhost:8080/
- The backend and especially the api can be reached at http://localhost:4040/api
- The api documentation can be found at http://localhost:4040/api/docs
## 🦸 Built With MEVN

* [MongoDB](https://www.mongodb.com/) - The database software
* [Express](https://expressjs.com/) - The web framework used at the backend
* [vue.js](https://vuejs.org/) - The web framework used at the frontend
* [node.js](https://rometools.github.io/rome/) - The power of the backend 

## 🏆 Contributing

Right now, this project is part of a web engineering course. So the development is limited to a few people. After completion of the course, however, every contribution is welcome!

## ⚖️ License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
