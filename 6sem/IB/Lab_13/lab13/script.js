console.log("Lab 13: LSB Steganography - FIXED VERSION");

let coverImageData = null;
let stegoImageData = null;
let lastEmbedParams = null;
let perfChart = null;
let performanceData = {
    labels: [],
    embedTimes: [],
    extractTimes: []
};

document.addEventListener('DOMContentLoaded', () => {
    initTabs();
    initEmbedTab();
    initExtractTab();
    initAnalysisTab();
    initPerformanceTab();
    setupDefaultMessages();
    initPerfChart();
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

function setupDefaultMessages() {
    const personalMsg = "Рублевская Маргарита Владимировна";
    const reportMsg = "Лабораторная работа №13: Исследование стеганографического метода на основе преобразования наименее значащих битов (LSB).";

    const msgTextarea = document.getElementById('secretMessage');
    const personalRadio = document.querySelector('input[value="personal"]');
    const reportRadio = document.querySelector('input[value="report"]');
    const customRadio = document.querySelector('input[value="custom"]');

    function applyMessageByType() {
        if (personalRadio.checked) {
            msgTextarea.value = personalMsg;
        } else if (reportRadio.checked) {
            msgTextarea.value = reportMsg;
        } else {
            msgTextarea.value = '';
        }
        updateMessageStats();
    }

    personalRadio.addEventListener('change', applyMessageByType);
    reportRadio.addEventListener('change', applyMessageByType);
    customRadio.addEventListener('change', applyMessageByType);

    msgTextarea.addEventListener('input', () => {
        if (!customRadio.checked && msgTextarea.value !== personalMsg && msgTextarea.value !== reportMsg) {
            customRadio.checked = true;
        }
        updateMessageStats();
    });

    // При загрузке страницы — текст по выбранной радиокнопке (по умолчанию ФИО)
    applyMessageByType();
}

function updateMessageStats() {
    const msg = document.getElementById('secretMessage').value;
    const encoder = new TextEncoder();
    const bytes = encoder.encode(msg);
    const bits = bytes.length * 8;
    document.getElementById('msgLength').textContent = msg.length;
    document.getElementById('msgBits').textContent = bits;
}

function initEmbedTab() {
    const coverInput = document.getElementById('coverImageInput');
    const embedBtn = document.getElementById('embedBtn');
    const saveBtn = document.getElementById('saveStegoBtn');
    const methodSelect = document.getElementById('embeddingMethod');
    const keyDiv = document.getElementById('randomKeyInput');

    methodSelect.addEventListener('change', () => {
        keyDiv.style.display = methodSelect.value === 'random' ? 'block' : 'none';
    });

    coverInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await loadImageToCanvas(file, 'coverCanvas');
            analyzeCoverCapacity();
        }
    });

    embedBtn.addEventListener('click', async () => {
        if (!coverImageData) {
            alert('Сначала загрузите изображение-контейнер');
            return;
        }

        const message = document.getElementById('secretMessage').value;
        if (!message.trim()) {
            alert('Введите сообщение для встраивания');
            return;
        }

        const method = methodSelect.value;
        const key = parseInt(document.getElementById('randomKey').value);
        const bitPlane = parseInt(document.getElementById('bitPlane').value);

        const startTime = performance.now();

        try {
            const result = await embedMessage(coverImageData, message, method, key, bitPlane);
            const endTime = performance.now();

            stegoImageData = result.imageData;
            
            lastEmbedParams = {
                method: method,
                key: key,
                bitPlane: bitPlane,
                message: message,
                messageBytes: result.messageBytes,
                bitsEmbedded: result.bitsEmbedded
            };

            document.getElementById('embedTiming').innerHTML = `
                Время встраивания: ${(endTime - startTime).toFixed(2)} мс<br>
                Встроено байт: ${result.messageBytes.length}<br>
                Встроено битов: ${result.bitsEmbedded}<br>
                <span style="color: #00d4ff;">Параметры: метод=${method}, ключ=${key}, бит=${bitPlane}</span>
            `;
            document.getElementById('embedResult').innerHTML = `
                <span style="color: #28a745;">Успешно встроено!</span><br>
                <span style="font-size: 11px;">Сообщение: "${message}"</span><br>
                <span style="font-size: 11px;">Длина сообщения: ${message.length} символов (${result.messageBytes.length} байт = ${result.bitsEmbedded} бит)</span>
            `;

            saveBtn.disabled = false;
            showPreview(result.imageData, 'coverCanvas');
            
            // Автоматически заполнить параметры извлечения
            document.getElementById('extractMethod').value = method;
            document.getElementById('extractKey').value = key;
            document.getElementById('extractBitPlane').value = bitPlane;
            document.getElementById('extractLength').value = result.messageBytes.length; // В байтах!
            
        } catch (error) {
            document.getElementById('embedTiming').innerHTML = `Ошибка: ${error.message}`;
            document.getElementById('embedResult').innerHTML = `<span style="color: #dc3545;">Ошибка: ${error.message}</span>`;
        }
    });

    saveBtn.addEventListener('click', () => {
        if (stegoImageData) {
            saveAsBMP(stegoImageData, 'stego_image.bmp');
            
            if (lastEmbedParams) {
                alert(`Сохранено изображение со встроенным сообщением!\n\nПараметры для извлечения:\nМетод: ${lastEmbedParams.method}\nКлюч: ${lastEmbedParams.key}\nБитовая плоскость: ${lastEmbedParams.bitPlane}\nДлина сообщения (БАЙТ): ${lastEmbedParams.messageBytes.length}\n\nВАЖНО: Сохранено в BMP формате!`);
            }
        }
    });
}

function initExtractTab() {
    const stegoInput = document.getElementById('stegoImageInput');
    const extractBtn = document.getElementById('extractBtn');
    
    const extractMethodSelect = document.getElementById('extractMethod');
    const extractKeyDiv = document.getElementById('extractKeyInput');
    
    extractMethodSelect.addEventListener('change', () => {
        extractKeyDiv.style.display = extractMethodSelect.value === 'random' ? 'block' : 'none';
    });

    stegoInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            await loadImageToCanvas(file, 'stegoCanvas');
            document.getElementById('stegoImageInfo').textContent = `Загружен: ${file.name}`;
        }
    });

    extractBtn.addEventListener('click', async () => {
        const canvas = document.getElementById('stegoCanvas');
        if (!canvas || !canvas.width || canvas.width === 0) {
            alert('Сначала загрузите стегано-изображение');
            return;
        }

        const method = extractMethodSelect.value;
        const key = parseInt(document.getElementById('extractKey').value);
        const bitPlane = parseInt(document.getElementById('extractBitPlane').value);
        let lengthBytes = parseInt(document.getElementById('extractLength').value);

        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        const startTime = performance.now();

        try {
            const result = await extractMessage(imageData, method, key, bitPlane, lengthBytes);
            const endTime = performance.now();

            document.getElementById('extractTiming').innerHTML = `
                Время извлечения: ${(endTime - startTime).toFixed(2)} мс<br>
                Извлечено байт: ${result.extractedBytes}<br>
                Извлечено битов: ${result.bitsExtracted}<br>
                <span style="color: #00d4ff;">Параметры: метод=${method}, ключ=${key}, бит=${bitPlane}</span>
            `;
            
            if (result.message && result.message.length > 0 && !result.message.includes('\\ufffd')) {
                document.getElementById('extractResult').innerHTML = `
                    <div><strong style="color: #28a745;">Извлечённое сообщение:</strong></div>
                    <div style="margin-top: 8px; padding: 12px; background: #1a2a3a; border-radius: 8px; word-wrap: break-word; max-height: 300px; overflow-y: auto;">${escapeHtml(result.message)}</div>
                    <div style="margin-top: 8px; font-size: 11px; color: #8ba0b8;">Длина сообщения: ${result.message.length} символов</div>
                `;
            } else {
                document.getElementById('extractResult').innerHTML = `
                    <div><strong style="color: #ffaa00;">Извлечение выполнено, но сообщение может быть повреждено:</strong></div>
                    <div style="margin-top: 8px; padding: 12px; background: #1a2a3a; border-radius: 8px; word-wrap: break-word; max-height: 300px; overflow-y: auto; font-family: monospace;">${escapeHtml(result.message.substring(0, 200))}</div>
                `;
            }
        } catch (error) {
            document.getElementById('extractTiming').innerHTML = `Ошибка: ${error.message}`;
            document.getElementById('extractResult').innerHTML = `
                <span style="color: #dc3545;">Ошибка: ${error.message}</span><br>
                <span style="font-size: 12px;">Убедитесь, что параметры совпадают с параметрами встраивания.</span>
            `;
        }
    });
}

function initAnalysisTab() {
    const analysisInput = document.getElementById('analysisImageInput');
    const analyzeBtn = document.getElementById('analyzeBtn');

    analyzeBtn.addEventListener('click', async () => {
        const file = analysisInput.files[0];
        if (!file) {
            alert('Выберите изображение для анализа');
            return;
        }

        await loadImageForAnalysis(file);
    });
}

async function loadImageForAnalysis(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const maxSize = 512;
            let width = img.width;
            let height = img.height;
            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            displayBitPlanes(imageData, file.name);
            analyzeBitDistribution(imageData);
            resolve();
        };
        img.src = URL.createObjectURL(file);
    });
}

function displayBitPlanes(imageData, fileName = '') {
    const container = document.getElementById('bitPlanesContainer');
    container.innerHTML = '';

    const title = document.createElement('h4');
    title.className = 'bitplanes-title';
    title.textContent = 'Битовые плоскости';
    container.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'bitplanes-meta';
    meta.textContent = `${fileName ? fileName + ' · ' : ''}${imageData.width}×${imageData.height} px · белый = 1, чёрный = 0`;
    container.appendChild(meta);

    const grid = document.createElement('div');
    grid.className = 'bitplanes-grid';

    for (let plane = 0; plane < 8; plane++) {
        const planeImageData = extractBitPlane(imageData, plane);
        const canvas = document.createElement('canvas');
        canvas.className = 'bitplane-canvas';
        canvas.width = imageData.width;
        canvas.height = imageData.height;
        canvas.getContext('2d').putImageData(planeImageData, 0, 0);

        const card = document.createElement('div');
        card.className = 'bitplane-card';
        const label = document.createElement('h5');
        label.textContent = `Бит ${plane}${plane === 0 ? ' (LSB)' : plane === 7 ? ' (MSB)' : ''}`;
        const wrap = document.createElement('div');
        wrap.className = 'bitplane-canvas-wrap';
        wrap.appendChild(canvas);
        card.appendChild(label);
        card.appendChild(wrap);
        grid.appendChild(card);
    }

    container.appendChild(grid);
}

function extractBitPlane(imageData, plane) {
    const newImageData = new ImageData(imageData.width, imageData.height);
    const data = imageData.data;
    const newData = newImageData.data;

    for (let i = 0; i < data.length; i += 4) {
        for (let c = 0; c < 3; c++) {
            const bit = (data[i + c] >> plane) & 1;
            const value = bit === 1 ? 255 : 0;
            newData[i + c] = value;
        }
        newData[i + 3] = 255;
    }

    return newImageData;
}

function analyzeBitDistribution(imageData) {
    const data = imageData.data;
    const pixelCount = imageData.width * imageData.height;
    let distribution = [];

    for (let plane = 0; plane < 8; plane++) {
        let ones = 0;
        for (let i = 0; i < data.length; i += 4) {
            for (let c = 0; c < 3; c++) {
                ones += (data[i + c] >> plane) & 1;
            }
        }
        const totalBits = pixelCount * 3;
        distribution.push({
            plane: plane,
            ones: ones,
            percent: (ones / totalBits * 100).toFixed(2)
        });
    }

    const statsHtml = `
        <h4>Статистика битовых плоскостей</h4>
        <table style="width:100%; border-collapse: collapse;">
            <thead><tr style="border-bottom: 1px solid #2a3a4a;">
                <th style="padding: 8px;">Битовая плоскость</th>
                <th style="padding: 8px;">Количество 1</th>
                <th style="padding: 8px;">% единиц</th>
                <th style="padding: 8px; width: 35%;">Отклонение от 50%</th>
            </tr></thead>
            <tbody>
                ${distribution.map(d => {
                    const pct = parseFloat(d.percent);
                    const dev = Math.abs(pct - 50).toFixed(2);
                    const barWidth = Math.min(pct, 100);
                    return `<tr>
                        <td style="padding: 8px;">${d.plane}${d.plane === 0 ? ' (LSB)' : d.plane === 7 ? ' (MSB)' : ''}</td>
                        <td style="padding: 8px;">${d.ones.toLocaleString()}</td>
                        <td style="padding: 8px;">${d.percent}%</td>
                        <td style="padding: 8px;">
                            <div class="stats-bar"><div class="stats-bar-fill" style="width:${barWidth}%"></div></div>
                            <span class="stats-deviation">В±${dev}%</span>
                        </td>
                    </tr>`;
                }).join('')}
            </tbody>
        </table>
        <p style="margin-top: 12px; font-size: 12px; color: #8ba0b8;">
            Для LSB (биты 0–2) после встраивания ~50% — норма. Для старших бит (6–7) отклонение выше: в MSB хранится «силуэт» изображения, не случайный шум.
        </p>
    `;

    const statsDiv = document.getElementById('analysisStats');
    if (statsDiv) statsDiv.innerHTML = statsHtml;
}

async function analyzeCoverCapacity() {
    if (!coverImageData) return;

    const pixelCount = coverImageData.width * coverImageData.height;
    const maxBits = pixelCount * 3;
    const maxBytes = Math.floor(maxBits / 8);

    document.getElementById('coverStats').innerHTML = `
        <div><strong>Характеристики контейнера:</strong></div>
        <div>Размер: ${coverImageData.width} x ${coverImageData.height} = ${pixelCount} пикселей</div>
        <div>Макс. ёмкость: ${maxBits} бит / ${maxBytes} байт</div>
    `;
}

async function loadImageToCanvas(file, canvasId) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.getElementById(canvasId);
            const ctx = canvas.getContext('2d');

            let width = img.width;
            let height = img.height;
            const maxSize = 400;

            if (width > maxSize || height > maxSize) {
                const ratio = Math.min(maxSize / width, maxSize / height);
                width = Math.floor(width * ratio);
                height = Math.floor(height * ratio);
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            if (canvasId === 'coverCanvas') {
                coverImageData = imageData;
                analyzeCoverCapacity();
            }

            const infoDiv = document.getElementById(canvasId === 'coverCanvas' ? 'coverImageInfo' : 'stegoImageInfo');
            if (infoDiv) {
                infoDiv.textContent = `Загружен: ${file.name}, ${width}x${height}`;
            }

            resolve(imageData);
        };
        img.src = URL.createObjectURL(file);
    });
}

function showPreview(imageData, canvasId) {
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
}

async function embedMessage(imageData, message, method, key, bitPlane) {
    const data = new Uint8ClampedArray(imageData.data);
    const width = imageData.width;
    const height = imageData.height;
    const pixels = width * height;
    const maxBits = pixels * 3;

    const encoder = new TextEncoder();
    const msgBytes = encoder.encode(message);
    const totalBits = msgBytes.length * 8 + 32;

    if (totalBits > maxBits) {
        throw new Error(`Сообщение слишком большое. Нужно ${totalBits} бит, доступно ${maxBits} бит`);
    }

    // Для псевдослучайного метода перемешиваем ВСЕ позиции контейнера (как при извлечении),
    // иначе перестановка при встраивании и извлечении не совпадёт.
    let bitPositions = [];
    for (let i = 0; i < maxBits; i++) {
        bitPositions.push(i);
    }

    if (method === 'random') {
        bitPositions = shuffleArray(bitPositions, key);
    }

    const bitStream = [];
    // Пишем длину сообщения в БАЙТАХ (32 бита)
    const lengthBits = msgBytes.length;
    for (let i = 31; i >= 0; i--) {
        bitStream.push((lengthBits >> i) & 1);
    }
    // Пишем сами байты сообщения
    for (let byte of msgBytes) {
        for (let i = 7; i >= 0; i--) {
            bitStream.push((byte >> i) & 1);
        }
    }

    let bitsEmbedded = 0;
    for (let i = 0; i < totalBits; i++) {
        const pos = bitPositions[i];
        const pixelIndex = Math.floor(pos / 3);
        const channel = pos % 3;
        const byteIndex = pixelIndex * 4 + channel;
        const bit = bitStream[i];

        if (bit === 1) {
            data[byteIndex] = data[byteIndex] | (1 << bitPlane);
        } else {
            data[byteIndex] = data[byteIndex] & ~(1 << bitPlane);
        }
        bitsEmbedded++;
    }

    const newImageData = new ImageData(new Uint8ClampedArray(data), width, height);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(newImageData, 0, 0);

    return {
        imageData: newImageData,
        messageBytes: msgBytes,
        bitsEmbedded: bitsEmbedded
    };
}

async function extractMessage(imageData, method, key, bitPlane, knownLengthBytes) {
    const data = imageData.data;
    const pixels = imageData.width * imageData.height;
    const maxBits = pixels * 3;

    let bitPositions = [];
    for (let i = 0; i < maxBits; i++) {
        bitPositions.push(i);
    }

    if (method === 'random') {
        bitPositions = shuffleArray(bitPositions, key);
    }

    let lengthBytes = knownLengthBytes;
    if (!lengthBytes || lengthBytes === 0 || isNaN(lengthBytes)) {
        // Автоопределение длины
        let lengthBitsValue = 0;
        for (let i = 0; i < 32; i++) {
            const pos = bitPositions[i];
            const pixelIndex = Math.floor(pos / 3);
            const channel = pos % 3;
            const byteIndex = pixelIndex * 4 + channel;
            const bit = (data[byteIndex] >> bitPlane) & 1;
            lengthBitsValue = (lengthBitsValue << 1) | bit;
        }
        lengthBytes = lengthBitsValue;
        
        if (lengthBytes <= 0 || lengthBytes > 100000) {
            throw new Error(`Некорректная длина (${lengthBytes} байт). Укажите длину вручную.`);
        }
    }

    const totalBits = 32 + lengthBytes * 8;
    if (totalBits > maxBits) {
        throw new Error(`Длина ${lengthBytes} байт (${totalBits} бит) превышает ёмкость (${maxBits} бит)`);
    }

    const bitStream = [];
    for (let i = 0; i < totalBits; i++) {
        const pos = bitPositions[i];
        const pixelIndex = Math.floor(pos / 3);
        const channel = pos % 3;
        const byteIndex = pixelIndex * 4 + channel;
        const bit = (data[byteIndex] >> bitPlane) & 1;
        bitStream.push(bit);
    }

    const msgBytes = [];
    for (let i = 0; i < lengthBytes; i++) {
        let byte = 0;
        for (let j = 0; j < 8; j++) {
            const bitIndex = 32 + i * 8 + j;
            byte = (byte << 1) | bitStream[bitIndex];
        }
        msgBytes.push(byte);
    }

    const decoder = new TextDecoder('utf-8');
    let message = '';
    try {
        message = decoder.decode(new Uint8Array(msgBytes));
    } catch (e) {
        message = "Ошибка декодирования";
    }

    return {
        message: message,
        extractedBytes: msgBytes.length,
        bitsExtracted: totalBits
    };
}

function shuffleArray(array, seed) {
    const shuffled = [...array];
    let random = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
        random = (random * 1103515245 + 12345) & 0x7fffffff;
        const j = random % (i + 1);
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function saveAsBMP(imageData, filename) {
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    const fileHeaderSize = 14;
    const infoHeaderSize = 40;
    const headerSize = fileHeaderSize + infoHeaderSize;
    
    const rowSize = Math.floor((width * 3 + 3) / 4) * 4;
    const pixelDataSize = rowSize * height;
    const fileSize = headerSize + pixelDataSize;
    
    const buffer = new ArrayBuffer(fileSize);
    const view = new DataView(buffer);
    
    view.setUint8(0, 0x42);
    view.setUint8(1, 0x4D);
    view.setUint32(2, fileSize, true);
    view.setUint32(6, 0, true);
    view.setUint32(10, headerSize, true);
    
    view.setUint32(14, infoHeaderSize, true);
    view.setInt32(18, width, true);
    view.setInt32(22, height, true);
    view.setUint16(26, 1, true);
    view.setUint16(28, 24, true);
    view.setUint32(30, 0, true);
    view.setUint32(34, pixelDataSize, true);
    view.setInt32(38, 2835, true);
    view.setInt32(42, 2835, true);
    view.setUint32(46, 0, true);
    view.setUint32(50, 0, true);
    
    let offset = headerSize;
    for (let y = height - 1; y >= 0; y--) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            view.setUint8(offset, data[idx + 2]);
            view.setUint8(offset + 1, data[idx + 1]);
            view.setUint8(offset + 2, data[idx]);
            offset += 3;
        }
        const padding = rowSize - width * 3;
        offset += padding;
    }
    
    const blob = new Blob([buffer], { type: 'image/bmp' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function initPerformanceTab() {
    const runBtn = document.getElementById('runPerfTest');
    const clearBtn = document.getElementById('clearPerfData');

    runBtn.addEventListener('click', async () => {
        const imageSize = parseInt(document.getElementById('testImageSize').value);
        const msgPercent = parseInt(document.getElementById('testMsgSize').value);

        runBtn.disabled = true;
        runBtn.textContent = 'Тестирование...';

        const embedTimes = [];
        const extractTimes = [];

        const testMessage = generateTestMessage(imageSize, msgPercent);

        for (let i = 0; i < 3; i++) {
            const testImage = await generateTestImage(imageSize);
            const embedStart = performance.now();
            const embedResult = await embedMessage(testImage, testMessage, 'random', 12345, 0);
            const embedEnd = performance.now();
            embedTimes.push(embedEnd - embedStart);

            const extractStart = performance.now();
            await extractMessage(embedResult.imageData, 'random', 12345, 0, 0);
            const extractEnd = performance.now();
            extractTimes.push(extractEnd - extractStart);
        }

        const avgEmbed = embedTimes.reduce((a, b) => a + b, 0) / embedTimes.length;
        const avgExtract = extractTimes.reduce((a, b) => a + b, 0) / extractTimes.length;

        const sizeLabel = `${imageSize}x${imageSize}`;
        const existingIndex = performanceData.labels.indexOf(sizeLabel);

        if (existingIndex === -1) {
            performanceData.labels.push(sizeLabel);
            performanceData.embedTimes.push(avgEmbed);
            performanceData.extractTimes.push(avgExtract);
        } else {
            performanceData.embedTimes[existingIndex] = avgEmbed;
            performanceData.extractTimes[existingIndex] = avgExtract;
        }

        updatePerfChart();
        displayPerfResults(embedTimes, extractTimes, imageSize, msgPercent);
        runBtn.disabled = false;
        runBtn.textContent = 'Запустить тест';
    });

    clearBtn.addEventListener('click', () => {
        performanceData = { labels: [], embedTimes: [], extractTimes: [] };
        updatePerfChart();
        document.getElementById('perfResults').innerHTML = '<p class="placeholder">Данные очищены.</p>';
    });
}

function generateTestMessage(imageSize, percent) {
    const pixels = imageSize * imageSize;
    const maxBits = pixels * 3;
    const targetBytes = Math.floor(maxBits * percent / 100 / 8);
    const baseText = 'LSB steganography test message. ';
    let message = '';
    while (message.length < targetBytes) {
        message += baseText;
    }
    return message.substring(0, targetBytes);
}

async function generateTestImage(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            ctx.fillStyle = `rgb(${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)},${Math.floor(Math.random() * 256)})`;
            ctx.fillRect(i, j, 1, 1);
        }
    }
    return ctx.getImageData(0, 0, size, size);
}

function initPerfChart() {
    const ctx = document.getElementById('perfChart').getContext('2d');
    if (perfChart) perfChart.destroy();
    perfChart = new Chart(ctx, {
        type: 'line',
        data: { labels: [], datasets: [
            { label: 'Время встраивания (мс)', data: [], borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.1)', borderWidth: 3, fill: true, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#28a745' },
            { label: 'Время извлечения (мс)', data: [], borderColor: '#00d4ff', backgroundColor: 'rgba(0,212,255,0.1)', borderWidth: 3, fill: true, tension: 0.1, pointRadius: 5, pointBackgroundColor: '#00d4ff' }
        ] },
        options: {
            responsive: true,
            plugins: { legend: { position: 'top', labels: { color: '#e0e0e0' } } },
            scales: { y: { title: { display: true, text: 'Время (мс)', color: '#aaa' }, ticks: { color: '#ccc' }, beginAtZero: true },
                      x: { title: { display: true, text: 'Размер изображения', color: '#aaa' }, ticks: { color: '#ccc' } } }
        }
    });
}

function updatePerfChart() {
    if (!perfChart) return;
    const sorted = performanceData.labels.map((l, i) => ({ l: parseInt(l.split('x')[0]), i })).sort((a,b) => a.l - b.l);
    perfChart.data.labels = sorted.map(s => performanceData.labels[s.i]);
    perfChart.data.datasets[0].data = sorted.map(s => performanceData.embedTimes[s.i] || 0);
    perfChart.data.datasets[1].data = sorted.map(s => performanceData.extractTimes[s.i] || 0);
    perfChart.update();
}

function displayPerfResults(embedTimes, extractTimes, imageSize, msgPercent) {
    const avgEmbed = embedTimes.reduce((a,b)=>a+b,0)/embedTimes.length;
    const avgExtract = extractTimes.reduce((a,b)=>a+b,0)/extractTimes.length;
    document.getElementById('perfResults').innerHTML = `
        <h4>Результаты тестирования</h4>
        <table style="width:100%"><thead><tr><th>Параметр</th><th>Значение</th></tr></thead>
        <tbody>
            <tr><td>Размер изображения</td><td>${imageSize}x${imageSize}</td></tr>
            <tr><td>Размер сообщения (% от ёмкости)</td><td>${msgPercent}%</td></tr>
            <tr><td><strong>Среднее время встраивания</strong></td><td><strong>${avgEmbed.toFixed(2)} мс</strong></td></tr>
            <tr><td><strong>Среднее время извлечения</strong></td><td><strong>${avgExtract.toFixed(2)} мс</strong></td></tr>
            <tr><td>Тестов (3 прогона)</td><td>${embedTimes.map(t=>t.toFixed(2)).join(', ')} мс</td></tr>
        </tbody></table>`;
}
