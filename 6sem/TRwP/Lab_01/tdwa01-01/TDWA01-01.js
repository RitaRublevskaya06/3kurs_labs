const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 40000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(express.json());

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    }
    return [];
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function calculate(op, x, y) {
    switch(op) {
        case 'add': return x + y;
        case 'sub': return x - y;
        case 'mul': return x * y;
        case 'div': return y !== 0 ? x / y : 0;
        default: return 0;
    }
}

// GET /NGINX-test
app.get('/NGINX-test', (req, res) => {
    const data = loadData();
    
    if (data.length === 0) {
        return res.status(404).json({ 
            error: 'JSON запрос не найден на сервере' 
        });
    }
    
    const last = data[data.length - 1];
    const result = calculate(last.op, last.x, last.y);
    
    res.status(200).json({
        op: last.op,
        x: last.x,
        y: last.y,
        result: result
    });
});

// POST /NGINX-test
app.post('/NGINX-test', (req, res) => {
    const { op, x, y } = req.body;
    
    if (!op || x === undefined || y === undefined) {
        return res.status(400).json({ error: 'Неверный формат запроса' });
    }
    
    const data = loadData();
    
    const exists = data.some(item => 
        item.op === op && item.x === x && item.y === y
    );
    
    if (exists) {
        return res.status(409).json({ 
            error: 'JSON запрос уже существует на сервере' 
        });
    }
    
    const newItem = { op, x, y };
    data.push(newItem);
    saveData(data);
    
    const result = calculate(op, x, y);
    
    res.status(200).json({
        op: op,
        x: x,
        y: y,
        result: result
    });
});

// PUT /NGINX-test - обновить ПОСЛЕДНЮЮ запись
app.put('/NGINX-test', (req, res) => {
    const { op, x, y } = req.body;
    
    if (!op || x === undefined || y === undefined) {
        return res.status(400).json({ error: 'Неверный формат запроса' });
    }
    
    let data = loadData();
    
    if (data.length === 0) {
        return res.status(404).json({ 
            error: 'Нет записей для обновления' 
        });
    }
    
    const lastIndex = data.length - 1;
    
    const updatedItem = { 
        op: op, 
        x: x, 
        y: y 
    };
    
    data[lastIndex] = updatedItem;
    saveData(data);
    
    const result = calculate(op, x, y);
    
    res.status(200).json({
        op: op,
        x: x,
        y: y,
        result: result
    });
});

// DELETE /NGINX-test
app.delete('/NGINX-test', (req, res) => {
    const data = loadData();
    
    if (data.length === 0) {
        return res.status(404).json({ 
            error: 'Нет JSON запросов для удаления' 
        });
    }
    
    saveData([]);
    
    res.status(200).json({ 
        message: 'Все JSON запросы успешно удалены',
        deletedCount: data.length 
    });
});

app.listen(PORT, () => {
    console.log(`API сервер запущен на порту ${PORT}`);
    console.log(`URL: http://localhost:${PORT}/NGINX-test`);
});