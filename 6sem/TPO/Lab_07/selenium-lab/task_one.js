const { Builder, By, until } = require('selenium-webdriver');
require('chromedriver');

async function findElementsExample() {
    console.log('=== Задание 1: Поиск элементов разными способами ===\n');
    
    let driver = await new Builder().forBrowser('chrome').build();
    
    try {
        await driver.manage().setTimeouts({ implicit: 5000 });
        await driver.manage().window().maximize();
        
        console.log('Открываем сайт https://www.saucedemo.com/');
        await driver.get('https://www.saucedemo.com/');
        
        let wait = new WebDriverWait(driver, 10000);
        
        // --- 1. Поиск по ID ---
        console.log('\n1. Поиск по ID:');
        let username = await wait.until(EC.presenceOfElementLocated(By.id('user-name')));
        console.log('   Найден элемент по ID:', await username.getAttribute('placeholder'));
        
        // --- 2. Поиск по NAME ---
        console.log('\n2. Поиск по NAME:');
        let password = await driver.findElement(By.name('password'));
        console.log('   Найден элемент по NAME:', await password.getAttribute('placeholder'));
        
        // --- 3. Поиск по CSS ---
        console.log('\n3. Поиск по CSS-селектору (сложный):');
        let loginButton = await driver.findElement(By.css('input.submit-button.btn_action'));
        console.log('   CSS селектор 1: input.submit-button.btn_action');
        console.log('   Найден элемент:', await loginButton.getAttribute('value'));
        
        // --- 4. Поиск по CSS ---
        console.log('\n4. Поиск по CSS-селектору (сложный):');
        let logo = await driver.findElement(By.css('div.login_logo'));
        console.log('   CSS селектор 2: div.login_logo');
        console.log('   Найден элемент:', await logo.getText());
        
        // --- 5. Поиск по XPath ---
        console.log('\n5. Поиск по XPath (сложный):');
        let xpathElem1 = await wait.until(EC.presenceOfElementLocated(By.xpath("//div[contains(@class,'login_wrapper')]//input[@id='user-name']")));
        console.log('   XPath 1: //div[contains(@class,"login_wrapper")]//input[@id="user-name"]');
        console.log('   Найден элемент:', await xpathElem1.getAttribute('id'));
        
        // --- 6. Поиск по XPath ---
        console.log('\n6. Поиск по XPath (сложный):');
        let xpathElem2 = await driver.findElement(By.xpath("//input[@id='password' and @type='password']"));
        console.log('   XPath 2: //input[@id="password" and @type="password"]');
        console.log('   Найден элемент:', await xpathElem2.getAttribute('id'));
        
        // Авторизация
        console.log('\n--- Выполняем авторизацию ---');
        await driver.findElement(By.id('user-name')).sendKeys('standard_user');
        await driver.findElement(By.id('password')).sendKeys('secret_sauce');
        await driver.findElement(By.id('login-button')).click();
        
        // Ждем загрузки главной страницы
        await wait.until(EC.presenceOfElementLocated(By.className('inventory_list')));
        console.log('Авторизация выполнена успешно');
        
        // --- 7. Поиск по частичному тексту ---
        console.log('\n7. Поиск по частичному тексту ссылки:');
        let addButtons = await wait.until(EC.presenceOfAllElementsLocatedBy(By.xpath("//button[contains(text(),'Add')]")));
        console.log('   Найдено кнопок с текстом, содержащим "Add":', addButtons.length);
        
        // --- 8. Поиск нескольких элементов (список) ---
        console.log('\n8. Поиск нескольких элементов (список):');
        let items = await driver.findElements(By.className('inventory_item_name'));
        console.log('   Найдено товаров:', items.length);
        
        if (items.length > 0) {
            console.log('   Список товаров (первые 5):');
            for (let i = 0; i < Math.min(items.length, 5); i++) {
                let text = await items[i].getText();
                console.log(`     ${i+1}. ${text}`);
            }
        }
        
        console.log('\n=== Поиск элементов успешно завершен ===');
        
        await driver.sleep(2000);
        
    } catch (error) {
        console.error('Ошибка:', error.message);
    } finally {
        await driver.quit();
        console.log('Браузер закрыт');
    }
}

// Вспомогательные классы для ожиданий
class WebDriverWait {
    constructor(driver, timeout) {
        this.driver = driver;
        this.timeout = timeout;
    }
    
    async until(condition) {
        const startTime = Date.now();
        while (Date.now() - startTime < this.timeout) {
            try {
                const result = await condition(this.driver);
                if (result) return result;
            } catch (e) {}
            await this.driver.sleep(500);
        }
        throw new Error(`Timeout after ${this.timeout}ms`);
    }
}

const EC = {
    presenceOfElementLocated: (locator) => async (driver) => {
        return await driver.findElement(locator);
    },
    presenceOfAllElementsLocatedBy: (locator) => async (driver) => {
        return await driver.findElements(locator);
    }
};

findElementsExample();