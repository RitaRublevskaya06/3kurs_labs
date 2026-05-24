const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const LoginPage = require('./pages/loginPage');
const InventoryPage = require('./pages/inventoryPage');
const CartPage = require('./pages/cartPage');
const CheckoutPage = require('./pages/checkoutPage');

async function createDriver(language = 'en') {
    const options = new chrome.Options();
    
    // Основные опции
    options.addArguments('--start-maximized');
    options.addArguments('--disable-notifications');
    options.addArguments('--disable-popup-blocking');
    options.addArguments('--lang=' + language);
    
    // Опции для отключения предупреждений о паролях
    options.addArguments('--disable-save-password-bubble');
    options.addArguments('--disable-features=PasswordImport,PasswordCheck,PasswordLeakDetection');
    options.addArguments('--disable-features=PasswordLeakDetection');
    options.addArguments('--disable-password-manager-reauthentication');
    
    // Дополнительные опции для отключения ненужных сервисов
    options.addArguments('--disable-background-networking');
    options.addArguments('--disable-default-apps');
    options.addArguments('--disable-sync');
    options.addArguments('--disable-web-security');
    options.addArguments('--no-first-run');
    options.addArguments('--no-default-browser-check');
    
    // Настройки пользователя
    options.setUserPreferences({
        'credentials_enable_service': false,
        'profile.password_manager_enabled': false,
        'profile.default_content_setting_values.notifications': 2,
        'profile.default_content_settings.popups': 0,
        'safebrowsing.enabled': false
    });
    
    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();
    
    await driver.manage().setTimeouts({ implicit: 5000, pageLoad: 30000 });
    
    return driver;
}

async function setupBrowser(language = 'en') {
    const driver = await createDriver(language);
    const pages = {
        loginPage: new LoginPage(driver),
        inventoryPage: new InventoryPage(driver),
        cartPage: new CartPage(driver),
        checkoutPage: new CheckoutPage(driver)
    };
    
    return { driver, pages };
}

async function loginWithCookies(driver) {
    const cookies = await driver.manage().getCookies();
    const fs = require('fs');
    const path = require('path');
    const cookieFile = path.join(__dirname, 'cookies.json');
    fs.writeFileSync(cookieFile, JSON.stringify(cookies, null, 2));
    console.log('Cookies сохранены в файл');
    return cookies;
}

async function loadCookies(driver) {
    const fs = require('fs');
    const path = require('path');
    const cookieFile = path.join(__dirname, 'cookies.json');
    
    if (fs.existsSync(cookieFile)) {
        const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));
        for (const cookie of cookies) {
            try {
                await driver.manage().addCookie(cookie);
            } catch (err) {
                console.log(`Не удалось добавить cookie ${cookie.name}: ${err.message}`);
            }
        }
        console.log('Cookies загружены из файла');
        return true;
    }
    return false;
}

module.exports = {
    createDriver,
    setupBrowser,
    loginWithCookies,
    loadCookies
};