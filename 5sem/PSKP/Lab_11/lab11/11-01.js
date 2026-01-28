const fs = require('fs');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 4000, host: 'localhost' });

let k = 0;

console.log('WebSocket server started');
console.log('Port: 4000');
console.log('Host: localhost');
console.log('Waiting for connections...');

wss.on('connection', ws => {
    console.log('Client connected');
    const duplex = WebSocket.createWebSocketStream(ws, { encoding: 'utf8' });
    let filename = `./upload/file${++k}.txt`;
    let wfile = fs.createWriteStream(filename);
    
    console.log(`Creating file: ${filename}`);
    
    duplex.pipe(wfile);
    
    wfile.on('finish', () => {
        console.log(`File saved: ${filename}`);
        console.log('Waiting for next connection...');
    });
    
    wfile.on('error', (err) => {
        console.error(`Error saving file: ${err.message}`);
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

wss.on('error', error => {
    console.error('Server error:', error.message);
});