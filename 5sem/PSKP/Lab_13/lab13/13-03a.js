const net = require('net');

let HOST = '127.0.0.1';
let PORT = 30000;

let x = Number(process.argv[2]) || 1;

let client = new net.Socket();
let buf = Buffer.alloc(4);
let messageCount = 0;

client.connect(PORT, HOST, () => {
    console.log(`Client connected to ${HOST}:${PORT}`);
    console.log(`Sending number ${x} every second...`);
    
    let timerId = setInterval(() => {
        buf.writeInt32LE(x, 0);
        client.write(buf);
        messageCount++;
        
        console.log(`Sent number ${x}`);
    }, 1000);
    
    setTimeout(() => {
        clearInterval(timerId);
        console.log(`\nClient stopped after 30 seconds`);
        console.log(`Total messages sent: ${messageCount}`);
        console.log(`Expected total sum: ${x * messageCount}`);
        client.end();
    }, 30000);
});

client.on('data', data => {
    if (data.length === 4) {
        let sum = data.readInt32LE();
        console.log(`Received sum from server: ${sum}`);
        
        let expected = x * messageCount;
        if (sum === expected) {
            console.log(`Correct! My sum should be: ${expected}\n`);
        } else {
            console.log(`Error! My sum should be: ${expected}, difference: ${Math.abs(sum - expected)}\n`);
        }
    }
});

client.on('close', () => {
    console.log(`Client disconnected`);
});

client.on('error', err => {
    console.log(`Client error: ${err}`);
});

process.on('SIGINT', () => {
    console.log(`\nClient stopped by user`);
    client.end();
    process.exit();
});