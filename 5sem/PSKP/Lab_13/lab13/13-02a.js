const net = require('net');

let HOST = '127.0.0.1';
let PORT = 3000;

let client = new net.Socket();
let buf = Buffer.alloc(4);
let counter = 1;

client.connect(PORT, HOST, () => {
    console.log(`Client connected to ${HOST}:${PORT}`);
    
    let interval = setInterval(() => {
        buf.writeInt32LE(counter, 0);
        client.write(buf);
        console.log(`Sent: ${counter}`);
        counter++;
    }, 1000);
    
    setTimeout(() => {
        clearInterval(interval);
        client.end();
        console.log('Client stopped after 20 seconds');
    }, 20000);
});

client.on('data', data => {
    console.log(`Received sum from server: ${data.readInt32LE()}`);
});

client.on('close', () => {
    console.log('Client disconnected');
});

client.on('error', err => {
    console.log(`Client error: ${err}`);
});