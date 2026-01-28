const fs = require('fs');
const WebSocket = require('ws');

console.log('Starting client...');

const ws = new WebSocket('ws://localhost:4000');

ws.on('open', () => {
    console.log('Connected to server');
    const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let rfile = fs.createReadStream('./MyFile.txt');
    
    rfile.pipe(duplex);
    
    rfile.on('end', () => {
        console.log('File sent successfully');
        setTimeout(() => {
            ws.close();
        }, 1000);
    });
});

ws.on('close', () => {
    console.log('Connection closed');
    process.exit(0);
});

ws.on('error', error => {
    console.error('Connection error:', error.message);
    process.exit(1);
});

setTimeout(() => {
    console.error('Connection timeout - server may not be running');
    process.exit(1);
}, 5000);