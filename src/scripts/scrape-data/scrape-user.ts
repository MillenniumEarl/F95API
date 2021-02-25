"use strict";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import { fetchHTML } from "../network-helper.js";
import { selectors as f95Selector } from "../constants/css-selector.js";
import { urls as f95url } from "../constants/url.js";
import UserData from "../classes/user-data.js";

/**
 * Gets user data, such as username, url of watched threads, and profile picture url.
 */
export async function getUserData(): Promise<UserData> {
    // Fetch data
    const data = await fetchUsernameAndAvatar();
    const urls = await fetchWatchedGameThreadURLs();

    // Create object
    const ud = new UserData();
    ud.username = data.username;
    ud.avatar = data.source;
    ud.watched = urls;

    return ud;
};

//#region Private methods
/**
 * It connects to the page and extracts the name 
 * of the currently logged in user and the URL 
 * of their profile picture.
 */
async function fetchUsernameAndAvatar(): Promise<{ [s: string]: string; }> {
    // Fetch page
    const html = await fetchHTML(f95url.F95_BASE_URL);

    if (html.isSuccess()) {
        // Load HTML response
        const $ = cheerio.load(html.value);
        const body = $("body");

        // Fetch username
        const username = body.find(f95Selector.UD_USERNAME_ELEMENT).first().text().trim();

        // Fetch user avatar image source
        const source = body.find(f95Selector.UD_AVATAR_PIC).first().attr("src");

        return {
            username,
            source
        };
    } else throw html.value;
}

/**
 * Gets the list of URLs of game threads watched by the user.
 * @returns {Promise<String[]>} List of URLs
 */
async function fetchWatchedGameThreadURLs(): Promise<string[]> {
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
        const html = await fetchHTML(currentURL);

        if (html.isSuccess()) {
            // Load HTML response
            const $ = cheerio.load(html.value);
            const body = $("body");

            // Find the URLs
            const urls = fetchPageURLs(body);
            watchedGameThreadURLs.push(...urls);

            // Find the next page (if any)
            currentURL = fetchNextPageURL(body);
        } else throw html.value;
    }
    while (currentURL);

    return watchedGameThreadURLs;
}

/**
 * Gets the URLs of the watched threads on the page.
 * @param {cheerio.Cheerio} body Page `body` selector
 */
function fetchPageURLs(body: cheerio.Cheerio): string[] {
    const elements = body.find(f95Selector.WT_URLS);
    
    return elements.map(function extractURLs(idx, e) {
        // Obtain the link (replace "unread" only for the unread threads)
        const partialLink = cheerio(e).attr("href").replace("unread", "");

        // Compose and return the URL
        return new URL(partialLink, f95url.F95_BASE_URL).toString();
    }).get();
}

/**
 * Gets the URL of the next page containing the watched threads 
 * or `null` if that page does not exist.
 * @param {cheerio.Cheerio} body Page `body` selector
 */
function fetchNextPageURL(body: cheerio.Cheerio): string {
    const element = body.find(f95Selector.WT_NEXT_PAGE).first();

    // No element found
    if(element.length === 0) return null;

    // Compose and return the URL
    return new URL(element.attr("href"), f95url.F95_BASE_URL).toString();
}
//#endregion Private methods