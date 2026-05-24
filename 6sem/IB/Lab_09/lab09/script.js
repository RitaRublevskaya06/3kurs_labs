class KnapsackCrypto {
    constructor() {
        this.privateKey = [];
        this.publicKey = [];
        this.n = 0;
        this.a = 0;
        this.aInverse = 0;
        this.z = 8;
    }

    gcdExtended(a, b) {
        a = BigInt(a);
        b = BigInt(b);
        if (b === 0n) {
            return { gcd: a, x: 1n, y: 0n };
        }
        const { gcd, x: x1, y: y1 } = this.gcdExtended(b, a % b);
        const x = y1;
        const y = x1 - (a / b) * y1;
        return { gcd, x, y };
    }

    modInverse(a, m) {
        a = BigInt(a);
        m = BigInt(m);
        const { gcd, x } = this.gcdExtended(a, m);
        if (gcd !== 1n) return null;
        return Number(((x % m) + m) % m);
    }

    generateSuperincreasingSequence(z, minBitLength = 40) {
        const sequence = [];
        let sum = 0n;
        
        for (let i = 0; i < z; i++) {
            let minValue;
            if (i === 0) {
                minValue = (1n << BigInt(minBitLength)) + 1n;
            } else {
                minValue = sum + 1n;
            }
            const maxValue = minValue * 2n;
            const range = maxValue - minValue;
            let randomOffset = 0n;
            if (range > 0n) {
                const maxOffset = range > 10000n ? 10000n : range;
                randomOffset = BigInt(Math.floor(Math.random() * Number(maxOffset)));
            }
            const value = minValue + randomOffset;
            sequence.push(value);
            sum += value;
        }
        
        return sequence;
    }

    generateKeys(z) {
        this.z = z;
        
        this.privateKey = this.generateSuperincreasingSequence(z);
        
        const sum = this.privateKey.reduce((a, b) => a + b, 0n);
        
        let minN = sum + 1n;
        let maxN = minN * 3n;
        const range = maxN - minN;
        let randomOffset = 1n;
        if (range > 1n) {
            const maxOffset = range > 10000n ? 10000n : range;
            randomOffset = BigInt(Math.floor(Math.random() * Number(maxOffset))) + 1n;
        }
        this.n = minN + randomOffset;
        
        let possibleA = [];
        for (let i = 3; i < 500; i++) {
            if (this.gcdExtended(i, this.n).gcd === 1n) {
                possibleA.push(i);
                if (possibleA.length > 30) break;
            }
        }
        
        if (possibleA.length === 0) {
            this.a = 3;
        } else {
            this.a = possibleA[Math.floor(Math.random() * possibleA.length)];
        }
        
        this.aInverse = this.modInverse(this.a, this.n);
        
        this.publicKey = this.privateKey.map(d => Number((BigInt(d) * BigInt(this.a)) % BigInt(this.n)));
        
        return {
            privateKey: this.privateKey.map(k => Number(k)),
            publicKey: this.publicKey,
            n: Number(this.n),
            a: this.a,
            aInverse: this.aInverse
        };
    }

    stringToUtf8Bits(str) {
        const encoder = new TextEncoder();
        const bytes = encoder.encode(str);
        let bits = '';
        for (let i = 0; i < bytes.length; i++) {
            bits += bytes[i].toString(2).padStart(8, '0');
        }
        return bits;
    }

    utf8BitsToString(bits, originalLength) {
        const bytes = [];
        let byteCount = 0;
        
        for (let i = 0; i < bits.length; i += 8) {
            if (i + 8 <= bits.length) {
                const byteStr = bits.substring(i, i + 8);
                const byteValue = parseInt(byteStr, 2);
                
                // Пропускаем нулевые байты в конце, если они превышают оригинальную длину
                if (byteCount < originalLength || byteValue !== 0) {
                    bytes.push(byteValue);
                    byteCount++;
                } else {
                    break;
                }
            }
        }
        
        const decoder = new TextDecoder();
        return decoder.decode(new Uint8Array(bytes));
    }

    stringToAsciiBits(str) {
        let bits = '';
        for (let i = 0; i < str.length; i++) {
            let code = str.charCodeAt(i);
            if (code > 127) code = 63;
            bits += code.toString(2).padStart(8, '0');
        }
        return bits;
    }

    asciiBitsToString(bits) {
        let result = '';
        for (let i = 0; i < bits.length; i += 8) {
            if (i + 8 <= bits.length) {
                const code = parseInt(bits.substring(i, i + 8), 2);
                if (code >= 32 && code <= 126) {
                    result += String.fromCharCode(code);
                } else if (code === 10 || code === 13) {
                    result += String.fromCharCode(code);
                }
            }
        }
        return result;
    }

    encryptBlock(blockBits, publicKey) {
        if (blockBits.length !== this.z) {
            blockBits = blockBits.padEnd(this.z, '0');
        }
        
        let sum = 0n;
        for (let i = 0; i < this.z; i++) {
            if (blockBits[i] === '1') {
                sum += BigInt(publicKey[i]);
            }
        }
        return sum;
    }

    encrypt(message, useUtf8 = true) {
        let bits;
        if (useUtf8) {
            bits = this.stringToUtf8Bits(message);
        } else {
            bits = this.stringToAsciiBits(message);
        }
        
        // Сохраняем оригинальную длину битов для последующего использования при расшифровании
        const originalBitLength = bits.length;
        
        const blocks = [];
        for (let i = 0; i < bits.length; i += this.z) {
            let block = bits.substring(i, i + this.z);
            if (block.length < this.z) {
                block = block.padEnd(this.z, '0');
            }
            blocks.push(block);
        }
        
        const encrypted = blocks.map(block => this.encryptBlock(block, this.publicKey));
        
        // Сохраняем оригинальную длину в зашифрованном сообщении (добавляем в начало)
        const result = {
            originalBitLength: originalBitLength,
            data: encrypted.map(v => v.toString())
        };
        
        return JSON.stringify(result);
    }

    decryptBlock(valueStr) {
        const value = BigInt(valueStr);
        const s = (value * BigInt(this.aInverse)) % BigInt(this.n);
        
        let remaining = s;
        const bits = new Array(this.z).fill('0');
        
        const pkBig = this.privateKey.map(k => BigInt(k));
        
        for (let i = this.z - 1; i >= 0; i--) {
            if (remaining >= pkBig[i]) {
                bits[i] = '1';
                remaining -= pkBig[i];
            } else {
                bits[i] = '0';
            }
        }
        
        return bits.join('');
    }

    decrypt(encryptedStr, useUtf8 = true) {
        let encryptedData;
        try {
            encryptedData = JSON.parse(encryptedStr);
        } catch (e) {
            // Если это старый формат (без метаданных), пытаемся распарсить как массив
            const values = encryptedStr.split(',').filter(v => v.trim().length > 0);
            encryptedData = {
                originalBitLength: null,
                data: values
            };
        }
        
        const values = encryptedData.data;
        const originalBitLength = encryptedData.originalBitLength;
        
        let bits = '';
        for (const val of values) {
            bits += this.decryptBlock(val);
        }
        
        // Обрезаем до оригинальной длины, если она известна
        if (originalBitLength !== null && originalBitLength > 0) {
            bits = bits.substring(0, originalBitLength);
        } else {
            // Удаляем нулевые байты в конце (каждый нулевой байт - это 8 нулей)
            while (bits.endsWith('00000000')) {
                bits = bits.substring(0, bits.length - 8);
            }
        }
        
        let result;
        if (useUtf8) {
            result = this.utf8BitsToString(bits, originalBitLength || bits.length / 8);
        } else {
            result = this.asciiBitsToString(bits);
        }
        
        return result;
    }

    setKeys(privateKey, publicKey, n, a, aInverse) {
        this.privateKey = privateKey.map(k => BigInt(k));
        this.publicKey = publicKey;
        this.n = n;
        this.a = a;
        this.aInverse = aInverse;
        this.z = privateKey.length;
    }
}

let knapsack = new KnapsackCrypto();
let currentKeys = null;
let timeChart = null;

function formatArray(arr) {
    if (!arr || arr.length === 0) return '[]';
    if (arr.length > 10) {
        return '[' + arr.slice(0, 5).join(', ') + ', ... , ' + arr.slice(-3).join(', ') + ']';
    }
    return '[' + arr.join(', ') + ']';
}

function formatNumber(num) {
    if (num > 1e15) {
        return num.toExponential(4);
    }
    return num.toString();
}

function initChart() {
    const ctx = document.getElementById('timeChart').getContext('2d');
    timeChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Генерация ключей (мс)',
                    data: [],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Шифрование (мс)',
                    data: [],
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Расшифрование (мс)',
                    data: [],
                    borderColor: '#ed8936',
                    backgroundColor: 'rgba(237, 137, 54, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Зависимость времени выполнения от размера ключа (z)'
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Размер последовательности (z)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Время (миллисекунды)'
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function updateChart(labels, genTimes, encTimes, decTimes) {
    if (timeChart) {
        timeChart.data.labels = labels;
        timeChart.data.datasets[0].data = genTimes;
        timeChart.data.datasets[1].data = encTimes;
        timeChart.data.datasets[2].data = decTimes;
        timeChart.update();
    }
}

document.getElementById('encodingType')?.addEventListener('change', (e) => {
    const encoding = e.target.value;
    let z = 8;
    if (encoding === 'ascii') z = 8;
    else if (encoding === 'base64') z = 6;
    else if (encoding === 'utf8') z = 8;
    document.getElementById('zValue').textContent = z;
    knapsack.z = z;
});

document.getElementById('genKeysBtn')?.addEventListener('click', () => {
    const encoding = document.getElementById('encodingType')?.value || 'utf8';
    let z = 8;
    if (encoding === 'ascii') z = 8;
    else if (encoding === 'base64') z = 6;
    else if (encoding === 'utf8') z = 8;
    
    const startTime = performance.now();
    const keys = knapsack.generateKeys(z);
    const endTime = performance.now();
    
    currentKeys = keys;
    
    document.getElementById('privateKey').value = formatArray(keys.privateKey);
    document.getElementById('publicKey').value = formatArray(keys.publicKey);
    document.getElementById('nValue').textContent = formatNumber(keys.n);
    document.getElementById('aValue').textContent = keys.a;
    document.getElementById('zValue').textContent = z;
    
    console.log('Keys generated in', (endTime - startTime).toFixed(2), 'ms');
});

document.getElementById('useStudentNameBtn')?.addEventListener('click', () => {
    const nameInput = document.getElementById('studentName');
    const message = nameInput.value;
    document.getElementById('plainMessage').value = message;
});

document.getElementById('encryptBtn')?.addEventListener('click', () => {
    if (!currentKeys) {
        alert('Сначала сгенерируйте ключи!');
        return;
    }
    
    const message = document.getElementById('plainMessage').value;
    if (!message.trim()) {
        alert('Введите сообщение для зашифрования!');
        return;
    }
    
    const startTime = performance.now();
    const encrypted = knapsack.encrypt(message, true);
    const endTime = performance.now();
    
    document.getElementById('encryptedMessage').value = encrypted;
    document.getElementById('encryptTime').innerHTML = 
        `<strong>Время зашифрования:</strong> ${(endTime - startTime).toFixed(3)} мс`;
    
    console.log('Encrypted length:', encrypted.length);
});

document.getElementById('decryptBtn')?.addEventListener('click', () => {
    if (!currentKeys) {
        alert('Сначала сгенерируйте ключи!');
        return;
    }
    
    const encrypted = document.getElementById('encryptedMessage').value;
    if (!encrypted.trim()) {
        alert('Сначала зашифруйте сообщение!');
        return;
    }
    
    const startTime = performance.now();
    const decrypted = knapsack.decrypt(encrypted, true);
    const endTime = performance.now();
    
    document.getElementById('decryptedMessage').value = decrypted;
    document.getElementById('decryptTime').innerHTML = 
        `<strong>Время расшифрования:</strong> ${(endTime - startTime).toFixed(3)} мс`;
    
    const original = document.getElementById('plainMessage').value;
    console.log('Original:', original);
    console.log('Decrypted:', decrypted);
    console.log('Match:', decrypted === original);
    
    if (decrypted === original) {
        alert('Расшифрование выполнено успешно!');
    } else {
        console.warn('Decryption mismatch!');
        alert('Ошибка расшифрования. Попробуйте сгенерировать новые ключи.');
    }
});

document.getElementById('analyzeBtn')?.addEventListener('click', async () => {
    const testCount = parseInt(document.getElementById('testCount')?.value || '5');
    const testMessage = document.getElementById('studentName')?.value || 'TestMessage123';
    
    const zValues = [8, 12, 16, 20, 24, 28, 32];
    
    const results = [];
    const genTimes = [];
    const encTimes = [];
    const decTimes = [];
    
    for (const z of zValues) {
        const tempCrypto = new KnapsackCrypto();
        
        const genStart = performance.now();
        const keys = tempCrypto.generateKeys(z);
        const genEnd = performance.now();
        const genTime = genEnd - genStart;
        
        const encStart = performance.now();
        const encrypted = tempCrypto.encrypt(testMessage, true);
        const encEnd = performance.now();
        const encTime = encEnd - encStart;
        
        const decStart = performance.now();
        const decrypted = tempCrypto.decrypt(encrypted, true);
        const decEnd = performance.now();
        const decTime = decEnd - decStart;
        
        const success = (decrypted === testMessage);
        
        results.push({
            z: z,
            genTime: genTime.toFixed(2),
            encTime: encTime.toFixed(2),
            decTime: decTime.toFixed(2),
            success: success
        });
        
        genTimes.push(genTime);
        encTimes.push(encTime);
        decTimes.push(decTime);
    }
    
    updateChart(zValues.map(v => v.toString()), genTimes, encTimes, decTimes);
    
    let html = '<h4>Результаты тестирования</h4>';
    html += '<table border="1" style="border-collapse: collapse; width: 100%;">';
    html += '<tr style="background: #667eea; color: white;"><th>z (размер ключа)</th><th>Время генерации (мс)</th><th>Время шифрования (мс)</th><th>Время расшифрования (мс)</th><th>Успех</th></tr>';
    
    for (const r of results) {
        html += `<tr>
            <td style="text-align: center;">${r.z}</td>
            <td style="text-align: center;">${r.genTime}</td>
            <td style="text-align: center;">${r.encTime}</td>
            <td style="text-align: center;">${r.decTime}</td>
            <td style="text-align: center;">${r.success ? 'Да' : 'Нет'}</td>
        </tr>`;
    }
    html += '</table>';
    
    html += '<br><hr><br>';
    html += '<p><strong>Анализ производительности:</strong></p>';
    html += '<ul>';
    html += '<li>При увеличении размера последовательности z время выполнения всех операций растет. На графике видна линейная (или близкая к линейной) зависимость для шифрования и расшифрования.</li>';
    html += '<li>Время генерации ключей растет быстрее из-за необходимости нахождения взаимно простых чисел и вычисления обратных элементов.</li>';
    html += '<li>Кодировка UTF-8 используется для поддержки русского языка и корректного отображения кириллицы.</li>';
    html += '<li>Ранцевый алгоритм основан на сложности задачи о сумме подмножеств (NP-полная задача).</li>';
    html += '<li><strong>Вывод:</strong> Зависимость времени выполнения от размера ключа (z) имеет линейный характер, что подтверждается графиком.</li>';
    html += '</ul>';
    
    document.getElementById('analysisResults').innerHTML = html;
});

initChart();

const encodingSelect = document.getElementById('encodingType');
if (encodingSelect) {
    encodingSelect.innerHTML = '<option value="utf8" selected>UTF-8 (для русского языка, z=8)</option><option value="ascii">ASCII (только латиница, z=8)</option><option value="base64">Base64 (z=6)</option>';
    encodingSelect.dispatchEvent(new Event('change'));
}

const nameInput = document.getElementById('studentName');
if (nameInput && nameInput.value === '') {
    nameInput.value = 'Фамилия Имя Отчество ';
}

console.log('Application initialized with fixed decryption - stores original bit length');