// // Параметры LCG (вариант 5 из табл. 6.7)
// const A = 421;
// const C = 1663;
// const N = 7875;

// let currentSequence = [];

// function lcgNext(x) {
//     return (A * x + C) % N;
// }

// function generateSequence() {
//     const count = parseInt(document.getElementById('count').value);
//     const seed = parseInt(document.getElementById('seed').value);
    
//     if (isNaN(seed) || seed < 0 || seed >= N) {
//         alert(`Начальное значение должно быть в диапазоне [0, ${N-1}]`);
//         return;
//     }
    
//     const startTime = performance.now();
    
//     let sequence = [];
//     let current = seed;
    
//     for (let i = 0; i < count; i++) {
//         sequence.push(current);
//         current = lcgNext(current);
//     }
    
//     const endTime = performance.now();
//     const elapsed = (endTime - startTime).toFixed(2);
    
//     currentSequence = sequence;
    
//     // Отображение последовательности
//     const sequenceDiv = document.getElementById('sequence');
//     sequenceDiv.innerHTML = sequence.join(', ');
    
//     // Обновление статистики
//     document.getElementById('totalCount').innerText = sequence.length;
//     document.getElementById('time').innerText = `${elapsed} мс`;
    
//     // Вычисление среднего значения
//     const sum = sequence.reduce((a, b) => a + b, 0);
//     const avg = (sum / sequence.length).toFixed(2);
//     document.getElementById('average').innerText = avg;
    
//     // Поиск периода
//     const period = findPeriod(seed);
//     document.getElementById('period').innerText = period;
    
//     // Анализ частоты
//     analyzeFrequency(sequence);
    
//     return sequence;
// }

// function findPeriod(seed) {
//     let seen = new Map();
//     let current = seed;
//     let step = 0;
    
//     while (!seen.has(current)) {
//         seen.set(current, step);
//         current = lcgNext(current);
//         step++;
//         if (step > N * 2) break;
//     }
    
//     if (seen.has(current)) {
//         return step - seen.get(current);
//     }
//     return 'Не найден';
// }

// function analyzeFrequency(sequence) {
//     // Группировка по диапазонам
//     const ranges = [0, 1000, 2000, 3000, 4000, 5000, 6000, 7000, N];
//     const frequencies = new Array(ranges.length - 1).fill(0);
    
//     sequence.forEach(value => {
//         for (let i = 0; i < ranges.length - 1; i++) {
//             if (value >= ranges[i] && value < ranges[i+1]) {
//                 frequencies[i]++;
//                 break;
//             }
//         }
//     });
    
//     // Создание таблицы частот
//     let tableHtml = '<table><th>Диапазон</th><th>Частота</th><th>Процент</th></tr>';
//     for (let i = 0; i < frequencies.length; i++) {
//         const percent = (frequencies[i] / sequence.length * 100).toFixed(2);
//         tableHtml += `<tr>
//             <td>${ranges[i]} - ${ranges[i+1]}</td>
//             <td>${frequencies[i]}</td>
//             <td>${percent}%</td>
//         </tr>`;
//     }
//     tableHtml += '</table>';
//     document.getElementById('frequencyTable').innerHTML = tableHtml;
    
//     // Создание гистограммы
//     const maxFreq = Math.max(...frequencies);
//     const chartDiv = document.getElementById('chart');
//     chartDiv.innerHTML = '';
    
//     frequencies.forEach(freq => {
//         const height = maxFreq > 0 ? (freq / maxFreq * 150) : 0;
//         const bar = document.createElement('div');
//         bar.className = 'bar';
//         bar.style.height = `${height}px`;
//         bar.textContent = freq;
//         chartDiv.appendChild(bar);
//     });
// }

// function clearSequence() {
//     currentSequence = [];
//     document.getElementById('sequence').innerHTML = '—';
//     document.getElementById('totalCount').innerText = '0';
//     document.getElementById('period').innerText = '-';
//     document.getElementById('average').innerText = '-';
//     document.getElementById('time').innerText = '-';
//     document.getElementById('frequencyTable').innerHTML = '';
//     document.getElementById('chart').innerHTML = '';
// }

// function generateRandomSeed() {
//     const randomSeed = Math.floor(Math.random() * N);
//     document.getElementById('seed').value = randomSeed;
//     generateSequence();
// }

// function generateAndAnalyze() {
//     generateSequence();
// }

// // Автоматическая генерация при загрузке
// window.onload = () => {
//     generateSequence();
// };

// Параметры LCG (вариант 5 из табл. 6.7)
const A = 421;
const C = 1663;
const N = 7875;

let performanceChart = null;
let currentSequence = [];

function lcgNext(x) {
    return (A * x + C) % N;
}

function generateSequence() {
    const count = parseInt(document.getElementById('count').value);
    const seed = parseInt(document.getElementById('seed').value);
    
    if (isNaN(seed) || seed < 0 || seed >= N) {
        alert(`Начальное значение должно быть в диапазоне [0, ${N-1}]`);
        return;
    }
    
    const startTime = performance.now();
    
    let sequence = [];
    let current = seed;
    
    for (let i = 0; i < count; i++) {
        sequence.push(current);
        current = lcgNext(current);
    }
    
    const endTime = performance.now();
    const elapsed = (endTime - startTime).toFixed(2);
    
    currentSequence = sequence;
    
    // Отображение последовательности
    const sequenceDiv = document.getElementById('sequence');
    if (sequenceDiv) {
        sequenceDiv.innerHTML = sequence.join(', ');
    }
    
    // Обновление статистики
    const totalCountEl = document.getElementById('totalCount');
    const timeEl = document.getElementById('time');
    const averageEl = document.getElementById('average');
    const periodEl = document.getElementById('period');
    
    if (totalCountEl) totalCountEl.innerText = sequence.length;
    if (timeEl) timeEl.innerText = `${elapsed} мс`;
    
    // Вычисление среднего значения
    const sum = sequence.reduce((a, b) => a + b, 0);
    const avg = (sum / sequence.length).toFixed(2);
    if (averageEl) averageEl.innerText = avg;
    
    // Поиск периода
    const period = findPeriod(seed);
    if (periodEl) periodEl.innerText = period;
    
    return sequence;
}

function findPeriod(seed) {
    let seen = new Map();
    let current = seed;
    let step = 0;
    
    while (!seen.has(current)) {
        seen.set(current, step);
        current = lcgNext(current);
        step++;
        if (step > N * 2) break;
    }
    
    if (seen.has(current)) {
        return step - seen.get(current);
    }
    return 'Не найден';
}

function clearSequence() {
    currentSequence = [];
    const sequenceDiv = document.getElementById('sequence');
    const totalCountEl = document.getElementById('totalCount');
    const periodEl = document.getElementById('period');
    const averageEl = document.getElementById('average');
    const timeEl = document.getElementById('time');
    
    if (sequenceDiv) sequenceDiv.innerHTML = '—';
    if (totalCountEl) totalCountEl.innerText = '0';
    if (periodEl) periodEl.innerText = '-';
    if (averageEl) averageEl.innerText = '-';
    if (timeEl) timeEl.innerText = '-';
}

function generateRandomSeed() {
    const randomSeed = Math.floor(Math.random() * N);
    const seedInput = document.getElementById('seed');
    if (seedInput) {
        seedInput.value = randomSeed;
    }
    generateSequence();
}

function generateAndAnalyze() {
    generateSequence();
}






function runPerformanceTest() {
    // Увеличьте максимальное количество чисел
    const maxCount = parseInt(document.getElementById('maxCount').value);
    
    // Добавьте ИТЕРАЦИИ (повторяем операцию много раз для точности)
    const ITERATIONS = 100;  // ← ДОБАВЬТЕ ЭТУ КОНСТАНТУ
    
    const sizes = [];
    const times = [];
    
    const resultsDiv = document.getElementById('performanceStats');
    resultsDiv.innerHTML = '<div style="text-align:center">⏳ Выполняется тестирование...</div>';
    
    let currentSize = 1000;  // ← начните с 1000, а не с step
    const maxSize = maxCount;
    const step = Math.floor(maxSize / 15);
    
    function runNext() {
        if (currentSize > maxSize) {
            drawPerformanceChart(sizes, times);
            return;
        }
        
        sizes.push(currentSize);
        
        // ИЗМЕРЕНИЕ С ПОВТОРЕНИЯМИ
        const startTime = performance.now();
        for (let iter = 0; iter < ITERATIONS; iter++) {  // ← ПОВТОРЯЕМ
            let current = parseInt(document.getElementById('seed').value);
            for (let i = 0; i < currentSize; i++) {
                current = lcgNext(current);
            }
        }
        const endTime = performance.now();
        const avgTime = (endTime - startTime) / ITERATIONS;  // ← СРЕДНЕЕ ВРЕМЯ
        
        times.push(avgTime);
        
        resultsDiv.innerHTML = `<div style="text-align:center">⏳ Тестирование: ${currentSize} / ${maxSize} чисел...</div>`;
        currentSize += step;
        setTimeout(runNext, 10);
    }
    
    runNext();
}
function drawPerformanceChart(sizes, times) {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    performanceChart = new Chart(ctx, {
        type: 'line',  // ← ЭТО ЛИНЕЙНЫЙ ГРАФИК (точки соединены линиями)
        data: {
            labels: sizes,  // X: количество чисел
            datasets: [{
                label: 'Время генерации (мс)',
                data: times,  // Y: время
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: '#764ba2',
                fill: true,
                tension: 0,  // ← 0 = прямые линии между точками (без изгибов)
                showLine: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Зависимость времени генерации от количества чисел',
                    font: { size: 16, weight: 'bold' }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Время: ${context.raw.toFixed(3)} мс | Размер: ${context.label} чисел`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Количество чисел (n)',
                        font: { weight: 'bold', size: 14 }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Время выполнения (мс)',
                        font: { weight: 'bold', size: 14 }
                    },
                    beginAtZero: true
                }
            }
        }
    });
}