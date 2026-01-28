const http = require('http');
const url = require('url');
const querystring = require('querystring');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

if (!fs.existsSync('downloaded')) {
    fs.mkdirSync('downloaded');
}

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;
    
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    switch (pathname) {
        case '/09-01':
            if (req.method === 'GET') {
                res.writeHead(200, { 
                    'Content-Type': 'text/plain; charset=utf-8'
                });
                res.end('Успешный ответ от сервера для задания 09-01\nТекущее время: ' + new Date().toISOString());
            }
            break;

        case '/09-02':
            if (req.method === 'GET') {
                const { x, y } = parsedUrl.query;
                const numX = parseFloat(x);
                const numY = parseFloat(y);
                
                if (isNaN(numX) || isNaN(numY)) {
                    res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ error: 'Неверные параметры x и y' }));
                    return;
                }
                
                const result = {
                    x: numX,
                    y: numY,
                    sum: numX + numY,
                    difference: numX - numY,
                    product: numX * numY,
                    quotient: numY !== 0 ? numX / numY : 'неопределено'
                };
                
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify(result, null, 2));
            }
            break;

        case '/09-03':
            if (req.method === 'POST') {
                let body = '';
                
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                
                req.on('end', () => {
                    try {
                        let data;
                        const contentType = req.headers['content-type'];
                        
                        if (contentType === 'application/x-www-form-urlencoded') {
                            data = querystring.parse(body);
                        } else if (contentType === 'application/json') {
                            data = JSON.parse(body);
                        } else {
                            data = JSON.parse(body);
                        }
                        
                        const { x, y, s } = data;
                        const numX = parseFloat(x);
                        const numY = parseFloat(y);
                        
                        if (isNaN(numX) || isNaN(numY) || !s) {
                            throw new Error('Неверные данные: x и y должны быть числами, s - строкой');
                        }
                        
                        const response = {
                            status: 'success',
                            message: `Получена строка: "${s}"`,
                            calculations: {
                                sum: numX + numY,
                                difference: numX - numY,
                                product: numX * numY,
                                quotient: numY !== 0 ? numX / numY : 'неопределено'
                            },
                            received: {
                                x: numX,
                                y: numY,
                                s: s
                            }
                        };
                        
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify(response, null, 2));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ error: 'Неверный формат данных', details: error.message }));
                    }
                });
            }
            break;

        case '/09-04':
            if (req.method === 'POST') {
                let body = '';
                
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body);
                        
                        if (typeof data.x !== 'number' || typeof data.y !== 'number' || 
                            typeof data.s !== 'string' || !Array.isArray(data.m) || 
                            !data.o || typeof data.o.surname !== 'string' || typeof data.o.name !== 'string') {
                            throw new Error('Неверная структура данных');
                        }
                        
                        const result = {
                            "_comment": "Ответ. Лабораторная работа 9/4",
                            "x_plus_y": data.x + data.y,
                            "Concatination_s_o": `${data.s}: ${data.o.surname}, ${data.o.name}`,
                            "Length_m": data.m.length
                        };
                        
                        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify(result, null, 2));
                    } catch (error) {
                        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
                        res.end(JSON.stringify({ 
                            error: 'Неверный JSON формат', 
                            details: error.message,
                            expected_format: {
                                "_comment": "Запрос. Лабораторная работа 9/4",
                                "x": "number",
                                "y": "number", 
                                "s": "string",
                                "m": "array",
                                "o": {"surname": "string", "name": "string"}
                            }
                        }));
                    }
                });
            }
            break;

        case '/09-05':
            if (req.method === 'POST') {
                let xmlString = '';
                
                req.on('data', (chunk) => {
                    xmlString += chunk.toString();
                });
                
                req.on('end', () => {
                    const parser = new xml2js.Parser();
                    parser.parseString(xmlString, (err, result) => {
                        if (err) {
                            res.writeHead(400, { 'Content-Type': 'text/xml; charset=utf-8' });
                            res.end(`<error>Ошибка парсинга XML: ${err.message}</error>`);
                            return;
                        }

                        try {
                            let sum = 0;
                            let concatResult = '';
                            
                            if (result.request.x) {
                                result.request.x.forEach(el => {
                                    sum += parseInt(el.$.value);
                                });
                            }
                             
                            if (result.request.m) {
                                result.request.m.forEach(el => {
                                    concatResult += el.$.value;
                                });
                            }
                            
                            const builder = new xml2js.Builder();
                            const responseId = parseInt(result.request.$.id) + 10;
                            
                            const xmlResponse = builder.buildObject({
                                response: {
                                    $: {
                                        id: responseId.toString(),
                                        request: result.request.$.id
                                    },
                                    sum: {
                                        $: {
                                            element: 'x',
                                            result: sum.toString()
                                        }
                                    },
                                    concat: {
                                        $: {
                                            element: 'm', 
                                            result: concatResult
                                        }
                                    }
                                }
                            });
                            
                            res.writeHead(200, { 'Content-Type': 'text/xml; charset=utf-8' });
                            res.end(xmlResponse);
                        } catch (error) {
                            res.writeHead(400, { 'Content-Type': 'text/xml; charset=utf-8' });
                            res.end(`<error>Ошибка обработки XML: ${error.message}</error>`);
                        }
                    });
                });
            }
            break;

        case '/09-06':
            if (req.method === 'POST') {
                let body = '';
                
                req.on('data', (chunk) => {
                    body += chunk.toString();
                });
                
                req.on('end', () => {
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `downloaded/file-09-06-${timestamp}.txt`;
                    
                    fs.writeFileSync(filename, body);
                    
                    const response = {
                        status: 'success',
                        message: 'Текстовый файл успешно получен и сохранен',
                        filename: filename,
                        fileSize: body.length,
                        lines: body.split('\n').length,
                        receivedAt: new Date().toISOString()
                    };
                    
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(response, null, 2));
                });
            }
            break;

        case '/09-07':
            if (req.method === 'POST') {
                const chunks = [];
                
                req.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                req.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                    const filename = `downloaded/image-09-07-${timestamp}.png`;
                    
                    fs.writeFileSync(filename, buffer);
                    
                    const response = {
                        status: 'success',
                        message: 'PNG файл успешно получен и сохранен',
                        filename: filename,
                        fileSize: buffer.length,
                        receivedAt: new Date().toISOString()
                    };
                    
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify(response, null, 2));
                });
            }
            break;

        case '/09-08':
            if (req.method === 'GET') {
                const filename = 'example-response.txt';
                const fileContent = `Это файл, сгенерированный сервером для задания 09-08
                    Дата создания: ${new Date().toISOString()}
                    Сервер: Node.js HTTP
                    Статус: Успешно`;

                res.writeHead(200, {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Content-Disposition': `attachment; filename="${filename}"`,
                    'Content-Length': Buffer.byteLength(fileContent, 'utf8')
                });
                
                res.end(fileContent);
            }
            break;

        case '/status':
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                status: 'running',
                server: 'Universal Lab Server',
                timestamp: new Date().toISOString(),
                endpoints: [
                    'GET  /09-01',
                    'GET  /09-02?x=number&y=number', 
                    'POST /09-03',
                    'POST /09-04',
                    'POST /09-05',
                    'POST /09-06',
                    'POST /09-07',
                    'GET  /09-08'
                ]
            }, null, 2));
            break;

        default:
            res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({ error: 'Маршрут не найден', path: pathname }));
    }
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});