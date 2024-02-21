FROM node:20.11.1-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "index.js"]