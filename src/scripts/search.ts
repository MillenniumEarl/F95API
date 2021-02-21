"use strict";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import { fetchHTML } from "./network-helper.js";
import shared from "./shared.js";
import { selectors as f95Selector } from "./constants/css-selector.js";
import { urls as f95urls } from "./constants/url.js";

//#region Public methods
/**
 * Search for a game on F95Zone and return a list of URLs, one for each search result.
 * @returns {Promise<String[]>} URLs of results
 */
export async function searchGame(name: string): Promise<string[]> {
    shared.logger.info(`Searching games with name ${name}`);

    // Replace the whitespaces with +
    const searchName = encodeURIComponent(name.toUpperCase());
    
    // Prepare the URL (only title, search in the "Games" section, order by relevance)
    const url = `https://f95zone.to/search/83456043/?q="${searchName}"&t=post&c[child_nodes]=1&c[nodes][0]=2&c[title_only]=1&o=relevance`;

    // Fetch and parse the result URLs
    return await fetchResultURLs(url);
};

/**
 * Search for a mod on F95Zone and return a list of URLs, one for each search result.
 * @returns {Promise<String[]>} URLs of results
 */
export async function searchMod(name: string): Promise<string[]> {
    shared.logger.info(`Searching mods with name ${name}`);
    
    // Replace the whitespaces with +
    const searchName = encodeURIComponent(name.toUpperCase());

    // Prepare the URL (only title, search in the "Mods" section, order by relevance)
    const url = `https://f95zone.to/search/83459796/?q="${searchName}"&t=post&c[child_nodes]=1&c[nodes][0]=41&c[title_only]=1&o=relevance`;

    // Fetch and parse the result URLs
    return await fetchResultURLs(url);
};
//#endregion Public methods

//#region Private methods
/**
 * Gets the URLs of the threads resulting from the F95Zone search.
 * @return {Promise<String[]>} List of URLs
 */
async function fetchResultURLs(url: string): Promise<string[]> {
    shared.logger.trace(`Fetching ${url}...`);

    // Fetch HTML and prepare Cheerio
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    // Here we get all the DIV that are the body of the various query results
    const results = $("body").find(f95Selector.GS_RESULT_BODY);

    // Than we extract the URLs
    const urls = results.map((idx, el) => {
        const elementSelector = $(el);
        return extractLinkFromResult(elementSelector);
    }).get();

    return urls;
}

/**
 * Look for the URL to the thread referenced by the item.
 * @param {cheerio.Cheerio} selector Element to search
 * @returns {String} URL to thread
 */
function extractLinkFromResult(selector: cheerio.Cheerio): string {
    shared.logger.trace("Extracting thread link from result...");
    
    const partialLink = selector
        .find(f95Selector.GS_RESULT_THREAD_TITLE)
        .attr("href")
        .trim();

    // Compose and return the URL
    return new URL(partialLink, f95urls.F95_BASE_URL).toString();
}
//#endregion Private methods
