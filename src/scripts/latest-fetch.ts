"use strict";

// Modules from file
import { fetchGETResponse } from "./network-helper.js";
import SearchQuery from "./classes/search-query";

/**
 * @public
 * Gets the URLs of the latest updated games that match the passed parameters.
 * You *must* be logged.
 * @param {SearchQuery} query
 * Query used for the search
 * @param {Number} limit 
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the fetched games
 */
export async function fetchLatest(query: SearchQuery, limit = 30): Promise<string[]> {
    // Local variables
    const threadURL = new URL("threads/", f95url.F95_BASE_URL).href;
    const resultURLs = [];
    let fetchedResults = 0;
    let page = 1;
    let noMorePages = false;

    do {
        // Prepare the URL
        const url = query.createUrl().toString();

        // Fetch the response (application/json)
        const response = await fetchGETResponse(url);

        // Save the URLs
        for(const result of response.data.msg.data) {
            if(fetchedResults < limit) {
                const gameURL = new URL(result.thread_id, threadURL).href;
                resultURLs.push(gameURL);
                fetchedResults += 1;
            }
        }
        
        // Increment page and check for it's existence
        page += 1;
        if (page > response.data.msg.pagination.total) noMorePages = true;
    }
    while (fetchedResults < limit && !noMorePages);

    return resultURLs;
}