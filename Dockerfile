FROM node:12.18-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app

#COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]

COPY ./packages/frontend/dist ./packages/frontend/dist
COPY ./packages/frontend/package*.json ./packages/frontend/

COPY ./packages/backend/dist ./packages/backend/dist
COPY ./packages/backend/package*.json ./packages/backend/
COPY ./packages/backend/src/docs/rest-api.yml ./packages/backend/src/docs/rest-api.yml

#RUN npm ci --only=production
RUN cd packages/frontend/ && npm ci --only=production --silent
RUN cd packages/backend/ && npm ci --only=production --silent

EXPOSE 4040

CMD ["node", "packages/backend/dist/index.js"]