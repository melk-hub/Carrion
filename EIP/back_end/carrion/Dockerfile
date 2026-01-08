FROM node:20.9-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 8080

COPY launcher.sh ./
RUN chmod +x launcher.sh

CMD ["./launcher.sh"]