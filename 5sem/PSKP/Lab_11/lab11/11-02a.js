const WebSocket = require("ws");
const fs = require("fs");

console.log('Starting client (Task 02)...');
console.log('Connecting to ws://localhost:4000...');

const ws = new WebSocket('ws://localhost:4000');
let k = 0;

ws.on('open', () => {
    console.log('Connected to server');
    const duplex = WebSocket.createWebSocketStream(ws, { encoding: 'utf8' });
    let filename = `./MyFile${++k}.txt`;
    let wfile = fs.createWriteStream(filename);
    
    console.log(`Receiving file to: ${filename}`);
    
    duplex.pipe(wfile);
    
    wfile.on('finish', () => {
        console.log(`File saved: ${filename}`);
        setTimeout(() => {
            ws.close();
        }, 1000);
    });
    
    wfile.on('error', (err) => {
        console.error(`Error saving file: ${err.message}`);
        ws.close();
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