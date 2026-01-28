require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const facultyController = require('./controllers/facultyController');
const pulpitController = require('./controllers/pulpitController');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Ошибка: MONGODB_URI не указан в .env файле');
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('Успешно подключено к MongoDB Atlas');
  console.log(`База данных: ${mongoose.connection.db.databaseName}`);
})
.catch((err) => {
  console.error('Ошибка подключения к MongoDB:', err.message);
  console.log('Проверьте:');
  console.log('1. Правильность строки подключения в .env');
  console.log('2. Доступность интернета');
  console.log('3. Настройки IP whitelist в MongoDB Atlas');
  console.log('4. Правильность имени пользователя и пароля');
  process.exit(1);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB отключена');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB соединение закрыто');
  process.exit(0);
});

app.get('/api/faculties', facultyController.getAllFaculties);
app.post('/api/faculties', facultyController.createFaculty);
app.put('/api/faculties/:id', facultyController.updateFaculty);
app.delete('/api/faculties/:id', facultyController.deleteFaculty);

app.get('/api/pulpits', pulpitController.getAllPulpits);
app.post('/api/pulpits', pulpitController.createPulpit);
app.put('/api/pulpits/:id', pulpitController.updatePulpit);
app.delete('/api/pulpits/:id', pulpitController.deletePulpit);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'BSTU API работает!',
    version: '1.0.0',
    description: 'API для управления факультетами и кафедрами БГУИР',
    endpoints: {
      faculties: {
        GET_all: 'GET /api/faculties',
        POST_create: 'POST /api/faculties',
        PUT_update: 'PUT /api/faculties/:id',
        DELETE: 'DELETE /api/faculties/:id'
      },
      pulpits: {
        GET_all: 'GET /api/pulpits',
        POST_create: 'POST /api/pulpits',
        PUT_update: 'PUT /api/pulpits/:id',
        DELETE: 'DELETE /api/pulpits/:id'
      }
    }
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Маршрут не найден',
    requested_url: req.url,
    method: req.method
  });
});

app.use((err, req, res, next) => {
  console.error('Ошибка приложения:', err);
  res.status(500).json({
    success: false,
    error: 'Внутренняя ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`API доступно по адресу: http://localhost:${PORT}`);
  console.log(`========================================\n`);
  console.log('Доступные эндпоинты:');
  console.log(`   GET  http://localhost:${PORT}/api/faculties`);
  console.log(`   POST http://localhost:${PORT}/api/faculties`);
  console.log(`   PUT  http://localhost:${PORT}/api/faculties/:id`);
  console.log(`   DEL  http://localhost:${PORT}/api/faculties/:id`);
  console.log('');
  console.log(`   GET  http://localhost:${PORT}/api/pulpits`);
  console.log(`   POST http://localhost:${PORT}/api/pulpits`);
  console.log(`   PUT  http://localhost:${PORT}/api/pulpits/:id`);
  console.log(`   DEL  http://localhost:${PORT}/api/pulpits/:id`);
  console.log(`\n========================================\n`);
});

process.on('SIGTERM', () => {
  console.log('Получен SIGTERM, завершаем работу...');
  server.close(() => {
    console.log('Сервер остановлен');
  });
});