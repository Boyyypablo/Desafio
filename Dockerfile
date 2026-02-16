FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
COPY frontend ./frontend
COPY pedidos.json ./

EXPOSE 3000

ENV PORT=3000
ENV PEDIDOS_FILE=./pedidos.json

CMD ["node", "src/index.js"]
