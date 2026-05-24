# Этап 1: Сборка приложения
FROM golang:1.21-alpine AS builder

# Устанавливаем необходимые утилиты
RUN apk add --no-cache git

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем go.mod и go.sum
COPY go.mod go.sum ./

# Загружаем зависимости
RUN go mod download

# Копируем исходный код
COPY . .

# Собираем приложение для Linux
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o GO04_01 .

# Этап 2: Финальный образ
FROM alpine:latest

# Устанавливаем ca-certificates для HTTPS запросов
RUN apk --no-cache add ca-certificates

# Создаем рабочую директорию
WORKDIR /root/

# Копируем бинарный файл из этапа сборки
COPY --from=builder /app/GO04_01 .
COPY --from=builder /app/celebrities.json .

# Открываем порт 3000
EXPOSE 3000

# Запускаем приложение
CMD ["./GO04_01"]