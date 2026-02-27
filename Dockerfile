# backend/Dockerfile

FROM node:20

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY . .

EXPOSE 8510

#CMD ["node", "server.mjs"]
CMD ["npm", "run", "start"]
