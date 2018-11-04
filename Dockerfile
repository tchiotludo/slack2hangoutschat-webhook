FROM node:11-alpine as build-deps

WORKDIR /usr/src/build
COPY package*.json ./
COPY . .
RUN npm install && npm run build


FROM node:11-alpine

WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY --from=build-deps /usr/src/build/dist /usr/src/app/dist
COPY public/ ./public
ENV NODE_ENV "production"
EXPOSE 3000

CMD [ "node", "dist/server.js" ]
