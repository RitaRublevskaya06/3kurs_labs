FROM node:18-alpine

WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем остальные файлы
COPY . .

# Создаем директорию для данных, если её нет
RUN mkdir -p data

# Указываем порт
EXPOSE 3000

# Запускаем приложение
CMD ["npm", "start"]