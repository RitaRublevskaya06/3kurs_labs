const http = require('http');

const postData = JSON.stringify({
  x: 15,
  y: 3,
  s: 'Hello Server'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/09-03',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log('=== ЗАДАНИЕ 09-03 ===');
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
req.write(postData);
req.end();