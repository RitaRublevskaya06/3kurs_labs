const http = require('http');
const fs = require('fs');
const path = require('path');

function createTestPngFile() {
    const filename = 'MyFile.png';
    if (!fs.existsSync(filename)) {
        console.log('Создание тестового PNG файла...');
        const buffer = Buffer.alloc(1024 * 1024);
        buffer.fill(0);
        
        buffer.write('\x89PNG\r\n\x1a\n', 0);
        
        fs.writeFileSync(filename, buffer);
        console.log(`Создан файл ${filename} размером ${buffer.length} байт`);
    }
    return filename;
}

const pngFilename = createTestPngFile();

console.log('=== ЗАДАНИЕ 09-07 ===');

const fileData = fs.readFileSync(pngFilename);

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/09-07',
    method: 'POST',
    headers: {
        'Content-Type': 'image/png',
        'Content-Length': fileData.length,
        'X-Filename': path.basename(pngFilename),
        'User-Agent': 'Lab09-Client/1.0'
    }
};

console.log(`Размер файла: ${fileData.length} байт (${(fileData.length / 1024 / 1024).toFixed(2)} МБ)`);
console.log('Отправка файла...');

const req = http.request(options, (res) => {
    console.log('\n--- Ответ сервера ---');
    console.log(`Статус ответа: ${res.statusCode} ${res.statusMessage}`);
    
    let responseData = '';
    res.on('data', (chunk) => {
        responseData += chunk;
    });
    
    res.on('end', () => {
        console.log('\nДанные в теле ответа:');
        try {
            const parsedData = JSON.parse(responseData);
            console.log(JSON.stringify(parsedData, null, 2));
        } catch (e) {
            console.log(responseData);
        }
        console.log('=======================\n');
    });
});

req.on('error', (error) => {
    console.error('Ошибка при выполнении запроса:', error);
});

req.write(fileData);
req.end();