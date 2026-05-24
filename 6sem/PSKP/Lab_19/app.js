const express = require('express');
const app = express();
const PORT = 3000;

const indexRouter = require('./routes/index');

app.use(express.json());

app.use('/', indexRouter);

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});