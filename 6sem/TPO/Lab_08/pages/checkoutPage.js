const { By } = require('selenium-webdriver');
const BasePage = require('./basePage');

class CheckoutPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.firstNameInput = By.id('first-name');
        this.lastNameInput = By.id('last-name');
        this.postalCodeInput = By.id('postal-code');
        this.continueButton = By.id('continue');
        this.finishButton = By.id('finish');
        this.cancelButton = By.id('cancel');
        this.completeHeader = By.className('complete-header');
        this.completeText = By.className('complete-text');
        this.backHomeButton = By.id('back-to-products');
    }

    async fillCheckoutInfo(firstName, lastName, postalCode) {
        await this.type(this.firstNameInput, firstName);
        await this.type(this.lastNameInput, lastName);
        await this.type(this.postalCodeInput, postalCode);
    }

    async clickContinue() {
        await this.click(this.continueButton);
    }

    async clickFinish() {
        await this.click(this.finishButton);
    }

    async getSuccessMessage() {
        return await this.getText(this.completeHeader);
    }

    async completeCheckout(firstName, lastName, postalCode) {
        await this.fillCheckoutInfo(firstName, lastName, postalCode);
        await this.clickContinue();
        await this.clickFinish();
    }

    async backToHome() {
        await this.click(this.backHomeButton);
    }
}

module.exports = CheckoutPage;
