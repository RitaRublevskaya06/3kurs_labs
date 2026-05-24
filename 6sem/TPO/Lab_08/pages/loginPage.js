const { By } = require('selenium-webdriver');
const BasePage = require('./basePage');

class LoginPage extends BasePage {
    constructor(driver) {
        super(driver);
        // Локаторы страницы
        this.usernameInput = By.id('user-name');
        this.passwordInput = By.id('password');
        this.loginButton = By.id('login-button');
        this.errorMessage = By.css('h3[data-test="error"]');
        this.logo = By.className('login_logo');
    }

    // Открыть страницу логина
    async open() {
        await super.open('https://www.saucedemo.com/');
    }

    // Ввести логин
    async enterUsername(username) {
        await this.type(this.usernameInput, username);
    }

    // Ввести пароль
    async enterPassword(password) {
        await this.type(this.passwordInput, password);
    }

    // Нажать кнопку логина
    async clickLogin() {
        await this.click(this.loginButton);
    }

    // Выполнить логин
    async login(username, password) {
        await this.enterUsername(username);
        await this.enterPassword(password);
        await this.clickLogin();
    }

    // Получить сообщение об ошибке
    async getErrorMessage() {
        return await this.getText(this.errorMessage);
    }

    // Проверить, отображается ли ошибка
    async isErrorDisplayed() {
        return await this.isDisplayed(this.errorMessage);
    }

    // Получить заголовок страницы
    async getLogoText() {
        return await this.getText(this.logo);
    }
}

module.exports = LoginPage;
