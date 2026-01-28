const http = require('http');

const x = 10;
const y = 5;

const options = {
  hostname: 'localhost',
  port: 3000,
  path: `/09-02?x=${x}&y=${y}`,
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log('=== ЗАДАНИЕ 09-02 ===');
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
req.end();