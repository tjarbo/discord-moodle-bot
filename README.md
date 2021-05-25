<div align="center">
    <a href="#"><img src="https://raw.githubusercontent.com/tjarbo/discord-moodle-bot/master/logo.png" alt="FMDB" width="200"></a>
    <br>
    <h1>Fancy-Moodle-Discord-Bot </h1>
    <small>Built with ❤︎ by
    <a href="https://github.com/tjarbo">Tjark</a>,
    <a href="https://github.com/antonplagemann">Anton</a>,
    <a href="https://github.com/p-fruck">Philipp</a>,
    <a href="https://github.com/NoWo2000">Noah</a> and
    <a href="https://github.com/tjarbo/discord-moodle-bot/graphs/contributors">contributors</a>
    </small>
</div>

---
![Build for Discord](https://img.shields.io/badge/build%20for-discord-blueviolet)
![AGPL-3.0](https://img.shields.io/github/license/tjarbo/discord-moodle-bot)
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/tjarbo/fmdb?color=0db7ed)
![Docker Pulls](https://img.shields.io/docker/pulls/tjarbo/fmdb?color=0db7ed)

The FMDB notifies you on a discord server about new activities on the Moodle platform. The current implementation includes:

- Notification of new or changed files
- Notification of new assignments
- Notification of assignments due soon

---
## 📮 News from core team!
Hey 👋 Almost a year ago, we made the first commit to this repo 🤯. While back then, the focus was mainly on getting any notification on Discord. Since then we have added many improvements and new features. But over time, our tools have changed as well. That's why we are in the process of becoming more independent from Discord with the upcoming versions, so you can be notified on **all your favorite channels ❤️ like Matrix, Slack, MS Teams, etc.**, even if you do not have a Discord Account! 

With the next two (maybe three) versions, **we will make fundamental changes**, so the code will not be backward compatible. Do not forget to read the changelog if you start an upgrade 🧐. More information [here](https://github.com/tjarbo/discord-moodle-bot/discussions/89)!

To stay up to date and get notified as soon as a new release is available, click on *watch* in the upper right corner, then *custom* and activate *Releases* and *Discussions* ✅ (so that your inbox is not spammed 😉)! And if you like the fmdb, give it a 🌟 - thank you 🤩!

Cheers 🍻!

---

## 🚀 Setup your own bot
[![Deploy with Docker](https://img.shields.io/badge/deploy%20with-docker-0db7ed)](https://github.com/tjarbo/discord-moodle-bot/wiki/Setup-with-docker)
[![Deploy to Heroku](https://img.shields.io/badge/deploy%20to-herkou-79589F)](https://github.com/tjarbo/discord-moodle-bot/wiki/Setup-with-heroku-and-mongodb-atlas)
[![CD - Release](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.release.yml/badge.svg)](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.release.yml)
[![CD - Main](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.main.yml/badge.svg)](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.main.yml)

The set-up is a somewhat more complex process. Therefore we have created a separate Wiki article for this purpose. You can find it [here](https://github.com/tjarbo/discord-moodle-bot/wiki/).

## ⚒️ Development
[![CI](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/ci.yml)
![GitHub last commit](https://img.shields.io/github/last-commit/tjarbo/discord-moodle-bot)
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

Do you have a great new feature idea or just want to be part of the project ? Awesome! Every contribution is welcome! If you want to find out more about how to contribute to the project, please checkout our [CONTRIBUTING.md](CONTRIBUTING.md)!

## ⚖️ License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details

---

<div align="right">
    <a href="https://github.com/tjarbo/tjarbo/blob/main/EASTEREGG.md"><img src="https://raw.githubusercontent.com/tjarbo/tjarbo/main/assets/logo.gif" alt="Animated Gif" height="45"></a>
</div>
