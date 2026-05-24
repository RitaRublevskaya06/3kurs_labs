const { setupBrowser } = require('../conftest');
const { expect } = require('chai');

const sortOptions = [
    { name: 'Name (A to Z)', option: 'Name (A to Z)', type: 'name', expected: 'asc' },
    { name: 'Name (Z to A)', option: 'Name (Z to A)', type: 'name', expected: 'desc' },
    { name: 'Price (low to high)', option: 'Price (low to high)', type: 'price', expected: 'asc' },
    { name: 'Price (high to low)', option: 'Price (high to low)', type: 'price', expected: 'desc' }
];

function isSortedAscending(arr) {
    if (!arr || arr.length === 0) return true;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] > arr[i + 1]) return false;
    }
    return true;
}

function isSortedDescending(arr) {
    if (!arr || arr.length === 0) return true;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] < arr[i + 1]) return false;
    }
    return true;
}

async function runSortTests() {
    console.log('\n========================================');
    console.log('ТЕСТИРОВАНИЕ СОРТИРОВКИ');
    console.log('========================================\n');
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    // Отдельный браузер для каждого теста сортировки
    for (const option of sortOptions) {
        console.log(`\n--- Тест сортировки: ${option.name} ---`);
        const { driver, pages } = await setupBrowser();
        
        try {
            await pages.loginPage.open();
            await pages.loginPage.login('standard_user', 'secret_sauce');
            
            // Ждем загрузки товаров
            await pages.inventoryPage.sleep(1000);
            
            await pages.inventoryPage.sortBy(option.option);
            await pages.inventoryPage.sleep(1000);
            
            let data;
            if (option.type === 'name') {
                data = await pages.inventoryPage.getAllNames();
                console.log(`  Названия: ${data.slice(0, 3).join(', ')}...`);
                
                if (option.expected === 'asc') {
                    expect(isSortedAscending(data)).to.be.true;
                } else {
                    expect(isSortedDescending(data)).to.be.true;
                }
                console.log(`  УСПЕХ: Сортировка названий корректна`);
            } else {
                data = await pages.inventoryPage.getAllPrices();
                console.log(`  Цены: ${data.slice(0, 5).join(', ')}...`);
                
                if (option.expected === 'asc') {
                    expect(isSortedAscending(data)).to.be.true;
                } else {
                    expect(isSortedDescending(data)).to.be.true;
                }
                console.log(`  УСПЕХ: Сортировка цен корректна`);
            }
            
            await pages.inventoryPage.takeScreenshot(`sort_${option.name.replace(/\s/g, '_')}`);
            passed++;
            results.push({ name: `Сортировка ${option.name}`, status: 'PASS' });
        } catch (err) {
            console.log(`  ОШИБКА: ${err.message}`);
            failed++;
            results.push({ name: `Сортировка ${option.name}`, status: 'FAIL', error: err.message });
        } finally {
            await driver.quit();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Пауза между тестами
        }
    }
    
    return { passed, failed, results };
}

module.exports = { runSortTests };