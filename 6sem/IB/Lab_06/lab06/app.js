const express = require('express');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ==================== КЛАСС ЭНИГМА ====================
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

// Роторы согласно варианту 11: L = Beta, M = VIII, R = I
const ROTORS = {
    L: 'leyjvcnixwpbqmdrtakzgfuhos',  // Beta
    M: 'fkqhtlxocbjspdzramewniuygv',  // VIII
    R: 'ekmflgdqvzntowyhxuspaibrcj'   // I
};

// const ROTORS = {
//     L: 'vzbrgityupsdnhlxawmjqofeck',  // V
//     M: 'jpgvoumfyqbenhzrdkasxlictw',  // VI
//     R: 'nzjhgrcxmyswboufaivlpekqdt'   // VII
// };

// Рефлектор B Dunn
const REFLECTOR = {
    a: 'e', b: 'n', c: 'k', d: 'q', e: 'a', f: 'u',
    g: 'y', h: 'w', i: 'j', j: 'i', k: 'c', l: 'o',
    m: 'p', n: 'b', o: 'l', p: 'm', q: 'd', r: 'x',
    s: 'z', t: 'v', u: 'f', v: 't', w: 'h', x: 'r',
    y: 'g', z: 's'
};

// const REFLECTOR = {
//     a: 'r', b: 'd', c: 'o', d: 'b', e: 'j', f: 'n',
//     g: 't', h: 'k', i: 'v', j: 'e', k: 'h', l: 'm',
//     m: 'l', n: 'f', o: 'c', p: 'w', q: 'z', r: 'a',
//     s: 'x', t: 'g', u: 'y', v: 'i', w: 'p', x: 's',
//     y: 'u', z: 'q'
// };

const ROTOR_LEN = 26;

class Enigma {
    constructor(lPos, mPos, rPos, lShift, mShift, rShift) {
        this.lPos = lPos;
        this.mPos = mPos;
        this.rPos = rPos;
        this.lShift = lShift;
        this.mShift = mShift;
        this.rShift = rShift;
    }

    directPath(letter, operation) {
        let afterR, afterM, afterL;
        if (operation === 'encrypt') {
            afterR = this.rotorEncrypt(letter, ALPHABET, ROTORS.R, this.rPos);
            afterM = this.rotorEncrypt(afterR, ALPHABET, ROTORS.M, this.mPos);
            afterL = this.rotorEncrypt(afterM, ALPHABET, ROTORS.L, this.lPos);
        } else {
            afterR = this.rotorDecrypt(letter, ALPHABET, ROTORS.R, this.rPos);
            afterM = this.rotorDecrypt(afterR, ALPHABET, ROTORS.M, this.mPos);
            afterL = this.rotorDecrypt(afterM, ALPHABET, ROTORS.L, this.lPos);
        }
        return afterL;
    }

    reversePath(letter, operation) {
        let afterL, afterM, afterR;
        if (operation === 'encrypt') {
            afterL = this.rotorEncrypt(letter, ROTORS.L, ALPHABET, this.lPos);
            afterM = this.rotorEncrypt(afterL, ROTORS.M, ALPHABET, this.mPos);
            afterR = this.rotorEncrypt(afterM, ROTORS.R, ALPHABET, this.rPos);
        } else {
            afterL = this.rotorDecrypt(letter, ROTORS.L, ALPHABET, this.lPos);
            afterM = this.rotorDecrypt(afterL, ROTORS.M, ALPHABET, this.mPos);
            afterR = this.rotorDecrypt(afterM, ROTORS.R, ALPHABET, this.rPos);
        }
        return afterR;
    }

    rotorEncrypt(letter, fromAlphabet, toAlphabet, offset) {
        const idx = fromAlphabet.indexOf(letter);
        const shiftedIdx = (idx + offset) % ROTOR_LEN;
        return toAlphabet[shiftedIdx];
    }

    rotorDecrypt(letter, fromAlphabet, toAlphabet, offset) {
        const idx = fromAlphabet.indexOf(letter);
        const shiftedIdx = (idx - offset + ROTOR_LEN) % ROTOR_LEN;
        return toAlphabet[shiftedIdx];
    }

    passThroughReflector(letter) {
        return REFLECTOR[letter];
    }

    shiftRotors() {
        this.rPos = (this.rPos + this.rShift) % ROTOR_LEN;
        this.mPos = (this.mPos + this.mShift) % ROTOR_LEN;
        this.lPos = (this.lPos + this.lShift) % ROTOR_LEN;
    }

    encrypt(text) {
        let result = '';
        for (let ch of text.toLowerCase()) {
            if (ALPHABET.includes(ch)) {
                const afterDirect = this.directPath(ch, 'encrypt');
                const afterReflector = this.passThroughReflector(afterDirect);
                const encrypted = this.reversePath(afterReflector, 'encrypt');
                result += encrypted;
                this.shiftRotors();
            } else {
                result += ch;
            }
        }
        return result;
    }

    decrypt(text) {
        let result = '';
        for (let ch of text.toLowerCase()) {
            if (ALPHABET.includes(ch)) {
                const afterDirect = this.directPath(ch, 'decrypt');
                const afterReflector = this.passThroughReflector(afterDirect);
                const decrypted = this.reversePath(afterReflector, 'decrypt');
                result += decrypted;
                this.shiftRotors();
            } else {
                result += ch;
            }
        }
        return result;
    }
}

// ==================== МАРШРУТЫ ====================
// Главная страница - отдаём index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API эндпоинты
app.post('/api/encrypt', (req, res) => {
    const { text, lPos, mPos, rPos, lShift, mShift, rShift } = req.body;
    
    const enigma = new Enigma(
        parseInt(lPos) || 0,
        parseInt(mPos) || 0,
        parseInt(rPos) || 0,
        parseInt(lShift) || 3,
        parseInt(mShift) || 1,
        parseInt(rShift) || 3
    );
    
    const result = enigma.encrypt(text);
    res.json({ result });
});

app.post('/api/decrypt', (req, res) => {
    const { text, lPos, mPos, rPos, lShift, mShift, rShift } = req.body;
    
    const enigma = new Enigma(
        parseInt(lPos) || 0,
        parseInt(mPos) || 0,
        parseInt(rPos) || 0,
        parseInt(lShift) || 3,
        parseInt(mShift) || 1,
        parseInt(rShift) || 3
    );
    
    const result = enigma.decrypt(text);
    res.json({ result });
});

// Запуск сервера
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
    console.log('Enigma variant 11: L=Beta, M=VIII, R=I, Refl=B Dunn, shifts=3-1-3');
});