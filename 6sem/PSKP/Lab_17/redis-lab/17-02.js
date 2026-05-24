const redis = require('redis');

async function benchmark() {
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });
    
    await client.connect();
    console.log('Задание 2 (10000 операций)\n');
    
    console.log('Выполнение SET операций...');
    const setStart = Date.now();
    for (let i = 1; i <= 10000; i++) {
        await client.set(`key:${i}`, `value:${i}`);
    }
    const setTime = Date.now() - setStart;
    console.log(`SET: ${setTime} мс\n`);
    
    console.log('Выполнение GET операций...');
    const getStart = Date.now();
    for (let i = 1; i <= 10000; i++) {
        await client.get(`key:${i}`);
    }
    const getTime = Date.now() - getStart;
    console.log(`GET: ${getTime} мс\n`);
    
    console.log('Выполнение DEL операций...');
    const delStart = Date.now();
    for (let i = 1; i <= 10000; i++) {
        await client.del(`key:${i}`);
    }
    const delTime = Date.now() - delStart;
    console.log(`DEL: ${delTime} мс\n`);
    
    await client.quit();
}

benchmark().catch(console.error);