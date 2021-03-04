"use strict";

// Modules from file
import LatestSearchQuery from "../classes/query/latest-search-query.js";
import { urls as f95url } from "../constants/url.js";

/**
 * Gets the URLs of the latest handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {LatestSearchQuery} query
 * Query used for the search
 * @param {Number} limit 
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the handiworks
 */
export default async function fetchLatestHandiworkURLs(query: LatestSearchQuery, limit = 30): Promise<string[]> {
    // Local variables
    const threadURL = new URL("threads/", f95url.F95_BASE_URL).href;
    const resultURLs = [];
    let fetchedResults = 0;
    let page = 1;
    let noMorePages = false;

    do {
        // Fetch the response (application/json)
        const response = await query.execute();

        // Save the URLs
        if (response.isSuccess()) {
            //@ts-ignore
            for (const result of response.value.data.msg.data) {
                if (fetchedResults < limit) {
                    const gameURL = new URL(result.thread_id, threadURL).href;
                    resultURLs.push(gameURL);
                    fetchedResults += 1;
                }
            }

            // Increment page and check for it's existence
            page += 1;

            //@ts-ignore
            if (page > response.value.data.msg.pagination.total) noMorePages = true;
        } else throw response.value;
    }
    while (fetchedResults < limit && !noMorePages);

    return resultURLs;
}