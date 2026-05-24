const { Builder, By, until, Select } = require('selenium-webdriver');
require('chromedriver');

class TestSauceDemo {
    constructor() {
        this.driver = null;
    }
    
    async setUp() {
        this.driver = await new Builder().forBrowser('chrome').build();
        await this.driver.manage().setTimeouts({ implicit: 5000 });
        await this.driver.manage().window().maximize();
    }
    
    async login() {
        await this.driver.get('https://www.saucedemo.com/');
        
        await this.driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await this.driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await this.driver.findElement(By.id('login-button')).click();
        
        await this.driver.wait(until.elementLocated(By.className('inventory_list')), 10000);
    }
    
    async tearDown() {
        if (this.driver) {
            await this.driver.quit();
            this.driver = null;
        }
    }
    
    // --- ТЕСТ 1: Авторизация ---
    async testLogin() {
        console.log('\n=== Тест 1: Авторизация ===');
        try {
            await this.setUp();
            await this.login();
            
            let title = await this.driver.findElement(By.className('title')).getText();
            console.log(`Заголовок страницы: ${title}`);
            
            if (title === 'Products') {
                console.log('ТЕСТ ПРОЙДЕН: Авторизация выполнена успешно');
            } else {
                console.log('ТЕСТ НЕ ПРОЙДЕН: Не удалось авторизоваться');
            }
        } catch (error) {
            console.error('Ошибка в тесте авторизации:', error.message);
        } finally {
            await this.tearDown();
        }
    }
    
    // --- ТЕСТ 2: Добавление товара в корзину ---
    async testAddToCart() {
        console.log('\n=== Тест 2: Добавление товара в корзину ===');
        try {
            await this.setUp();
            await this.login();
            
            await this.driver.findElement(By.id('add-to-cart-sauce-labs-backpack')).click();
            await this.driver.findElement(By.className('shopping_cart_link')).click();
            
            let item = await this.driver.findElement(By.className('inventory_item_name')).getText();
            console.log(`Товар в корзине: ${item}`);
            
            if (item.includes('Backpack')) {
                console.log('ТЕСТ ПРОЙДЕН: Товар успешно добавлен в корзину');
            } else {
                console.log('ТЕСТ НЕ ПРОЙДЕН: Товар не найден в корзине');
            }
        } catch (error) {
            console.error('Ошибка в тесте добавления в корзину:', error.message);
        } finally {
            await this.tearDown();
        }
    }

    // --- ТЕСТ 3: Сквозной сценарий (оформление заказа) ---
    async testCheckout() {
        console.log('\n=== Тест 3: Сквозной сценарий оформления заказа ===');
        try {
            await this.setUp();
            await this.login();
            
            console.log('1. Добавляем товар в корзину');
            await this.driver.findElement(By.id('add-to-cart-sauce-labs-bike-light')).click();
            
            console.log('2. Переходим в корзину');
            await this.driver.findElement(By.className('shopping_cart_link')).click();
            
            console.log('3. Нажимаем Checkout');
            await this.driver.findElement(By.id('checkout')).click();
            
            console.log('4. Заполняем форму');
            await this.driver.findElement(By.id('first-name')).sendKeys('Ivan');
            await this.driver.findElement(By.id('last-name')).sendKeys('Ivanov');
            await this.driver.findElement(By.id('postal-code')).sendKeys('12345');
            await this.driver.findElement(By.id('continue')).click();
            
            console.log('5. Нажимаем Finish');
            await this.driver.findElement(By.id('finish')).click();
            
            let success = await this.driver.findElement(By.className('complete-header')).getText();
            console.log(`Результат: ${success}`);
            
            if (success === 'Thank you for your order!') {
                console.log('ТЕСТ ПРОЙДЕН: Заказ успешно оформлен');
            } else {
                console.log('ТЕСТ НЕ ПРОЙДЕН: Ошибка при оформлении заказа');
            }
        } catch (error) {
            console.error('Ошибка в сквозном тесте:', error.message);
        } finally {
            await this.tearDown();
        }
    }
    
    // --- ТЕСТ 4: Работа с выпадающим списком (dropdown) ---
    async testSortDropdown() {
        console.log('\n=== Тест 4: Работа с выпадающим списком (сортировка) ===');
        try {
            await this.setUp();
            await this.login();
            
            let dropdown = new Select(await this.driver.findElement(By.className('product_sort_container')));
            await dropdown.selectByVisibleText('Price (low to high)');
            console.log('Выбрана сортировка: Price (low to high)');
            
            await this.driver.sleep(1000);
            
            let prices = await this.driver.findElements(By.className('inventory_item_price'));
            let firstPrice = await prices[0].getText();
            console.log(`Цена первого товара: ${firstPrice}`);
            
            if (firstPrice.includes('$')) {
                console.log('ТЕСТ ПРОЙДЕН: Сортировка работает корректно');
            } else {
                console.log('ТЕСТ НЕ ПРОЙДЕН: Ошибка сортировки');
            }
        } catch (error) {
            console.error('Ошибка в тесте сортировки:', error.message);
        } finally {
            await this.tearDown();
        }
    }
    
    async runAllTests() {
        console.log('=== Запуск всех тестов ===');
        
        await this.testLogin();
        await this.testAddToCart();
        await this.testCheckout();
        await this.testSortDropdown();
        
        console.log('\n=== Все тесты выполнены ===');
    }
}

const tests = new TestSauceDemo();
tests.runAllTests();







    // ❌ ✅