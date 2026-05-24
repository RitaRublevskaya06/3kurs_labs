const { By, until } = require('selenium-webdriver');
const BasePage = require('./basePage');
const { Select } = require('selenium-webdriver');

class InventoryPage extends BasePage {
    constructor(driver) {
        super(driver);
        this.title = By.className('title');
        this.inventoryList = By.className('inventory_list');
        this.sortDropdown = By.className('product_sort_container');
        this.cartBadge = By.className('shopping_cart_badge');
        this.cartLink = By.className('shopping_cart_link');
    }

    getAddToCartButton(productName) {
        const id = productName.toLowerCase().replace(/\s/g, '-');
        return By.id(`add-to-cart-${id}`);
    }

    async isPageLoaded() {
        return await this.isDisplayed(this.inventoryList);
    }

    async getTitle() {
        return await this.getText(this.title);
    }

    async addToCart(productName) {
        const button = this.getAddToCartButton(productName);
        await this.click(button);
        console.log(`Товар добавлен в корзину: ${productName}`);
    }

    async getCartCount() {
        try {
            // Ждем появления счетчика
            await this.driver.wait(until.elementLocated(this.cartBadge), 3000);
            const element = await this.find(this.cartBadge);
            const text = await element.getText();
            return parseInt(text);
        } catch (err) {
            return 0;
        }
    }

    async goToCart() {
        await this.click(this.cartLink);
    }

    async sortBy(option) {
        const dropdown = await this.find(this.sortDropdown);
        const select = new Select(dropdown);
        await select.selectByVisibleText(option);
        await this.sleep(500);
        console.log(`Сортировка применена: ${option}`);
    }

    async getAllPrices() {
        const prices = await this.findAll(By.className('inventory_item_price'));
        const priceTexts = [];
        for (const price of prices) {
            const text = await price.getText();
            priceTexts.push(parseFloat(text.replace('$', '')));
        }
        return priceTexts;
    }

    async getAllNames() {
        const names = await this.findAll(By.className('inventory_item_name'));
        const nameTexts = [];
        for (const name of names) {
            nameTexts.push(await name.getText());
        }
        return nameTexts;
    }
}

module.exports = InventoryPage;