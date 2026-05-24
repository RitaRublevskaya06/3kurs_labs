const express = require('express');
const { engine } = require('express-handlebars');
const bodyParser = require('body-parser');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'phonebook.json');

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, 'views', 'layouts'),
    partialsDir: path.join(__dirname, 'views', 'partials'),
    helpers: {
        cancelButton: function() {
            return '<a href="/" class="cancel-btn">Отказаться</a>';
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

async function readPhonebook() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

async function writePhonebook(data) {
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// GET: / - главная страница
app.get('/', async (req, res) => {
    try {
        const phonebook = await readPhonebook();
        res.render('home', { 
            title: 'Телефонный справочник',
            phonebook: phonebook
        });
    } catch (error) {
        res.status(500).send('Ошибка при чтении данных');
    }
});

// GET: /Add - форма добавления
app.get('/Add', async (req, res) => {
    try {
        const phonebook = await readPhonebook();
        res.render('add', { 
            title: 'Добавление записи',
            phonebook: phonebook
        });
    } catch (error) {
        res.status(500).send('Ошибка при чтении данных');
    }
});

// POST: /Add - добавление записи
app.post('/Add', async (req, res) => {
    try {
        const { name, phone } = req.body;
        const phonebook = await readPhonebook();
        
        const newId = phonebook.length > 0 ? Math.max(...phonebook.map(item => item.id)) + 1 : 1;
        
        phonebook.push({ id: newId, name, phone });
        await writePhonebook(phonebook);
        
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка при добавлении записи');
    }
});

// GET: /Update - форма обновления
app.get('/Update', async (req, res) => {
    try {
        const { id } = req.query;
        const phonebook = await readPhonebook();
        const record = phonebook.find(item => item.id === parseInt(id));
        
        if (!record) {
            return res.status(404).send('Запись не найдена');
        }
        
        res.render('update', { 
            title: 'Изменение записи',
            phonebook: phonebook,
            record: record
        });
    } catch (error) {
        res.status(500).send('Ошибка при чтении данных');
    }
});

// POST: /Update - обновление записи
app.post('/Update', async (req, res) => {
    try {
        const { id, name, phone } = req.body;
        const phonebook = await readPhonebook();
        
        const index = phonebook.findIndex(item => item.id === parseInt(id));
        if (index !== -1) {
            phonebook[index] = { id: parseInt(id), name, phone };
            await writePhonebook(phonebook);
        }
        
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка при обновлении записи');
    }
});

// POST: /Delete - удаление записи
app.post('/Delete', async (req, res) => {
    try {
        const { id } = req.body;
        let phonebook = await readPhonebook();
        
        phonebook = phonebook.filter(item => item.id !== parseInt(id));
        await writePhonebook(phonebook);
        
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка при удалении записи');
    }
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});