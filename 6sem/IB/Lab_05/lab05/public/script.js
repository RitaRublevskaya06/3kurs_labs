// API URLs
const API = {
    routeEncrypt: '/api/route/encrypt',
    routeDecrypt: '/api/route/decrypt',
    multipleEncrypt: '/api/multiple/encrypt',
    multipleDecrypt: '/api/multiple/decrypt',
    frequencies: '/api/frequencies'
};

// Пример большого текста (500+ символов) на белорусском языке
const largeTextSample = `аб гэтым часе ў лясным гушчары жыў сабе стары бабёр. ён быў вельмі мудры і дасведчаны, бо пражыў на свеце ўжо шмат гадоў. бабры жывуць сем'ямі, разам будуюць плаціны і хаткі. яны вельмі працавітыя і ніколі не сядзяць без справы. вось і цяпер стары бабёр паплыў да сваёй сям'і, якая чакала яго каля новай плаціны. вада была халодная, але бабры не баяцца холаду. у іх вельмі густы поўсць, якая не прапускае ваду. бабёр узяў у зубы вялікую галіну і паплыў да берага. там ужо яго чакалі жонка і маленькія бабраняты. яны радасна сустрэлі старога бабра. асабліва цешыліся бабраняты, бо яны любілі слухаць розныя гісторыі, якія ведаў іх бацька. "дзе ты быў?" - спытала жонка. "я хадзіў да старога дуба, які расце на тым беразе," - адказаў бабёр. "там вельмі шмат добрых галінак, якія нам спатрэбяцца для рамонту плаціны. заўтра я вазьму з сабой нашых сыноў, яны ўжо дарослыя і могуць мне дапамагчы. а ты, дарагая, застанешся дома з маленькімі бабранятамі." жонка згадзілася, бо яна ведала, што муж вельмі мудры і заўсёды робіць правільна. так бабры жылі дружна і шчасліва, дапамагаючы адзін аднаму. яны былі прыкладам для ўсіх жыхароў лесу, як трэба працаваць і клапаціцца пра сваю сям'ю. вось такая гісторыя адбылася ў адным беларускім лесе. калі вы калі-небудзь убачыце бабровую плаціну, успомніце гэтую гісторыю. бабры - сапраўдныя майстры і будаўнікі, якіх трэба паважаць.`;

// Функция проверки объема текста
function checkTextVolume(text, minLength = 500) {
    const length = text.length;
    if (length < minLength) {
        console.warn(`Внимание: текст содержит только ${length} символов. Рекомендуется использовать текст объемом не менее ${minLength} символов.`);
        return false;
    }
    console.log(`Текст содержит ${length} символов - OK`);
    return true;
}

// Инициализация Chart.js
let freqChart = null;

// ============ МАРШРУТНАЯ ПЕРЕСТАНОВКА ============

// Загрузка примера большого текста
document.getElementById('route-load-sample')?.addEventListener('click', () => {
    document.getElementById('route-plaintext').value = largeTextSample;
    checkTextVolume(largeTextSample);
});

// Загрузка из файла
document.getElementById('route-file-input')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            document.getElementById('route-plaintext').value = content;
            checkTextVolume(content);
        };
        reader.readAsText(file, 'UTF-8');
    }
});

document.getElementById('route-encrypt-btn').addEventListener('click', async () => {
    const text = document.getElementById('route-plaintext').value;
    const colsCount = parseInt(document.getElementById('route-cols').value);
    
    if (!text) {
        alert('Введите текст для шифрования');
        return;
    }
    
    checkTextVolume(text);
    
    try {
        const response = await fetch(API.routeEncrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, colsCount })
        });
        
        const data = await response.json();
        document.getElementById('route-result').value = data.result;
        document.getElementById('route-time').textContent = data.time;
        document.getElementById('route-result-length').textContent = data.result.length;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при шифровании');
    }
});

document.getElementById('route-decrypt-btn').addEventListener('click', async () => {
    const text = document.getElementById('route-plaintext').value;
    const colsCount = parseInt(document.getElementById('route-cols').value);

    if (!text) {
        alert('Нет текста для расшифрования');
        return;
    }

    try {
        const response = await fetch(API.routeDecrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, colsCount })
        });

        const data = await response.json();

        //// document.getElementById('route-plaintext').value = data.result;
        document.getElementById('route-result').value = data.result;

        document.getElementById('route-time').textContent = data.time;
        document.getElementById('route-result-length').textContent = data.result.length;

        checkTextVolume(data.result);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при расшифровании');
    }
});

// document.getElementById('route-decrypt-btn').addEventListener('click', async () => {
//     // const text = document.getElementById('route-result').value;
//     const text = document.getElementById('route-plaintext').value;
//     const colsCount = parseInt(document.getElementById('route-cols').value);
    
//     if (!text) {
//         alert('Нет зашифрованного текста для расшифрования');
//         return;
//     }
    
//     try {
//         const response = await fetch(API.routeDecrypt, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ text, colsCount })
//         });
        
//         const data = await response.json();
//         document.getElementById('route-plaintext').value = data.result;
//         document.getElementById('route-time').textContent = data.time;
//         checkTextVolume(data.result);
//     } catch (error) {
//         console.error('Ошибка:', error);
//         alert('Ошибка при расшифровании');
//     }
// });

// ============ МНОЖЕСТВЕННАЯ ПЕРЕСТАНОВКА ============

document.getElementById('multiple-load-sample')?.addEventListener('click', () => {
    document.getElementById('multiple-plaintext').value = largeTextSample;
    checkTextVolume(largeTextSample);
});

document.getElementById('multiple-file-input')?.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            document.getElementById('multiple-plaintext').value = content;
            checkTextVolume(content);
        };
        reader.readAsText(file, 'UTF-8');
    }
});

document.getElementById('multiple-encrypt-btn').addEventListener('click', async () => {
    const text = document.getElementById('multiple-plaintext').value;
    const rowKey = document.getElementById('multiple-row-key').value;
    const colKey = document.getElementById('multiple-col-key').value;
    
    if (!text) {
        alert('Введите текст для шифрования');
        return;
    }
    
    if (!rowKey || !colKey) {
        alert('Введите ключевые слова (имя и фамилию)');
        return;
    }
    
    checkTextVolume(text);
    
    try {
        const response = await fetch(API.multipleEncrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, rowKey, colKey })
        });
        
        const data = await response.json();
        document.getElementById('multiple-result').value = data.result;
        document.getElementById('multiple-time').textContent = data.time;
        document.getElementById('multiple-result-length').textContent = data.result.length;
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при шифровании');
    }
});

// document.getElementById('multiple-decrypt-btn').addEventListener('click', async () => {
//     // const text = document.getElementById('multiple-result').value;
//     const text = document.getElementById('multiple-plaintext').value;
//     const rowKey = document.getElementById('multiple-row-key').value;
//     const colKey = document.getElementById('multiple-col-key').value;
    
//     if (!text) {
//         alert('Нет зашифрованного текста для расшифрования');
//         return;
//     }
    
//     try {
//         const response = await fetch(API.multipleDecrypt, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ text, rowKey, colKey })
//         });
        
//         const data = await response.json();
//         // //document.getElementById('multiple-plaintext').value = data.result;
//         document.getElementById('multiple-time').textContent = data.time;
//         checkTextVolume(data.result);
//     } catch (error) {
//         console.error('Ошибка:', error);
//         alert('Ошибка при расшифровании');
//     }
// });

// ============ АНАЛИЗ ЧАСТОТ ============
document.getElementById('multiple-decrypt-btn').addEventListener('click', async () => {
    const text = document.getElementById('multiple-plaintext').value;
    const rowKey = document.getElementById('multiple-row-key').value;
    const colKey = document.getElementById('multiple-col-key').value;
    
    if (!text) {
        alert('Нет текста для расшифрования');
        return;
    }
    
    try {
        const response = await fetch(API.multipleDecrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text, rowKey, colKey })
        });
        
        const data = await response.json();

        document.getElementById('multiple-result').value = data.result;

        document.getElementById('multiple-time').textContent = data.time;
        document.getElementById('multiple-result-length').textContent = data.result.length;

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при расшифровании');
    }
});


document.getElementById('analyze-btn').addEventListener('click', async () => {
    const text = document.getElementById('analysis-text').value;
    
    if (!text) {
        alert('Введите текст для анализа');
        return;
    }
    
    checkTextVolume(text);
    
    try {
        const response = await fetch(API.frequencies, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        const data = await response.json();
        updateChart(data.frequencies);
        
        // Вывод статистики
        const totalChars = Object.values(data.frequencies).reduce((a, b) => a + b, 0);
        console.log(`📊 Анализ завершен: ${totalChars} букв проанализировано`);
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при анализе частот');
    }
});

// Обновление гистограммы
function updateChart(frequencies) {
    const alphabet = 'абвгдеёжзійклмнопрстуўфхцчшыьэюя';
    const labels = alphabet.split('');
    const data = labels.map(letter => frequencies[letter] || 0);
    
    if (freqChart) {
        freqChart.destroy();
    }
    
    const ctx = document.getElementById('freq-chart').getContext('2d');
    freqChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Частота появления символа',
                data: data,
                backgroundColor: 'rgba(102, 126, 234, 0.7)',
                borderColor: 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Количество вхождений'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Символы алфавита'
                    },
                    ticks: {
                        maxRotation: 90,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Частота: ${context.raw}`;
                        }
                    }
                }
            }
        }
    });
}

// Переключение вкладок
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabId = btn.dataset.tab;
        
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${tabId}`).classList.add('active');
    });
});

document.getElementById('analysis-load-sample')?.addEventListener('click', () => {
    document.getElementById('analysis-text').value = largeTextSample;
    checkTextVolume(largeTextSample);
});



// ============ ГРАФИК ВРЕМЕНИ ВЫПОЛНЕНИЯ (ЛИНЕЙНЫЙ) ============

let performanceChart = null;

// Функция для генерации тестового текста заданной длины
function generateTestText(length) {
    const words = ['бабры', 'тут', 'калісь', 'вадзіліся', 'у', 'лесе', 'яны', 'жылі', 'дружна', 'шчасліва', 
                   'працавалі', 'будавалі', 'плаціны', 'хаткі', 'вясной', 'летам', 'восенню', 'зімой',
                   'стары', 'бабёр', 'мудры', 'дасведчаны', 'працавіты', 'клапатлівы', 'беларускі', 'лес',
                   'жывёлы', 'птушкі', 'звяры', 'расліны', 'дрэвы', 'кветкі', 'гарады', 'вёскі', 'рэкі'];
    let text = '';
    while (text.length < length) {
        const word = words[Math.floor(Math.random() * words.length)];
        if (text.length + word.length + 1 <= length) {
            text += word + ' ';
        } else {
            text += word.substring(0, length - text.length);
        }
    }
    return text.trim();
}

// Функция для тестирования одного размера
async function testForSize(size, iterations, rowKey, colKey, colsCount) {
    const testText = generateTestText(size);
    
    let routeEncrypt = 0, routeDecrypt = 0;
    let multipleEncrypt = 0, multipleDecrypt = 0;
    
    // Прогрев
    await fetch(API.routeEncrypt, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: testText, colsCount })
    });
    
    for (let i = 0; i < iterations; i++) {
        // Маршрутная перестановка
        let start = performance.now();
        const encryptResp = await fetch(API.routeEncrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: testText, colsCount })
        });
        const encryptData = await encryptResp.json();
        routeEncrypt += (performance.now() - start);
        
        start = performance.now();
        await fetch(API.routeDecrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: encryptData.result, colsCount })
        });
        routeDecrypt += (performance.now() - start);
        
        // Множественная перестановка
        start = performance.now();
        const multipleResp = await fetch(API.multipleEncrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: testText, rowKey, colKey })
        });
        const multipleData = await multipleResp.json();
        multipleEncrypt += (performance.now() - start);
        
        start = performance.now();
        await fetch(API.multipleDecrypt, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: multipleData.result, rowKey, colKey })
        });
        multipleDecrypt += (performance.now() - start);
    }
    
    return {
        size,
        routeEncrypt: routeEncrypt / iterations,
        routeDecrypt: routeDecrypt / iterations,
        multipleEncrypt: multipleEncrypt / iterations,
        multipleDecrypt: multipleDecrypt / iterations
    };
}

document.getElementById('run-performance-test')?.addEventListener('click', async () => {
    const sizes = [100, 500, 1000, 2000, 5000];
    const iterations = parseInt(document.getElementById('test-iterations')?.value || 5);
    const rowKey = document.getElementById('multiple-row-key')?.value || 'имя';
    const colKey = document.getElementById('multiple-col-key')?.value || 'имя';
    const colsCount = 8;
    
    // Показываем индикатор загрузки
    const resultsDiv = document.getElementById('performance-results');
    resultsDiv.innerHTML = '<p>Выполняется тест производительности для размеров: 100, 500, 1000, 2000, 5000 символов...</p><p>Это может занять до 30 секунд...</p>';
    
    const results = [];
    
    // Последовательно тестируем каждый размер
    for (const size of sizes) {
        resultsDiv.innerHTML = `<p>Тестирование размера ${size} символов... (${iterations} повторений)</p>`;
        const result = await testForSize(size, iterations, rowKey, colKey, colsCount);
        results.push(result);
        console.log(`Размер ${size}: Готово`);
    }
    
    // Формируем таблицу результатов
    let tableHtml = '<table style="width:100%; border-collapse: collapse; margin-top: 15px;">';
    tableHtml += '<tr style="background: #667eea; color: white;"><th>Размер текста</th><th>Маршрутная (шифр)</th><th>Маршрутная (расшифр)</th><th>Множественная (шифр)</th><th>Множественная (расшифр)</th></tr>';
    
    for (const r of results) {
        tableHtml += `<tr style="border-bottom: 1px solid #ddd;">
            <td style="padding: 8px; text-align: center;">${r.size}</td>
            <td style="padding: 8px; text-align: center;">${r.routeEncrypt.toFixed(3)} мс</td>
            <td style="padding: 8px; text-align: center;">${r.routeDecrypt.toFixed(3)} мс</td>
            <td style="padding: 8px; text-align: center;">${r.multipleEncrypt.toFixed(3)} мс</td>
            <td style="padding: 8px; text-align: center;">${r.multipleDecrypt.toFixed(3)} мс</td>
        </tr>`;
    }
    tableHtml += '</table>';
    
    resultsDiv.innerHTML = `
        <p><strong>Результаты теста производительности (${iterations} повторений):</strong></p>
        ${tableHtml}
        <hr>
        <p>Множественная перестановка медленнее маршрутной в среднем в ${((results[2].multipleEncrypt + results[2].multipleDecrypt) / (results[2].routeEncrypt + results[2].routeDecrypt)).toFixed(1)} раза</p>
    `;
    
    // Строим ЛИНЕЙНЫЙ график
    if (performanceChart) {
        performanceChart.destroy();
    }
    
    const ctx = document.getElementById('performance-chart').getContext('2d');
    performanceChart = new Chart(ctx, {
        type: 'line',  // Линейный график!
        data: {
            labels: results.map(r => `${r.size} симв.`),
            datasets: [
                {
                    label: 'Маршрутная (шифрование)',
                    data: results.map(r => r.routeEncrypt),
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Маршрутная (расшифрование)',
                    data: results.map(r => r.routeDecrypt),
                    borderColor: '#a78bfa',
                    backgroundColor: 'rgba(167, 139, 250, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#a78bfa',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Множественная (шифрование)',
                    data: results.map(r => r.multipleEncrypt),
                    borderColor: '#48bb78',
                    backgroundColor: 'rgba(72, 187, 120, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#48bb78',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                },
                {
                    label: 'Множественная (расшифрование)',
                    data: results.map(r => r.multipleDecrypt),
                    borderColor: '#38a169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    borderWidth: 3,
                    fill: false,
                    tension: 0.3,
                    pointRadius: 5,
                    pointBackgroundColor: '#38a169',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(3)} мс`;
                        }
                    }
                },
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        usePointStyle: true,
                        boxWidth: 10
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Время выполнения (миллисекунды)',
                        font: { weight: 'bold', size: 14 }
                    },
                    grid: {
                        color: '#e0e0e0'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Размер текста (символы)',
                        font: { weight: 'bold', size: 14 }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
    
    console.log('Тест завершен');
});





// Вывод информации при загрузке страницы
console.log('Приложение загружено. Готово к работе с текстами 500+ символов.');