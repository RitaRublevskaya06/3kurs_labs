const http = require('http');

const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
<request id="28">
    <x value="1"/>
    <x value="2"/>
    <x value="3"/>
    <m value="Hello"/>
    <m value=" "/>
    <m value="World"/>
    <m value="!"/>
</request>`;

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/09-05',
    method: 'POST',
    headers: {
        'Content-Type': 'application/xml',
        'Content-Length': Buffer.byteLength(xmlData),
        'User-Agent': 'Lab09-Client/1.0'
    }
};

console.log('=== ЗАДАНИЕ 09-05 ===');
console.log('Отправляемые XML данные:');
console.log(xmlData);

const req = http.request(options, (res) => {
    console.log('\n--- Ответ сервера ---');
    console.log(`Статус ответа: ${res.statusCode} ${res.statusMessage}`);
    console.log('Content-Type:', res.headers['content-type']);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('\nДанные в теле ответа:');
        console.log(data);
        
        console.log('=======================\n');
    });
});

req.on('error', (error) => {
    console.error('Ошибка при выполнении запроса:', error);
});

req.write(xmlData);
req.end();