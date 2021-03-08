// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from files
import fetchHandiworkURLs from "./fetch-handiwork";
import fetchLatestHandiworkURLs from "./fetch-latest";
import fetchThreadHandiworkURLs from "./fetch-thread";
import HandiworkSearchQuery from "../classes/query/handiwork-search-query";
import LatestSearchQuery from "../classes/query/latest-search-query";
import ThreadSearchQuery from "../classes/query/thread-search-query";
import { IQuery } from "../interfaces";

//#region Public methods

/**
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
export default async function getURLsFromQuery(
  query: IQuery,
  limit = 30
): Promise<string[]> {
  switch (query.itype) {
    case "HandiworkSearchQuery":
      return fetchHandiworkURLs(query as HandiworkSearchQuery, limit);
    case "LatestSearchQuery":
      return fetchLatestHandiworkURLs(query as LatestSearchQuery, limit);
    case "ThreadSearchQuery":
      return fetchThreadHandiworkURLs(query as ThreadSearchQuery, limit);
    default:
      throw Error(`Invalid query type: ${query.itype}`);
  }
}

//#endregion
