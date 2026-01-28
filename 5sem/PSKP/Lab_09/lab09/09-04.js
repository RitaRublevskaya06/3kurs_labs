const http = require('http');

const postData = JSON.stringify({
    "_comment": "Запрос. Лабораторная работа 9/4",
    "x": 15,
    "y": 25,
    "s": "Сообщение",
    "m": ["e", "f", "g", "h"],
    "o": {
        "surname": "Иванов",
        "name": "Иван"
    }
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/09-04',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Lab09-Client/1.0'
    }
};

console.log('=== ЗАДАНИЕ 09-04 ===');
console.log('Отправляемые данные:');
console.log(JSON.stringify(JSON.parse(postData), null, 2));

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
        try {
            const parsedData = JSON.parse(data);
            console.log(JSON.stringify(parsedData, null, 2));
            
        } catch (e) {
            console.log(data);
        }
        console.log('=======================\n');
    });
});

req.on('error', (error) => {
    console.error('Ошибка при выполнении запроса:', error);
});

req.write(postData);
req.end();