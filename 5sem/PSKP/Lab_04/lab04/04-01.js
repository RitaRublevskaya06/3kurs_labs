const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const database = require('./DB');

let db = new database.DB();

db.on('GET', (req, res) => {
    console.log('DB GET');
    db.select().then(results => {
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(results));
    });
});

db.on('POST', (req, res) => {
    console.log('DB POST');
    req.on('data', data => {
        let r = JSON.parse(data);
        if (!r.id || !r.name || !r.bday) {
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({error: 'Поля не могут быть пустыми'}));
            return;
        }
        if (!checkDate(r.bday)) {
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({error: 'Дата рождения не может быть больше текущей'}));
            return;
        }

        db.insert(r).then(data => {
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify(data));
        }).catch(err => {
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify(err));
        });
    });
});

db.on('PUT', (req, res) => {
    console.log('DB PUT');
    req.on('data', data => {
        let r = JSON.parse(data);
        if (!r.id || !r.name || !r.bday) {
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({error: 'Поля не могут быть пустыми'}));
            return;
        }
        if (!checkDate(r.bday)) {
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify({error: 'Дата рождения не может быть больше текущей'}));
            return;
        }

        db.update(r).then(data => {
            res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify(data));
        }).catch(err => {
            res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
            res.end(JSON.stringify(err));
        });
    });
});

db.on('DELETE', (req, res) => {
    console.log('DB DELETE');
    const query = url.parse(req.url, true).query;
    const id = query.id;

    if (!id) {
        res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({error: 'Не указан параметр id в запросе'}));
        return;
    }

    db.delete(Number(id)).then(data => {
        res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify({deleted: data}));
    }).catch(err => {
        res.writeHead(400, {'Content-Type': 'application/json; charset=utf-8'});
        res.end(JSON.stringify(err));
    });
});

let checkDate = date => {
    let pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
    let new_date = date.replace(pattern, '$3-$2-$1');
    return new Date(new_date) <= new Date();
};

function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    let contentType = 'text/html';
    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500);
            res.end(error.code === 'ENOENT' ? 'File not found' : 'Server error');
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf-8');
        }
    });
}

http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        const html = fs.readFileSync('./04-01.html', 'utf8');
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else if (pathname === '/api/db') {
        db.emit(req.method, req, res);
    } else {
        serveStaticFile(res, '.' + pathname);
    }
}).listen(5000, () => console.log('Server is running at http://localhost:5000'));
