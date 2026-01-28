const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/09-01',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('=== ЗАДАНИЕ 09-01 ===');
  console.log(`Статус ответа: ${res.statusCode}`);
  console.log(`Сообщение к статусу: ${res.statusMessage}`);
  console.log(`IP-адрес удаленного сервера: ${res.socket.remoteAddress}`);
  console.log(`Порт удаленного сервера: ${res.socket.remotePort}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Данные в теле ответа:');
    console.log(data);
    console.log('=======================\n');
  });
});

req.on('error', console.error);
req.end();