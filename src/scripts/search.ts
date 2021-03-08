// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint-disable @typescript-eslint/no-inferrable-types */
"use strict";

// Modules from file
import { IBasic, IQuery } from "./interfaces";
import getHandiworkInformation from "./scrape-data/handiwork-parse";
import getURLsFromQuery from "./fetch-data/fetch-query";

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
