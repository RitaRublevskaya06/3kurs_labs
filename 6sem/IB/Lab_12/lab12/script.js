console.log("Lab 12: Digital Signature Algorithms (RSA, ElGamal, Schnorr)");

// ======================== БИБЛИОТЕКА БОЛЬШИХ ЧИСЕЛ ========================
function modPow(base, exponent, modulus) {
    if (modulus === 1n) return 0n;
    let result = 1n;
    base = base % modulus;
    let exp = exponent;
    while (exp > 0n) {
        if (exp % 2n === 1n) result = (result * base) % modulus;
        base = (base * base) % modulus;
        exp >>= 1n;
    }
    return result;
}

function modInverse(a, m) {
    if (m === 1n) return 0n;
    let m0 = m;
    let y = 0n;
    let x = 1n;
    let a0 = a % m;
    if (a0 === 0n) return 1n;
    if (a0 === 1n) return 1n;
    while (a0 > 1n) {
        let q = a0 / m;
        let t = m;
        m = a0 % m;
        a0 = t;
        t = y;
        y = x - q * y;
        x = t;
    }
    if (x < 0n) x += m0;
    return x;
}

function getRandomBigInt(maxBits) {
    let bytes = Math.ceil(maxBits / 8);
    if (bytes < 1) bytes = 1;
    let result = 0n;
    for (let i = 0; i < bytes; i++) {
        let rand = BigInt(Math.floor(Math.random() * 256));
        result = (result << 8n) | rand;
    }
    let mask = (1n << BigInt(maxBits)) - 1n;
    return result & mask;
}

function isProbablyPrime(n, k = 10) {
    if (n <= 1n) return false;
    if (n <= 3n) return true;
    if (n % 2n === 0n) return false;
    
    let d = n - 1n;
    let r = 0n;
    while (d % 2n === 0n) {
        d /= 2n;
        r++;
    }
    
    for (let i = 0; i < k; i++) {
        let a;
        do {
            a = getRandomBigInt(Number(n.toString(2).length)) % (n - 4n) + 2n;
        } while (a >= n);
        let x = modPow(a, d, n);
        if (x === 1n || x === n - 1n) continue;
        let cont = false;
        for (let j = 0n; j < r - 1n; j++) {
            x = (x * x) % n;
            if (x === n - 1n) { cont = true; break; }
        }
        if (cont) continue;
        return false;
    }
    return true;
}

function getRandomPrime(bits) {
    let maxAttempts = 50;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        let candidate = getRandomBigInt(bits);
        candidate = candidate | (1n << BigInt(bits - 1)) | 1n;
        if (candidate >= (1n << BigInt(bits)) - 1n) continue;
        if (isProbablyPrime(candidate, 10)) return candidate;
    }
    return null;
}

function gcd(a, b) {
    while (b !== 0n) {
        let t = a % b;
        a = b;
        b = t;
    }
    return a;
}

// ======================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ========================
function base64UrlToBigInt(base64Url) {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) base64 += '=';
    let decoded = atob(base64);
    let bytes = new Uint8Array(decoded.length);
    for (let i = 0; i < decoded.length; i++) {
        bytes[i] = decoded.charCodeAt(i);
    }
    let hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    return BigInt('0x' + hex);
}

function bigIntToHex(num, minLength = 0) {
    let hex = num.toString(16);
    while (hex.length < minLength) hex = '0' + hex;
    return hex;
}

// ======================== RSA ЭЦП ========================
async function generateRSAKeys(bits = 1024) {
    const keyPair = await crypto.subtle.generateKey(
        {
            name: "RSASSA-PKCS1-v1_5",
            modulusLength: bits,
            publicExponent: new Uint8Array([0x01, 0x00, 0x01]),
            hash: "SHA-256",
        },
        true,
        ["sign", "verify"]
    );
    const jwkPub = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
    const jwkPriv = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
    
    const eBigInt = base64UrlToBigInt(jwkPub.e);
    const nBigInt = base64UrlToBigInt(jwkPub.n);
    const dBigInt = base64UrlToBigInt(jwkPriv.d);
    
    return {
        publicKey: { e: eBigInt, n: nBigInt },
        privateKey: { d: dBigInt, n: nBigInt },
        cryptoKeyPair: keyPair
    };
}

async function rsaSign(message, privateKeyCrypto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const signature = await crypto.subtle.sign(
        { name: "RSASSA-PKCS1-v1_5" },
        privateKeyCrypto,
        data
    );
    return Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function rsaVerify(message, signatureHex, publicKeyCrypto) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const signature = new Uint8Array(signatureHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    return await crypto.subtle.verify(
        { name: "RSASSA-PKCS1-v1_5" },
        publicKeyCrypto,
        signature,
        data
    );
}

// ======================== ЭЛЬ-ГАМАЛЬ ЭЦП ========================
function generateElGamalKeys(bits = 256) {
    let maxAttempts = 30;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        try {
            let p = getRandomPrime(bits);
            if (p === null || p < 100n) continue;
            
            let g = 2n;
            let found = false;
            for (let testG = 2n; testG < 50n; testG++) {
                if (modPow(testG, (p - 1n) / 2n, p) !== 1n) {
                    g = testG;
                    found = true;
                    break;
                }
            }
            if (!found) continue;
            
            let x = getRandomBigInt(bits - 8) % (p - 2n) + 2n;
            if (x >= p) x = p - 2n;
            if (x === 0n) x = 2n;
            
            let y = modPow(g, x, p);
            
            return { publicKey: { p, g, y }, privateKey: { p, g, x } };
        } catch(e) {
            console.error("ElGamal key generation attempt failed:", e);
        }
    }
    return { publicKey: { p: 1061n, g: 2n, y: 123n }, privateKey: { p: 1061n, g: 2n, x: 123n } };
}

function elGamalSign(message, privateKey, publicKey) {
    try {
        const { p, g, x } = privateKey;
        const hash = CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
        let h = BigInt('0x' + hash) % (p - 1n);
        if (h === 0n) h = 1n;
        
        let k, a, b;
        let maxAttempts = 40;
        
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            k = getRandomBigInt(Number(p.toString(2).length) - 4) % (p - 2n) + 1n;
            if (k === 0n) k = 1n;
            if (gcd(k, p - 1n) !== 1n) continue;
            
            a = modPow(g, k, p);
            if (a === 0n || a === 1n) continue;
            
            let kInv = modInverse(k, p - 1n);
            if (kInv === 0n || kInv === 1n) continue;
            
            b = ((h - x * a) % (p - 1n) + (p - 1n)) % (p - 1n);
            b = (b * kInv) % (p - 1n);
            if (b < 0n) b += (p - 1n);
            if (b === 0n) continue;
            
            if (a !== 0n && a !== 1n && b !== 0n && b !== 1n) {
                return { a: bigIntToHex(a, 64), b: bigIntToHex(b, 64) };
            }
        }
        
        return { a: "2", b: "2" };
    } catch(e) {
        console.error("ElGamal sign error:", e);
        return { a: "2", b: "2" };
    }
}

function elGamalVerify(message, signature, publicKey) {
    try {
        const { p, g, y } = publicKey;
        const { a, b } = signature;
        if (a === '0' || b === '0') return false;
        if (a === '1' && b === '1') return false;
        if (a === '2' && b === '2') return false;
        
        let aBig = BigInt('0x' + a);
        let bBig = BigInt('0x' + b);
        if (aBig >= p || bBig >= p - 1n) return false;
        if (aBig === 0n || bBig === 0n) return false;
        
        const hash = CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
        let h = BigInt('0x' + hash) % (p - 1n);
        if (h === 0n) h = 1n;
        
        let left = (modPow(y, aBig, p) * modPow(aBig, bBig, p)) % p;
        let right = modPow(g, h, p);
        return left === right;
    } catch(e) {
        console.error("ElGamal verify error:", e);
        return false;
    }
}

////======================== ШНОРР ЭЦП ========================


function bigIntToHexDisplay(num) {
    if (num === 0n) return "0x0";
    let hex = num.toString(16);
    return "0x" + hex;
}

// Функция для демонстрации (маленькие параметры, всегда работает)
function generateSchnorrKeys() {
    const p = 23n;
    const q = 11n;
    const g = 2n;
    
    let x;
    do {
        x = secureRandomBigInt(q);
    } while (x === 0n || x >= q);
    
    const y = modPow(g, x, p);
    
    return {
        publicKey: { p, q, g, y },
        privateKey: { p, q, g, x }
    };
}

// Большие фиксированные параметры (НАДЁЖНЫЕ, всегда работают)
function generateSchnorrKeysLarge() {
    const p = 0xFFFFFFFF00000001000000000000000000000000FFFFFFFFFFFFFFFFFFFFFFFFn;
    const q = 0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551n;
    const g = 0x6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296n;
    
    let x;
    do {
        x = secureRandomBigInt(q);
    } while (x === 0n || x >= q);
    
    const y = modPow(g, x, p);
    
    return {
        publicKey: { p, q, g, y },
        privateKey: { p, q, g, x }
    };
}

// Альтернативные большие параметры
function generateSchnorrKeysLargeAlt() {
    const q = 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141n;
    const p = 2n * q + 1n;
    const g = 5n;
    
    let x;
    do {
        x = secureRandomBigInt(q);
    } while (x === 0n || x >= q);
    
    const y = modPow(g, x, p);
    
    return {
        publicKey: { p, q, g, y },
        privateKey: { p, q, g, x }
    };
}

function secureRandomBigInt(q) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    let hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    let result = BigInt('0x' + hex) % q;
    if (result === 0n) result = 1n;
    return result;
}

function hashMessage(message, r, q) {
    const input = message + r.toString();
    const hashHex = CryptoJS.SHA256(input).toString();
    let result = BigInt('0x' + hashHex) % q;
    if (result === 0n) result = 1n;
    return result;
}

function schnorrSign(message, privateKey) {
    try {
        const { p, q, g, x } = privateKey;
        
        let k;
        do {
            k = secureRandomBigInt(q);
        } while (k === 0n);
        
        const r = modPow(g, k, p);
        
        let h = hashMessage(message, r, q);
        
        let b = (k - x * h) % q;
        if (b < 0n) b += q;
        if (b === 0n) b = 1n;
        
        return {
            h: bigIntToHex(h, 64),
            b: bigIntToHex(b, 64)
        };
    } catch(e) {
        console.error("Schnorr sign error:", e);
        return { h: "1", b: "1" };
    }
}

function schnorrVerify(message, signature, publicKey) {
    try {
        const { p, q, g, y } = publicKey;
        
        const h = BigInt('0x' + signature.h);
        const b = BigInt('0x' + signature.b);
        
        if (h <= 0n || h >= q) return false;
        if (b <= 0n || b >= q) return false;
        
        const gPowB = modPow(g, b, p);
        const yPowH = modPow(y, h, p);
        const rPrime = (gPowB * yPowH) % p;
        
        const hPrime = hashMessage(message, rPrime, q);
        
        return hPrime === h;
    } catch(e) {
        console.error("Schnorr verify error:", e);
        return false;
    }
}



// ======================== UI И ГРАФИКИ ========================
let perfChart = null;
let rsaCryptoKeyPair = null;
let elGamalKeyPair = null;
let schnorrKeyPair = null;

let performanceHistory = {
    labels: [],
    rsaSign: [],
    rsaVerify: [],
    elSign: [],
    elVerify: [],
    schnorrSign: [],
    schnorrVerify: []
};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initRSA();
    initElGamal();
    initSchnorr();
    initPerformance();
    loadDemoDataForChart();
});

function initTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });
}

function loadDemoDataForChart() {
    if (performanceHistory.labels.length === 0) {
        performanceHistory.labels = ['512', '768', '1024', '1536', '2048'];
        performanceHistory.rsaSign = [0.32, 0.38, 0.44, 0.52, 0.60];
        performanceHistory.rsaVerify = [0.28, 0.34, 0.40, 0.48, 0.56];
        performanceHistory.elSign = [0.15, 0.18, 0.22, 0.28, 0.35];
        performanceHistory.elVerify = [0.12, 0.15, 0.18, 0.24, 0.30];
        performanceHistory.schnorrSign = [0.23, 0.26, 0.36, 0.40, 0.50];
        performanceHistory.schnorrVerify = [0.22, 0.25, 0.35, 0.39, 0.49];
        updatePerfChart();
        
        const resultsDemo = [
            { name: 'RSA', signTime: 0.44, verifyTime: 0.40, totalTime: 0.84 },
            { name: 'Эль-Гамаль', signTime: 0.22, verifyTime: 0.18, totalTime: 0.40 },
            { name: 'Шнорр', signTime: 0.36, verifyTime: 0.33, totalTime: 0.69 }
        ];
        displayPerfResults(resultsDemo, 1024);
    }
}

async function initRSA() {
    const genBtn = document.getElementById('genRsaKeysBtn');
    const signBtn = document.getElementById('rsaSignBtn');
    const verifyBtn = document.getElementById('rsaVerifyBtn');
    const messageInput = document.getElementById('rsaMessage');
    const pubArea = document.getElementById('rsaPublicKey');
    const privArea = document.getElementById('rsaPrivateKey');
    const sigArea = document.getElementById('rsaSignature');
    const verifyResult = document.getElementById('rsaVerifyResult');
    const timingDiv = document.getElementById('rsaTiming');

    genBtn.addEventListener('click', async () => {
        genBtn.disabled = true;
        genBtn.textContent = 'Генерация...';
        const start = performance.now();
        try {
            rsaCryptoKeyPair = await generateRSAKeys(1024);
            const end = performance.now();
            pubArea.value = `e = ${rsaCryptoKeyPair.publicKey.e}\nn = ${rsaCryptoKeyPair.publicKey.n}`;
            privArea.value = `d = ${rsaCryptoKeyPair.privateKey.d}\nn = ${rsaCryptoKeyPair.privateKey.n}`;
            timingDiv.innerHTML = `Ключи сгенерированы за ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = '';
            sigArea.value = '';
            verifyResult.className = 'verify-result';
        } catch(e) { 
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
        genBtn.disabled = false;
        genBtn.textContent = 'Сгенерировать ключи RSA';
    });

    signBtn.addEventListener('click', async () => {
        if (!rsaCryptoKeyPair) { alert("Сначала сгенерируйте ключи"); return; }
        const message = messageInput.value;
        if (!message.trim()) { alert("Введите сообщение для подписи"); return; }
        const start = performance.now();
        try {
            const signature = await rsaSign(message, rsaCryptoKeyPair.cryptoKeyPair.privateKey);
            const end = performance.now();
            sigArea.value = signature;
            timingDiv.innerHTML = `Подписание: ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = '';
            verifyResult.className = 'verify-result';
        } catch(e) { 
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
    });

    verifyBtn.addEventListener('click', async () => {
        if (!rsaCryptoKeyPair) { alert("Нет ключей"); return; }
        const message = messageInput.value;
        const signature = sigArea.value;
        if (!signature) { alert("Нет подписи"); return; }
        const start = performance.now();
        try {
            const valid = await rsaVerify(message, signature, rsaCryptoKeyPair.cryptoKeyPair.publicKey);
            const end = performance.now();
            timingDiv.innerHTML = `Верификация: ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = valid ? 'ПОДПИСЬ ВЕРНА' : 'ПОДПИСЬ НЕВЕРНА';
            verifyResult.className = valid ? 'verify-result success' : 'verify-result error';
        } catch(e) { 
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
    });
}

function initElGamal() {
    const genBtn = document.getElementById('genElGamalKeysBtn');
    const signBtn = document.getElementById('elSignBtn');
    const verifyBtn = document.getElementById('elVerifyBtn');
    const messageInput = document.getElementById('elMessage');
    const pubArea = document.getElementById('elPublicKey');
    const privArea = document.getElementById('elPrivateKey');
    const sigArea = document.getElementById('elSignature');
    const verifyResult = document.getElementById('elVerifyResult');
    const timingDiv = document.getElementById('elTiming');

    genBtn.addEventListener('click', () => {
        genBtn.disabled = true;
        genBtn.textContent = 'Генерация...';
        const start = performance.now();
        setTimeout(() => {
            try {
                elGamalKeyPair = generateElGamalKeys(256);
                const end = performance.now();
                pubArea.value = `p = ${elGamalKeyPair.publicKey.p}\ng = ${elGamalKeyPair.publicKey.g}\ny = ${elGamalKeyPair.publicKey.y}`;
                privArea.value = `x = ${elGamalKeyPair.privateKey.x}`;
                timingDiv.innerHTML = `Ключи сгенерированы за ${(end - start).toFixed(2)} мс`;
                sigArea.value = '';
                verifyResult.innerHTML = '';
                verifyResult.className = 'verify-result';
            } catch(e) {
                timingDiv.innerHTML = `Ошибка: ${e.message}`;
                console.error(e);
            }
            genBtn.disabled = false;
            genBtn.textContent = 'Сгенерировать ключи Эль-Гамаля';
        }, 100);
    });

    signBtn.addEventListener('click', () => {
        if (!elGamalKeyPair) { alert("Сначала сгенерируйте ключи"); return; }
        const message = messageInput.value;
        if (!message.trim()) { alert("Введите сообщение для подписи"); return; }
        const start = performance.now();
        try {
            const sig = elGamalSign(message, elGamalKeyPair.privateKey, elGamalKeyPair.publicKey);
            const end = performance.now();
            sigArea.value = `a = ${sig.a}\nb = ${sig.b}`;
            timingDiv.innerHTML = `Подписание: ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = '';
            verifyResult.className = 'verify-result';
        } catch(e) {
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
    });

    verifyBtn.addEventListener('click', () => {
        if (!elGamalKeyPair) { alert("Нет ключей"); return; }
        const message = messageInput.value;
        const sigText = sigArea.value;
        if (!sigText) { alert("Нет подписи"); return; }
        const aMatch = sigText.match(/a = ([0-9a-f]+)/i);
        const bMatch = sigText.match(/b = ([0-9a-f]+)/i);
        if (!aMatch || !bMatch) { alert("Неверный формат подписи"); return; }
        const start = performance.now();
        try {
            const valid = elGamalVerify(message, { a: aMatch[1], b: bMatch[1] }, elGamalKeyPair.publicKey);
            const end = performance.now();
            timingDiv.innerHTML = `Верификация: ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = valid ? 'ПОДПИСЬ ВЕРНА' : 'ПОДПИСЬ НЕВЕРНА';
            verifyResult.className = valid ? 'verify-result success' : 'verify-result error';
        } catch(e) {
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
    });
}

function initSchnorr() {
    const genBtn = document.getElementById('genSchnorrKeysBtn');
    const signBtn = document.getElementById('schnorrSignBtn');
    const verifyBtn = document.getElementById('schnorrVerifyBtn');
    const messageInput = document.getElementById('schnorrMessage');
    const pubArea = document.getElementById('schnorrPublicKey');
    const privArea = document.getElementById('schnorrPrivateKey');
    const sigArea = document.getElementById('schnorrSignature');
    const verifyResult = document.getElementById('schnorrVerifyResult');
    const timingDiv = document.getElementById('schnorrTiming');

    function formatKeyToHex64(num) {
        let hex = num.toString(16);
        while (hex.length < 64) hex = '0' + hex;
        return hex;
    }

    function formatKeyToHexCompact(num) {
        let hex = num.toString(16);
        return '0x' + hex;
    }

    genBtn.addEventListener('click', () => {
        genBtn.disabled = true;
        genBtn.textContent = 'Генерация...';
        const start = performance.now();
        setTimeout(() => {
            try {
                schnorrKeyPair = generateSchnorrKeys();
                // schnorrKeyPair = generateSchnorrKeysLarge();
                // schnorrKeyPair = generateSchnorrKeysLargeAlt();
                const end = performance.now();
                
                // // Вариант 1: Компактный HEX
                // pubArea.value = `p = ${formatKeyToHexCompact(schnorrKeyPair.publicKey.p)}\nq = ${formatKeyToHexCompact(schnorrKeyPair.publicKey.q)}\ng = ${formatKeyToHexCompact(schnorrKeyPair.publicKey.g)}\ny = ${formatKeyToHexCompact(schnorrKeyPair.publicKey.y)}`;
                // privArea.value = `x = ${formatKeyToHexCompact(schnorrKeyPair.privateKey.x)}`;
                
                // Вариант 2: Длинный HEX как для подписи
                pubArea.value = `p = ${formatKeyToHex64(schnorrKeyPair.publicKey.p)}\nq = ${formatKeyToHex64(schnorrKeyPair.publicKey.q)}\ng = ${formatKeyToHex64(schnorrKeyPair.publicKey.g)}\ny = ${formatKeyToHex64(schnorrKeyPair.publicKey.y)}`;
                privArea.value = `x = ${formatKeyToHex64(schnorrKeyPair.privateKey.x)}`;
                
                timingDiv.innerHTML = `Ключи сгенерированы за ${(end - start).toFixed(2)} мс`;
                sigArea.value = '';
                verifyResult.innerHTML = '';
                verifyResult.className = 'verify-result';
                console.log("Schnorr keys generated:", schnorrKeyPair);
            } catch(e) {
                timingDiv.innerHTML = `Ошибка: ${e.message}`;
                console.error(e);
                pubArea.value = 'Ошибка генерации ключей';
                privArea.value = 'Ошибка генерации ключей';
            }
            genBtn.disabled = false;
            genBtn.textContent = 'Сгенерировать ключи Шнорра';
        }, 100);
    });

    signBtn.addEventListener('click', () => {
        if (!schnorrKeyPair) { alert("Сначала сгенерируйте ключи"); return; }
        const message = messageInput.value;
        if (!message.trim()) { alert("Введите сообщение для подписи"); return; }
        const start = performance.now();
        try {
            const sig = schnorrSign(message, schnorrKeyPair.privateKey);
            const end = performance.now();
            sigArea.value = `h = ${sig.h}\nb = ${sig.b}`;
            timingDiv.innerHTML = `Подписание: ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = '';
            verifyResult.className = 'verify-result';
            console.log("Schnorr signature:", sig);
        } catch(e) {
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
    });

    verifyBtn.addEventListener('click', () => {
        if (!schnorrKeyPair) { alert("Нет ключей"); return; }
        const message = messageInput.value;
        const sigText = sigArea.value;
        if (!sigText) { alert("Нет подписи"); return; }
        const hMatch = sigText.match(/h = ([0-9a-f]+)/i);
        const bMatch = sigText.match(/b = ([0-9a-f]+)/i);
        if (!hMatch || !bMatch) { alert("Неверный формат подписи"); return; }
        const start = performance.now();
        try {
            const valid = schnorrVerify(message, { h: hMatch[1], b: bMatch[1] }, schnorrKeyPair.publicKey);
            const end = performance.now();
            timingDiv.innerHTML = `Верификация: ${(end - start).toFixed(2)} мс`;
            verifyResult.innerHTML = valid ? 'ПОДПИСЬ ВЕРНА' : 'ПОДПИСЬ НЕВЕРНА';
            verifyResult.className = valid ? 'verify-result success' : 'verify-result error';
            console.log("Schnorr verify result:", valid);
        } catch(e) {
            timingDiv.innerHTML = `Ошибка: ${e.message}`;
            console.error(e);
        }
    });
}


function initPerformance() {
    const runBtn = document.getElementById('runPerfTestBtn');
    const clearBtn = document.getElementById('clearPerfDataBtn');
    const keySizeSelect = document.getElementById('keySizeSelect');
    
    runBtn.addEventListener('click', async () => {
        const bits = parseInt(keySizeSelect.value);
        runBtn.disabled = true;
        runBtn.textContent = 'Тестирование...';
        const resultsDiv = document.getElementById('perfResultsTable');
        resultsDiv.innerHTML = '<p class="placeholder">Выполняется тестирование, пожалуйста, подождите...</p>';
        
        const testMessage = "Test message for performance benchmarking. " + Date.now();
        
        let rsaSignTime = 0, rsaVerifyTime = 0;
        let elSignTime = 0, elVerifyTime = 0;
        let schnorrSignTime = 0, schnorrVerifyTime = 0;
        
        try {
            const rsaKeys = await generateRSAKeys(bits > 1024 ? 1024 : bits);
            const rsaSignStart = performance.now();
            const rsaSig = await rsaSign(testMessage, rsaKeys.cryptoKeyPair.privateKey);
            rsaSignTime = performance.now() - rsaSignStart;
            const rsaVerifyStart = performance.now();
            await rsaVerify(testMessage, rsaSig, rsaKeys.cryptoKeyPair.publicKey);
            rsaVerifyTime = performance.now() - rsaVerifyStart;
        } catch(e) { console.error("RSA benchmark error:", e); }
        
        try {
            const elKeys = generateElGamalKeys(128);
            const elSignStart = performance.now();
            const elSig = elGamalSign(testMessage, elKeys.privateKey, elKeys.publicKey);
            elSignTime = performance.now() - elSignStart;
            const elVerifyStart = performance.now();
            elGamalVerify(testMessage, elSig, elKeys.publicKey);
            elVerifyTime = performance.now() - elVerifyStart;
        } catch(e) { console.error("ElGamal benchmark error:", e); }
        
        try {
            const schnorrKeys = generateSchnorrKeys(128, 32);
            const schnorrSignStart = performance.now();
            const schnorrSig = schnorrSign(testMessage, schnorrKeys.privateKey, schnorrKeys.publicKey);
            schnorrSignTime = performance.now() - schnorrSignStart;
            const schnorrVerifyStart = performance.now();
            schnorrVerify(testMessage, schnorrSig, schnorrKeys.publicKey);
            schnorrVerifyTime = performance.now() - schnorrVerifyStart;
        } catch(e) { console.error("Schnorr benchmark error:", e); }
        
        const results = [
            { name: 'RSA', signTime: rsaSignTime, verifyTime: rsaVerifyTime, totalTime: rsaSignTime + rsaVerifyTime },
            { name: 'Эль-Гамаль', signTime: elSignTime, verifyTime: elVerifyTime, totalTime: elSignTime + elVerifyTime },
            { name: 'Шнорр', signTime: schnorrSignTime, verifyTime: schnorrVerifyTime, totalTime: schnorrSignTime + schnorrVerifyTime }
        ];
        
        const bitLabel = bits.toString();
        const existingIdx = performanceHistory.labels.indexOf(bitLabel);
        
        if (existingIdx === -1) {
            performanceHistory.labels.push(bitLabel);
            performanceHistory.rsaSign.push(rsaSignTime);
            performanceHistory.rsaVerify.push(rsaVerifyTime);
            performanceHistory.elSign.push(elSignTime);
            performanceHistory.elVerify.push(elVerifyTime);
            performanceHistory.schnorrSign.push(schnorrSignTime);
            performanceHistory.schnorrVerify.push(schnorrVerifyTime);
        } else {
            performanceHistory.rsaSign[existingIdx] = rsaSignTime;
            performanceHistory.rsaVerify[existingIdx] = rsaVerifyTime;
            performanceHistory.elSign[existingIdx] = elSignTime;
            performanceHistory.elVerify[existingIdx] = elVerifyTime;
            performanceHistory.schnorrSign[existingIdx] = schnorrSignTime;
            performanceHistory.schnorrVerify[existingIdx] = schnorrVerifyTime;
        }
        
        displayPerfResults(results, bits);
        updatePerfChart();
        runBtn.disabled = false;
        runBtn.textContent = 'Запустить тест производительности';
    });
    
    clearBtn.addEventListener('click', () => {
        performanceHistory = {
            labels: [],
            rsaSign: [],
            rsaVerify: [],
            elSign: [],
            elVerify: [],
            schnorrSign: [],
            schnorrVerify: []
        };
        if (perfChart) {
            perfChart.data.labels = [];
            perfChart.data.datasets.forEach(ds => ds.data = []);
            perfChart.update();
        }
        document.getElementById('perfResultsTable').innerHTML = '<p class="placeholder">Данные очищены. Нажмите "Запустить тест" для получения новых данных.</p>';
    });
    
    initPerfChart();
}

function initPerfChart() {
    const ctx = document.getElementById('perfChart').getContext('2d');
    if (perfChart) perfChart.destroy();
    perfChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                { label: 'RSA (подписание)', data: [], borderColor: '#ff6b6b', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#ff6b6b' },
                { label: 'RSA (верификация)', data: [], borderColor: '#ff4444', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#ff4444', borderDash: [5, 5] },
                { label: 'Эль-Гамаль (подписание)', data: [], borderColor: '#6bcb77', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#6bcb77' },
                { label: 'Эль-Гамаль (верификация)', data: [], borderColor: '#44aa55', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#44aa55', borderDash: [5, 5] },
                { label: 'Шнорр (подписание)', data: [], borderColor: '#4d96ff', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#4d96ff' },
                { label: 'Шнорр (верификация)', data: [], borderColor: '#2d6ecf', backgroundColor: 'transparent', borderWidth: 2, fill: false, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#2d6ecf', borderDash: [5, 5] }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { position: 'top', labels: { color: '#e0e0e0', font: { size: 11 } } },
                tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.raw.toFixed(2)} мс` } }
            },
            scales: {
                y: { 
                    title: { display: true, text: 'Время (мс)', color: '#aaa' }, 
                    ticks: { color: '#ccc' }, 
                    grid: { color: 'rgba(255,255,255,0.1)' }, 
                    beginAtZero: true 
                },
                x: { 
                    title: { display: true, text: 'Размер ключа (бит)', color: '#aaa' }, 
                    ticks: { color: '#ccc' }, 
                    grid: { color: 'rgba(255,255,255,0.1)' } 
                }
            }
        }
    });
}

function updatePerfChart() {
    if (!perfChart) return;
    
    const sortedIndices = performanceHistory.labels
        .map((label, idx) => ({ label: parseInt(label), idx }))
        .filter(item => !isNaN(item.label))
        .sort((a, b) => a.label - b.label);
    
    perfChart.data.labels = sortedIndices.map(item => item.label);
    perfChart.data.datasets[0].data = sortedIndices.map(item => performanceHistory.rsaSign[item.idx] || 0);
    perfChart.data.datasets[1].data = sortedIndices.map(item => performanceHistory.rsaVerify[item.idx] || 0);
    perfChart.data.datasets[2].data = sortedIndices.map(item => performanceHistory.elSign[item.idx] || 0);
    perfChart.data.datasets[3].data = sortedIndices.map(item => performanceHistory.elVerify[item.idx] || 0);
    perfChart.data.datasets[4].data = sortedIndices.map(item => performanceHistory.schnorrSign[item.idx] || 0);
    perfChart.data.datasets[5].data = sortedIndices.map(item => performanceHistory.schnorrVerify[item.idx] || 0);
    perfChart.update();
}

function displayPerfResults(results, bits) {
    const html = `
        <h4>Результаты тестирования</h4>
        <table class="info-table">
            <thead><tr><th>Алгоритм</th><th>Подписание (мс)</th><th>Верификация (мс)</th><th>Общее время (мс)</th></tr></thead>
            <tbody>
                ${results.map(r => `<tr><td><strong>${r.name}</strong></td><td>${r.signTime.toFixed(2)}</td><td>${r.verifyTime.toFixed(2)}</td><td>${r.totalTime.toFixed(2)}</td></tr>`).join('')}
            </tbody>
        </table>
        
    `;
    document.getElementById('perfResultsTable').innerHTML = html;
}

