// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import { IBasic, IQuery } from "./interfaces";
import getHandiworkInformation from "./scrape-data/handiwork-parse";
import fetchHandiworkURLs from "./fetch-data/fetch-handiwork";
import fetchLatestHandiworkURLs from "./fetch-data/fetch-latest";
import fetchThreadHandiworkURLs from "./fetch-data/fetch-thread";
import { UserNotLogged, USER_NOT_LOGGED } from "./classes/errors";
import shared from "./shared";
import HandiworkSearchQuery from "./classes/query/handiwork-search-query";
import LatestSearchQuery from "./classes/query/latest-search-query";
import ThreadSearchQuery from "./classes/query/thread-search-query";

/**
 * Gets the handiworks that match the passed parameters.
 *
 * You *must* be logged.
 * @param {IQuery} query Parameters used for the search.
 * @param {Number} limit Maximum number of items to get. Default: 30
 */
export default async function search<T extends IBasic>(
  query: IQuery,
  limit: number = 30
): Promise<T[]> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Fetch the URLs
  const urls: string[] = await getURLsFromQuery(query, limit);

  // Fetch the data
  const results = urls.map((url) => getHandiworkInformation<T>(url));

  return Promise.all(results);
}

//#region Private methods

/**
 * Gets the URLs of the Handiworks that are defined by the search query.
 *
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
async function getURLsFromQuery(query: IQuery, limit = 30): Promise<string[]> {
  const functionMap = {
    HandiworkSearchQuery: (query: IQuery, limit: number) =>
      fetchHandiworkURLs(query as HandiworkSearchQuery, limit),
    LatestSearchQuery: (query: IQuery, limit: number) =>
      fetchLatestHandiworkURLs(query as LatestSearchQuery, limit),
    ThreadSearchQuery: (query: IQuery, limit: number) =>
      fetchThreadHandiworkURLs(query as ThreadSearchQuery, limit)
  };

  const typeMap = {
    HandiworkSearchQuery: HandiworkSearchQuery,
    LatestSearchQuery: LatestSearchQuery,
    ThreadSearchQuery: ThreadSearchQuery
  };

  // Throws error if the type of query is non existent
  if (!Object.keys(functionMap).includes(query.itype)) {
    throw Error(`Invalid query type: ${query.itype}`);
  }

  // fetch and return the urls
  return await functionMap[query.itype](query, limit);
}

//#endregion Private methods
