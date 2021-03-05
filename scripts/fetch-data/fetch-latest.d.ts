import LatestSearchQuery from "../classes/query/latest-search-query.js";
/**
 * Gets the URLs of the latest handiworks that match the passed parameters.
 *
 * You *must* be logged.
 * @param {LatestSearchQuery} query
 * Query used for the search
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 * @returns {Promise<String[]>} URLs of the handiworks
 */
export default function fetchLatestHandiworkURLs(
  query: LatestSearchQuery,
  limit?: number
): Promise<string[]>;
