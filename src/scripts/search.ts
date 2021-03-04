"use strict";

// Modules from file
import { IBasic, IQuery } from "./interfaces.js";
import getHandiworkInformation from "./scrape-data/handiwork-parse.js";
import getURLsFromQuery from "./fetch-data/fetch-query.js";

/**
 * Gets the handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 */
export default async function search<T extends IBasic>(
  query: IQuery,
  limit = 30
): Promise<T[]> {
  // Fetch the URLs
  const urls: string[] = await getURLsFromQuery(query, limit);

  // Fetch the data
  const results = urls.map((url, idx) => {
    return getHandiworkInformation<T>(url);
  });

  return Promise.all(results);
}
