FROM node:20.9
WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
RUN npm install

COPY . .

EXPOSE 8080
CMD ["./launcher.sh"]