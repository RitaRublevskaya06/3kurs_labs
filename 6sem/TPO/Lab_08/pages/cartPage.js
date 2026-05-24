const { By } = require('selenium-webdriver');
const BasePage = require('./basePage');

class CartPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.cartItems = By.className('cart_item');
        this.cartItemName = By.className('inventory_item_name');
        this.checkoutButton = By.id('checkout');
        this.continueShoppingButton = By.id('continue-shopping');
        this.removeButton = By.css('button.cart_button');
    }

    async getItemCount() {
        const items = await this.findAll(this.cartItems);
        return items.length;
    }

    async getItemNames() {
        const names = await this.findAll(this.cartItemName);
        const nameTexts = [];
        for (const name of names) {
            nameTexts.push(await name.getText());
        }
        return nameTexts;
    }

    async proceedToCheckout() {
        // Ждем и скроллим к кнопке
        const element = await this.waitForVisible(this.checkoutButton);
        await this.scrollToElement(this.checkoutButton);
        await this.driver.sleep(500);
        await element.click();
    }

    async removeItem(index) {
        const removeButtons = await this.findAll(this.removeButton);
        if (index < removeButtons.length) {
            await removeButtons[index].click();
        }
    }

    async continueShopping() {
        await this.click(this.continueShoppingButton);
    }
}

module.exports = CartPage;
