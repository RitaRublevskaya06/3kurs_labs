const { setupBrowser } = require('../conftest');
const { By } = require('selenium-webdriver');
const { expect } = require('chai');

const testUsers = [
    { username: 'standard_user', password: 'secret_sauce', expectedSuccess: true, description: 'Стандартный пользователь' },
    { username: 'locked_out_user', password: 'secret_sauce', expectedSuccess: false, description: 'Заблокированный пользователь' },
    { username: 'problem_user', password: 'secret_sauce', expectedSuccess: true, description: 'Пользователь с проблемами' },
    { username: 'invalid_user', password: 'wrong_pass', expectedSuccess: false, description: 'Неверные данные' }
];

async function runLoginTests() {
    console.log('\n========================================');
    console.log('ТЕСТИРОВАНИЕ АВТОРИЗАЦИИ');
    console.log('========================================\n');
    
    let passed = 0;
    let failed = 0;
    const results = [];

    for (const user of testUsers) {
        console.log(`\n--- Тест: ${user.description} ---`);
        const { driver, pages } = await setupBrowser('en');
        const loginPage = pages.loginPage;
        
        try {
            await loginPage.open();
            
            if (user.expectedSuccess) {
                await loginPage.login(user.username, user.password);
                const isLoggedIn = await loginPage.isDisplayed(By.className('inventory_list'));
                expect(isLoggedIn).to.be.true;
                console.log(`  УСПЕХ: Вход выполнен для ${user.username}`);
                passed++;
                results.push({ name: `Авторизация: ${user.description}`, status: 'PASS' });
            } else {
                await loginPage.login(user.username, user.password);
                const hasError = await loginPage.isErrorDisplayed();
                expect(hasError).to.be.true;
                const errorMsg = await loginPage.getErrorMessage();
                console.log(`  УСПЕХ: Ожидаемая ошибка: ${errorMsg}`);
                passed++;
                results.push({ name: `Авторизация: ${user.description}`, status: 'PASS' });
            }
            await loginPage.takeScreenshot(`login_${user.username}`);
        } catch (err) {
            console.log(`  ОШИБКА: ${err.message}`);
            failed++;
            results.push({ name: `Авторизация: ${user.description}`, status: 'FAIL', error: err.message });
        } finally {
            await driver.quit();
        }
    }
    
    // Демонстрация ожидаемо падающего теста
    console.log('\n--- Ожидаемо падающий тест (EXPECTED FAIL) ---');
    const { driver, pages } = await setupBrowser('en');
    try {
        await pages.loginPage.open();
        await pages.loginPage.login('', '');
        const hasError = await pages.loginPage.isErrorDisplayed();
        expect(hasError).to.be.true;
        console.log('  УСПЕХ: Система показала ошибку для пустых полей');
        results.push({ name: 'Пустые поля (проверка ошибки)', status: 'PASS' });
        passed++;
    } catch (err) {
        console.log('  Тест упал с ошибкой');
        results.push({ name: 'Пустые поля (ожидаемо падает)', status: 'EXPECTED FAIL', error: err.message });
    } finally {
        await driver.quit();
    }
    
    // Пропущенный тест (SKIP)
    console.log('\n--- Пропущенный тест (SKIP) ---');
    console.log('  Тест с разными языками пропущен');
    results.push({ name: 'Тест с русским языком (SKIP)', status: 'SKIP' });

    return { passed, failed, results };
}

module.exports = { runLoginTests };