const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const port = 3000;

http.createServer((req, res) => {
  if (req.method === 'GET' && req.url === '/') {
    fs.readFile('./06-02.html', (err, data) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(data);
    });
  } 
  else if (req.method === 'POST' && req.url === '/send') {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
    const formData = querystring.parse(body);
      
    console.log('Отправляем письмо:', formData);
      
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransport({
        host: 'smtp.mail.ru',
        port: 465,
        secure: true,
        auth: {
            user: 'primer@mail.ru',
            pass: 'sdfghyjuk'
            }
        });

        transporter.sendMail({
            from: formData.from,
            to: formData.to,
            bcc: 'margouniver@mail.ru',
            subject: 'Сообщение с Node.js',
            html: formData.message
        }, (err, info) => {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        if (err) {
            console.error(err);
            res.end("<h3>Ошибка при отправке письма!</h3><a href='/'>Назад</a>");
        } else {
            res.end("<h3>Письмо успешно отправлено!</h3><a href='/'>Назад</a>");
        }
    });

    });
  } 
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}).listen(port, () => {
  console.log(`Server is running at: http://localhost:${port}`);
});

