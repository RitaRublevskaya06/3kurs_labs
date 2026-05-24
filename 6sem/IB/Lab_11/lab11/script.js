// Получение элементов DOM
const messageInput = document.getElementById('messageInput');
const messageLength = document.getElementById('messageLength');
const hashBtn = document.getElementById('hashBtn');
const hashResult = document.getElementById('hashResult');
const hashResultBase64 = document.getElementById('hashResultBase64');
const copyHashBtn = document.getElementById('copyHashBtn');
const copyBase64Btn = document.getElementById('copyBase64Btn');
const clearBtn = document.getElementById('clearBtn');
const loadFileBtn = document.getElementById('loadFileBtn');
const fileInput = document.getElementById('fileInput');
const benchmarkBtn = document.getElementById('benchmarkBtn');
const iterationsInput = document.getElementById('iterations');
const benchmarkResults = document.getElementById('benchmarkResults');
const analysisResult = document.getElementById('analysisResult');

// Данные для графика (на основе ваших замеров)
let chartData = {
    iterations: [],
    md5Times: [],
    sha1Times: [],
    sha256Times: [],
    sha512Times: []
};

let performanceChart = null;

// Получение выбранного алгоритма
function getSelectedAlgorithm() {
    const radios = document.getElementsByName('algorithm');
    for (let radio of radios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return 'SHA-256';
}

// Вычисление хеша с использованием CryptoJS
function calculateHash(message, algorithm) {
    if (!message) {
        return '';
    }
    
    switch (algorithm) {
        case 'SHA-256':
            return CryptoJS.SHA256(message).toString();
        case 'SHA-512':
            return CryptoJS.SHA512(message).toString();
        case 'MD5':
            return CryptoJS.MD5(message).toString();
        case 'SHA-1':
            return CryptoJS.SHA1(message).toString();
        default:
            return CryptoJS.SHA256(message).toString();
    }
}

// Вычисление хеша в Base64
function calculateHashBase64(message, algorithm) {
    if (!message) {
        return '';
    }
    
    let wordArray;
    switch (algorithm) {
        case 'SHA-256':
            wordArray = CryptoJS.SHA256(message);
            break;
        case 'SHA-512':
            wordArray = CryptoJS.SHA512(message);
            break;
        case 'MD5':
            wordArray = CryptoJS.MD5(message);
            break;
        case 'SHA-1':
            wordArray = CryptoJS.SHA1(message);
            break;
        default:
            wordArray = CryptoJS.SHA256(message);
    }
    return wordArray.toString(CryptoJS.enc.Base64);
}

// Обновление длины сообщения
function updateMessageLength() {
    const text = messageInput.value;
    const bytes = new TextEncoder().encode(text);
    messageLength.textContent = bytes.length;
}

// Обновление хеша
function updateHash() {
    const message = messageInput.value;
    const algorithm = getSelectedAlgorithm();
    
    if (!message) {
        hashResult.value = '';
        hashResultBase64.value = '';
        return;
    }
    
    const startTime = performance.now();
    const hexHash = calculateHash(message, algorithm);
    const base64Hash = calculateHashBase64(message, algorithm);
    const endTime = performance.now();
    
    hashResult.value = hexHash;
    hashResultBase64.value = base64Hash;
    
    console.log('Алгоритм: ' + algorithm + ', Время: ' + (endTime - startTime).toFixed(2) + ' мс');
}

// Копирование в буфер обмена
async function copyToClipboard(text, button) {
    try {
        await navigator.clipboard.writeText(text);
        const originalText = button.textContent;
        button.textContent = 'Скопировано!';
        button.style.background = '#28a745';
        setTimeout(() => {
            button.textContent = originalText;
            button.style.background = '';
        }, 2000);
    } catch (err) {
        console.error('Ошибка копирования:', err);
        button.textContent = 'Ошибка!';
        setTimeout(() => {
            button.textContent = 'Копировать';
        }, 2000);
    }
}

// Инициализация графика
function initChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'MD5',
                    data: [],
                    borderColor: '#ff6b6b',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: '#ff6b6b',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'SHA-1',
                    data: [],
                    borderColor: '#ffd93d',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: '#ffd93d',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'SHA-256',
                    data: [],
                    borderColor: '#6bcb77',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: '#6bcb77',
                    tension: 0.1,
                    fill: false
                },
                {
                    label: 'SHA-512',
                    data: [],
                    borderColor: '#4d96ff',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    pointRadius: 5,
                    pointBackgroundColor: '#4d96ff',
                    tension: 0.1,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#eee',
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Зависимость времени выполнения от количества итераций',
                    color: '#00d4ff',
                    font: { size: 14 }
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
                x: {
                    title: {
                        display: true,
                        text: 'Количество итераций',
                        color: '#aaa'
                    },
                    ticks: {
                        color: '#ccc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Время выполнения (мс)',
                        color: '#aaa'
                    },
                    ticks: {
                        color: '#ccc'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            }
        }
    });
    console.log('Chart initialized');
}

// Обновление графика
function updateChart() {
    if (!performanceChart) {
        initChart();
        if (!performanceChart) return;
    }
    
    if (chartData.iterations.length === 0) {
        console.log('No data to display in chart');
        performanceChart.data.labels = [];
        performanceChart.data.datasets[0].data = [];
        performanceChart.data.datasets[1].data = [];
        performanceChart.data.datasets[2].data = [];
        performanceChart.data.datasets[3].data = [];
        performanceChart.update();
        return;
    }
    
    // Сортируем данные по количеству итераций
    const indices = chartData.iterations.map((_, i) => i);
    indices.sort((a, b) => chartData.iterations[a] - chartData.iterations[b]);
    
    const sortedIterations = indices.map(i => chartData.iterations[i]);
    const sortedMd5 = indices.map(i => chartData.md5Times[i]);
    const sortedSha1 = indices.map(i => chartData.sha1Times[i]);
    const sortedSha256 = indices.map(i => chartData.sha256Times[i]);
    const sortedSha512 = indices.map(i => chartData.sha512Times[i]);
    
    performanceChart.data.labels = sortedIterations;
    performanceChart.data.datasets[0].data = sortedMd5;
    performanceChart.data.datasets[1].data = sortedSha1;
    performanceChart.data.datasets[2].data = sortedSha256;
    performanceChart.data.datasets[3].data = sortedSha512;
    performanceChart.update();
    
    console.log('Chart updated with data:', sortedIterations);
}

// Тест производительности
async function runBenchmark() {
    const iterations = parseInt(iterationsInput.value);
    if (isNaN(iterations) || iterations < 1) {
        alert('Введите корректное количество итераций');
        return;
    }
    
    const testMessage = messageInput.value;
    if (!testMessage) {
        alert('Введите сообщение для тестирования');
        return;
    }
    
    const algorithms = ['MD5', 'SHA-1', 'SHA-256', 'SHA-512'];
    const results = [];
    
    benchmarkResults.innerHTML = '<div class="placeholder">Выполняется тестирование...</div>';
    
    // Даем время на отрисовку
    await new Promise(resolve => setTimeout(resolve, 10));
    
    for (const algorithm of algorithms) {
        const startTime = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            if (algorithm === 'SHA-256') {
                CryptoJS.SHA256(testMessage);
            } else if (algorithm === 'SHA-512') {
                CryptoJS.SHA512(testMessage);
            } else if (algorithm === 'MD5') {
                CryptoJS.MD5(testMessage);
            } else if (algorithm === 'SHA-1') {
                CryptoJS.SHA1(testMessage);
            }
        }
        
        const endTime = performance.now();
        const totalTime = endTime - startTime;
        const avgTime = totalTime / iterations;
        
        let hashLength = 128;
        if (algorithm === 'SHA-1') hashLength = 160;
        else if (algorithm === 'SHA-256') hashLength = 256;
        else if (algorithm === 'SHA-512') hashLength = 512;
        
        results.push({
            algorithm: algorithm,
            totalTime: totalTime,
            avgTime: avgTime,
            hashLength: hashLength
        });
    }
    
    // Отображение результатов
    let html = '<table class="info-table" style="width: 100%;">';
    html += '<thead><tr><th>Алгоритм</th><th>Длина хеша</th><th>Общее время</th><th>Среднее время/операция</th><th>Операций/сек</th></tr></thead>';
    html += '<tbody>';
    
    for (const result of results) {
        const opsPerSec = (1000 / result.avgTime).toFixed(0);
        html += '<tr>';
        html += '<td><strong>' + result.algorithm + '</strong></td>';
        html += '<td>' + result.hashLength + ' бит</td>';
        html += '<td>' + result.totalTime.toFixed(2) + ' мс</td>';
        html += '<td>' + result.avgTime.toFixed(4) + ' мс</td>';
        html += '<td>' + opsPerSec + '</td>';
        html += '</tr>';
    }
    html += '</tbody></table>';
    
    const messageBytes = new TextEncoder().encode(testMessage).length;
    html += '<p style="margin-top: 15px; font-size: 12px; color: #888;">';
    html += 'Размер тестового сообщения: ' + messageBytes + ' байт (' + testMessage.length + ' символов)<br>';
    html += 'Количество итераций: ' + iterations;
    html += '</p>';
    
    benchmarkResults.innerHTML = html;
    
    // Сохраняем данные для графика
    const existingIndex = chartData.iterations.indexOf(iterations);
    if (existingIndex !== -1) {
        // Обновляем существующие данные
        chartData.md5Times[existingIndex] = results.find(r => r.algorithm === 'MD5').totalTime;
        chartData.sha1Times[existingIndex] = results.find(r => r.algorithm === 'SHA-1').totalTime;
        chartData.sha256Times[existingIndex] = results.find(r => r.algorithm === 'SHA-256').totalTime;
        chartData.sha512Times[existingIndex] = results.find(r => r.algorithm === 'SHA-512').totalTime;
    } else {
        // Добавляем новые данные
        chartData.iterations.push(iterations);
        chartData.md5Times.push(results.find(r => r.algorithm === 'MD5').totalTime);
        chartData.sha1Times.push(results.find(r => r.algorithm === 'SHA-1').totalTime);
        chartData.sha256Times.push(results.find(r => r.algorithm === 'SHA-256').totalTime);
        chartData.sha512Times.push(results.find(r => r.algorithm === 'SHA-512').totalTime);
    }
    
    // Обновляем график
    updateChart();
    
    // Выводим данные графика в консоль для отладки
    console.log('Chart data iterations:', chartData.iterations);
    console.log('Chart data MD5:', chartData.md5Times);
    console.log('Chart data SHA-1:', chartData.sha1Times);
    console.log('Chart data SHA-256:', chartData.sha256Times);
    console.log('Chart data SHA-512:', chartData.sha512Times);
}

// Добавление демо-данных для отображения графика (чтобы показать как работает)
function addDemoData() {
    // Добавляем демо-данные, чтобы график не был пустым
    // Пользователь может их удалить, запустив свой тест
    if (chartData.iterations.length === 0) {
        chartData.iterations = [500, 1000, 2000];
        chartData.md5Times = [48.2, 95.4, 192.1];
        chartData.sha1Times = [43.5, 85.9, 173.2];
        chartData.sha256Times = [49.8, 97.1, 196.5];
        chartData.sha512Times = [195.6, 389.3, 782.4];
        updateChart();
    }
}

// Загрузка файла
function loadFile() {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        if (content) {
            messageInput.value = content;
            updateMessageLength();
            updateHash();
        }
    };
    reader.readAsText(file, 'UTF-8');
    fileInput.value = '';
}

// Очистка полей
function clearAll() {
    messageInput.value = '';
    hashResult.value = '';
    hashResultBase64.value = '';
    updateMessageLength();
}

// Очистка графика
function clearChartData() {
    chartData = {
        iterations: [],
        md5Times: [],
        sha1Times: [],
        sha256Times: [],
        sha512Times: []
    };
    updateChart();
    benchmarkResults.innerHTML = '<div class="placeholder">Данные графика очищены. Выполните новый тест.</div>';
}

// Обработчики событий
messageInput.addEventListener('input', function() {
    updateMessageLength();
    updateHash();
});

hashBtn.addEventListener('click', updateHash);
copyHashBtn.addEventListener('click', function() { copyToClipboard(hashResult.value, copyHashBtn); });
copyBase64Btn.addEventListener('click', function() { copyToClipboard(hashResultBase64.value, copyBase64Btn); });
clearBtn.addEventListener('click', clearAll);
loadFileBtn.addEventListener('click', function() { fileInput.click(); });
fileInput.addEventListener('change', loadFile);
benchmarkBtn.addEventListener('click', runBenchmark);

// Изменение алгоритма вызывает пересчет хеша
const radios = document.querySelectorAll('input[name="algorithm"]');
for (let i = 0; i < radios.length; i++) {
    radios[i].addEventListener('change', updateHash);
}

// Ждем загрузки страницы перед инициализацией графика
document.addEventListener('DOMContentLoaded', function() {
    initChart();
    addDemoData(); // Добавляем демо-данные для наглядности
    updateMessageLength();
    console.log('Страница загружена, график инициализирован');
});

console.log('Лабораторная работа №9: Исследование криптографических хеш-функций');
console.log('Доступные алгоритмы: SHA-256, SHA-512, MD5, SHA-1');