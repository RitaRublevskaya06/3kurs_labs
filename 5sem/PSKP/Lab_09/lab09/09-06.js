const http = require('http');
const fs = require('fs');

if (!fs.existsSync('MyFile.txt')) {
  fs.writeFileSync('MyFile.txt', 'Это содержимое моего файла\nВторая строка файла\nТретья строка файла');
}

const fileContent = fs.readFileSync('MyFile.txt', 'utf8');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/09-06',
  method: 'POST',
  headers: {
    'Content-Type': 'text/plain',
    'Content-Length': Buffer.byteLength(fileContent, 'utf8')
  }
};

const req = http.request(options, (res) => {
  console.log('=== ЗАДАНИЕ 09-06 ===');
  console.log(`Статус ответа: ${res.statusCode}`);
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Данные в теле ответа:');
    console.log(data);
    console.log('=======================\n');
  });
});

req.on('error', console.error);
req.write(fileContent);
req.end();