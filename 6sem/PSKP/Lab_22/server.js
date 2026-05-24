const https = require('https');
const fs = require('fs');

const options = {
    // key: fs.readFileSync('resource.key'),
    // cert: fs.readFileSync('resource.crt')
    key: fs.readFileSync('RS.key'),
    cert: fs.readFileSync('RS.crt')
};

const server = https.createServer(options, (req, res) => {
    console.log(`Запрос: ${req.method} ${req.url}`);
    
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Лабораторная работа 22</title>
            <style>
                body { font-family: Arial; text-align: center; padding: 50px; }
                h1 { color: #4CAF50; }
                .info { background: #f0f0f0; padding: 20px; border-radius: 10px; margin-top: 20px; }
                .success { color: green; font-size: 48px; }
            </style>
        </head>
        <body>
            <div class="success">✔</div>
            <h1>Лабораторная работа 22</h1>
            <div class="info">
                <p><strong>Студент (Resource):</strong> RMV</p>
                <p><strong>CA:</strong> CA-LAB22-SAV</p>
                <p><strong>Домен:</strong> ${req.headers.host}</p>
                <p><strong>URL:</strong> ${req.url}</p>
                <p><strong>HTTPS работает!</strong></p>
            </div>
        </body>
        </html>
    `);
});

server.listen(443, '0.0.0.0', () => {
    console.log('HTTPS сервер запущен');
    console.log('Проверьте: https://localhost');
});