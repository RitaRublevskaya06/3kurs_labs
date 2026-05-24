const express = require('express');
const passport = require('passport');
const DigestStrategy = require('passport-http').DigestStrategy;

const users = require('./users.json');

const app = express();
const PORT = 3000;

passport.use(new DigestStrategy(
    { qop: 'auth' },
    (username, done) => {
        console.log('Попытка входа:', username);
        
        if (users[username]) {
            return done(null, { username }, users[username]);
        }
        return done(null, false);
    },
    (params, done) => {
        done(null, true);
    }
));

app.use(passport.initialize());

app.get('/login', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Digest Authentication</title>
            <style>
                body { font-family: Arial; margin: 40px; }
                .container { max-width: 400px; margin: 0 auto; }
                .info { background: #f0f0f0; padding: 20px; border-radius: 5px; }
                .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 3px; }
                .button:hover { background: #45a049; }
                .note { background: #fff3cd; padding: 10px; border-radius: 3px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Digest Authentication</h1>
                
                <div class="info">
                    <p>Для доступа к защищенному ресурсу используется Digest-аутентификация.</p>
                    <p>Нажмите кнопку ниже для входа.</p>
                    
                    <p><strong>Тестовые пользователи:</strong></p>
                    <ul>
                        <li>admin / secret</li>
                        <li>user / password</li>
                    </ul>
                    
                    <p><a href="/resource" class="button">Перейти к защищенному ресурсу</a></p>
                </div>
            </div>
        </body>
        </html>
    `);
});

app.get('/resource', 
    passport.authenticate('digest', { session: false }),
    (req, res) => {
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
                        <h2>Добро пожаловать, ${req.user.username}!</h2>
                        <p>Это защищенный ресурс. Вы успешно вошли через Digest аутентификацию.</p>
                        <p><a href="/logout">Выйти из системы</a></p>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
);

app.get('/logout', (req, res) => {
    res.set('WWW-Authenticate', 'Digest realm="Users", qop="auth"');
    res.status(401).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Выход</title>
            <style>
                body { font-family: Arial; margin: 40px; }
                .container { max-width: 400px; margin: 0 auto; }
                .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 3px; }
                .button:hover { background: #45a049; }
                .note { background: #fff3cd; padding: 10px; border-radius: 3px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Выход из системы</h1>
                <p>Вы успешно вышли из системы.</p>
                <p>Для повторного входа нажмите кнопку ниже.</p>
                                
                <p><a href="/login" class="button">Вернуться на главную</a></p>
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
                <p><a href="/login">Вернуться на главную</a></p>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log('=================================');
    console.log('21-02 DIGEST сервер запущен');
    console.log(`Порт: ${PORT}`);
    console.log('Ссылки:');
    console.log('  - http://localhost:3000/login  - информация о входе');
    console.log('  - http://localhost:3000/resource - защищенный ресурс');
    console.log('  - http://localhost:3000/logout - выход');
    console.log('Пользователи: admin/secret, user/password');
    console.log('=================================');
});