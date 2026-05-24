FROM node:18-alpine

WORKDIR /app

# Копируем файлы приложения
COPY package*.json ./
COPY app.js ./

# Устанавливаем зависимости
RUN npm install

# Открываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["node", "app.js"]