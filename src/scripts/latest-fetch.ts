"use strict";

// Modules from file
const { fetchGETResponse } = require("./network-helper.js");
const f95url = require("./constants/url.js");

/**
 * @public
 * Gets the URLs of the latest updated games that match the passed parameters.
 * You *must* be logged.
 * @param {Object} query
 * Query used for the search
 * @param {Number[]} [query.tags]
 * List of tags to be included in the search. Max. 5 tags
 * @param {Number[]} [query.prefixes] 
 * List of prefixes to be included in the search.
 * @param {String} [query.sort] 
 * Sorting type between (default: `date`):
 *`date`, `likes`, `views`, `name`, `rating`
 * @param {Number} [query.date]
 * Date limit in days, to be understood as "less than".
 * Possible values:
 * `365`, `180`, `90`, `30`, `14`, `7`, `3`, `1`.
 * Use `1` to indicate "today" or set no value to indicate "anytime"
 * @param {Number} limit 
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the fetched games
 */
module.exports.fetchLatest = async function(query, limit = 30) {
    // Local variables
    const threadURL = new URL("threads/", f95url.F95_BASE_URL).href;
    const resultURLs = [];
    let fetchedResults = 0;
    let page = 1;
    let noMorePages = false;

    do {
        // Prepare the URL
        const url = parseLatestURL(query, page);

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
};

/**
 * @private
 * Parse the URL with the passed parameters.
 * @param {Object} query
 * Query used for the search
 * @param {Number[]} [query.tags]
 * List of tags to be included in the search. Max. 5 tags
 * @param {Number[]} [query.prefixes] 
 * List of prefixes to be included in the search.
 * @param {String} [query.sort] 
 * Sorting type between (default: `date`):
 * `date`, `likes`, `views`, `title`, `rating`
 * @param {Number} [query.date]
 * Date limit in days, to be understood as "less than".
 * Possible values:
 * `365`, `180`, `90`, `30`, `14`, `7`, `3`, `1`.
 * Use `1` to indicate "today" or set no value to indicate "anytime"
 * @param {Number} [page]
 * Index of the page to be obtained. Default: 1.
 */
function parseLatestURL(query, page = 1) {
    // Create the URL
    const url = new URL("https://f95zone.to/new_latest.php");
    url.searchParams.set("cmd", "list");
    url.searchParams.set("cat", "games");

    // Add the parameters
    if (query.tags) {
        if (query.tags.length > 5)
            throw new Error(`Too many tags: ${query.tags.length} instead of 5`);

        for(const tag of query.tags) {
            url.searchParams.append("tags[]", tag);
        }
    }

    if (query.prefixes) {
        for (const p of query.prefixes) {
            url.searchParams.append("prefixes[]", p);
        }
    }

    if(query.sort) {
        const validSort = ["date", "likes", "views", "title", "rating"];
        if (!validSort.includes(query.sort))
            throw new Error(`Invalid sort parameter: ${query.sort}`);
        url.searchParams.set("sort", query.sort);
    }

    if (query.date) {
        const validDate = [365, 180, 90, 30, 14, 7, 3, 1];
        if (!validDate.includes(query.date))
            throw new Error(`Invalid date parameter: ${query.date}`);
        url.searchParams.set("date", query.date);
    }

    if (page) url.searchParams.set("page", page);

    return url.toString();
}