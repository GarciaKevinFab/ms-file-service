FROM node:20-alpine

WORKDIR /app

COPY ../../shared ./shared

COPY services/file-service/package*.json ./services/file-service/

WORKDIR /app/services/file-service

RUN npm install --production

COPY services/file-service/ .

RUN mkdir -p uploads/thumbnails

EXPOSE 3005

CMD ["node", "server.js"]
