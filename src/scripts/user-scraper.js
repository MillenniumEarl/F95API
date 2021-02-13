"use strict";

// Public modules from npm
const cheerio = require("cheerio");

// Modules from file
const networkHelper = require("./network-helper.js");
const f95Selector = require("./constants/css-selector.js");
const f95url = require("./constants/url.js");
const UserData = require("./classes/user-data.js");

/**
 * @protected
 * Gets user data, such as username, url of watched threads, and profile picture url.
 * @return {Promise<UserData>} User data
 */
module.exports.getUserData = async function() {
    // Fetch data
    const data = await fetchUsernameAndAvatar();
    const urls = await fetchWatchedGameThreadURLs();

    // Create object
    const ud = new UserData();
    ud.username = data.username;
    ud.avatarSrc = data.source;
    ud.watchedGameThreads = urls;

    return ud;
};

//#region Private methods
/**
 * @private
 * It connects to the page and extracts the name 
 * of the currently logged in user and the URL 
 * of their profile picture.
 * @return {Promise<Object.<string, string>>}
 */
async function fetchUsernameAndAvatar() {
    // Fetch page
    const html = await networkHelper.fetchHTML(f95url.F95_BASE_URL);

    // Load HTML response
    const $ = cheerio.load(html);
    const body = $("body");

    // Fetch username
    const username = body.find(f95Selector.UD_USERNAME_ELEMENT).first().text().trim();

    // Fetch user avatar image source
    const source = body.find(f95Selector.UD_AVATAR_PIC).first().attr("src");

    return {
        username,
        source
    };
}

/**
 * @private
 * Gets the list of URLs of game threads watched by the user.
 * @returns {Promise<String[]>} List of URLs
 */
async function fetchWatchedGameThreadURLs() {
    // Local variables
    const watchedGameThreadURLs = [];

    // Get the first page with the "unread" flag disabled
    // and searching only the games forum
    const firstPageURL = new URL(f95url.F95_WATCHED_THREADS);
    firstPageURL.searchParams.append("unread", "0");
    firstPageURL.searchParams.append("nodes[0]", "2"); // This is the forum filter

    // Set the variable containing the current scraped page
    let currentURL = firstPageURL.href;

    do {
        // Fetch page
        const html = await networkHelper.fetchHTML(currentURL);

        // Load HTML response
        const $ = cheerio.load(html);
        const body = $("body");

        // Find the URLs
        const urls = fetchPageURLs(body);
        watchedGameThreadURLs.push(...urls);

        // Find the next page (if any)
        currentURL = fetchNextPageURL(body);
    }
    while (currentURL);

    return watchedGameThreadURLs;
}

/**
 * @private
 * Gets the URLs of the watched threads on the page.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {String[]}
 */
function fetchPageURLs(body) {
    const elements = body.find(f95Selector.WT_URLS);

    return elements.map(function extractURLs(idx, e) {
        // Obtain the link (replace "unread" only for the unread threads)
        const partialLink = e.attribs.href.replace("unread", "");

        // Compose and return the URL
        return new URL(partialLink, f95url.F95_BASE_URL).toString();
    }).get();
}

/**
 * @private
 * Gets the URL of the next page containing the watched threads 
 * or `null` if that page does not exist.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {String}
 */
function fetchNextPageURL(body) {
    const element = body.find(f95Selector.WT_NEXT_PAGE).first();

    // No element found
    if(element.length === 0) return null;

    // Compose and return the URL
    return new URL(element.attr("href"), f95url.F95_BASE_URL).toString();
}
//#endregion Private methods