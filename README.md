<div align="center">
    <img src="https://raw.githubusercontent.com/tjarbo/discord-moodle-bot/version-2/logo.svg" alt="Mailbox Icon by Bootstrap" width="200">
    <br>
    <h1>Moodle Notification Service</h1>
    <small>⚠️ Branch under active development. More <a href="#-news-from-core-team-for-version-2">here</a></small> 
    <br>
    <small>Built with ❤︎ by
    <a href="https://github.com/tjarbo">Tjark</a>,
    <a href="https://github.com/antonplagemann">Anton</a>,
    <a href="https://github.com/p-fruck">Philipp</a>,
    <a href="https://github.com/NoWo2000">Noah</a> and
    <a href="https://github.com/tjarbo/discord-moodle-bot/graphs/contributors">contributors</a>
    </small>
</div>

---
![AGPL-3.0](https://img.shields.io/github/license/tjarbo/discord-moodle-bot)
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/tjarbo/fmdb?color=0db7ed)
![Docker Pulls](https://img.shields.io/docker/pulls/tjarbo/fmdb?color=0db7ed)

The Moodle Notification Service is a web application, that notifies you about various activities on your Moodle Server. Notifications can be send to **all your favorite messaging channels ❤️ like Matrix, Slack, MS Teams, etc.¹**. The current implementation includes:

- Notifications of new files
- Notifications of new assignments
- Notifications of assignments due soon

¹ Currently only Discord is supported, more are coming soon. If we are to slow for you, make a PR 😉

---
## 📬 News from core team for version 2!
Hey 👋

Version 2 of the Moodle Notification Service (formerly "Fancy Moodle Discord Bot") is still under active development and testing. If you want to setup our own service, please checkout the version-1 branch and follow the instructions in [this wiki](https://docs.tjarbo.me/moodle-notification-service/1.0.0/home). Overall the entire project is still under active development. That means it is very likely that **new major versions will break the backwards compatibility.** So make sure to read the change log before you start an upgrade. 

But what is new in version 2? After a long time we have successfully re-implemented the connector service to make it as easy as possible to add new services like Matrix, MS Teams or Webhooks. Our goal was to remove Discord as a dependency for authentication and instead use the lasted state-of-the-art technologies. Now the Moodle Notification Service uses [WebAuthn](https://docs.tjarbo.me/moodle-notification-service/2.0.0/advanced-guides/what-is-passwordless). But before we can publish a new release, it's time to test, measuring performance and to update [the wiki](https://docs.tjarbo.me/moodle-notification-service/2.0.0/home)

To stay up to date and get notified as soon as a new release is available, click on *watch* in the upper right corner, then *custom* and activate *Releases* and *Discussions* ✅ (so that your inbox does not get spammed 😉)! And if you like the Moodle Notification Service, give it a 🌟 - thank you 🤩!

Cheers 🍻!

---

## 🚀 Setup your own bot
[![Deploy with Docker](https://img.shields.io/badge/deploy%20with-docker-0db7ed)](https://github.com/tjarbo/discord-moodle-bot/wiki/Setup-with-docker)
[![Deploy to Heroku](https://img.shields.io/badge/deploy%20to-herkou-79589F)](https://github.com/tjarbo/discord-moodle-bot/wiki/Setup-with-heroku-and-mongodb-atlas)
[![CD - Release](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.release.yml/badge.svg)](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.release.yml)
[![CD - Main](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.main.yml/badge.svg)](https://github.com/tjarbo/discord-moodle-bot/actions/workflows/cd.main.yml)

To run your own Service you can choose from various manuals we wrote in our wiki. Click [here](https://docs.tjarbo.me) to get started.

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
<div align="left">
    Icon by <a href="https://github.com/twbs/icons">Bootstrap</a> published under <a href="https://github.com/twbs/icons/blob/main/LICENSE.md">MIT licence</a>.
</div>

<div align="right">
    <a href="https://github.com/tjarbo/tjarbo/blob/main/EASTEREGG.md"><img src="https://raw.githubusercontent.com/tjarbo/tjarbo/main/assets/logo.gif" alt="Animated Gif" height="45"></a>
</div>
