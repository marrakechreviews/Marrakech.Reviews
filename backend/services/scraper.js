const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const chromium = require('@sparticuz/chromium');

async function scrapeProduct(url) {
    let driver;
    try {
        const options = new chrome.Options();
        // Required arguments for serverless environments
        options.addArguments(...chromium.args);
        options.addArguments('--headless'); // Ensure headless mode
        // Set the path to the Chrome executable provided by @sparticuz/chromium
        options.setChromeBinaryPath(await chromium.executablePath());

        // Set the path to the chromedriver executable
        const service = new chrome.ServiceBuilder(chromium.driver);

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeService(service)
            .setChromeOptions(options)
            .build();

        await driver.get(url);

        if (url.includes('ebay.com')) {
            return await scrapeEbay(driver);
        } else if (url.includes('etsy.com')) {
            return await scrapeEtsy(driver);
        } else {
            throw new Error('Unsupported website');
        }
    } catch (error) {
        if (driver) {
            const screenshot = await driver.takeScreenshot();
            fs.writeFileSync('debug-screenshot.png', screenshot, 'base64');
        }
        throw error;
    }
    finally {
        if (driver) {
            await driver.quit();
        }
    }
}

async function scrapeEbay(driver) {
    await driver.wait(until.elementLocated(By.css('#mainContent')), 10000);

    const data = {};

    try {
        data.name = await driver.findElement(By.css('.x-item-title__mainTitle')).getText();
    } catch (e) {
        console.log('Name not found');
        data.name = '';
    }

    try {
        const priceString = await driver.findElement(By.css('.x-price-primary')).getText();
        data.price = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    } catch (e) {
        console.log('Price not found');
        data.price = 0;
    }

    try {
        const descriptionElement = await driver.findElement(By.css('div.product-description-features'));
        data.description = await descriptionElement.getText();
    } catch (e) {
        console.log('Description not found, using title as fallback.');
        data.description = data.name; // Fallback to title
    }

    try {
        const imageElement = await driver.findElement(By.xpath('/html/body/div[2]/main/div[1]/div[1]/div[4]/div/div/div[1]/div[1]/div/div[1]/div[1]/div[2]/div[4]/div[3]/img'));
        data.image = await imageElement.getAttribute('src');
        data.images = [data.image];
    } catch (e) {
        console.log('Image not found');
        data.image = '';
        data.images = [];
    }

    try {
        data.brand = await driver.findElement(By.css('a[data-testid="x-sellercard-atf__seller-info__link"]')).getText();
    } catch (e) {
        console.log('Seller not found');
        data.brand = '';
    }

    return data;
}

async function scrapeEtsy(driver) {
    const data = {};

    try {
        data.name = await driver.findElement(By.css('h1.wt-text-body-03')).getText();
    } catch (e) {
        console.log('Name not found');
        data.name = '';
    }

    try {
        const priceString = await driver.findElement(By.css('p.wt-text-title-03')).getText();
        data.price = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    } catch (e) {
        console.log('Price not found');
        data.price = 0;
    }

    try {
        // Etsy has a button to expand the description
        const descriptionButton = await driver.findElement(By.css('button#listing-page-description-button'));
        await descriptionButton.click();
        await driver.wait(until.elementIsVisible(driver.findElement(By.css('.wt-content-toggle__body'))), 5000);
        const descriptionElement = await driver.findElement(By.css('.wt-content-toggle__body [data-id="description-text"] p'));
        data.description = await descriptionElement.getText();
    } catch (e) {
        console.log('Description not found');
        data.description = '';
    }

    try {
        const imageElements = await driver.findElements(By.css('.wt-position-absolute img'));
        data.images = await Promise.all(imageElements.map(el => el.getAttribute('src')));
    } catch (e) {
        console.log('Images not found');
        data.images = [];
    }

    data.image = data.images[0] || '';

    try {
        data.brand = await driver.findElement(By.css('.wt-text-body-01')).getText();
    } catch (e) {
        console.log('Seller not found');
        data.brand = '';
    }

    return data;
}

module.exports = {
    scrapeProduct,
};