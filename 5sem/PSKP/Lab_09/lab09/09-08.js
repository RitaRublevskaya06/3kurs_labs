const http = require('http');
const fs = require('fs');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/09-08',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('=== ЗАДАНИЕ 09-08 ===');
  console.log(`Статус ответа: ${res.statusCode}`);
  
  let data = Buffer.alloc(0);
  
  res.on('data', (chunk) => {
    data = Buffer.concat([data, chunk]);
  });
  
  res.on('end', () => {
    fs.writeFileSync('downloaded_file.txt', data);
    console.log('Файл успешно получен и сохранен как downloaded_file.txt');
    console.log(`Размер файла: ${data.length} байт`);
    console.log('=======================\n');
  });
});

req.on('error', console.error);
req.end();