const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const FILL_CHAR = 'X';

app.use(express.static('public'));
app.use(express.json());

// ============ МАРШРУТНАЯ ПЕРЕСТАНОВКА ============

function routeTranspositionEncode(text, colsCount) {
    const cleanText = text.replace(/\r\n/g, '\n').replace(/\n/g, ' ');
    const rowsCount = Math.ceil(cleanText.length / colsCount);
    
    const table = [];
    let index = 0;
    for (let row = 0; row < rowsCount; row++) {
        const rowData = [];
        for (let col = 0; col < colsCount; col++) {
            if (index < cleanText.length) {
                rowData.push(cleanText[index]);
            } else {
                rowData.push('');
            }
            index++;
        }
        table.push(rowData);
    }
    
    let result = '';
    for (let col = 0; col < colsCount; col++) {
        for (let row = 0; row < rowsCount; row++) {
            if (table[row][col] !== '') {
                result += table[row][col];
            }
        }
    }
    return result;
}

function routeTranspositionDecode(text, colsCount) {
    const rowsCount = Math.ceil(text.length / colsCount);
    const baseLen = Math.floor(text.length / colsCount);
    const extra = text.length % colsCount;

    const colLengths = [];
    for (let i = 0; i < colsCount; i++) {
        colLengths.push(i < extra ? baseLen + 1 : baseLen);
    }

    const table = Array(rowsCount).fill().map(() => Array(colsCount).fill(''));
    let index = 0;

    for (let col = 0; col < colsCount; col++) {
        for (let row = 0; row < colLengths[col]; row++) {
            table[row][col] = text[index++];
        }
    }

    let result = '';
    for (let row = 0; row < rowsCount; row++) {
        for (let col = 0; col < colsCount; col++) {
            if (table[row][col]) {
                result += table[row][col];
            }
        }
    }
    return result;
}

// ============ МНОЖЕСТВЕННАЯ ПЕРЕСТАНОВКА ============

function getKeyOrder(keyword) {
    const letters = keyword.toLowerCase().split('');
    const indexed = letters.map((letter, idx) => ({ letter, idx }));
    indexed.sort((a, b) => a.letter.localeCompare(b.letter));
    return indexed.map(item => item.idx);
}

function getInverseOrder(order) {
    const inverse = new Array(order.length);
    for (let i = 0; i < order.length; i++) {
        inverse[order[i]] = i;
    }
    return inverse;
}


function applyPermutation(arr, order) {
    const result = new Array(arr.length);
    for (let i = 0; i < order.length; i++) {
        result[i] = arr[order[i]];
    }
    return result;
}



// function multipleTranspositionEncode(text, rowKey, colKey) {
//     const cleanText = text.replace(/\n/g, ' ');

//     const rowsCount = rowKey.length;
//     const colsCount = colKey.length;

//     const totalSize = rowsCount * colsCount;

//     // padding
//     const paddedText = cleanText.padEnd(totalSize, FILL_CHAR);

//     const table = [];
//     let index = 0;

//     // 1. Заполнение
//     for (let i = 0; i < rowsCount; i++) {
//         const row = [];
//         for (let j = 0; j < colsCount; j++) {
//             row.push(paddedText[index++]);
//         }
//         table.push(row);
//     }

//     // 2. Перестановка строк
//     const rowOrder = getKeyOrder(rowKey);
//     const afterRow = applyPermutation(table, rowOrder);

//     // 3. Перестановка столбцов
//     const colOrder = getKeyOrder(colKey);
//     const afterCol = afterRow.map(row => applyPermutation(row, colOrder));

//     // 4. Чтение
//     let result = '';
//     for (let row of afterCol) {
//         for (let char of row) {
//             result += char;
//         }
//     }

//     return result;
// }


// function multipleTranspositionDecode(text, rowKey, colKey) {
//     const rowsCount = rowKey.length;
//     const colsCount = colKey.length;

//     const table = [];
//     let index = 0;

//     // 1. Восстановление таблицы
//     for (let i = 0; i < rowsCount; i++) {
//         const row = [];
//         for (let j = 0; j < colsCount; j++) {
//             row.push(text[index++] || FILL_CHAR);
//         }
//         table.push(row);
//     }

//     // 2. Обратные столбцы
//     const colOrder = getKeyOrder(colKey);
//     const invColOrder = getInverseOrder(colOrder);
//     const afterCol = table.map(row => applyPermutation(row, invColOrder));

//     // 3. Обратные строки
//     const rowOrder = getKeyOrder(rowKey);
//     const invRowOrder = getInverseOrder(rowOrder);
//     const originalTable = applyPermutation(afterCol, invRowOrder);

//     // 4. Чтение
//     let result = '';
//     for (let row of originalTable) {
//         for (let char of row) {
//             result += char;
//         }
//     }

//     return result.replace(new RegExp(FILL_CHAR + '+$', 'g'), '');
// }


function multipleTranspositionEncode(text, rowKey, colKey) {
    const cleanText = text.replace(/\n/g, ' ');

    const rowsCount = rowKey.length;
    const colsCount = colKey.length;
    const blockSize = rowsCount * colsCount;

    const rowOrder = getKeyOrder(rowKey);
    const colOrder = getKeyOrder(colKey);

    let result = '';

    for (let start = 0; start < cleanText.length; start += blockSize) {
        let block = cleanText.slice(start, start + blockSize);

        // padding блока
        block = block.padEnd(blockSize, FILL_CHAR);

        // таблица
        const table = [];
        let index = 0;

        for (let i = 0; i < rowsCount; i++) {
            const row = [];
            for (let j = 0; j < colsCount; j++) {
                row.push(block[index++]);
            }
            table.push(row);
        }

        // перестановки
        const afterRow = applyPermutation(table, rowOrder);
        const afterCol = afterRow.map(row => applyPermutation(row, colOrder));

        // чтение
        for (let row of afterCol) {
            for (let char of row) {
                result += char;
            }
        }
    }

    return result;
}


function multipleTranspositionDecode(text, rowKey, colKey) {
    const rowsCount = rowKey.length;
    const colsCount = colKey.length;
    const blockSize = rowsCount * colsCount;

    const rowOrder = getKeyOrder(rowKey);
    const colOrder = getKeyOrder(colKey);
    const invRowOrder = getInverseOrder(rowOrder);
    const invColOrder = getInverseOrder(colOrder);

    let result = '';

    for (let start = 0; start < text.length; start += blockSize) {
        const block = text.slice(start, start + blockSize);

        const table = [];
        let index = 0;

        for (let i = 0; i < rowsCount; i++) {
            const row = [];
            for (let j = 0; j < colsCount; j++) {
                row.push(block[index++] || FILL_CHAR);
            }
            table.push(row);
        }

        // обратные перестановки
        const afterCol = table.map(row => applyPermutation(row, invColOrder));
        const originalTable = applyPermutation(afterCol, invRowOrder);

        for (let row of originalTable) {
            for (let char of row) {
                result += char;
            }
        }
    }

    return result.replace(new RegExp(FILL_CHAR + '+$', 'g'), '');
}





function calculateFrequencies(text) {
    const alphabet = 'абвгдеёжзійклмнопрстуўфхцчшыьэюя';
    const frequencies = {};
    
    for (const char of text.toLowerCase()) {
        if (alphabet.includes(char)) {
            frequencies[char] = (frequencies[char] || 0) + 1;
        }
    }
    return frequencies;
}

// ============ API ENDPOINTS ============

app.post('/api/route/encrypt', (req, res) => {
    const { text, colsCount } = req.body;
    const startTime = performance.now();
    const result = routeTranspositionEncode(text, colsCount);
    const time = (performance.now() - startTime).toFixed(3);
    res.json({ result, time, length: result.length });
});

app.post('/api/route/decrypt', (req, res) => {
    const { text, colsCount } = req.body;
    const startTime = performance.now();
    const result = routeTranspositionDecode(text, colsCount);
    const time = (performance.now() - startTime).toFixed(3);
    res.json({ result, time, length: result.length });
});

app.post('/api/multiple/encrypt', (req, res) => {
    const { text, rowKey, colKey } = req.body;
    const startTime = performance.now();
    const result = multipleTranspositionEncode(text, rowKey, colKey);
    const time = (performance.now() - startTime).toFixed(3);
    res.json({ result, time, length: result.length });
});

app.post('/api/multiple/decrypt', (req, res) => {
    const { text, rowKey, colKey } = req.body;
    const startTime = performance.now();
    const result = multipleTranspositionDecode(text, rowKey, colKey);
    const time = (performance.now() - startTime).toFixed(3);
    res.json({ result, time, length: result.length });
});

app.post('/api/frequencies', (req, res) => {
    const { text } = req.body;
    const frequencies = calculateFrequencies(text);
    res.json({ frequencies });
});

app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});