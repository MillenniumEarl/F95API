// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import LatestSearchQuery from "../classes/query/latest-search-query";
import { urls } from "../constants/url";

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
export default async function fetchLatestHandiworkURLs(
  query: LatestSearchQuery,
  limit = 30
): Promise<string[]> {
  // Local variables
  const shallowQuery: LatestSearchQuery = Object.assign(new LatestSearchQuery(), query);
  const resultURLs = [];
  let fetchedResults = 0;
  let noMorePages = false;

  do {
    // Fetch the response (application/json)
    const response = await shallowQuery.execute();

    // Save the URLs
    if (response.isSuccess()) {
      // In-loop variables
      const data: [{ thread_id: number }] = response.value.data.msg.data;
      const totalPages: number = response.value.data.msg.pagination.total;

      data.map((e, idx) => {
        if (fetchedResults < limit) {
          const gameURL = new URL(e.thread_id.toString(), urls.THREADS).href;
          resultURLs.push(gameURL);

          fetchedResults += 1;
        }
      });

      // Increment page and check for it's existence
      shallowQuery.page += 1;
      noMorePages = shallowQuery.page > totalPages;
    } else throw response.value;
  } while (fetchedResults < limit && !noMorePages);

  return resultURLs;
}
