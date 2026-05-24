const redis = require('redis');

async function pubsubDemo() {
    const subscriber = redis.createClient({ url: 'redis://localhost:6379' });
    const publisher = redis.createClient({ url: 'redis://localhost:6379' });
    
    await subscriber.connect();
    await publisher.connect();
    
    console.log('Задание 5\n');
    
    await subscriber.subscribe('news', (message) => {
        console.log(`[Подписчик] Получено сообщение из канала 'news': "${message}"`);
    });
    
    await subscriber.subscribe('notifications', (message) => {
        console.log(`[Подписчик] Получено сообщение из канала 'notifications': "${message}"`);
    });
        
    console.log('Публикация сообщений...');
    
    await publisher.publish('news', 'Redis 8.0 вышел с новыми возможностями!');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await publisher.publish('notifications', 'У вас новое сообщение');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await publisher.publish('news', 'Сессия по Redis начинается через 5 минут');
    await new Promise(resolve => setTimeout(resolve, 100));
    
    await publisher.publish('notifications', 'Система будет перезагружена');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await subscriber.unsubscribe('news');
    await subscriber.unsubscribe('notifications');
    console.log('\n Отписка от каналов завершена');
    
    await publisher.publish('news', 'Это сообщение не будет доставлено (отписка)');
    console.log('Сообщение после отписки не получено подписчиком');
    
    await subscriber.quit();
    await publisher.quit();
}

pubsubDemo().catch(console.error);