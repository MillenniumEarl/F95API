'use strict';
const path = require('path');
const fs = require('fs');
const UserData = require('./scripts/user-data').UserData;
const LoginResult = require('./scripts/login-result').LoginResult;
const GameInfo = require('./scripts/game-info').GameInfo;
const GameDownload = require('./scripts/game-download').GameDownload;
const HTMLParser = require('node-html-parser');
const puppeteer = require('puppeteer');
const urlExist = require('url-exist');

//#region URL
const F95_BASE_URL = 'https://f95zone.to';
const F95_SEARCH_URL = 'https://f95zone.to/search';
const F95_LATEST_UPDATES = 'https://f95zone.to/latest';
const F95_LOGIN_URL = 'https://f95zone.to/login';
const F95_WATCHED_THREADS = 'https://f95zone.to/watched/threads';
//#endregion

//#region CSS Selectors
const SEARCH_FORM_TEXTBOX = 'input[name="keywords"]';
const PASSWORD_INPUT = 'input[name="password"]';
const USERNAME_INPUT = 'input[name="login"]';
const LOGIN_BUTTON = 'button.button--icon--login';
const AVATAR_INFO = 'span.avatar';
const TITLE_ONLY_CHECKBOX = 'form.block > * input[name="c[title_only]"]';
const SEARCH_BUTTON = 'form.block > * button.button--icon--search';
const ENGINE_ID_SELECTOR = 'div[id^="btn-prefix_1_"]>span';
const STATUS_ID_SELECTOR = 'div[id^="btn-prefix_4_"]>span';
const THREAD_TITLE = 'h3.contentRow-title';
const THREAD_POSTS = 'article.message-body:first-child > div.bbWrapper:first-of-type';
const GAME_TITLE = 'h1.p-title-value';
const GAME_IMAGES = 'img[src^="https://attachments.f95zone.to"]';
const LOGIN_MESSAGE_ERROR = 'div.blockMessage.blockMessage--error.blockMessage--iconic';
const GAME_TAGS = 'a.tagItem';
const USERNAME_ELEMENT = 'a[href="/account/"] > span.p-navgroup-linkText';
const AVATAR_PIC = 'a[href="/account/"] > span.avatar > img[class^="avatar"]';
const UNREAD_THREAD_CHECKBOX = 'input[type="checkbox"][name="unread"]';
const ONLY_GAMES_THREAD_OPTION = 'select[name="nodes[]"] > option[value="2"]';
const FILTER_THREADS_BUTTON = 'button[class="button--primary button"]';
const GAME_TITLE_PREFIXES = 'h1.p-title-value > a.labelLink > span[dir="auto"]';
const WATCHED_THREAD_URLS = 'a[href^="/threads/"][data-tp-primary]';
const WATCHED_THREAD_NEXT_PAGE = 'a.pageNav-jump--next';
const WATCHED_THREAD_FILTER_POPUP_BUTTON = 'a.filterBar-menuTrigger';
//#endregion CSS Selectors

//#region Game prefixes
const MOD_PREFIX = 'MOD';
const GAME_RECOMMENDATION_PREFIX = 'RECOMMENDATION';
//#endregion Game prefixes

//#region Directories
const CACHE_PATH = './f95cache';
const COOKIES_SAVE_PATH = path.join(CACHE_PATH, 'cookies.json');
const ENGINES_SAVE_PATH = path.join(CACHE_PATH, 'engines.json');
const STATUSES_SAVE_PATH = path.join(CACHE_PATH, 'statuses.json');

// Create directory if it doesn't exist
if (!fs.existsSync(CACHE_PATH)) fs.mkdirSync(CACHE_PATH);
//#endregion Directories

//#region Various
const WAIT_STATEMENT = 'domcontentloaded';
//#endregion Various

//#region Fields
/**
 * @private
 * @type Object[]
 */
let _cookies = loadCookies();
/**
 * @private
 * @type String[]
 */
let _engines = null;
/**
 * @private
 * @type String[]
 */
let _statuses = null;
/** @private
 * @type Boolean
 */
let _isLogged = false;
/**
 * @private
 * @type Boolean
 */
let _debug = false;
//#endregion Fields

//#region Properties
/**
 * 
 * @param {Boolean} value 
 */
module.exports.debug = function (value) {
    _debug = value;
}
module.exports.isLogged = function () {
    return _isLogged;
};
//#endregion Properties

//#region Export methods
/**
 * @public
 * Log in to the F95Zone platform.
 * This **must** be the first operation performed before accessing any other script functions.
 * @param {String} username Username used for login
 * @param {String} password Password used for login
 * @returns {Promise<LoginResult>} Result of the operation
 */
module.exports.login = async function (username, password) {
    if (_isLogged) {
        if (_debug) console.log("Already logged in");
        let result = new LoginResult();
        result.success = true;
        result.message = 'Already logged in';
        return result;
    }

    // If cookies are loaded, use them to authenticate
    if (_cookies !== null) {
        if (_debug) console.log('Valid session, no need to re-authenticate');
        _isLogged = true;
        let result = new LoginResult();
        result.success = true;
        result.message = 'Logged with cookies';
        return result;
    }

    // Else, log in throught browser
    if (_debug) console.log('No saved sessions or expired session, login on the platform');
    let browser = await prepareBrowser();
    let result = await loginF95(browser, username, password);
    _isLogged = result.success;

    if (result.success) {
        // Reload cookies
        _cookies = loadCookies();
        if (_debug) console.log('User logged in through the platform');
    } else {
        console.warn('Error during authentication: ' + result.message);
    }
    await browser.close();
    return result;
}
/**
 * @public
 * This method loads the main data from the F95 portal 
 * used to provide game information. You **must** be logged 
 * in to the portal before calling this method.
 * @returns {Promise<Boolean>} Result of the operation
 */
module.exports.loadF95BaseData = async function () {
    if (!_isLogged) {
        console.warn('User not authenticated, unable to continue');
        return false;
    }

    if (_debug) console.log('Loading base data...');

    // Prepare a new web page
    let browser = await prepareBrowser();
    let page = await preparePage(browser); // Set new isolated page
    await page.setCookie(..._cookies); // Set cookies to avoid login

    // Go to latest update page and wait for it to load
    await page.goto(F95_LATEST_UPDATES, {
        waitUntil: WAIT_STATEMENT
    });

    // Obtain engines (disc/online)
    await page.waitForSelector(ENGINE_ID_SELECTOR);
    _engines = await loadValuesFromLatestPage(page, ENGINES_SAVE_PATH, ENGINE_ID_SELECTOR, 'engines');

    // Obtain statuses (disc/online)
    await page.waitForSelector(STATUS_ID_SELECTOR);
    _statuses = await loadValuesFromLatestPage(page, STATUSES_SAVE_PATH, STATUS_ID_SELECTOR, 'statuses');

    await browser.close();
    if (_debug) console.log('Base data loaded');
    return true;
}
/**
 * @public
 * Returns the currently online version of the specified game. 
 * You **must** be logged in to the portal before calling this method.
 * @param {GameInfo} info Information about the game to get the version for
 * @returns {Promise<String>} Currently online version of the specified game
 */
module.exports.getGameVersion = async function (info) {
    if (!_isLogged) {
        console.warn('user not authenticated, unable to continue');
        return info.version;
    }

    let urlExists = await urlExist(info.f95url.toString());

    // F95 change URL at every game update, so if the URL is the same no update is available
    if (urlExists) return info.version;
    else return await module.exports.getGameData(info.name, info.isMod).version;
}
/**
 * @public
 * Starting from the name, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} name Name of the game searched
 * @param {Boolean} includeMods Indicates whether to also take mods into account when searching
 * @returns {Promise<GameInfo[]>} List of information obtained where each item corresponds to 
 * an identified game (in the case of homonymy). If no games were found, null is returned
 */
module.exports.getGameData = async function (name, includeMods) {
    if (!_isLogged) {
        console.warn('user not authenticated, unable to continue');
        return null;
    }

    // Gets the search results of the game being searched for
    let browser = await prepareBrowser();
    let urlList = await getSearchGameResults(browser, name, _cookies);

    // Process previous partial results
    let promiseList = [];
    for (let url of urlList) {
        // Start looking for information
        promiseList.push(getGameInfo(browser, url));
    }

    // Filter for mods
    let result = [];
    for (let info of await Promise.all(promiseList)) {
        // Skip mods if not required
        if (info.isMod && !includeMods) continue;
        else result.push(info);
    }

    await browser.close();
    return result;
}
/**
 * @deprecated
 * @public
 * @param {*} platform 
 * @param {*} url 
 */
module.exports.getDownloadLink = async function (platform, url) {
    if (!_isLogged) {
        console.warn('user not authenticated, unable to continue');
        return null;
    }

    // Gets the search results of the game being searched for
    let browser = await prepareBrowser();
    getGameDownloadLink(browser, url);
    await browser.close();
}
/**
 * @public
 * Gets the data of the currently logged in user.
 * @returns {Promise<UserData>} Data of the user currently logged in or null if an error arise
 */
module.exports.getUserData = async function () {
    if (!_isLogged) {
        console.warn('user not authenticated, unable to continue');
        return null;
    }

    // Prepare a new web page
    let browser = await prepareBrowser();
    let page = await preparePage(browser); // Set new isolated page
    await page.setCookie(..._cookies); // Set cookies to avoid login
    await page.goto(F95_BASE_URL); // Go to base page

    // Explicitly wait for the required items to load
    await page.waitForSelector(USERNAME_ELEMENT);
    await page.waitForSelector(AVATAR_PIC);

    let threads = getUserWatchedGameThreads(browser);

    let username = await page.evaluate((selector) =>
        document.querySelector(selector).innerText,
        USERNAME_ELEMENT);

    let avatarSrc = await page.evaluate((selector) =>
        document.querySelector(selector).getAttribute('src'),
        AVATAR_PIC);

    let ud = new UserData();
    ud.username = username;
    ud.avatarSrc = isStringAValidURL(avatarSrc) ? new URL(avatarSrc) : null;
    ud.watchedThreads = await threads;

    await page.close();
    await browser.close();

    return ud;
}
//#endregion

//#region Private methods

//#region Puppeteer helpers
/**
 * @private
 * Create a Chromium instance used to navigate with Puppeteer. 
 * By default the browser is headless.
 * @returns {Promise<puppeteer.Browser>} Created browser
 */
async function prepareBrowser() {
    // Create a headless browser
    let browser = await puppeteer.launch({
        headless: false,
    });

    return browser;
}

/**
 * @private
 * Prepare a page used to navigate the browser.
 * The page is set up to reject image download requests. The user agent is also changed.
 * @param {puppeteer.Browser} browser Browser to use when navigating where the page will be created
 * @returns {Promise<puppeteer.Page>} New page
 */
async function preparePage(browser) {
    // Create new page in the browser argument
    let page = await browser.newPage();

    // Block image download
    await page.setRequestInterception(true);
    page.on('request', (request) => {
        if (request.resourceType() === 'image') request.abort();
        // else if(request.resourceType == 'font') request.abort();
        // else if(request.resourceType == 'media') request.abort();
        else request.continue();
    });

    // Set custom user-agent
    let userAgent = 'Mozilla/5.0 (X11; Linux x86_64)' +
        'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36';
    await page.setUserAgent(userAgent);

    return page;
}
//#endregion

//#region Cookies functions
/**
 * @private
 * Loads and verifies the expiration of previously stored cookies from disk
 * if they exist, otherwise it returns null.
 * @return {object[]} List of dictionaries or null if cookies don't exist
 */
function loadCookies() {
    // Check the existence of the cookie file
    if (fs.existsSync(COOKIES_SAVE_PATH)) {
        // Read cookies
        let cookiesJSON = fs.readFileSync(COOKIES_SAVE_PATH);
        let cookies = JSON.parse(cookiesJSON);

        // Check if the cookies have expired
        for (let cookie of cookies) {
            if (isCookieExpired(cookie)) return null;
        }

        // Cookies loaded and verified
        return cookies;

    } else return null;
}

/**
 * @private
 * Check the validity of a cookie.
 * @param {object} cookie Cookies to verify the validity. It's a dictionary
 * @returns {Boolean} true if the cookie has expired, false otherwise
 */
function isCookieExpired(cookie) {
    // Local variables
    let expiredCookies = false;

    // Ignore cookies that never expire 
    let expirationUnixTimestamp = cookie['expire'];

    if (expirationUnixTimestamp !== '-1') {
        // Convert UNIX epoch timestamp to normal Date
        let expirationDate = new Date(expirationUnixTimestamp * 1000);

        if (expirationDate < Date.now()) {
            if (_debug) console.log('Cookie ' + cookie['name'] + ' expired, you need to re-authenticate');
            expiredCookies = true;
        }
    }

    return expiredCookies;
}
//#endregion Cookies functions

//#region Latest Updates page parserer
/**
 * @private
 * If present, it reads the file containing the searched values (engines or states) 
 * from the disk, otherwise it connects to the F95 portal (at the page 
 * https://f95zone.to/latest) and downloads them.
 * @param {puppeteer.Page} page Page used to locate the required elements
 * @param {String} path Path to disk of the JSON file containing the data to read / write
 * @param {String} selector CSS selector of the required elements
 * @param {String} elementRequested Required element (engines or states) used to detail log messages
 * @returns {Promise<String[]>} List of required values in uppercase
 */
async function loadValuesFromLatestPage(page, path, selector, elementRequested) {
    // If the values already exist they are loaded from disk without having to connect to F95
    if (_debug) console.log('Load ' + elementRequested + ' from disk...');
    if (fs.existsSync(path)) {
        let valueJSON = fs.readFileSync(path);
        return JSON.parse(valueJSON);
    }

    // Otherwise, connect and download the data from the portal
    if (_debug) console.log('No ' + elementRequested + ' cached, downloading...');
    let values = await getValuesFromLatestPage(page, selector, 'Getting ' + elementRequested + ' from page');
    fs.writeFileSync(path, JSON.stringify(values));
    return values;
}

/**
 * @private
 * Gets all the textual values of the elements present 
 * in the F95 portal page and identified by the selector 
 * passed by parameter
 * @param {puppeteer.Page} page Page used to locate items specified by the selector
 * @param {String} selector CSS selector
 * @param {String} logMessage Log message indicating which items the selector is requesting
 * @return {Promise<String[]>} List of uppercase strings indicating the textual values of the elements identified by the selector
 */
async function getValuesFromLatestPage(page, selector, logMessage) {
    if (_debug) console.log(logMessage);

    let result = [];
    let elements = await page.$$(selector);

    for (let element of elements) {
        let text = await element.evaluate(e => e.innerText);

        // Save as upper text for better match if used in query
        result.push(text.toUpperCase());
    }
    return result;
}
//#endregion

//#region URL methods
/**
 * @private
 * Check if the url belongs to the domain of the F95 platform.
 * @param {URL} url URL to check
 * @returns {Boolean} true if the url belongs to the domain, false otherwise
 */
function isF95URL(url) {
    if (url.toString().startsWith(F95_BASE_URL)) return true;
    else return false;
}

/**
 * @private
 * Checks if the string passed by parameter has a properly formatted and valid path to a URL.
 * @param {String} url String to check for correctness
 * @returns {Boolean} true if the string is a valid URL, false otherwise
 */
function isStringAValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}
//#endregion

//#region User
/**
 * @private
 * Log in to the F95Zone portal and, if successful, save the cookies.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @param {String} username Username to use during login
 * @param {String} password Password to use during login
 * @returns {Promise<LoginResult>} Result of the operation
 */
async function loginF95(browser, username, password) {
    let page = await preparePage(browser); // Set new isolated page
    await page.goto(F95_LOGIN_URL); // Go to login page

    // Explicitly wait for the required items to load
    await page.waitForSelector(USERNAME_INPUT);
    await page.waitForSelector(PASSWORD_INPUT);
    await page.waitForSelector(LOGIN_BUTTON);
    await page.type(USERNAME_INPUT, username); // Insert username
    await page.type(PASSWORD_INPUT, password); // Insert password
    await Promise.all([
        page.click(LOGIN_BUTTON), // Click on the login button
        page.waitForNavigation({
            waitUntil: WAIT_STATEMENT
        }), // Wait for page to load
    ]);
    await page.waitForSelector(AVATAR_INFO);

    // Prepare result
    let result = new LoginResult();

    // Check if the user is logged in
    result.success = await page.evaluate((selector) => document.querySelector(selector) !== null, AVATAR_INFO);

    // Save cookies to avoid re-auth
    if (result.success) {
        const cookies = await page.cookies();
        fs.writeFileSync(COOKIES_SAVE_PATH, JSON.stringify(cookies));
        result.message = 'Authentication successful';
    }
    // Obtain the error message
    else if (await page.evaluate((selector) => document.querySelector(selector) !== null, LOGIN_MESSAGE_ERROR)) {
        let errorMessage = await page.evaluate((selector) => document.querySelector(selector).innerText, LOGIN_MESSAGE_ERROR);
        if (errorMessage === 'Incorrect password. Please try again.') result.message = 'Incorrect password';
        else if (errorMessage === "The requested user '" + username + "' could not be found.") result.message = 'Incorrect username';
        else result.message = errorMessage;
    } else result.message = "Unknown error";
    await page.close(); // Close the page

    return result;
}

/**
 * @private
 * Gets the list of URLs of threads the user follows.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @returns {Promise<URL[]>} URL list
 */
async function getUserWatchedGameThreads(browser) {
    let page = await preparePage(browser); // Set new isolated page
    await page.goto(F95_WATCHED_THREADS); // Go to the thread page

    // Explicitly wait for the required items to load
    await page.waitForSelector(WATCHED_THREAD_FILTER_POPUP_BUTTON);

    // Show the popup
    await page.click(WATCHED_THREAD_FILTER_POPUP_BUTTON);
    await page.waitForSelector(UNREAD_THREAD_CHECKBOX);
    await page.waitForSelector(ONLY_GAMES_THREAD_OPTION);
    await page.waitForSelector(FILTER_THREADS_BUTTON);

    // Set the filters
    await page.evaluate((selector) =>
        document.querySelector(selector).removeAttribute('checked'),
        UNREAD_THREAD_CHECKBOX); // Also read the threads already read

    await page.click(ONLY_GAMES_THREAD_OPTION);

    // Filter the threads
    await page.click(FILTER_THREADS_BUTTON);
    await page.waitForSelector(WATCHED_THREAD_URLS);

    // Get the threads urls
    let urls = [];
    let nextPageExists = false;
    do {
        // Get all the URLs
        for (let handle of await page.$$(WATCHED_THREAD_URLS)) {
            let src = await page.evaluate((element) => element.href, handle);
            // If 'unread' is left, it will redirect to the last unread post
            let url = new URL(src.replace('/unread', ''));
            urls.push(url);
        }

        nextPageExists = await page.evaluate((selector) =>
            document.querySelector(selector),
            WATCHED_THREAD_NEXT_PAGE);

        // Click to next page
        if (nextPageExists) {
            await page.click(WATCHED_THREAD_NEXT_PAGE);
            await page.waitForSelector(WATCHED_THREAD_URLS);
        }
    }
    while (nextPageExists);

    await page.close();
    return urls;
}
//#endregion User

//#region Game data parser
/**
 * @private
 * Get information from the game's main page.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @param {URL} url URL of the game/mod to extract data from
 * @return {Promise<GameInfo>} Complete information about the game you are looking for
 */
async function getGameInfo(browser, url) {
    if (_debug) console.log('Obtaining game info');

    // Verify the correctness of the URL
    if (!isF95URL(url)) throw url + ' is not a valid F95Zone URL';
    let exists = await urlExist(url.toString());
    if (!exists) return new GameInfo();

    let page = await preparePage(browser); // Set new isolated page
    await page.setCookie(..._cookies); // Set cookies to avoid login
    await page.goto(url.toString(), {
        waitUntil: WAIT_STATEMENT
    }); // Go to the game page and wait until it loads

    // Object to fill with information
    let info = new GameInfo();

    // Get the game/mod name (without square brackets)
    let title = getGameTitle(page);

    // Get the game/mod author (without square brackets)
    let author = getGameAuthor(page);

    // Get the game tags
    let tags = getGameTags(page);

    // Get the game title image (the first is what we are searching)
    let previewSource = await getGamePreviewSource(page);
    if (previewSource === null) console.warn('Cannot find game preview image for ' + await title);

    // Parse the prefixes
    info = await parsePrefixes(page, info); // Fill status/engines/isMod

    // Gets the first post, where are listed all the game's informations
    let post = (await page.$$(THREAD_POSTS))[0];

    // The info are plain text so we need to parse the HTML code
    let bodyHTML = await page.evaluate((mainPost) => mainPost.innerHTML, post);
    let structuredText = HTMLParser.parse(bodyHTML).structuredText;

    // Get overview (different parsing for game and mod)
    let overviewEndIndex;
    if (info.isMod) overviewEndIndex = structuredText.indexOf('Updated');
    else overviewEndIndex = structuredText.indexOf('Thread Updated');
    let overview = structuredText.substring(0, overviewEndIndex).replace('Overview:\n', '').trim();

    // Parse all the information in the format DESCRIPTION : VALUE
    let parsedInfos = parseConversationPage(structuredText);

    // Fill in the GameInfo element with the information obtained
    info.name = await title;
    info.author = await author;
    info.overview = overview;
    info.tags = await tags;
    info.f95url = url;
    info.version = info.isMod ? parsedInfos['MOD VERSION'] : parsedInfos['VERSION'];
    info.lastUpdate = info.isMod ? parsedInfos['UPDATED'] : parsedInfos['THREAD UPDATED'];
    info.previewSource = previewSource;

    await page.close(); // Close the page
    if (_debug) console.log('Founded data for ' + info.name);
    return info;
}

/**
 * @private
 * Extrapolates and cleans the author from the page passed by parameter.
 * @param {puppeteer.Page} page Page containing the author to be extrapolated
 * @returns {Promise<String>} Game author
 */
async function getGameAuthor(page) {
    // Get the game/mod name (without square brackets)
    let titleHTML = await page.evaluate((selector) => document.querySelector(selector).innerHTML, GAME_TITLE);
    let structuredTitle = HTMLParser.parse(titleHTML);

    // The last element **shoud be** the title without prefixes (engines, status, other...)
    let gameTitle = structuredTitle.childNodes.pop().rawText;

    // The last square brackets contain the author
    let startTitleIndex = gameTitle.lastIndexOf('[') + 1;
    return gameTitle.substring(startTitleIndex, gameTitle.length - 1).trim();
}

/**
 * @private
 * Process the post text to get all the useful 
 * information in the format *DESCRIPTOR : VALUE*.
 * @param {String} text Structured text of the post
 * @returns {Object} Dictionary of information
 */
function parseConversationPage(text) {
    let dataPairs = {};

    // The information searched in the game post are one per line
    let splittedText = text.split('\n');
    for (let line of splittedText) {

        if (!line.includes(':')) continue;

        // Create pair key/value
        let splitted = line.split(':');
        let key = splitted[0].trim().toUpperCase(); // Uppercase to avoid mismatch
        let value = splitted[1].trim();

        // Add pair to the dict if valid
        if (value != '') dataPairs[key] = value;
    }

    return dataPairs;
}

/**
 * @private
 * Gets the URL of the image used as a preview for the game in the conversation.
 * @param {puppeteer.Page} page Page containing the URL to be extrapolated
 * @returns {Promise<URL>} URL of the image or null if failed to get it
 */
async function getGamePreviewSource(page) {
    let src = await page.evaluate((selector) => {
        // Get the firs image available
        let img = document.querySelector(selector);

        if (img === null || img === undefined) return null;
        else return img.getAttribute('src');
    }, GAME_IMAGES);

    // Check if the URL is valid
    return isStringAValidURL(src) ? new URL(src) : null;
}

/**
 * @private
 * Extrapolates and cleans the title from the page passed by parameter.
 * @param {puppeteer.Page} page Page containing the title to be extrapolated
 * @returns {Promise<String>} Game title
 */
async function getGameTitle(page) {
    // Get the game/mod name (without square brackets)
    const titleHTML = await page.evaluate((selector) => document.querySelector(selector).innerHTML, GAME_TITLE);
    const structuredTitle = HTMLParser.parse(titleHTML);

    // The last element **shoud be** the title without prefixes (engines, status, other...)
    let gameTitle = structuredTitle.childNodes.pop().rawText;
    const endTitleIndex = gameTitle.indexOf('[');
    return gameTitle.substring(0, endTitleIndex).trim();
}

/**
 * @private
 * Get the list of tags associated with the game.
 * @param {puppeteer.Page} page Page containing the tags to be extrapolated
 * @returns {Promise<String[]>} List of uppercase tags
 */
async function getGameTags(page) {
    let tags = [];

    // Get the game tags
    for (let handle of await page.$$(GAME_TAGS)) {
        let tag = await page.evaluate((element) => element.innerText, handle);
        tags.push(tag.toUpperCase());
    }
    return tags;
}

/**
 * @private
 * Process the game title prefixes to extract information such as game status, 
 * graphics engine used, and whether it is a mod or original game.
 * @param {puppeteer.Page} page Page containing the prefixes to be extrapolated
 * @param {GameInfo} info Object to assign the identified information to
 * @returns {Promise<GameInfo>} GameInfo object passed in to which the identified information has been added
 */
async function parsePrefixes(page, info) {
    // The 'Ongoing' status is not specified, only 'Abandoned'/'OnHold'/'Complete'
    info.status = 'Ongoing';
    for (let handle of await page.$$(GAME_TITLE_PREFIXES)) {
        let value = await page.evaluate((element) => element.innerText, handle);

        // Clean the prefix
        let prefix = value.toUpperCase().replace('[', '').replace(']', '').trim();

        // Getting infos...
        if (_statuses.includes(prefix)) info.status = prefix;
        else if (_engines.includes(prefix)) info.engine = prefix;

        // This is not a game but a mod
        else if (prefix === MOD_PREFIX) info.isMod = true;
    }
    return info;
}

/**
 * @deprecated
 * @param {puppeteer.Browser} browser 
 * @param {URL} url 
 */
async function getGameDownloadLink(browser, url) {
    // Verify the correctness of the URL
    if (!isF95URL(url)) throw url + ' is not a valid F95Zone URL';
    let exists = await urlExist(url.toString());
    if (!exists) return new GameDownload();

    let page = await preparePage(browser); // Set new isolated page
    await page.setCookie(..._cookies); // Set cookies to avoid login
    await page.goto(url.toString(), {
        waitUntil: WAIT_STATEMENT
    }); // Go to the game page and wait until it loads

    // Gets the first post, where are listed all the game's informations
    let post = (await page.$$(THREAD_POSTS))[0];

    // Get the HTML text
    let postHTML = await page.evaluate((mainPost) => mainPost.innerHTML, post);
    let startIndex = postHTML.indexOf('DOWNLOAD');
    let endIndex = postHTML.indexOf('class="js-lbImage"');
    postHTML = postHTML.substring(startIndex, endIndex - startIndex);
    console.log(postHTML);
}
//#endregion Game data parser

//#region Game search
/**
 * @private
 * Search the F95Zone portal to find possible conversations regarding the game you are looking for.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @param {String} gamename Name of the game to search for
 * @returns {Promise<URL[]>} List of URL of possible games  obtained from the preliminary research on the F95 portal
 */
async function getSearchGameResults(browser, gamename) {
    if (_debug) console.log('Searching ' + gamename + ' on F95Zone');

    let page = await preparePage(browser); // Set new isolated page
    await page.setCookie(..._cookies); // Set cookies to avoid login
    await page.goto(F95_SEARCH_URL, {
        waitUntil: WAIT_STATEMENT
    }); // Go to the search form and wait for it

    // Explicitly wait for the required items to load
    await page.waitForSelector(SEARCH_FORM_TEXTBOX);
    await page.waitForSelector(TITLE_ONLY_CHECKBOX);
    await page.waitForSelector(SEARCH_BUTTON);

    await page.type(SEARCH_FORM_TEXTBOX, gamename) // Type the game we desire
    await page.click(TITLE_ONLY_CHECKBOX) // Select only the thread with the game in the titles
    await Promise.all([
        page.click(SEARCH_BUTTON), // Execute search
        page.waitForNavigation({
            waitUntil: WAIT_STATEMENT
        }), // Wait for page to load
    ]);

    // Select all conversation titles
    let threadTitleList = await page.$$(THREAD_TITLE);

    // For each title extract the info about the conversation
    if (_debug) console.log('Extracting info from conversation titles');
    let results = [];
    for (let title of threadTitleList) {
        let gameUrl = await getOnlyGameThreads(page, title);

        // Append the game's informations
        if (gameUrl !== null) results.push(gameUrl);
    }
    if (_debug) console.log('Find ' + results.length + ' conversations');
    await page.close(); // Close the page

    return results;
}

/**
 * @private
 * Return the link of a conversation if it is a game or a mod
 * @param {puppeteer.Page} page Page containing the conversation to be analyzed
 * @param {puppeteer.ElementHandle} titleHandle Title of the conversation to be analyzed
 * @return {Promise<URL>} URL of the game/mod
 */
async function getOnlyGameThreads(page, titleHandle) {
    // Get the URL of the thread from the title
    let relativeURLThread = await page.evaluate((element) => element.querySelector('a').href, titleHandle);
    let url = new URL(relativeURLThread, F95_BASE_URL);

    // Parse prefixes to ignore game recommendation
    for (let element of await titleHandle.$$('span[dir="auto"]')) {
        // Elaborate the prefixes
        let prefix = await page.evaluate(element => element.textContent.toUpperCase(), element);
        prefix = prefix.replace('[', '').replace(']', '');

        // This is not a game nor a mod, we can exit
        if (prefix === GAME_RECOMMENDATION_PREFIX) return null;
    }
    return url;
}
//#endregion Game search

//#endregion Private methods