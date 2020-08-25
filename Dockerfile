FROM node:12.18-alpine
ENV NODE_ENV production
WORKDIR /usr/src/fmdb
 
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

RUN npm install --production --silent && mv node_modules ../

COPY . .

RUN npm run postinstall

EXPOSE 4040

RUN npm build
CMD ["node", "packages/backend/dist/index.js"]