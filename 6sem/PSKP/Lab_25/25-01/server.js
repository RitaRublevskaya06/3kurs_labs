const express = require('express');
const bodyParser = require('body-parser');
const { JSONRPCServer } = require('json-rpc-2.0');

const server = new JSONRPCServer();

// 1. Процедура sum (переменное количество параметров)
server.addMethod('sum', (params) => {
  if (!Array.isArray(params)) {
    throw new Error('Params must be an array of numbers');
  }
  const sum = params.reduce((acc, val) => acc + val, 0);
  return sum;
});

// 2. Процедура mul (переменное количество параметров)
server.addMethod('mul', (params) => {
  if (!Array.isArray(params)) {
    throw new Error('Params must be an array of numbers');
  }
  const product = params.reduce((acc, val) => acc * val, 1);
  return product;
});

// 3. Процедура div(x, y)
server.addMethod('div', (params) => {
  const { x, y } = params;
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw { code: -32602, message: 'Both x and y must be numbers' };
  }
  if (y === 0) {
    throw { code: -32602, message: 'Division by zero is not allowed' };
  }
  return x / y;
});

// 4. Процедура proc(x, y) = x / y * 100
server.addMethod('proc', (params) => {
  const { x, y } = params;
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error('Both x and y must be numbers');
  }
  if (y === 0) {
    throw new Error('Division by zero');
  }
  return (x / y) * 100;
});

const app = express();
app.use(bodyParser.json());

app.post('/jsonrpc', async (req, res) => {
  const jsonRPCRequest = req.body;
  
  if (Array.isArray(jsonRPCRequest)) {
    const responses = await Promise.all(
      jsonRPCRequest.map(request => server.receive(request))
    );
    const validResponses = responses.filter(response => response !== null);
    if (validResponses.length > 0) {
      res.json(validResponses);
    } else {
      res.status(204).send();
    }
  } else {
    const response = await server.receive(jsonRPCRequest);
    if (response) {
      res.json(response);
    } else {
      res.status(204).send();
    }
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'JSON-RPC server is running' });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`JSON-RPC сервер запущен на http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`  POST http://localhost:${PORT}/jsonrpc - JSON-RPC запросы`);
  console.log(`  GET  http://localhost:${PORT}/health - Проверка статуса`);
});