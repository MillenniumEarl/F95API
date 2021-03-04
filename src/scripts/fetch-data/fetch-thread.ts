"use strict";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import shared from "../shared.js";
import { selectors as f95Selector } from "../constants/css-selector.js";
import { urls as f95urls } from "../constants/url.js";
import ThreadSearchQuery from "../classes/query/thread-search-query.js";

//#region Public methods

/**
 * Gets the URLs of the handiwork' threads that match the passed parameters.
 * You *must* be logged.
 * @param {ThreadSearchQuery} query
 * Query used for the search
 * @param {number} limit
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the handiworks
 */
export default async function fetchThreadHandiworkURLs(query: ThreadSearchQuery, limit: number = 30): Promise<string[]> {
    // Execute the query
    const response = await query.execute();

    // Fetch the results from F95 and return the handiwork urls
    if (response.isSuccess()) return fetchResultURLs(response.value.data as string, limit);
    else throw response.value
}

//#endregion Public methods

//#region Private methods

/**
 * Gets the URLs of the threads resulting from the F95Zone search.
 * @param {number} limit
 * Maximum number of items to get. Default: 30
 */
async function fetchResultURLs(html: string, limit: number = 30): Promise<string[]> {
    // Prepare cheerio
    const $ = cheerio.load(html);

    // Here we get all the DIV that are the body of the various query results
    const results = $("body").find(f95Selector.GS_RESULT_BODY);

    // Than we extract the URLs
    const urls = results.slice(0, limit).map((idx, el) => {
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