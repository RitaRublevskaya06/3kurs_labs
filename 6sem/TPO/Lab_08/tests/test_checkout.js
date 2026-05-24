const { setupBrowser } = require('../conftest');
const { expect } = require('chai');

async function runCheckoutTests() {
    console.log('\n========================================');
    console.log('ТЕСТИРОВАНИЕ ОФОРМЛЕНИЯ ЗАКАЗА');
    console.log('========================================\n');
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    // Тест полного цикла
    console.log('\n--- Тест: Полный цикл оформления заказа ---');
    const { driver, pages } = await setupBrowser();
    try {
        await pages.loginPage.open();
        await pages.loginPage.login('standard_user', 'secret_sauce');
        await pages.inventoryPage.sleep(1000);
        
        await pages.inventoryPage.addToCart('Sauce Labs Bike Light');
        await pages.inventoryPage.sleep(1000);
        
        await pages.inventoryPage.goToCart();
        await pages.cartPage.sleep(1000);
        
        await pages.cartPage.proceedToCheckout();
        await pages.checkoutPage.sleep(1000);
        
        await pages.checkoutPage.fillCheckoutInfo('Ivan', 'Petrov', '123456');
        await pages.checkoutPage.sleep(500);
        
        await pages.checkoutPage.clickContinue();
        await pages.checkoutPage.sleep(1000);
        
        await pages.checkoutPage.clickFinish();
        await pages.checkoutPage.sleep(1000);
        
        const successMessage = await pages.checkoutPage.getSuccessMessage();
        expect(successMessage).to.equal('Thank you for your order!');
        console.log('  УСПЕХ: Заказ оформлен');
        
        await pages.checkoutPage.takeScreenshot('order_complete');
        passed++;
        results.push({ name: 'Полный цикл заказа', status: 'PASS' });
    } catch (err) {
        console.log(`  ОШИБКА: ${err.message}`);
        failed++;
        results.push({ name: 'Полный цикл заказа', status: 'FAIL', error: err.message });
    } finally {
        await driver.quit();
    }
    
    // Демонстрация работы с cookies
    console.log('\n--- Демонстрация работы с cookies ---');
    const { driver: driver2, pages: pages2 } = await setupBrowser();
    try {
        await pages2.loginPage.open();
        console.log('  Cookies до авторизации:');
        await pages2.loginPage.getAllCookies();
        
        await pages2.loginPage.login('standard_user', 'secret_sauce');
        await pages2.loginPage.sleep(1000);
        
        console.log('\n  Cookies после авторизации:');
        await pages2.loginPage.getAllCookies();
        
        results.push({ name: 'Демонстрация работы с cookies', status: 'PASS' });
        passed++;
    } catch (err) {
        console.log(`  ОШИБКА: ${err.message}`);
        results.push({ name: 'Демонстрация работы с cookies', status: 'FAIL', error: err.message });
        failed++;
    } finally {
        await driver2.quit();
    }
    
    return { passed, failed, results };
}

module.exports = { runCheckoutTests };