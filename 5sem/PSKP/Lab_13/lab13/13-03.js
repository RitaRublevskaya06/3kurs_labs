const net = require('net');

let HOST = '127.0.0.1';
let PORT = 30000;

let connections = new Map();

net.createServer((socket) => {
    let serverInterval = null;
    
    socket.id = `${socket.remoteAddress}:${socket.remotePort}`;
    connections.set(socket.id, 0);
    
    console.log(`Server connected to ${socket.remoteAddress}:${socket.remotePort}`);
    
    socket.on('data', (data) => {
        if (data.length === 4) {
            let number = data.readInt32LE();
            let currentSum = connections.get(socket.id);
            let newSum = currentSum + number;
            
            connections.set(socket.id, newSum);
            
            let totalSumAllClients = 0;
            for (let sum of connections.values()) {
                totalSumAllClients += sum;
            }
            
            console.log(`Received ${number} from ${socket.remoteAddress}, client sum: ${newSum}, total sum all clients: ${totalSumAllClients}`);
        }
    });
    
    let buf = Buffer.alloc(4);
    serverInterval = setInterval(() => {
        let clientSum = connections.get(socket.id);
        buf.writeInt32LE(clientSum, 0);
        socket.write(buf);
        
        console.log(`Sent individual sum ${clientSum} to ${socket.remoteAddress}`);
    }, 5000);
    
    socket.on('error', (err) => {
        console.log(`Error: ${err.message}`);
        clearInterval(serverInterval);
        connections.delete(socket.id);
    });
    
    socket.on('close', () => {
        console.log(`Connection closed: ${socket.remoteAddress}`);
        clearInterval(serverInterval);
        connections.delete(socket.id);
    });
    
}).listen(PORT, HOST);

console.log(`TCP sum server (improved) listening on ${HOST}:${PORT}`);