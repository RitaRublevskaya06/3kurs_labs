const { runLoginTests } = require('./test_login');
const { runCartTests } = require('./test_cart');
const { runCheckoutTests } = require('./test_checkout');
const { runSortTests } = require('./test_sort');
const fs = require('fs');
const path = require('path');


// Определение приоритетов тестов
const TEST_PRIORITY = {
    LOGIN: 1,
    CART: 2,
    CHECKOUT: 3,
    SORT: 4 
};

// Метки для тестов
const TEST_TAGS = {
    SMOKE: 'smoke',           // Критический функционал
    REGRESSION: 'regression', // Полная проверка
    SLOW: 'slow',             // Медленные тесты
    FAST: 'fast'              // Быстрые тесты
};

// Определение тестов с их метками и приоритетами
const testSuite = [
    { 
        name: 'Тесты авторизации', 
        runner: runLoginTests, 
        priority: TEST_PRIORITY.LOGIN,
        tags: [TEST_TAGS.SMOKE, TEST_TAGS.FAST],
        description: 'Проверка входа с разными пользователями'
    },
    { 
        name: 'Тесты корзины', 
        runner: runCartTests, 
        priority: TEST_PRIORITY.CART,
        tags: [TEST_TAGS.SMOKE, TEST_TAGS.FAST],
        description: 'Добавление и удаление товаров'
    },
    { 
        name: 'Тесты оформления заказа', 
        runner: runCheckoutTests, 
        priority: TEST_PRIORITY.CHECKOUT,
        tags: [TEST_TAGS.REGRESSION, TEST_TAGS.SLOW],
        description: 'Полный цикл покупки'
    },
    { 
        name: 'Тесты сортировки', 
        runner: runSortTests, 
        priority: TEST_PRIORITY.SORT,
        tags: [TEST_TAGS.REGRESSION, TEST_TAGS.FAST],
        description: 'Проверка сортировки товаров'
    }
];

// Функция для запуска тестов в правильном порядке (по приоритету)
async function runTestsByPriority() {
    console.log('\n\nЗАПУСК ТЕСТОВ С УПРАВЛЕНИЕМ ПОРЯДКОМ (ПО ПРИОРИТЕТУ)');
    
    // Сортируем тесты по приоритету (от меньшего к большему)
    const sortedTests = [...testSuite].sort((a, b) => a.priority - b.priority);
    
    console.log('\nПорядок выполнения тестов (по возрастанию приоритета):');
    sortedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. [Приоритет: ${test.priority}] ${test.name}`);
        console.log(`      Метки: ${test.tags.join(', ')}`);
        console.log(`      Описание: ${test.description}`);
    });
    
    return sortedTests;
}

// Функция для фильтрации тестов по меткам
async function runTestsByTags(includeTags = [], excludeTags = []) {
    console.log(`\n\n========== ЗАПУСК ТЕСТОВ С МЕТКАМИ ==========`);
    console.log(`Включить: ${includeTags.join(', ') || 'все'}`);
    console.log(`Исключить: ${excludeTags.join(', ') || 'нет'}\n`);
    
    let filteredTests = [...testSuite];
    
    if (includeTags.length > 0) {
        filteredTests = filteredTests.filter(test => 
            includeTags.some(tag => test.tags.includes(tag))
        );
    }
    
    if (excludeTags.length > 0) {
        filteredTests = filteredTests.filter(test => 
            !excludeTags.some(tag => test.tags.includes(tag))
        );
    }
    
    // Сортируем отфильтрованные тесты по приоритету
    filteredTests.sort((a, b) => a.priority - b.priority);
    
    console.log('Отфильтрованные тесты (в порядке выполнения):');
    filteredTests.forEach((test, index) => {
        console.log(`  ${index + 1}. ${test.name} [${test.tags.join(', ')}]`);
    });
    
    return filteredTests;
}

// Функция для маркировки тестов как пропущенных
function skipTest(testName, reason = 'Пропущен по требованию') {
    console.log(`\nПРОПУЩЕННЫЙ ТЕСТ: ${testName}`);
    console.log(`   Причина: ${reason}`);
    return { status: 'SKIP', name: testName, reason };
}

// Функция для маркировки тестов как ожидаемо падающих
function expectedFailTest(testName, reason = 'Ожидаемое падение') {
    console.log(`\nОЖИДАЕМО ПАДАЮЩИЙ ТЕСТ: ${testName}`);
    console.log(`   Причина: ${reason}`);
    return { status: 'EXPECTED FAIL', name: testName, reason };
}

// ГЛАВНАЯ ФУНКЦИЯ ЗАПУСКА
async function runAllTests() {
    const startTime = Date.now();
    const allResults = [];
    let totalPassed = 0;
    let totalFailed = 0;
    let totalSkipped = 0;
    let totalExpectedFail = 0;
    
    // ДЕМОНСТРАЦИЯ 1: Запуск по приоритету (основной порядок)
    console.log('\nДЕМОНСТРАЦИЯ 1: ОСНОВНОЙ ЗАПУСК (ПО ПРИОРИТЕТУ)');
    const sortedTests = await runTestsByPriority();
    
    // ДЕМОНСТРАЦИЯ 2: Выборочный запуск только SMOKE тестов
    console.log('\nДЕМОНСТРАЦИЯ 2: ВЫБОРОЧНЫЙ ЗАПУСК (ТОЛЬКО SMOKE ТЕСТЫ)');
    const smokeTests = await runTestsByTags([TEST_TAGS.SMOKE]);
    
    // ДЕМОНСТРАЦИЯ 3: Запуск всех, кроме SLOW тестов
    console.log('\nДЕМОНСТРАЦИЯ 3: ЗАПУСК БЕЗ SLOW ТЕСТОВ');
    const fastTests = await runTestsByTags([], [TEST_TAGS.SLOW]);
    
    // ДЕМОНСТРАЦИЯ 4: Пропущенные и ожидаемо падающие тесты (добавляем в статистику)
    console.log('\nДЕМОНСТРАЦИЯ 4: ПРОПУЩЕННЫЕ И ОЖИДАЕМО ПАДАЮЩИЕ ТЕСТЫ');
    const skipped = skipTest('Тест с русским языком', 'Функционал локализации не готов');
    const expectedFail = expectedFailTest('Тест с пустыми полями', 'Известный баг #1234');
    
    allResults.push({ name: skipped.name, status: skipped.status, reason: skipped.reason });
    allResults.push({ name: expectedFail.name, status: expectedFail.status, reason: expectedFail.reason });
    totalSkipped++;
    totalExpectedFail++;
    
    console.log('\n\nЗАПУСК ТЕСТОВ В ПОРЯДКЕ ПРИОРИТЕТА');
    console.log('=' .repeat(60));
    
    for (const test of sortedTests) {
        console.log(`\nВыполняется: ${test.name} [Приоритет: ${test.priority}]`);
        console.log(`   Метки: ${test.tags.join(', ')}`);
        
        try {
            const result = await test.runner();

            console.log(`   РЕЗУЛЬТАТ: passed=${result.passed}, failed=${result.failed}`);
            console.log(`   Детали результатов:`, JSON.stringify(result.results, null, 2));

            totalPassed += result.passed || 0;
            totalFailed += result.failed || 0;
            if (result.results) {
                for (const r of result.results) {
                    if (r.status === 'SKIP') {
                        totalSkipped++;
                    } else if (r.status === 'EXPECTED FAIL') {
                        totalExpectedFail++;
                    }
                    allResults.push(r);
                }
            }
            console.log(`Завершено: ${test.name}`);
        } catch (err) {
            console.error(`Ошибка в ${test.name}:`, err.message);
            totalFailed++;
        }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const totalTests = totalPassed + totalFailed + totalSkipped + totalExpectedFail;
    
    // ВЫВОД РЕЗУЛЬТАТОВ
    console.log('\n\nРЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ');
    console.log(`\nСтатистика:`);
    console.log(`Пройдено: ${totalPassed}`);
    console.log(`Провалено: ${totalFailed}`);
    console.log(`Пропущено: ${totalSkipped}`);
    console.log(`Ожидаемо падающих: ${totalExpectedFail}`);
    console.log(`Всего: ${totalTests}`);
    console.log(`Время: ${duration} сек`);
    
    // Генерация HTML отчета
    const reportDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Отчет с управлением порядком тестов</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1, h2 { color: #333; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .skip { color: gray; font-weight: bold; }
        .expected-fail { color: orange; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
        .tag { background: #e0e0e0; border-radius: 3px; padding: 2px 5px; font-size: 12px; margin: 2px; display: inline-block; }
        .priority-high { background: #ff4444; color: white; padding: 2px 5px; border-radius: 3px; }
        .priority-medium { background: #ffaa44; padding: 2px 5px; border-radius: 3px; }
        .priority-low { background: #44ff44; padding: 2px 5px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Отчет о тестировании с управлением порядком выполнения</h1>
    
    <div class="summary">
        <h2>Общая статистика</h2>
        <p><strong>Пройдено:</strong> <span class="pass">${totalPassed}</span></p>
        <p><strong>Провалено:</strong> <span class="fail">${totalFailed}</span></p>
        <p><strong>Пропущено:</strong> <span class="skip">${totalSkipped}</span></p>
        <p><strong>Ожидаемо падающих:</strong> <span class="expected-fail">${totalExpectedFail}</span></p>
        <p><strong>Всего:</strong> ${totalTests}</p>
        <p><strong>Время выполнения:</strong> ${duration} сек</p>
        <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
    </div>
    
    <h2>Порядок выполнения тестов (по приоритету)</h2>
    <table>
        <thead>
            <tr><th>Приоритет</th><th>Название теста</th><th>Метки</th><th>Описание</th></tr>
        </thead>
        <tbody>
            ${testSuite.map(test => `
            <tr>
                <td class="${test.priority === 1 ? 'priority-high' : (test.priority === 2 ? 'priority-medium' : 'priority-low')}">
                    ${test.priority}
                </td>
                <td>${test.name}</td>
                <td>${test.tags.map(t => `<span class="tag">${t}</span>`).join(' ')}</td>
                <td>${test.description}</td>
            </tr>
            `).join('')}
        </tbody>
    </table>
    
    <h2>Детальные результаты тестов</h2>
    <table>
        <thead>
            <tr><th>Тест</th><th>Результат</th><th>Причина</th></tr>
        </thead>
        <tbody>
            ${allResults.map(r => {
                let statusClass = '';
                if (r.status === 'PASS') statusClass = 'pass';
                else if (r.status === 'FAIL') statusClass = 'fail';
                else if (r.status === 'SKIP') statusClass = 'skip';
                else if (r.status === 'EXPECTED FAIL') statusClass = 'expected-fail';
                return `<tr>
                    <td>${r.name}</td>
                    <td class="${statusClass}">${r.status}</td>
                    <td>${r.reason || r.error || ''}</td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>
    
    <h2>Демонстрация управления порядком</h2>
    <ul>
        <li><strong>Запуск по приоритету:</strong> Тесты с priority=1 выполняются первыми</li>
        <li><strong>Выборочный запуск по меткам:</strong> Только SMOKE тесты или только FAST тесты</li>
        <li><strong>Исключение по меткам:</strong> Запуск всех, кроме SLOW тестов</li>
        <li><strong>Пропущенные тесты:</strong> Тесты, отмеченные как SKIP</li>
        <li><strong>Ожидаемо падающие:</strong> Тесты, отмеченные как EXPECTED FAIL</li>
    </ul>
    
    <h3>Примеры команд для выборочного запуска:</h3>
    <pre>
runTestsByTags([TEST_TAGS.SMOKE])

runTestsByTags([], [TEST_TAGS.SLOW])

skipTest('Тест с русским языком', 'Функционал не готов')
    </pre>
</body>
</html>`;
    
    fs.writeFileSync(path.join(reportDir, 'test_report_with_order.html'), htmlContent);
    console.log(`\nHTML отчет сохранен: reports/test_report_with_order.html`);
    console.log('\n========== ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ ==========');
}

// Запуск
runAllTests().catch(err => {
    console.error('Критическая ошибка:', err);
    process.exit(1);
});