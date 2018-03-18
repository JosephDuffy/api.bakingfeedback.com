FROM node:carbon

# Create app directory
WORKDIR /usr/src/app

COPY package.json ./
COPY yarn.lock ./

ENV NODE_ENV=production

RUN yarn install

COPY . .
RUN npm run build

EXPOSE 13515

CMD [ "npm", "start" ]