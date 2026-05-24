const redis = require('redis');

async function benchmarkIncrDecr() {
    const client = redis.createClient({
        url: 'redis://localhost:6379'
    });
    
    await client.connect();
    console.log('Задание 3 (10000 операций)\n');
    
    await client.set('counter', '0');
    
    console.log('Выполнение INCR операций...');
    const incrStart = Date.now();
    for (let i = 0; i < 10000; i++) {
        await client.incr('counter');
    }
    const incrTime = Date.now() - incrStart;
    const finalValue = await client.get('counter');
    console.log(`INCR: ${incrTime} мс (финальное значение: ${finalValue})\n`);
    
    await client.set('counter', '10000');
    
    console.log('Выполнение DECR операций...');
    const decrStart = Date.now();
    for (let i = 0; i < 10000; i++) {
        await client.decr('counter');
    }
    const decrTime = Date.now() - decrStart;
    const finalValue2 = await client.get('counter');
    console.log(`DECR: ${decrTime} мс (финальное значение: ${finalValue2})\n`);
    
    await client.quit();
}

benchmarkIncrDecr().catch(console.error);