# 🤖 Fancy-Moodle-Discord-Bot 

The FMDB notifies you on a discord server about new acitivities on the moodle platform.

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
ADMIN_NAME=usernname#00000
DISCORD_TOKEN=XXXXXX....XXX
JWT_SECRET=ChooseTheSecreteWisely
JWT_EXPIRESIN=1h
MONGO_HOST=mongodb://localhost:27017/fmdb
MONGOOSE_DEBUG=true
NODE_ENV=development
SERVER_PORT=4040
```

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
* [node.js](https://rometools.github.io/rome/) - Framework at the 

## 🏆 Contributing

Right now, this project is part of a web engineering course. So the development is limited to a few people. After completion of the course, however, every contribution is welcome!

<!--
## Authors

* **Billie Thompson** - *Initial work* - [PurpleBooth](https://github.com/PurpleBooth)

See also the list of [contributors](https://github.com/your/project/contributors) who participated in this project.
-->
## ⚖️ License

This project is licensed under the AGPL-3.0 License - see the [LICENSE.md](LICENSE.md) file for details
