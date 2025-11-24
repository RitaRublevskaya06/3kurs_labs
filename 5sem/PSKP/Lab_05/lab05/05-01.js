const http = require('http');
const fs = require('fs');
const url = require('url');
const path = require('path');
const database = require('./DB');
const readline = require('readline');

let db = new database.DB();

let serverShutdownTimer = null;
let commitInterval = null;
let statsCollection = {
    active: false,
    startTime: null,
    endTime: null,
    interval: null
};

db.setStatsCollection(statsCollection);

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

db.on('STATS', (req, res) => {
    console.log('DB STATS REQUEST');
    
    let response = {
        start: statsCollection.startTime ? formatDate(statsCollection.startTime) : "",
        finish: statsCollection.endTime ? formatDate(statsCollection.endTime) : "",
        request: db.stats.requests,
        commit: db.stats.commits
    };
    
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(response));
});


let checkDate = date => {
    let pattern = /(\d{2})\-(\d{2})\-(\d{4})/;
    let new_date = date.replace(pattern, '$3-$2-$1');
    return new Date(new_date) <= new Date();
};

function formatDate(date) {
    return date.toISOString().split('T')[0];
}

function serveStaticFile(res, filePath) {
    const extname = path.extname(filePath);
    let contentType = 'text/html; charset=utf-8';
    switch (extname) {
        case '.js': contentType = 'text/javascript; charset=utf-8'; break;
        case '.css': contentType = 'text/css; charset=utf-8'; break;
        case '.json': contentType = 'application/json; charset=utf-8'; break;
    }

    fs.readFile(filePath, 'utf8', (error, content) => {
        if (error) {
            res.writeHead(error.code === 'ENOENT' ? 404 : 500);
            res.end(error.code === 'ENOENT' ? 'File not found' : 'Server error');
        } else {
            res.writeHead(200, {'Content-Type': contentType});
            res.end(content, 'utf-8');
        }
    });
}
function scheduleShutdown(seconds) {
    if (serverShutdownTimer) {
        serverShutdownTimer.ref();
        clearTimeout(serverShutdownTimer);
    }
    
    if (seconds === undefined) {
        console.log('Остановка сервера отменена');
        return;
    }
    
    console.log(`Сервер будет остановлен через ${seconds} секунд`);
    serverShutdownTimer = setTimeout(() => {
        console.log('Остановка сервера...');
        process.exit(0);
    }, seconds * 1000);
    
    serverShutdownTimer.unref();
}

function startCommit(seconds) {
    if (commitInterval) {
        commitInterval.ref();
        clearInterval(commitInterval);
    }
    
    if (seconds === undefined) {
        console.log('Периодическая фиксация БД остановлена');
        return;
    }
    
    console.log(`Запуск периодической фиксации БД каждые ${seconds} секунд`);
    commitInterval = setInterval(() => {
        db.commit().then(() => {
            console.log('Фиксация БД выполнена');
        });
    }, seconds * 1000);
    
    commitInterval.unref();
}

function startStatsCollection(seconds) {
    if (statsCollection.interval) {
        statsCollection.interval.ref();
        clearInterval(statsCollection.interval);
    }
    
    if (seconds === undefined) {
        console.log('Сбор статистики остановлен');
        statsCollection.active = false;
        statsCollection.endTime = new Date();
        return;
    }
    
    console.log(`Запуск сбора статистики на ${seconds} секунд`);
    statsCollection.active = true;
    statsCollection.startTime = new Date();
    statsCollection.endTime = null;
    
    db.resetStats();
    
    statsCollection.interval = setTimeout(() => {
        console.log('Сбор статистики завершен');
        statsCollection.active = false;
        statsCollection.endTime = new Date();
    }, seconds * 1000);
    
    statsCollection.interval.unref();
}
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const pathname = parsedUrl.pathname;

    if (pathname === '/') {
        const html = fs.readFileSync('./05-01.html', 'utf8');
        res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
        res.end(html);
    } else if (pathname === '/api/db') {
        db.emit(req.method, req, res);
    } else if (pathname === '/api/ss') {
        db.emit('STATS', req, res);
    } else {
        serveStaticFile(res, '.' + pathname);
    }
});

server.listen(5000, () => {
    console.log('Server is running at http://localhost:5000');
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.on('line', (input) => {
        const parts = input.trim().split(' ');
        const command = parts[0];
        const param = parts[1] ? parseInt(parts[1]) : undefined;
        
        switch(command) {
            case 'sd':
                scheduleShutdown(param);
                break;
            case 'sc':
                startCommit(param);
                break;
            case 'ss':
                startStatsCollection(param);
                break;
            default:
                console.log('Неизвестная команда. Используйте: sd, sc, ss');
        }
    });
    
    console.log('Доступные команды:');
    console.log('sd x - остановить сервер через x секунд');
    console.log('sc x - запустить периодическую фиксацию БД каждые x секунд');
    console.log('ss x - запустить сбор статистики на x секунд');
    console.log('(команда без параметра отменяет действие)');
});