const { runLoginTests } = require('./test_login');
const { runCartTests } = require('./test_cart');
const { runCheckoutTests } = require('./test_checkout');
const { runSortTests } = require('./test_sort');
const fs = require('fs');
const path = require('path');

async function runAllTests() {
    console.log('\n\n========== ЗАПУСК ВСЕХ ТЕСТОВ ==========\n');
    
    const startTime = Date.now();
    const allResults = [];
    let totalPassed = 0;
    let totalFailed = 0;
    
    try {
        console.log('1. Запуск тестов авторизации...');
        const loginRes = await runLoginTests();
        totalPassed += loginRes.passed || 0;
        totalFailed += loginRes.failed || 0;
        if (loginRes.results) allResults.push(...loginRes.results);
        console.log('Логин тесты завершены');
    } catch (err) {
        console.error('Ошибка в login тестах:', err);
    }
    
    try {
        console.log('\n2. Запуск тестов корзины...');
        const cartRes = await runCartTests();
        totalPassed += cartRes.passed || 0;
        totalFailed += cartRes.failed || 0;
        if (cartRes.results) allResults.push(...cartRes.results);
        console.log('Cart тесты завершены');
    } catch (err) {
        console.error('Ошибка в cart тестах:', err);
    }
    
    try {
        console.log('\n3. Запуск тестов оформления заказа...');
        const checkoutRes = await runCheckoutTests();
        totalPassed += checkoutRes.passed || 0;
        totalFailed += checkoutRes.failed || 0;
        if (checkoutRes.results) allResults.push(...checkoutRes.results);
        console.log('Checkout тесты завершены');
    } catch (err) {
        console.error('Ошибка в checkout тестах:', err);
    }
    
    try {
        console.log('\n4. Запуск тестов сортировки...');
        const sortRes = await runSortTests();
        totalPassed += sortRes.passed || 0;
        totalFailed += sortRes.failed || 0;
        if (sortRes.results) allResults.push(...sortRes.results);
        console.log('Sort тесты завершены');
    } catch (err) {
        console.error('Ошибка в sort тестах:', err);
    }
    
    const totalTests = totalPassed + totalFailed;
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log('\n========== РЕЗУЛЬТАТЫ ==========');
    console.log(`Всего тестов: ${totalTests}`);
    console.log(`Пройдено: ${totalPassed}`);
    console.log(`Провалено: ${totalFailed}`);
    console.log(`Время: ${duration} сек`);
    
    // Создаем папку reports
    const reportDir = path.join(__dirname, '..', 'reports');
    if (!fs.existsSync(reportDir)) {
        fs.mkdirSync(reportDir, { recursive: true });
    }
    
    // Генерация HTML отчета
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Отчет о тестировании Selenium POM</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; }
        .summary { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .pass { color: green; font-weight: bold; }
        .fail { color: red; font-weight: bold; }
        .skip { color: gray; font-weight: bold; }
        .expected-fail { color: orange; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #4CAF50; color: white; }
        tr:nth-child(even) { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h1>Отчет о тестировании Selenium Page Object Model</h1>
    <div class="summary">
        <p><strong>Всего тестов:</strong> ${totalTests}</p>
        <p><strong>Пройдено:</strong> <span class="pass">${totalPassed}</span></p>
        <p><strong>Провалено:</strong> <span class="fail">${totalFailed}</span></p>
        <p><strong>Время выполнения:</strong> ${duration} сек</p>
        <p><strong>Дата:</strong> ${new Date().toLocaleString()}</p>
    </div>
    <h2>Детали тестов</h2>
    <table>
        <thead>
            <tr><th>Тест</th><th>Результат</th><th>Ошибка</th></tr>
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
                    <td>${r.error || ''}</td>
                </tr>`;
            }).join('')}
        </tbody>
    </table>
    <h2>Требования лабораторной работы</h2>
    <ul>
        <li>1. Паттерн Page Object Model - реализован (папка pages)</li>
        <li>2. Опции браузера - установлены в conftest.js</li>
        <li>3. Работа с cookies - вывод в консоль</li>
        <li>4. Скриншоты - сохранены в папке screenshots</li>
        <li>5. Параметризация тестов - разные пользователи, разные варианты сортировки</li>
        <li>6. Управление тестами - пропущенные тесты (SKIP), ожидаемо падающие (EXPECTED FAIL)</li>
        <li>7. Отчет - сгенерирован в формате HTML</li>
    </ul>
    <p><em>Скриншоты доступны в папке screenshots</em></p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(reportDir, 'test_report.html'), htmlContent);
    console.log('\nHTML отчет сохранен в reports/test_report.html');
    console.log('========== ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ ==========');
}

runAllTests().catch(err => {
    console.error('Критическая ошибка:', err);
    process.exit(1);
});