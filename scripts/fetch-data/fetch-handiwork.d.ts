import HandiworkSearchQuery from "../classes/query/handiwork-search-query";
/**
 * Gets the URLs of the handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {LatestSearchQuery} query
 * Query used for the search
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the handiworks
 */
export default function fetchHandiworkURLs(query: HandiworkSearchQuery, limit?: number): Promise<string[]>;
