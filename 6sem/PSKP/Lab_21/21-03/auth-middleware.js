const users = require('./users.json');

module.exports = (req, res, next) => {
    if (req.session && req.session.user) {
        return next();
    }
    
    if (req.method === 'POST' && req.path === '/login') {
        const { username, password } = req.body;
        
        console.log('Попытка входа:', username);
        
        if (users[username] && users[username] === password) {
            req.session.user = { username };
            console.log('Успешный вход:', username);
            return res.redirect('/resource');
        } else {
            console.log('Ошибка входа:', username);
            return res.status(401).send(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Ошибка входа</title>
                    <style>
                        body { font-family: Arial; margin: 40px; }
                        .container { max-width: 400px; margin: 0 auto; }
                        .error { color: red; }
                        a { color: #4CAF50; text-decoration: none; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="error">Ошибка входа</h1>
                        <p>Неверное имя пользователя или пароль.</p>
                        <p><a href="/login">Попробовать снова</a></p>
                    </div>
                </body>
                </html>
            `);
        }
    }
    
    if (req.path === '/resource' && !req.session.user) {
        return res.redirect('/login');
    }
    
    next();
};