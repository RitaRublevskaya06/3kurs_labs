const net = require('net');

let HOST = '127.0.0.1';
let PORT = 3000;

let totalSum = 0;

net.createServer((socket) => {
    console.log(`Server connected to ${socket.remoteAddress}:${socket.remotePort}`);
    
    let clientSum = 0;
    
    socket.on('data', data => {
        let number = data.readInt32LE();
        clientSum += number;
        totalSum += number;
        console.log(`Received ${number} from ${socket.remoteAddress}, client sum: ${clientSum}, total sum: ${totalSum}`);
    });
    
    let interval = setInterval(() => {
        let buf = Buffer.alloc(4);
        buf.writeInt32LE(totalSum, 0);
        socket.write(buf);
        console.log(`Sent total sum ${totalSum} to ${socket.remoteAddress}`);
    }, 5000);
    
    socket.on('close', () => {
        clearInterval(interval);
        console.log(`Connection closed: ${socket.remoteAddress}`);
    });
    
    socket.on('error', (err) => {
        clearInterval(interval);
        console.log(`Error: ${err.message}`);
    });
    
}).listen(PORT, HOST);

console.log(`TCP sum server listening on ${HOST}:${PORT}`);