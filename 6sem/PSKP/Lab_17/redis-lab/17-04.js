const redis = require('redis');

async function benchmarkHsetHget() {
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });
    
    await client.connect();
    console.log('Задание 4 (10000 операций)\n');
    
    console.log('Выполнение HSET операций...');
    const hsetStart = Date.now();
    for (let i = 1; i <= 10000; i++) {
        await client.hSet('main_hash', i.toString(), JSON.stringify({
            id: i,
            val: `val-${i}`
        }));
    }
    const hsetTime = Date.now() - hsetStart;
    console.log(`HSET: ${hsetTime} мс\n`);
    
    console.log('Выполнение HGET операций...');
    const hgetStart = Date.now();
    for (let i = 1; i <= 10000; i++) {
        await client.hGet('main_hash', i.toString());
    }
    const hgetTime = Date.now() - hgetStart;
    console.log(`HGET: ${hgetTime} мс\n`);
    
    await client.quit();
}

benchmarkHsetHget().catch(console.error);