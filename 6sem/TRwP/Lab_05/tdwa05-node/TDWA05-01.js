const express = require('express');
const app = express();

app.use(express.json());

const args = process.argv.slice(2);
let Nick = 'Default';
let Port = 3000;
let Delay = 1000;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--Nick' || args[i] === '-n') {
        Nick = args[i + 1];
        i++;
    } else if (args[i] === '--Port' || args[i] === '-p') {
        Port = parseInt(args[i + 1]);
        i++;
    } else if (args[i] === '--Delay' || args[i] === '-d') {
        Delay = parseInt(args[i + 1]);
        i++;
    }
}

// Функция задержки
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Маршрут GET /lb - задержка 1/3 * Delay
app.get('/lb', async (req, res) => {
    const delayTime = Math.floor(Delay / 3);
    console.log(`[${Nick}] Получен GET /lb запрос, задержка ${delayTime}ms`);
    await sleep(delayTime);
    res.json({ 
        Nick: Nick, 
        Method: "GET", 
        Delay: delayTime,
        Timestamp: new Date().toISOString()
    });
});

// Маршрут POST /lb - задержка 2/3 * Delay
app.post('/lb', async (req, res) => {
    const delayTime = Math.floor(2 * Delay / 3);
    console.log(`[${Nick}] Получен POST /lb запрос, задержка ${delayTime}ms`);
    console.log(`Body:`, req.body);
    await sleep(delayTime);
    res.json({ 
        Nick: Nick, 
        Method: "POST", 
        Delay: delayTime,
        Body: req.body,
        Timestamp: new Date().toISOString()
    });
});

// Маршрут PUT /lb - задержка Delay
app.put('/lb', async (req, res) => {
    const delayTime = Delay;
    console.log(`[${Nick}] Получен PUT /lb запрос, задержка ${delayTime}ms`);
    console.log(`Body:`, req.body);
    await sleep(delayTime);
    res.json({ 
        Nick: Nick, 
        Method: "PUT", 
        Delay: delayTime,
        Body: req.body,
        Timestamp: new Date().toISOString()
    });
});

// Маршрут DELETE /lb - задержка 1/4 * Delay
app.delete('/lb', async (req, res) => {
    const delayTime = Math.floor(Delay / 4);
    console.log(`[${Nick}] Получен DELETE /lb запрос, задержка ${delayTime}ms`);
    await sleep(delayTime);
    res.json({ 
        Nick: Nick, 
        Method: "DELETE", 
        Delay: delayTime,
        Timestamp: new Date().toISOString()
    });
});

app.listen(Port, () => {
    console.log(`Сервер ${Nick} запущен на порту ${Port} с базовой задержкой ${Delay}ms`);
    console.log(`GET /lb -> задержка ${Math.floor(Delay/3)}ms`);
    console.log(`POST /lb -> задержка ${Math.floor(2*Delay/3)}ms`);
    console.log(`PUT /lb -> задержка ${Delay}ms`);
    console.log(`DELETE /lb -> задержка ${Math.floor(Delay/4)}ms`);
});