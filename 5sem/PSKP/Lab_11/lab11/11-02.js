const WebSocket = require("ws");
const fs = require("fs");

const wss = new WebSocket.Server({ port: 4000, host: 'localhost' });

console.log('WebSocket server started (Task 02)');
console.log('Port: 4000');
console.log('Host: localhost');
console.log('Sending file: ./download/ServerFile.txt');
console.log('Waiting for connections...');

wss.on('connection', ws => {
    console.log('Client connected');
    const duplex = WebSocket.createWebSocketStream(ws, {encoding: 'utf8'});
    let rfile = fs.createReadStream('./download/ServerFile.txt');
    
    rfile.pipe(duplex);
    
    rfile.on('end', () => {
        console.log('File sent to client');
    });
    
    rfile.on('error', (err) => {
        console.error('Error reading file:', err.message);
    });
    
    ws.on('close', () => {
        console.log('Client disconnected');
        console.log('Waiting for next connection...');
    });
});

wss.on('error', error => {
    console.error('Server error:', error.message);
});