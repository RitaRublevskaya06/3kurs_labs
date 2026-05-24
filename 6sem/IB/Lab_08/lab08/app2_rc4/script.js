// ========== КЛАСС RC4 ==========
class RC4 {
    constructor(key) {
        this.key = key;
        this.S = new Array(256);
        this.init();
    }

    init() {
        for (let i = 0; i < 256; i++) {
            this.S[i] = i;
        }

        let j = 0;
        for (let i = 0; i < 256; i++) {
            j = (j + this.S[i] + this.key[i % this.key.length]) % 256;
            [this.S[i], this.S[j]] = [this.S[j], this.S[i]];
        }
    }

    generateKeyStream(length) {
        let keyStream = new Uint8Array(length);
        let i = 0;
        let j = 0;
        let S_copy = [...this.S];
        
        for (let k = 0; k < length; k++) {
            i = (i + 1) % 256;
            j = (j + S_copy[i]) % 256;
            [S_copy[i], S_copy[j]] = [S_copy[j], S_copy[i]];
            const t = (S_copy[i] + S_copy[j]) % 256;
            keyStream[k] = S_copy[t];
        }
        
        return keyStream;
    }

    encrypt(data) {
        const keyStream = this.generateKeyStream(data.length);
        const result = new Uint8Array(data.length);
        
        for (let i = 0; i < data.length; i++) {
            result[i] = data[i] ^ keyStream[i];
        }
        
        return { result, keyStream };
    }
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function stringToBytes(str) {
    const encoder = new TextEncoder();
    return encoder.encode(str);
}

function bytesToString(bytes) {
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

function toBase64(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
}

function fromBase64(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
}

function parseKey(keyString) {
    const numbers = keyString.split(',').map(n => parseInt(n.trim()));
    const keyBytes = new Uint8Array(numbers);
    return keyBytes;
}

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let currentKey = parseKey("13,19,90,92,240");
let currentRC4 = new RC4(currentKey);
let performanceChart = null;

// ========== УПРАВЛЕНИЕ ВКЛАДКАМИ ==========
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabId = tab.getAttribute('data-tab');
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`${tabId}Tab`).classList.add('active');
    });
});

// ========== НАСТРОЙКА КЛЮЧА ==========
function setKey() {
    const keyInput = document.getElementById('keyInput').value;
    try {
        currentKey = parseKey(keyInput);
        currentRC4 = new RC4(currentKey);
        alert('Ключ успешно установлен!');
    } catch (e) {
        alert('Ошибка при установке ключа. Проверьте формат ввода.');
    }
}

function randomKey() {
    const length = Math.floor(Math.random() * 10) + 5;
    const key = [];
    for (let i = 0; i < length; i++) {
        key.push(Math.floor(Math.random() * 256));
    }
    document.getElementById('keyInput').value = key.join(',');
    setKey();
}

// ========== ШИФРОВАНИЕ ==========
function encrypt() {
    const plaintext = document.getElementById('plaintext').value;
    if (!plaintext) {
        alert('Введите текст для шифрования');
        return;
    }

    const startTime = performance.now();
    const bytes = stringToBytes(plaintext);
    const { result } = currentRC4.encrypt(bytes);
    const endTime = performance.now();

    const ciphertext = toBase64(result);
    document.getElementById('ciphertext').innerHTML = ciphertext;
    
    showStats('encrypt', plaintext.length, result.length, endTime - startTime);
}

function showStats(tab, originalLen, resultLen, time) {
    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Размер исходных данных</div>
                <div class="value">${originalLen} байт</div>
            </div>
            <div class="stat-card">
                <div class="label">Размер результата</div>
                <div class="value">${resultLen} байт</div>
            </div>
            <div class="stat-card">
                <div class="label">Время выполнения</div>
                <div class="value">${time.toFixed(2)} мс</div>
            </div>
            <div class="stat-card">
                <div class="label">Скорость</div>
                <div class="value">${(originalLen / time * 1000).toFixed(0)} байт/с</div>
            </div>
        </div>
    `;
    
    const existingStats = document.querySelector(`#${tab}Tab .stats-grid`);
    if (existingStats) existingStats.remove();
    document.querySelector(`#${tab}Tab .result-area`).insertAdjacentHTML('beforeend', statsHtml);
}

// ========== ДЕШИФРОВАНИЕ ==========
function decrypt() {
    const cipherInput = document.getElementById('cipherInput').value;
    if (!cipherInput) {
        alert('Введите зашифрованный текст');
        return;
    }

    try {
        const startTime = performance.now();
        const cipherBytes = fromBase64(cipherInput);
        const { result } = currentRC4.encrypt(cipherBytes);
        const endTime = performance.now();

        const plaintext = bytesToString(result);
        document.getElementById('decryptedText').innerHTML = plaintext;
        
        showStats('decrypt', cipherBytes.length, plaintext.length, endTime - startTime);
    } catch (e) {
        alert('Ошибка при дешифровании. Проверьте формат входных данных.');
    }
}

// ========== ТЕСТ ПРОИЗВОДИТЕЛЬНОСТИ (С ГРАФИКОМ) ==========
function runPerformanceTest() {
    const maxSize = parseInt(document.getElementById('maxSize').value);
    const ITERATIONS = 30;  // Количество повторений для точности
    
    // Размеры для тестирования (равномерно распределены)
    const sizes = [];
    const step = Math.floor(maxSize / 12);
    for (let i = step; i <= maxSize; i += step) {
        sizes.push(i);
    }
    // Убедимся, что maxSize включен
    if (sizes[sizes.length - 1] !== maxSize) {
        sizes.push(maxSize);
    }
    
    const times = [];
    
    const statsDiv = document.getElementById('performanceStats');
    statsDiv.innerHTML = '<div style="text-align:center">⏳ Выполняется тестирование производительности RC4...</div>';
    
    let currentIndex = 0;
    
    function runNext() {
        if (currentIndex >= sizes.length) {
            drawPerformanceChart(sizes, times);
            displayPerformanceStats(sizes, times, ITERATIONS);
            return;
        }
        
        const size = sizes[currentIndex];
        
        // Создаем случайные данные для теста
        const testData = new Uint8Array(size);
        for (let i = 0; i < size; i++) {
            testData[i] = Math.floor(Math.random() * 256);
        }
        
        // Измеряем время с повторениями
        const startTime = performance.now();
        for (let iter = 0; iter < ITERATIONS; iter++) {
            currentRC4.encrypt(testData);
        }
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / ITERATIONS;
        
        times.push(avgTime);
        
        statsDiv.innerHTML = `<div style="text-align:center">⏳ Тестирование: ${(currentIndex + 1)} / ${sizes.length} (${size.toLocaleString()} байт)...</div>`;
        
        currentIndex++;
        setTimeout(runNext, 10);
    }
    
    runNext();
}

// ========== ОТРИСОВКА ГРАФИКА (CHART.JS) ==========
function drawPerformanceChart(sizes, times) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sizes.map(s => s.toLocaleString()),
            datasets: [{
                label: 'Время шифрования (мс)',
                data: times,
                borderColor: '#2a5298',
                backgroundColor: 'rgba(42, 82, 152, 0.1)',
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: '#1e3c72',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7,
                fill: true,
                tension: 0,
                showLine: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Зависимость времени шифрования RC4 от размера данных',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Время: ${context.raw.toFixed(3)} мс | Размер: ${sizes[context.dataIndex].toLocaleString()} байт`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: { font: { size: 12 } }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Размер данных (байт)',
                        font: { weight: 'bold', size: 14 }
                    },
                    ticks: {
                        callback: function(val, index) {
                            return sizes[index]?.toLocaleString() || '';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Время выполнения (мс)',
                        font: { weight: 'bold', size: 14 }
                    },
                    beginAtZero: true,
                    ticks: {
                        callback: function(val) {
                            return val.toFixed(2) + ' мс';
                        }
                    }
                }
            }
        }
    });
}

// ========== СТАТИСТИКА ПРОИЗВОДИТЕЛЬНОСТИ ==========
function displayPerformanceStats(sizes, times, iterations) {
    // Вычисляем среднюю скорость (байт/с)
    const speeds = [];
    for (let i = 0; i < sizes.length; i++) {
        const speed = sizes[i] / (times[i] / 1000);
        speeds.push(speed);
    }
    const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
    const maxSpeed = Math.max(...speeds);
    const minSpeed = Math.min(...speeds);
    
    // Линейная регрессия (аппроксимация)
    const n = sizes.length;
    const sumX = sizes.reduce((a, b) => a + b, 0);
    const sumY = times.reduce((a, b) => a + b, 0);
    const sumXY = sizes.reduce((a, b, i) => a + b * times[i], 0);
    const sumX2 = sizes.reduce((a, b) => a + b * b, 0);
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Вычисляем R²
    const yMean = sumY / n;
    let ssRes = 0;
    let ssTot = 0;
    for (let i = 0; i < n; i++) {
        const yPred = slope * sizes[i] + intercept;
        ssRes += Math.pow(times[i] - yPred, 2);
        ssTot += Math.pow(times[i] - yMean, 2);
    }
    const rSquared = 1 - ssRes / ssTot;
    
    const statsHtml = `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="label">Средняя скорость шифрования</div>
                <div class="value">${(avgSpeed / 1024).toFixed(2)} КБ/с</div>
            </div>
            <div class="stat-card">
                <div class="label">Максимальная скорость</div>
                <div class="value">${(maxSpeed / 1024).toFixed(2)} КБ/с</div>
            </div>
            <div class="stat-card">
                <div class="label">Минимальная скорость</div>
                <div class="value">${(minSpeed / 1024).toFixed(2)} КБ/с</div>
            </div>
            <div class="stat-card">
                <div class="label">Время на 1 КБ</div>
                <div class="value">${(1024 / avgSpeed * 1000).toFixed(3)} мс</div>
            </div>
            <div class="stat-card">
                <div class="label">Линейная аппроксимация</div>
                <div class="value">t = ${slope.toFixed(6)} × n + ${intercept.toFixed(4)}</div>
            </div>
            <div class="stat-card">
                <div class="label">Коэффициент R²</div>
                <div class="value">${rSquared.toFixed(6)}</div>
            </div>
            <div class="stat-card">
                <div class="label">Количество измерений</div>
                <div class="value">${sizes.length}</div>
            </div>
            <div class="stat-card">
                <div class="label">Повторений на точку</div>
                <div class="value">${iterations}</div>
            </div>
        </div>
        <div style="margin-top:20px; padding:15px; background:#e8f4f8; border-radius:10px;">
            <strong>Вывод:</strong> График показывает <strong>линейную зависимость</strong> времени шифрования от размера данных,
            что соответствует теоретической сложности алгоритма RC4 - <strong>O(n)</strong>.
            Коэффициент детерминации R² = ${rSquared.toFixed(6)} (близок к 1, что подтверждает линейность).
        </div>
    `;
    
    document.getElementById('performanceStats').innerHTML = statsHtml;
}

// ========== ЭКСПОРТ ГРАФИКА ==========
function exportChartAsImage() {
    if (!performanceChart) {
        alert('Сначала запустите тест производительности!');
        return;
    }
    
    const canvas = document.getElementById('performanceChart');
    const link = document.createElement('a');
    link.download = 'rc4_performance_chart.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    alert('График сохранен как rc4_performance_chart.png');
}

// ========== ЭКСПОРТ ДАННЫХ В CSV ==========
function exportPerformanceData() {
    if (!performanceChart || !performanceChart.data) {
        alert('Сначала запустите тест производительности!');
        return;
    }
    
    const sizes = performanceChart.data.labels;
    const times = performanceChart.data.datasets[0].data;
    
    let csv = 'Размер (байт),Время (мс),Скорость (КБ/с)\n';
    for (let i = 0; i < sizes.length; i++) {
        const size = parseInt(sizes[i].replace(/,/g, ''));
        const time = times[i];
        const speed = (size / time / 1024 * 1000).toFixed(2);
        csv += `${size},${time.toFixed(3)},${speed}\n`;
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', 'rc4_performance_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Данные экспортированы в CSV файл');
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function loadSampleText() {
    const sample = "Потоковые шифры преобразуют каждый бит открытого текста в соответствующий бит шифротекста с использованием операции XOR. Генератор псевдослучайной последовательности является ключевым элементом таких шифров. RC4, созданный в 1987 году, до сих пор используется в некоторых приложениях благодаря высокой производительности.";
    document.getElementById('plaintext').value = sample;
}

function clearEncrypt() {
    document.getElementById('plaintext').value = '';
    document.getElementById('ciphertext').innerHTML = '—';
    const stats = document.querySelector('#encryptTab .stats-grid');
    if (stats) stats.remove();
}

function clearDecrypt() {
    document.getElementById('cipherInput').value = '';
    document.getElementById('decryptedText').innerHTML = '—';
    const stats = document.querySelector('#decryptTab .stats-grid');
    if (stats) stats.remove();
}

function clearPerformance() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    if (performanceChart) {
        performanceChart.destroy();
        performanceChart = null;
    }
    ctx.clearRect(0, 0, document.getElementById('performanceChart').width, document.getElementById('performanceChart').height);
    document.getElementById('performanceStats').innerHTML = '';
}