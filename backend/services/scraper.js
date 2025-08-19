const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');

async function scrapeProduct(url) {
    let driver;
    try {
        const options = new chrome.Options();
        options.addArguments('--headless');
        options.addArguments('--disable-gpu');
        options.addArguments('--no-sandbox');
        options.addArguments('--disable-dev-shm-usage');
        options.addArguments("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36");

        driver = await new Builder()
            .forBrowser('chrome')
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
    const data = {};

    try {
        await driver.wait(until.elementLocated(By.css('h1.x-item-title__mainTitle')), 30000);
        data.name = await driver.findElement(By.css('h1.x-item-title__mainTitle .ux-textspans')).getText();
    } catch (e) {
        console.log('Name not found');
        data.name = '';
    }

    try {
        const priceString = await driver.findElement(By.css('.x-price-primary .ux-textspans')).getText();
        data.price = parseFloat(priceString.replace(/[^0-9.]/g, ''));
    } catch (e) {
        console.log('Price not found');
        data.price = 0;
    }

    try {
        const iframe = await driver.findElement(By.css('iframe#desc_ifr'));
        await driver.switchTo().frame(iframe);
        data.description = await driver.findElement(By.css('div#ds_div')).getText();
        await driver.switchTo().defaultContent();
    } catch (e) {
        console.log('Description not found, trying alternative.');
        try {
            data.description = await driver.findElement(By.css('#viTabs_0_is')).getText();
        } catch (e2) {
            console.log('Alternative description not found');
            data.description = '';
        }
    }

    try {
        const imageElements = await driver.findElements(By.css('.ux-image-carousel-item img'));
        data.images = await Promise.all(imageElements.map(async (el) => {
            const src = await el.getAttribute('data-src');
            return src || el.getAttribute('src');
        }));
    } catch (e) {
        console.log('Images not found');
        data.images = [];
    }
    
    data.image = data.images[0] || '';

    try {
        data.brand = await driver.findElement(By.css('.x-sellercard-atf__info__about-seller .ux-textspans--BOLD')).getText();
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
