const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

class BasePage {
    constructor(driver) {
        this.driver = driver;
        this.waitTimeout = 10000;
    }

    // Метод для открытия страницы
    async open(url) {
        await this.driver.get(url);
    }

    // Явное ожидание видимости элемента
    async waitForVisible(locator, timeout = this.waitTimeout) {
        return await this.driver.wait(until.elementLocated(locator), timeout);
    }

    // Явное ожидание кликабельности элемента
    async waitForClickable(locator, timeout = this.waitTimeout) {
        const element = await this.waitForVisible(locator, timeout);
        await this.driver.wait(until.elementIsEnabled(element), timeout);
        return element;
    }

    // Найти элемент
    async find(locator) {
        return await this.driver.findElement(locator);
    }

    // Найти несколько элементов
    async findAll(locator) {
        return await this.driver.findElements(locator);
    }

    // Клик по элементу
    async click(locator) {
        const element = await this.waitForClickable(locator);
        await element.click();
    }

    // Ввод текста
    async type(locator, text) {
        const element = await this.waitForVisible(locator);
        await element.clear();
        await element.sendKeys(text);
    }

    // Получить текст элемента
    async getText(locator) {
        const element = await this.waitForVisible(locator);
        return await element.getText();
    }

    // Проверить видимость элемента
    async isDisplayed(locator) {
        try {
            const element = await this.find(locator);
            return await element.isDisplayed();
        } catch {
            return false;
        }
    }

    // Скролл к элементу
    async scrollToElement(locator) {
        const element = await this.find(locator);
        await this.driver.executeScript("arguments[0].scrollIntoView(true);", element);
    }

    // Сделать скриншот
    async takeScreenshot(name) {
        const screenshotDir = path.join(__dirname, '../screenshots');
        if (!fs.existsSync(screenshotDir)) {
            fs.mkdirSync(screenshotDir, { recursive: true });
        }
        
        const screenshot = await this.driver.takeScreenshot();
        const filename = `${name}_${Date.now()}.png`;
        const filepath = path.join(screenshotDir, filename);
        fs.writeFileSync(filepath, screenshot, 'base64');
        console.log(`Скриншот сохранен: ${filepath}`);
        return filepath;
    }

    // Получить все cookies
    async getAllCookies() {
        const cookies = await this.driver.manage().getCookies();
        console.log('Все cookies:');
        cookies.forEach(cookie => {
            console.log(`  - ${cookie.name}: ${cookie.value}`);
        });
        return cookies;
    }

    // Добавить cookie
    async addCookie(name, value) {
        await this.driver.manage().addCookie({ name, value });
        console.log(`Добавлен cookie: ${name}=${value}`);
    }

    // Удалить cookie
    async deleteCookie(name) {
        await this.driver.manage().deleteCookie(name);
        console.log(`Удален cookie: ${name}`);
    }

    // Ожидание
    async sleep(ms) {
        await this.driver.sleep(ms);
    }
}

module.exports = BasePage;