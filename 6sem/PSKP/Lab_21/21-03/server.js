const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const authMiddleware = require('./auth-middleware');

const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true
}));

app.use(authMiddleware);

app.get('/login', (req, res) => {
    if (req.session.user) {
        return res.redirect('/resource');
    }
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Forms Authentication</title>
            <style>
                body { font-family: Arial; margin: 40px; }
                .container { max-width: 400px; margin: 0 auto; }
                .form-group { margin-bottom: 15px; }
                label { display: block; margin-bottom: 5px; }
                input { width: 100%; padding: 8px; box-sizing: border-box; }
                button { padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor: pointer; }
                button:hover { background: #45a049; }
                .info { background: #f0f0f0; padding: 10px; border-radius: 5px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Forms Authentication</h1>
                <p>Введите имя пользователя и пароль для входа:</p>
                
                <form method="POST" action="/login">
                    <div class="form-group">
                        <label for="username">Имя пользователя:</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Пароль:</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    
                    <button type="submit">Войти</button>
                </form>
                
                <div class="info">
                    <p><strong>Тестовые пользователи:</strong></p>
                    <ul>
                        <li>admin / secret</li>
                        <li>user / password</li>
                    </ul>
                    <p>Перейдите на <a href="/resource">/resource</a> для доступа к защищенному ресурсу</p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/logout', (req, res) => {
    const username = req.session.user ? req.session.user.username : 'Unknown';
    console.log('Выход пользователя:', username);
    
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
        }
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Выход</title>
                <style>
                    body { font-family: Arial; margin: 40px; }
                    .container { max-width: 400px; margin: 0 auto; }
                    a { color: #4CAF50; text-decoration: none; }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Вы успешно вышли из системы</h1>
                    <p>Сессия завершена.</p>
                    <p><a href="/login">Войти снова</a> | <a href="/resource">Защищенный ресурс</a></p>
                </div>
            </body>
            </html>
        `);
    });
});

app.get('/resource', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>RESOURCE</title>
            <style>
                body { font-family: Arial; margin: 40px; }
                .container { max-width: 600px; margin: 0 auto; }
                .welcome { color: #4CAF50; }
                a { color: #4CAF50; text-decoration: none; }
                a:hover { text-decoration: underline; }
                .info { background: #f0f0f0; padding: 20px; border-radius: 5px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1 class="welcome">RESOURCE</h1>
                <div class="info">
                    <h2>Добро пожаловать, ${req.session.user.username}!</h2>
                    <p>Это защищенный ресурс. Вы успешно вошли через Forms аутентификацию.</p>
                    <p><a href="/logout">Выйти из системы</a></p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>404 Not Found</title>
            <style>
                body { font-family: Arial; margin: 40px; }
                .container { max-width: 400px; margin: 0 auto; }
                a { color: #4CAF50; text-decoration: none; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404 Not Found</h1>
                <p>Запрашиваемая страница не найдена.</p>
                <p><a href="/login">Войти в систему</a> | <a href="/resource">Защищенный ресурс</a></p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log('21-03 FORMS сервер запущен');
    console.log(`Порт: ${PORT}`);
    console.log('Ссылки:');
    console.log('  - http://localhost:3000/login  - форма входа');
    console.log('  - http://localhost:3000/resource - защищенный ресурс');
    console.log('  - http://localhost:3000/logout - выход');
    console.log('Пользователи: admin/secret, user/password');
    console.log('=================================');
});