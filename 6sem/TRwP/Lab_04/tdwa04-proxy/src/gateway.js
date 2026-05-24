const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// GET /api -> сервер X (порт 3001)
app.get('/api', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:3001/A');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api -> сервер Y (порт 3002)
app.post('/api', async (req, res) => {
    try {
        const response = await axios.post('http://localhost:3002/A', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT /api -> сервер Z (порт 3003)
app.put('/api', async (req, res) => {
    try {
        const response = await axios.put('http://localhost:3003/A', req.body);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE /api -> сервер Z (порт 3003)
app.delete('/api', async (req, res) => {
    try {
        const response = await axios.delete('http://localhost:3003/A');
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway started on port ${PORT}`);
    console.log(`GET /api -> Server X (GET /A)`);
    console.log(`POST /api -> Server Y (POST /A)`);
    console.log(`PUT /api -> Server Z (PUT /A)`);
    console.log(`DELETE /api -> Server Z (DELETE /A)`);
});