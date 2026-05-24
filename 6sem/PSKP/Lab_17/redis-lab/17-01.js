const redis = require('redis');

const client = redis.createClient({
    url: 'redis://localhost:6379'
});

async function testConnection() {
    try {
        await client.connect();
        console.log('Успешное подключение к Redis серверу!');

        const pong = await client.ping();
        console.log(`PING сервера: ${pong}`);

        const info = await client.info();
        const version = info.split('\n')
            .find(line => line.startsWith('redis_version:'))
            .split(':')[1];
        console.log(`Версия Redis: ${version}`);
    } catch (error) {
        console.error('Ошибка подключения к Redis:', error.message);
    } finally {
        await client.quit();
        console.log('Отключение от Redis сервера');
    }
}

testConnection();
