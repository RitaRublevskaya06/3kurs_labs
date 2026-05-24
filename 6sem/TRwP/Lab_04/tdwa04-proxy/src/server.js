const express = require('express');
const app = express();

app.use(express.json());

const args = process.argv.slice(2);
let Nick = 'Default';
let Port = 3000;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--Nick' || args[i] === '-n') {
        Nick = args[i + 1];
        i++;
    } else if (args[i] === '--Port' || args[i] === '-p') {
        Port = parseInt(args[i + 1]);
        i++;
    }
}

app.get('/A', (req, res) => {
    console.log(`[${Nick}] Получен GET запрос от Gateway`);
    res.json({ Nick: Nick, Method: "GET" });
});

app.post('/A', (req, res) => {
    console.log(`[${Nick}] Получен POST запрос от Gateway`);
    console.log(`Body:`, req.body);
    res.json({ Nick: Nick, Method: "POST" });
});

app.put('/A', (req, res) => {
    console.log(`[${Nick}] Получен PUT запрос от Gateway`);
    console.log(`Body:`, req.body);
    res.json({ Nick: Nick, Method: "PUT" });
});

app.delete('/A', (req, res) => {
    console.log(`[${Nick}] Получен DELETE запрос от Gateway`);
    res.json({ Nick: Nick, Method: "DELETE" });
});

app.listen(Port, () => {
    console.log(`Сервер ${Nick} запущен на порту ${Port}`);
    console.log(`GET /A -> {"Nick": "${Nick}", "Method": "GET"}`);
    console.log(`POST /A -> {"Nick": "${Nick}", "Method": "POST"}`);
    console.log(`PUT /A -> {"Nick": "${Nick}", "Method": "PUT"}`);
    console.log(`DELETE /A -> {"Nick": "${Nick}", "Method": "DELETE"}`);
});