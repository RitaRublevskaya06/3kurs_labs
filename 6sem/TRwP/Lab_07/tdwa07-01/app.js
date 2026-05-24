const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const config = {
    server: 'host.docker.internal',
    port: 8080,
    user: 'sa',
    password: 'Str0ngPass!2026',
    database: 'Celebrities',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};


let pool = null;

async function getConnection() {
    if (!pool) {
        try {
            pool = await sql.connect(config);
            console.log('Connected to database successfully');
        } catch (err) {
            console.error('Database connection error:', err);
            throw err;
        }
    }
    return pool;
}

async function initDatabase() {
    try {
        const pool = await getConnection();
        
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Celebrities')
            BEGIN
                CREATE TABLE Celebrities (
                    Id INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                    FullName NVARCHAR(50) NOT NULL,
                    Nationality NVARCHAR(2) NOT NULL,
                    ReqPhotoPath NVARCHAR(200) NULL
                );
                PRINT 'Table Celebrities created';
            END
        `);
        console.log('Database and table are ready');
    } catch (err) {
        console.error('Init error:', err);
    }
}

// CRUD endpoints
app.get('/celebrities', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Celebrities');
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/celebrities/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('SELECT * FROM Celebrities WHERE Id = @id');
        
        if (result.recordset.length === 0) {
            res.status(404).json({ error: 'Not found' });
        } else {
            res.json(result.recordset[0]);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/celebrities', async (req, res) => {
    const { FullName, Nationality, ReqPhotoPath } = req.body;
    
    if (!FullName || !Nationality) {
        return res.status(400).json({ error: 'FullName and Nationality are required' });
    }
    
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('FullName', sql.NVarChar(50), FullName)
            .input('Nationality', sql.NVarChar(2), Nationality)
            .input('ReqPhotoPath', sql.NVarChar(200), ReqPhotoPath || null)
            .query(`
                INSERT INTO Celebrities (FullName, Nationality, ReqPhotoPath) 
                VALUES (@FullName, @Nationality, @ReqPhotoPath);
                SELECT SCOPE_IDENTITY() AS Id;
            `);
        
        const id = result.recordset[0].Id;
        res.status(201).json({ Id: id, FullName, Nationality, ReqPhotoPath });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.put('/celebrities/:id', async (req, res) => {
    const { FullName, Nationality, ReqPhotoPath } = req.body;
    
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('FullName', sql.NVarChar(50), FullName)
            .input('Nationality', sql.NVarChar(2), Nationality)
            .input('ReqPhotoPath', sql.NVarChar(200), ReqPhotoPath || null)
            .query(`
                UPDATE Celebrities 
                SET FullName = @FullName, 
                    Nationality = @Nationality, 
                    ReqPhotoPath = @ReqPhotoPath
                WHERE Id = @id
            `);
        
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ error: 'Not found' });
        } else {
            res.json({ message: 'Updated successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.delete('/celebrities/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM Celebrities WHERE Id = @id');
        
        if (result.rowsAffected[0] === 0) {
            res.status(404).json({ error: 'Not found' });
        } else {
            res.json({ message: 'Deleted successfully' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, async () => {
    console.log(`API Server running on http://localhost:${port}`);
    setTimeout(async () => {
        await initDatabase();
        console.log('Endpoints:');
        console.log('  GET    /celebrities');
        console.log('  GET    /celebrities/:id');
        console.log('  POST   /celebrities');
        console.log('  PUT    /celebrities/:id');
        console.log('  DELETE /celebrities/:id');
    }, 5000);
});