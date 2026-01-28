const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const { Server } = require('ws');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'StudentList.json');
const BACKUPS_DIR = path.join(__dirname, 'data', 'backups');

const wss = new Server({ noServer: true });
const clients = new Set();

function notifyClients(message) {
    const notification = JSON.stringify({
        type: 'notification',
        data: message,
        timestamp: new Date().toISOString()
    });
    
    clients.forEach(client => {
        if (client.readyState === 1) {
            client.send(notification);
        }
    });
}

async function readStudents() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        throw new Error(`Ошибка чтения файла ${DATA_FILE}`);
    }
}

async function writeStudents(students) {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(students, null, 2));
        notifyClients('Файл StudentList.json был изменен');
        return true;
    } catch (error) {
        throw new Error(`Ошибка записи файла ${DATA_FILE}`);
    }
}

async function createBackup() {
    try {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const now = new Date();
        
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        const timestamp = `${year}${month}${day}${hours}${seconds}`;
        
        const backupName = `${timestamp}_StudentList.json`;
        const backupPath = path.join(BACKUPS_DIR, backupName);
        
        const data = await fs.readFile(DATA_FILE, 'utf8');
        await fs.writeFile(backupPath, data);
        
        return backupName;
    } catch (error) {
        throw new Error('Ошибка создания бэкапа');
    }
}

app.get('/', async (req, res) => {
    try {
        const students = await readStudents();
        res.json(students);
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

app.get('/backup', async (req, res) => {
    try {
        const files = await fs.readdir(BACKUPS_DIR);
        const backups = files
            .filter(file => file.endsWith('_StudentList.json'))
            .map(file => ({
                name: file,
                path: `/backups/${file}`,
                created: file.substring(0, 14)
            }));
        
        res.json(backups);
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

app.get('/:id', async (req, res) => {
    try {
        const students = await readStudents();
        const studentId = parseInt(req.params.id);
        const student = students.find(s => s.id === studentId);
        
        if (!student) {
            return res.status(404).json({
                error: 2,
                message: `Студент с id равным ${studentId} не найден`
            });
        }
        
        res.json(student);
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

app.post('/', async (req, res) => {
    try {
        const newStudent = req.body;
        
        if (!newStudent.id) {
            return res.status(400).json({
                error: 4,
                message: 'ID студента обязателен'
            });
        }
        
        const students = await readStudents();
        const existingStudent = students.find(s => s.id === newStudent.id);
        
        if (existingStudent) {
            return res.status(409).json({
                error: 3,
                message: `Студент с id равным ${newStudent.id} уже есть`
            });
        }
        
        students.push(newStudent);
        await writeStudents(students);
        
        res.status(201).json(newStudent);
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

app.put('/', async (req, res) => {
    try {
        const updatedStudent = req.body;
        
        if (!updatedStudent.id) {
            return res.status(400).json({
                error: 4,
                message: 'ID студента обязателен'
            });
        }
        
        const students = await readStudents();
        const studentIndex = students.findIndex(s => s.id === updatedStudent.id);
        
        if (studentIndex === -1) {
            return res.status(404).json({
                error: 2,
                message: `Студент с id равным ${updatedStudent.id} не найден`
            });
        }
        
        students[studentIndex] = updatedStudent;
        await writeStudents(students);
        
        res.json(updatedStudent);
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

app.delete('/:id', async (req, res) => {
    try {
        const studentId = parseInt(req.params.id);
        const students = await readStudents();
        const studentIndex = students.findIndex(s => s.id === studentId);
        
        if (studentIndex === -1) {
            return res.status(404).json({
                error: 2,
                message: `Студент с id равным ${studentId} не найден`
            });
        }
        
        const deletedStudent = students.splice(studentIndex, 1)[0];
        await writeStudents(students);
        
        res.json(deletedStudent);
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

app.post('/backup', async (req, res) => {
    try {
        const backupName = await createBackup();
        res.json({
            message: 'Бэкап создан успешно',
            backup: backupName
        });
    } catch (error) {
        res.status(500).json({
            error: 5,
            message: error.message
        });
    }
});

app.delete('/backup/:date', async (req, res) => {
    try {
        const targetDate = req.params.date;
        
        if (!/^\d{8}$/.test(targetDate)) {
            return res.status(400).json({
                error: 6,
                message: 'Неверный формат даты. Используйте YYYYDDMM'
            });
        }
        
        const year = parseInt(targetDate.substring(0, 4));
        const day = parseInt(targetDate.substring(4, 6));   
        const month = parseInt(targetDate.substring(6, 8)); 
        
        if (day < 1 || day > 31) {
            return res.status(400).json({
                error: 8,
                message: 'День должен быть от 01 до 31'
            });
        }
        
        if ([4, 6, 9, 11].includes(month) && day > 30) {
            return res.status(400).json({
                error: 9,
                message: 'В этом месяце не может быть больше 30 дней'
            });
        }
        
        if (month === 2 && day > 29) {
            return res.status(400).json({
                error: 10,
                message: 'В феврале не может быть больше 29 дней'
            });
        }
        
        const targetDateFormatted = `${year}${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}`;
        
        const files = await fs.readdir(BACKUPS_DIR);
        const deletedFiles = [];
        
        for (const file of files) {
            if (file.endsWith('_StudentList.json')) {
                const fileDate = file.substring(0, 8);
                
                if (fileDate < targetDateFormatted) {
                    await fs.unlink(path.join(BACKUPS_DIR, file));
                    deletedFiles.push(file);
                }
            }
        }
        
        res.json({
            message: 'Старые бэкапы удалены',
            deleted: deletedFiles,
            inputFormat: 'yyyyddmm',
            inputDate: targetDate,
            convertedDate: targetDateFormatted
        });
        
    } catch (error) {
        res.status(500).json({
            error: 1,
            message: error.message
        });
    }
});

const server = app.listen(PORT, async () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
    
    try {
        await fs.mkdir(BACKUPS_DIR, { recursive: true });
        
        try {
            await fs.access(DATA_FILE);
        } catch {
            const initialData = [
                {"id": 1, "name": "Иванов И.И.", "bday": "2000-12-02", "specility": "ПОИТ"},
                {"id": 2, "name": "Петров П.П.", "bday": "2001-11-01", "specility": "Исит"},
                {"id": 3, "name": "Сидорова С.С.", "bday": "2001-11-01", "specility": "ДЭВИ"}
            ];
            await fs.writeFile(DATA_FILE, JSON.stringify(initialData, null, 2));
            console.log('Создан начальный файл StudentList.json');
        }
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
    });
});

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Новый клиент WebSocket подключен');
    
    ws.on('close', () => {
        clients.delete(ws);
        console.log('Клиент WebSocket отключен');
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket ошибка:', error);
    });
});

console.log('WebSocket сервер готов к подключениям');