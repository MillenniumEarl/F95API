import ThreadSearchQuery from "../classes/query/thread-search-query.js";
/**
 * Gets the URLs of the handiwork' threads that match the passed parameters.
 *
 * You *must* be logged.
 * @param {ThreadSearchQuery} query
 * Query used for the search
 * @param {number} limit
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the handiworks
 */
export default function fetchThreadHandiworkURLs(query: ThreadSearchQuery, limit?: number): Promise<string[]>;
