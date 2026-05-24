const { setupBrowser } = require('../conftest');
const { expect } = require('chai');

async function runCartTests() {
    console.log('\n========================================');
    console.log('ТЕСТИРОВАНИЕ КОРЗИНЫ');
    console.log('========================================\n');
    
    let passed = 0;
    let failed = 0;
    const results = [];
    
    // Тест 1: Добавление одного товара
    console.log('\n--- Тест: Добавление одного товара ---');
    const { driver, pages } = await setupBrowser();
    try {
        await pages.loginPage.open();
        await pages.loginPage.login('standard_user', 'secret_sauce');
        await pages.inventoryPage.addToCart('Sauce Labs Backpack');
        await pages.inventoryPage.sleep(1000);
        
        const cartCount = await pages.inventoryPage.getCartCount();
        console.log(`  Фактический счетчик: ${cartCount}`);
        expect(cartCount).to.equal(1);
        console.log('  УСПЕХ: Товар добавлен, счетчик = 1');
        
        await pages.inventoryPage.goToCart();
        const itemNames = await pages.cartPage.getItemNames();
        expect(itemNames[0]).to.include('Backpack');
        console.log('  УСПЕХ: Товар отображается в корзине');
        
        await pages.cartPage.takeScreenshot('cart_one_item');
        passed++;
        results.push({ name: 'Добавление одного товара', status: 'PASS' });
    } catch (err) {
        console.log(`  ОШИБКА: ${err.message}`);
        failed++;
        results.push({ name: 'Добавление одного товара', status: 'FAIL', error: err.message });
    } finally {
        await driver.quit();
    }
    
    // Тест 2: Добавление нескольких товаров - упрощенный вариант
    console.log('\n--- Тест: Добавление нескольких товаров ---');
    const { driver: driver2, pages: pages2 } = await setupBrowser();
    try {
        await pages2.loginPage.open();
        await pages2.loginPage.login('standard_user', 'secret_sauce');
        
        const products = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
        for (const product of products) {
            await pages2.inventoryPage.addToCart(product);
            await pages2.inventoryPage.sleep(500);
            const count = await pages2.inventoryPage.getCartCount();
            console.log(`  После добавления ${product}: счетчик = ${count}`);
        }
        
        await pages2.inventoryPage.goToCart();
        const itemCount = await pages2.cartPage.getItemCount();
        console.log(`  Товаров в корзине: ${itemCount}`);
        
        if (itemCount === 3) {
            console.log('  УСПЕХ: 3 товара в корзине');
            passed++;
            results.push({ name: 'Добавление нескольких товаров', status: 'PASS' });
        } else {
            throw new Error(`Ожидалось 3 товара, получено ${itemCount}`);
        }
        
        await pages2.cartPage.takeScreenshot('cart_multiple_items');
    } catch (err) {
        console.log(`  ОШИБКА: ${err.message}`);
        failed++;
        results.push({ name: 'Добавление нескольких товаров', status: 'FAIL', error: err.message });
    } finally {
        await driver2.quit();
    }
    
    // Тест 3: Удаление товара
    console.log('\n--- Тест: Удаление товара из корзины ---');
    const { driver: driver3, pages: pages3 } = await setupBrowser();
    try {
        await pages3.loginPage.open();
        await pages3.loginPage.login('standard_user', 'secret_sauce');
        await pages3.inventoryPage.addToCart('Sauce Labs Backpack');
        await pages3.inventoryPage.sleep(1000);
        await pages3.inventoryPage.goToCart();
        await pages3.cartPage.sleep(1000);
        
        const beforeCount = await pages3.cartPage.getItemCount();
        console.log(`  До удаления: ${beforeCount} товаров`);
        
        if (beforeCount === 1) {
            await pages3.cartPage.removeItem(0);
            await pages3.cartPage.sleep(1000);
            const afterCount = await pages3.cartPage.getItemCount();
            console.log(`  После удаления: ${afterCount} товаров`);
            
            if (afterCount === 0) {
                console.log('  УСПЕХ: Товар удален');
                passed++;
                results.push({ name: 'Удаление товара', status: 'PASS' });
                await pages3.cartPage.takeScreenshot('cart_empty');
            } else {
                throw new Error(`После удаления осталось ${afterCount} товаров`);
            }
        } else {
            throw new Error(`Перед удалением ${beforeCount} товаров, ожидалось 1`);
        }
    } catch (err) {
        console.log(`  ОШИБКА: ${err.message}`);
        failed++;
        results.push({ name: 'Удаление товара', status: 'FAIL', error: err.message });
    } finally {
        await driver3.quit();
    }
    
    return { passed, failed, results };
}

module.exports = { runCartTests };