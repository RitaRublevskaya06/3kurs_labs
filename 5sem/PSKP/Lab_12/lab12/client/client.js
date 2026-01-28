const WebSocket = require('ws');

class NotificationClient {
    constructor(wsUrl = 'ws://localhost:3000') {
        this.wsUrl = wsUrl;
        this.ws = null;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.wsUrl);
        
        this.ws.on('open', () => {
            console.log('Подключено к серверу уведомлений');
            console.log('Ожидание уведомлений об изменениях файла StudentList.json...\n');
        });
        
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                if (message.type === 'notification') {
                    const time = new Date(message.timestamp).toLocaleTimeString();
                    console.log(`[${time}] ${message.data}`);
                }
            } catch (error) {
                console.error('Ошибка обработки сообщения:', error);
            }
        });
        
        this.ws.on('error', (error) => {
            console.error('WebSocket ошибка:', error.message);
        });
        
        this.ws.on('close', () => {
            console.log('Отключено от сервера уведомлений');
            setTimeout(() => {
                console.log('Попытка переподключения...');
                this.connect();
            }, 5000);
        });
    }
}

if (require.main === module) {
    const client = new NotificationClient();
    
    console.log('=== Клиент для получения уведомлений ===');
    console.log('Клиент подключается к WebSocket серверу');
    console.log('Клиент показывает уведомления при изменении файла StudentList.json\n');
    console.log('Для проверки работы:');
    console.log('1. Используйте Postman для отправки запросов');
    console.log('2. Выполните POST/PUT/DELETE операции');
    console.log('3. Наблюдайте уведомления здесь\n');
    
    process.on('SIGINT', () => {
        console.log('\nЗавершение работы клиента...');
        if (client.ws) {
            client.ws.close();
        }
        process.exit(0);
    });
}

module.exports = NotificationClient;