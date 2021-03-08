// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint-disable @typescript-eslint/no-inferrable-types */
"use strict";

// Modules from file
import { IBasic, IQuery } from "./interfaces";
import getHandiworkInformation from "./scrape-data/handiwork-parse";
import { HandiworkSearchQuery, LatestSearchQuery, ThreadSearchQuery } from "..";
import fetchHandiworkURLs from "./fetch-data/fetch-handiwork";
import fetchLatestHandiworkURLs from "./fetch-data/fetch-latest";
import fetchThreadHandiworkURLs from "./fetch-data/fetch-thread";

/**
 * Gets the handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 */
export default async function search<T extends IBasic>(
  query: IQuery,
  limit: number = 30
): Promise<T[]> {
  // Fetch the URLs
  const urls: string[] = await getURLsFromQuery(query, limit);

  // Fetch the data
  const results = urls.map((url) => getHandiworkInformation<T>(url));

  return Promise.all(results);
}

//#region Private methods

/**
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
async function getURLsFromQuery(query: IQuery, limit = 30): Promise<string[]> {
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

//#endregion Private methods
