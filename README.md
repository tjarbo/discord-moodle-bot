<div align="center">
    <a href="#"><img src="https://raw.githubusercontent.com/tjarbo/discord-moodle-bot/master/logo.png" alt="FMDB" width="200"></a>
    <br>
    <h1>Fancy-Moodle-Discord-Bot </h1>
    <sub>Built with ❤︎ by
    <a href="https://github.com/tjarbo">Tjark</a>,
    <a href="https://github.com/antonplagemann">Anton</a>,
    <a href="https://github.com/p-fruck">Philipp</a>,
    <a href="https://github.com/NoWo2000">Noah</a> and
    <a href="https://github.com/tjarbo/discord-moodle-bot/graphs/contributors">contributors</a>
    </sub>
</div>

---
![Build for Discord](https://img.shields.io/badge/build%20for-discord-blueviolet)
![Runs with Docker](https://img.shields.io/badge/runs%20with-docker-0db7ed)
![AGPL-3.0](https://img.shields.io/github/license/tjarbo/discord-moodle-bot)

The FMDB notifies you on a discord server about new activities on the Moodle platform. The current implementation includes:

- Notification of new or changed files
- Notification of new assignments
- Notification of assignments due soon

## 🚀 Setup your own bot
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/tjarbo/fmdb?color=0db7ed)
![Docker Pulls](https://img.shields.io/docker/pulls/tjarbo/fmdb?color=0db7ed)
[![Deploy to Heroku](https://img.shields.io/badge/deploy%20to-herkou-79589F)](https://github.com/tjarbo/discord-moodle-bot/wiki/Setup-with-heroku-and-mongodb-atlas)

The set-up is a somewhat more complex process. Therefore we have created a separate Wiki article for this purpose. You can find it [here](https://github.com/tjarbo/discord-moodle-bot/wiki/%F0%9F%9B%A0%EF%B8%8F-FMDB-einrichten).

## ⚒️ Development
![CI](https://github.com/tjarbo/discord-moodle-bot/workflows/Node%20CI/badge.svg?branch=master)
![CD](https://github.com/tjarbo/discord-moodle-bot/workflows/CD/badge.svg)
![GitHub issues](https://img.shields.io/github/issues/tjarbo/discord-moodle-bot)

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites ⚗️
> We have also setup a `.devcontainer`.  [Learn more](https://code.visualstudio.com/docs/remote/containers#_quick-start-open-an-existing-folder-in-a-container)

- Local MongoDB installation on port 27017 (https://docs.mongodb.com/manual/tutorial/install-mongodb-on-windows/)
- Node with NPM installed (https://nodejs.org/en/download/)
- Discord Server to test the application

#### Installing modules 📁

Run `npm i` at the root of the repository and `npm run postinstall`

#### Prepare environment 🦕

Follow the steps described in [this wiki artice](https://github.com/tjarbo/discord-moodle-bot/wiki/Setup-your-own-bot): Setup a bot for developing, generate your moodle token and save your `.env` file at `./packages/backend/`.

### Start development 🛫

Run `npm run start` at the root of the directory.

Attention: For coding use get functions first if defined!
Example: getDiscordChannel() and getRefreshRate() instead of
config constants discordChannel and fetchInterval.

### Links 🔗 (In most cases)

- The frontend can be opened under http://localhost:4040/
- The backend and especially the api can be reached at http://localhost:4040/api
- The api documentation can be found at http://localhost:4040/api/docs

## 🦸 Built With MEVN

- [MongoDB](https://www.mongodb.com/) - The database software
- [Express](https://expressjs.com/) - The web framework used at the backend
- [Vue.js](https://vuejs.org/) - The web framework used at the frontend
- [Node.js](https://nodejs.org/en/) - The power of the backend

## 🏆 Contributing

Every contribution is welcome! Do you have a great new feature idea or just want to be part of the project ? Awesome - get started with a look into the issues list. If a similar ticket doesn't exist, feel free to open a new one. The first step is to discuss your new idea or contribution to make sure, it follows the concept of the application. Afterwards, get started to code 💽! If you have finished you changes, create a pull request and we will review your changes!

## ⚖️ License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details

---

<div align="right">
    <a href="https://github.com/tjarbo/tjarbo/blob/main/EASTEREGG.md"><img src="https://raw.githubusercontent.com/tjarbo/tjarbo/main/assets/logo.gif" alt="Animated Gif" height="45"></a>
</div>
