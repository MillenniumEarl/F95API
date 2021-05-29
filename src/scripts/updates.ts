// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import { UserNotLogged, USER_NOT_LOGGED } from "./classes/errors";
import fetchLatestHandiworkURLs from "./fetch-data/fetch-latest";
import { getHandiworkFromURL } from "./handiwork-from-url";
import { IBasic } from "./interfaces";
import { urlExists } from "./network-helper";
import getHandiworkInformation from "./scrape-data/handiwork-parse";
import shared from "./shared";

// Classes from file
import HandiWork from "./classes/handiwork/handiwork";
import LatestSearchQuery from "./classes/query/latest-search-query";

/**
 * Gets the latest updated games that match the specified parameters.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @param {LatestSearchQuery} query Parameters used for the search.
 * @param {Number} limit Maximum number of results. Default: 30
 */
export async function getLatestUpdates<T extends IBasic>(
  query: LatestSearchQuery,
  limit: number = 30
): Promise<T[]> {
  // Check limit value
  if (limit <= 0) throw new Error("Limit must be greater than 0");

  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Fetch the results
  const urls = await fetchLatestHandiworkURLs(query, limit);

  // Get the data from urls
  const promiseList = urls.map((u: string) => getHandiworkInformation<T>(u));
  return Promise.all(promiseList);
}

/**
 * Chek if exists a new version of the handiwork.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export async function checkIfHandiworkHasUpdate(hw: HandiWork): Promise<boolean> {
  // Local variables
  let hasUpdate = false;

  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // F95 change URL at every game update,
  // so if the URL is different an update is available
  if (await urlExists(hw.url, true)) {
    // Fetch the online handiwork
    const onlineHw = await getHandiworkFromURL<HandiWork>(hw.url);

    // Compare the versions
    hasUpdate = onlineHw.version?.toUpperCase() !== hw.version?.toUpperCase();
  }

  return hasUpdate;
}
