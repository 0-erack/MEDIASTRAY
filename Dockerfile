# backend/Dockerfile

FROM node:20

WORKDIR /usr/src/app

#RUN npm install --only=production
COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

WORKDIR /usr/src/app/frontend
RUN npm install
RUN npm run build
WORKDIR /usr/src/app

EXPOSE 8510

CMD ["node", "dist/server.js"]
#CMD ["npm", "run", "build", "; npm", "run", "start"]
#CMD ["npm", "run", "start"]
