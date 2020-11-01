"use strict";

// Modules from file
const shared = require("./scripts/shared.js");
const f95url = require("./scripts/constants/url.js");
const f95selector = require("./scripts/constants/css-selector.js");
const networkHelper = require("./scripts/network-helper.js");
const scraper = require("./scripts/scraper.js");
const searcher = require("./scripts/searcher.js");

// Classes from file
const Credentials = require("./scripts/classes/credentials.js");
const GameInfo = require("./scripts/classes/game-info.js");
const LoginResult = require("./scripts/classes/login-result.js");
const UserData = require("./scripts/classes/user-data.js");

//#region Export classes
module.exports.GameInfo = GameInfo;
module.exports.LoginResult = LoginResult;
module.exports.UserData = UserData;
//#endregion Export classes

//#region Export properties
/**
 * Shows log messages and other useful functions for module debugging.
 * @param {Boolean} value
 */
module.exports.debug = function (value) {
    shared.debug = value;

    // Configure logger
    shared.logger.level = value ? "trace" : "warn";
};
/**
 * @public
 * Indicates whether a user is logged in to the F95Zone platform or not.
 * @returns {String}
 */
module.exports.isLogged = function () {
    return shared.isLogged;
};
//#endregion Export properties

//#region Global variables
const USER_NOT_LOGGED = "User not authenticated, unable to continue";
//#endregion

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
    if (shared.isLogged) {
        shared.logger.info(`${username} already authenticated`);
        return new LoginResult(true, `${username} already authenticated`);
    }

    shared.logger.trace("Fetching token...");
    const creds = new Credentials(username, password);
    await creds.fetchToken();

    shared.logger.trace(`Authentication for ${username}`);
    const result = await networkHelper.autenticate(creds);
    shared.isLogged = result.success;

    if (result.success) shared.logger.info("User logged in through the platform");
    else shared.logger.warn(`Error during authentication: ${result.message}`);

    return result;
};

/**
 * @public
 * Chek if exists a new version of the game.
 * You **must** be logged in to the portal before calling this method.
 * @param {GameInfo} info Information about the game to get the version for
 * @returns {Promise<Boolean>} true if an update is available, false otherwise
 */
module.exports.checkIfGameHasUpdate = async function (info) {
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return false;
    }

    // F95 change URL at every game update,
    // so if the URL is different an update is available
    const exists = await networkHelper.urlExists(info.url, true);
    if (!exists) return true;

    // Parse version from title
    const onlineVersion = await scraper.getGameInfo(info.url).version;
    
    // Compare the versions
    return onlineVersion.toUpperCase() !== info.version.toUpperCase();
};

/**
 * @public
 * Starting from the name, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} name Name of the game searched
 * @param {Boolean} mod Indicate if you are looking for mods or games
 * @returns {Promise<GameInfo[]>} List of information obtained where each item corresponds to
 * an identified game (in the case of homonymy of titles)
 */
module.exports.getGameData = async function (name, mod) {
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    // Gets the search results of the game/mod being searched for
    let urls = [];
    if(mod) urls = await searcher.searchMod(name);
    else urls = await searcher.searchGame(name);

    // Process previous partial results
    const results = [];
    for (const url of urls) {
        // Start looking for information
        const info = scraper.getGameInfo(url);
        results.push(info);
    }
    return results;
};

/**
 * @public
 * Starting from the url, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} url URL of the game to obtain information of
 * @returns {Promise<GameInfo>} Information about the game. If no game was found, null is returned
 */
module.exports.getGameDataFromURL = async function (url) {
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    // Check URL validity
    const exists = await networkHelper.urlExists(url);
    if (!exists) throw new URIError(`${url} is not a valid URL`);
    if (!networkHelper.isF95URL(url)) throw new Error(`${url} is not a valid F95Zone URL`);
    
    // Get game data
    return await scraper.getGameInfo(url);
};

/**
 * @public
 * Gets the data of the currently logged in user.
 * You **must** be logged in to the portal before calling this method.
 * @returns {Promise<UserData>} Data of the user currently logged in
 */
module.exports.getUserData = async function () {
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    const threads = await getUserWatchedGameThreads(null);

    const username = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
            document.querySelector(selector).innerText,
        f95selector.USERNAME_ELEMENT
    );

    const avatarSrc = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
            document.querySelector(selector).getAttribute("src"),
        f95selector.AVATAR_PIC
    );

    const ud = new UserData();
    ud.username = username;
    ud.avatarSrc = networkHelper.isStringAValidURL(avatarSrc) ? avatarSrc : null;
    ud.watchedThreads = threads;

    return ud;
};
//#endregion

//#region Private methods

//#region User
/**
 * @private
 * Gets the list of URLs of threads the user follows.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @returns {Promise<String[]>} URL list
 */
async function getUserWatchedGameThreads() {
    const page = null;
    await page.goto(f95url.F95_WATCHED_THREADS); // Go to the thread page

    // Explicitly wait for the required items to load
    await page.waitForSelector(f95selector.WATCHED_THREAD_FILTER_POPUP_BUTTON);

    // Show the popup
    await Promise.all([
        page.click(f95selector.WATCHED_THREAD_FILTER_POPUP_BUTTON),
        page.waitForSelector(f95selector.UNREAD_THREAD_CHECKBOX),
        page.waitForSelector(f95selector.ONLY_GAMES_THREAD_OPTION),
        page.waitForSelector(f95selector.FILTER_THREADS_BUTTON),
    ]);

    // Set the filters
    await page.evaluate(
    /* istanbul ignore next */ (selector) =>
            document.querySelector(selector).removeAttribute("checked"),
        f95selector.UNREAD_THREAD_CHECKBOX
    ); // Also read the threads already read

    // Filter the threads
    await page.click(f95selector.ONLY_GAMES_THREAD_OPTION);
    await page.click(f95selector.FILTER_THREADS_BUTTON);
    await page.waitForSelector(f95selector.WATCHED_THREAD_URLS);

    // Get the threads urls
    const urls = [];
    let nextPageExists = false;
    do {
    // Get all the URLs
        for (const handle of await page.$$(f95selector.WATCHED_THREAD_URLS)) {
            const src = await page.evaluate(
                /* istanbul ignore next */ (element) => element.href,
                handle
            );
            // If 'unread' is left, it will redirect to the last unread post
            const url = src.replace("/unread", "");
            urls.push(url);
        }

        nextPageExists = await page.evaluate(
            /* istanbul ignore next */ (selector) => document.querySelector(selector),
            f95selector.WATCHED_THREAD_NEXT_PAGE
        );

        // Click to next page
        if (nextPageExists) {
            await page.click(f95selector.WATCHED_THREAD_NEXT_PAGE);
            await page.waitForSelector(f95selector.WATCHED_THREAD_URLS);
        }
    } while (nextPageExists);

    await page.close();
    return urls;
}
//#endregion User

//#endregion Private methods
