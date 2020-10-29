"use strict";

// Public modules from npm
const puppeteer = require("puppeteer");

// Modules from file
const shared = require("./shared.js");

/**
 * @protected
 * Create a Chromium instance used to navigate with Puppeteer.
 * By default the browser is headless.
 * @returns {Promise<puppeteer.Browser>} Created browser
 */
module.exports.prepareBrowser = async function () {
    // Create a headless browser
    let browser = null;
    if (shared.chromiumLocalPath) {
        browser = await puppeteer.launch({
            executablePath: shared.chromiumLocalPath,
            headless: !shared.debug, // Use GUI when debug = true
        });
    } else {
        browser = await puppeteer.launch({
            headless: !shared.debug, // Use GUI when debug = true
        });
    }

    return browser;
};

/**
 * @protected
 * Prepare a page used to navigate the browser.
 * The page is set up to reject image download requests. The user agent is also changed.
 * @param {puppeteer.Browser} browser Browser to use when navigating where the page will be created
 * @returns {Promise<puppeteer.Page>} New page
 */
module.exports.preparePage = async function (browser) {
    // Create new page in the browser argument
    const page = await browser.newPage();

    // Block image download
    await page.setRequestInterception(true);
    page.on("request", (request) => {
        if (request.resourceType() === "image") request.abort();
        else if (request.resourceType === "font") request.abort();
        // else if (request.resourceType() == 'stylesheet') request.abort();
        // else if(request.resourceType == 'media') request.abort();
        else request.continue();
    });

    // Set custom user-agent
    const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
    await page.setUserAgent(userAgent);

    return page;
};
