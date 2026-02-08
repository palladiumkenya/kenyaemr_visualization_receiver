FROM node:20.11.1-bullseye-slim

WORKDIR /app

COPY package*.json ./

RUN npm install && npm cache clean --force

COPY . .

RUN chmod +x docker/start.sh

EXPOSE 5000

ENV NODE_ENV=production

CMD ["sh", "docker/start.sh"]