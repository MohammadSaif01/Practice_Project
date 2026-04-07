FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

RUN chown -R node:node /app
USER node

EXPOSE 5000

CMD ["npm", "run", "dev"]
