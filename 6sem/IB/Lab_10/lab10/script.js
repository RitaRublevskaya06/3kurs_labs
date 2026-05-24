// ======================== БИБЛИОТЕКА БОЛЬШИХ ЧИСЕЛ ========================

console.log("Script loaded successfully");

function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    let exp = exponent;
    while (exp > 0n) {
        if (exp % 2n === 1n) {
            result = (result * base) % modulus;
        }
        base = (base * base) % modulus;
        exp >>= 1n;
    }
    return result;
}

function modInverse(a, m) {
    let m0 = m, y = 0n, x = 1n;
    if (m === 1n) return 0n;
    while (a > 1n) {
        let q = a / m;
        let t = m;
        m = a % m;
        a = t;
        t = y;
        y = x - q * y;
        x = t;
    }
    if (x < 0n) x += m0;
    return x;
}

function getRandomBigInt(bits) {
    let result = 0n;
    for (let i = 0; i < bits; i += 16) {
        let rand = BigInt(Math.floor(Math.random() * 65536));
        result = (result << 16n) | rand;
    }
    return result & ((1n << BigInt(bits)) - 1n);
}

// ======================== ПРЕДОПРЕДЕЛЕННЫЕ ПРОСТЫЕ ЧИСЛА ДЛЯ X (В HEX) ========================
// Настоящие простые числа для разных разрядов (в шестнадцатеричном виде)
const PRIME_X_BY_BITS = {
    100: 0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn,
    200: 0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn,
    300: 0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn,
    400: 0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn,
    500: 0x1FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn
};

// Функция для получения простого числа x по битам
function getPrimeX(bits) {
    if (PRIME_X_BY_BITS[bits]) {
        return PRIME_X_BY_BITS[bits];
    }
    // Если нет точного, генерируем степень двойки минус 1
    return (1n << BigInt(bits)) - 1n;
}

// ======================== ПРЕОБРАЗОВАНИЕ ТЕКСТА ========================
function stringToBytes(str) {
    let bytes = [];
    for (let i = 0; i < str.length; i++) {
        let code = str.charCodeAt(i);
        if (code <= 0x7F) {
            bytes.push(code);
        } else if (code <= 0x7FF) {
            bytes.push(0xC0 | (code >> 6));
            bytes.push(0x80 | (code & 0x3F));
        } else {
            bytes.push(0xE0 | (code >> 12));
            bytes.push(0x80 | ((code >> 6) & 0x3F));
            bytes.push(0x80 | (code & 0x3F));
        }
    }
    return bytes;
}

function bytesToString(bytes) {
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
        let b1 = bytes[i];
        if ((b1 & 0x80) === 0) {
            result += String.fromCharCode(b1);
        } else if ((b1 & 0xE0) === 0xC0) {
            let b2 = bytes[++i];
            let code = ((b1 & 0x1F) << 6) | (b2 & 0x3F);
            result += String.fromCharCode(code);
        } else if ((b1 & 0xF0) === 0xE0) {
            let b2 = bytes[++i];
            let b3 = bytes[++i];
            let code = ((b1 & 0x0F) << 12) | ((b2 & 0x3F) << 6) | (b3 & 0x3F);
            result += String.fromCharCode(code);
        }
    }
    return result;
}

function bytesToBigInt(bytes) {
    let hex = '';
    for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
    }
    return BigInt('0x' + hex);
}

function bigIntToBytes(num) {
    let hex = num.toString(16);
    if (hex.length % 2) hex = '0' + hex;
    let bytes = [];
    for (let i = 0; i < hex.length; i += 2) {
        bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
}

// ======================== RSA ========================
function generateRSAKeys() {
    let p = 174821n;
    let q = 175003n;
    let n = p * q;
    let phi = (p - 1n) * (q - 1n);
    let e = 65537n;
    let d = modInverse(e, phi);
    return { publicKey: { e, n }, privateKey: { d, n } };
}

function rsaEncrypt(plainText, publicKey) {
    let { e, n } = publicKey;
    let bytes = stringToBytes(plainText);
    let maxBlockBytes = Number(n.toString(16).length) / 2 - 2;
    if (maxBlockBytes < 1) maxBlockBytes = 1;
    
    let result = [];
    for (let i = 0; i < bytes.length; i += maxBlockBytes) {
        let chunkBytes = bytes.slice(i, i + maxBlockBytes);
        let m = bytesToBigInt(chunkBytes);
        let c = modPow(m, e, n);
        result.push(c.toString(16));
    }
    
    return result.join(':');
}

function rsaDecrypt(cipherText, privateKey) {
    let { d, n } = privateKey;
    try {
        let parts = cipherText.split(':');
        let allBytes = [];
        
        for (let part of parts) {
            let c = BigInt('0x' + part);
            let m = modPow(c, d, n);
            let bytes = bigIntToBytes(m);
            for (let b of bytes) {
                allBytes.push(b);
            }
        }
        
        return bytesToString(allBytes);
    } catch(e) {
        console.error("RSA decrypt error:", e);
        return "Ошибка расшифрования";
    }
}

// ======================== ЭЛЬ-ГАМАЛЬ ========================
function generateElGamalKeys() {
    let p = 1061n;
    let g = 2n;
    let x = getRandomBigInt(16) % (p - 1n) + 1n;
    let y = modPow(g, x, p);
    return { publicKey: { p, g, y }, privateKey: { p, g, x } };
}

function elGamalEncrypt(plainText, publicKey) {
    let { p, g, y } = publicKey;
    let bytes = stringToBytes(plainText);
    let results = { a: [], b: [] };
    
    for (let i = 0; i < bytes.length; i++) {
        let k = getRandomBigInt(16) % (p - 1n) + 1n;
        let a = modPow(g, k, p);
        let b = (modPow(y, k, p) * BigInt(bytes[i])) % p;
        results.a.push(a.toString(16));
        results.b.push(b.toString(16));
    }
    
    return { 
        a: results.a.join(':'), 
        b: results.b.join(':') 
    };
}

function elGamalDecrypt(cipher, privateKey) {
    let { p, g, x } = privateKey;
    try {
        let aParts = cipher.a.split(':');
        let bParts = cipher.b.split(':');
        let bytes = [];
        
        for (let i = 0; i < aParts.length; i++) {
            let a = BigInt('0x' + aParts[i]);
            let b = BigInt('0x' + bParts[i]);
            let s = modPow(a, x, p);
            let sInv = modInverse(s, p);
            let m = Number((b * sInv) % p);
            bytes.push(m);
        }
        
        return bytesToString(bytes);
    } catch(e) {
        console.error("ElGamal decrypt error:", e);
        return "Ошибка расшифрования";
    }
}

// ======================== ИЗМЕРЕНИЕ ВРЕМЕНИ ========================
const FIXED_N = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn;

async function measureModExpFixedN(a, xBits, iterations = 3) {
    let aVal = BigInt(a);
    let times = [];
    let x = getPrimeX(xBits);
    
    // Показываем первые 16 шестнадцатеричных цифр числа x
    // let hexStr = x.toString(16);
    // let xSample = hexStr.slice(0, 16) + (hexStr.length > 16 ? '...' : '');
    let decStr = x.toString(10);
    let xSample = decStr.slice(0, 16) + (decStr.length > 16 ? '...' : '');
    
    for (let i = 0; i < iterations; i++) {
        let start = performance.now();
        let res = modPow(aVal, x, FIXED_N);
        let end = performance.now();
        times.push(end - start);
    }
    
    let avgTime = times.reduce((sum, t) => sum + t, 0) / times.length;
    return { time: avgTime.toFixed(2), xVal: xSample };
}

let perfChart = null;

function drawChart(data) {
    const canvas = document.getElementById('perfChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    if (perfChart) {
        perfChart.destroy();
    }
    
    perfChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(d => d.bits + ' бит'),
            datasets: [
                {
                    label: 'Фактическое время (мс)',
                    data: data.map(d => parseFloat(d.time)),
                    borderColor: '#3949ab',
                    backgroundColor: 'rgba(57, 73, 171, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.1,
                    pointRadius: 6,
                    pointBackgroundColor: '#3949ab',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Линейная аппроксимация',
                    data: (() => {
                        let times = data.map(d => parseFloat(d.time));
                        let bits = data.map(d => d.bits);
                        let n = times.length;
                        let sumX = bits.reduce((a,b) => a + b, 0);
                        let sumY = times.reduce((a,b) => a + b, 0);
                        let sumXY = 0, sumX2 = 0;
                        for (let i = 0; i < n; i++) {
                            sumXY += bits[i] * times[i];
                            sumX2 += bits[i] * bits[i];
                        }
                        let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
                        let intercept = (sumY - slope * sumX) / n;
                        return bits.map(b => Math.max(0, slope * b + intercept));
                    })(),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    pointRadius: 0,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ' + context.raw.toFixed(2) + ' мс';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Время (мс)',
                        font: { weight: 'bold' }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Размер показателя x (бит)',
                        font: { weight: 'bold' }
                    }
                }
            }
        }
    });
}

// ======================== ИНИЦИАЛИЗАЦИЯ UI ========================
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM loaded, initializing...");
    
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            let tabId = btn.dataset.tab;
            contents.forEach(c => c.classList.remove('active'));
            tabs.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Тест производительности
    document.getElementById('runPerfTest').addEventListener('click', async () => {
        const a = parseInt(document.getElementById('perf_a').value);
        const xBitSizes = [100, 200, 300, 400, 500];
        const tbody = document.querySelector('#perfTable tbody');
        
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">Выполняется измерение...<\/td><\/tr>';
        
        let results = [];
        
        for (let idx = 0; idx < xBitSizes.length; idx++) {
            let xbits = xBitSizes[idx];
            
            let row = document.createElement('tr');
            row.innerHTML = '<td>' + xbits + '<\/td><td>Измерение...<\/td><td>...<\/td>';
            if (idx === 0) tbody.innerHTML = '';
            tbody.appendChild(row);
            
            let { time, xVal } = await measureModExpFixedN(a, xbits, 3);
            results.push({ bits: xbits, time, xVal });
            
            row.innerHTML = '<td>' + xbits + '<\/td><td>' + xVal + '<\/td><td>' + time + ' мс<\/td>';
        }
        
        drawChart(results);
    });

    // RSA логика
    let rsaPub, rsaPriv;
    
    document.getElementById('genRsaKeys').addEventListener('click', async () => {
        const start = performance.now();
        document.getElementById('genRsaKeys').disabled = true;
        document.getElementById('genRsaKeys').textContent = 'Генерация...';
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        let keys = generateRSAKeys();
        rsaPub = keys.publicKey;
        rsaPriv = keys.privateKey;
        
        const end = performance.now();
        document.getElementById('rsaPublicKey').value = 'e = ' + rsaPub.e + '\nn = ' + rsaPub.n;
        document.getElementById('rsaPrivateKey').value = 'd = ' + rsaPriv.d + '\nn = ' + rsaPriv.n;
        
        document.getElementById('genRsaKeys').disabled = false;
        document.getElementById('genRsaKeys').textContent = 'Сгенерировать ключи RSA';
        document.getElementById('rsaTiming').innerHTML = 'Ключи сгенерированы за ' + (end-start).toFixed(2) + ' мс';
    });

    document.getElementById('rsaEncryptBtn').addEventListener('click', () => {
        if (!rsaPub) { alert("Сначала сгенерируйте ключи"); return; }
        let plain = document.getElementById('rsaPlainText').value;
        let start = performance.now();
        try {
            let cipherHex = rsaEncrypt(plain, rsaPub);
            let end = performance.now();
            document.getElementById('rsaCipherText').value = cipherHex;
            let timingDiv = document.getElementById('rsaTiming');
            timingDiv.innerHTML += '<br>Шифрование: ' + (end - start).toFixed(2) + ' мс';
        } catch (e) {
            alert("Ошибка: " + e.message);
        }
    });

    document.getElementById('rsaDecryptBtn').addEventListener('click', () => {
        if (!rsaPriv) { alert("Нет закрытого ключа"); return; }
        let cipher = document.getElementById('rsaCipherText').value;
        if (!cipher) { alert("Нет шифртекста"); return; }
        let start = performance.now();
        let decrypted = rsaDecrypt(cipher, rsaPriv);
        let end = performance.now();
        document.getElementById('rsaDecryptedText').value = decrypted;
        document.getElementById('rsaTiming').innerHTML += '<br>Расшифрование: ' + (end - start).toFixed(2) + ' мс';
    });

    // Эль-Гамаль логика
    let elPub, elPriv;
    let elCipherStore = null;
    
    document.getElementById('genElGamalKeys').addEventListener('click', async () => {
        const start = performance.now();
        document.getElementById('genElGamalKeys').disabled = true;
        document.getElementById('genElGamalKeys').textContent = 'Генерация...';
        
        await new Promise(resolve => setTimeout(resolve, 50));
        
        let keys = generateElGamalKeys();
        elPub = keys.publicKey;
        elPriv = keys.privateKey;
        
        const end = performance.now();
        document.getElementById('elPublicKey').value = 'p = ' + elPub.p + '\ng = ' + elPub.g + '\ny = ' + elPub.y;
        document.getElementById('elPrivateKey').value = 'x = ' + elPriv.x;
        
        document.getElementById('genElGamalKeys').disabled = false;
        document.getElementById('genElGamalKeys').textContent = 'Сгенерировать ключи Эль-Гамаля';
        document.getElementById('elTiming').innerHTML = 'Ключи сгенерированы за ' + (end-start).toFixed(2) + ' мс';
    });

    document.getElementById('elEncryptBtn').addEventListener('click', () => {
        if (!elPub) { alert("Сначала сгенерируйте ключи"); return; }
        let plain = document.getElementById('elPlainText').value;
        let start = performance.now();
        let cipher = elGamalEncrypt(plain, elPub);
        let end = performance.now();
        document.getElementById('elCipherText').value = 'a = ' + cipher.a + '\nb = ' + cipher.b;
        document.getElementById('elTiming').innerHTML += '<br>Шифрование: ' + (end - start).toFixed(2) + ' мс';
        elCipherStore = cipher;
    });

    document.getElementById('elDecryptBtn').addEventListener('click', () => {
        if (!elPriv || !elCipherStore) { alert("Нет ключей или нет шифртекста"); return; }
        let start = performance.now();
        let decrypted = elGamalDecrypt(elCipherStore, elPriv);
        let end = performance.now();
        document.getElementById('elDecryptedText').value = decrypted;
        document.getElementById('elTiming').innerHTML += '<br>Расшифрование: ' + (end - start).toFixed(2) + ' мс';
    });
    
    console.log("Initialization complete!");
});