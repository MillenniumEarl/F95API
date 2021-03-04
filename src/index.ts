"use strict";

// Modules from file
import shared from "./scripts/shared.js";
import search from "./scripts/search.js";
import { authenticate, urlExists, isF95URL } from "./scripts/network-helper.js";
import fetchLatestHandiworkURLs from "./scripts/fetch-data/fetch-latest.js";
import fetchPlatformData from "./scripts/fetch-data/fetch-platform-data.js";
import getHandiworkInformation from "./scripts/scrape-data/handiwork-parse.js";
import { IBasic } from "./scripts/interfaces.js";

// Classes from file
import Credentials from "./scripts/classes/credentials.js";
import LoginResult from "./scripts/classes/login-result.js";
import UserProfile from "./scripts/classes/mapping/user-profile.js";
import LatestSearchQuery from "./scripts/classes/query/latest-search-query.js";
import HandiworkSearchQuery from "./scripts/classes/query/handiwork-search-query.js";
import HandiWork from "./scripts/classes/handiwork/handiwork.js";
import { UserNotLogged } from "./scripts/classes/errors.js";

//#region Global variables

const USER_NOT_LOGGED = "User not authenticated, unable to continue";

//#endregion

//#region Re-export classes
export { default as Animation } from "./scripts/classes/handiwork/animation.js";
export { default as Asset } from "./scripts/classes/handiwork/asset.js";
export { default as Comic } from "./scripts/classes/handiwork/comic.js";
export { default as Game } from "./scripts/classes/handiwork/game.js";
export { default as Handiwork } from "./scripts/classes/handiwork/handiwork.js";

export { default as PlatformUser } from "./scripts/classes/mapping/platform-user.js";
export { default as Post } from "./scripts/classes/mapping/post.js";
export { default as Thread } from "./scripts/classes/mapping/thread.js";
export { default as UserProfile } from "./scripts/classes/mapping/user-profile.js";

export { default as HandiworkSearchQuery } from "./scripts/classes/query/handiwork-search-query.js";
export { default as LatestSearchQuery } from "./scripts/classes/query/latest-search-query.js";
export { default as ThreadSearchQuery } from "./scripts/classes/query/thread-search-query.js";
//#endregion Re-export classes

//#region Export properties
/**
 * Set the logger level for module debugging.
 */
/* istambul ignore next */
export var loggerLevel = shared.logger.level;
shared.logger.level = "warn"; // By default log only the warn messages

/**
 * Indicates whether a user is logged in to the F95Zone platform or not.
 */
export function isLogged(): boolean {
  return shared.isLogged;
}
//#endregion Export properties

//#region Export methods

/**
 * Log in to the F95Zone platform.
 *
 * This **must** be the first operation performed before accessing any other script functions.
 */
export async function login(
  username: string,
  password: string
): Promise<LoginResult> {
  // Try to load a previous session
  await shared.session.load();

  // If the session is valid, return
  if (shared.session.isValid(username, password)) {
    shared.logger.info(`Loading previous session for ${username}`);

    // Load platform data
    await fetchPlatformData();

    shared.setIsLogged(true);
    return new LoginResult(true, `${username} already authenticated (session)`);
  }

  // Creating credentials and fetch unique platform token
  shared.logger.trace("Fetching token...");
  const creds = new Credentials(username, password);
  await creds.fetchToken();

  shared.logger.trace(`Authentication for ${username}`);
  const result = await authenticate(creds);
  shared.setIsLogged(result.success);

  if (result.success) {
    // Load platform data
    await fetchPlatformData();

    // Recreate the session, overwriting the old one
    shared.session.create(username, password, creds.token);
    await shared.session.save();

    shared.logger.info("User logged in through the platform");
  } else shared.logger.warn(`Error during authentication: ${result.message}`);

  return result;
}

/**
 * Chek if exists a new version of the handiwork.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export async function checkIfHandiworkHasUpdate(
  hw: HandiWork
): Promise<boolean> {
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

/**
 * Search for one or more handiworks identified by a specific query.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @param {HandiworkSearchQuery} query Parameters used for the search.
 * @param {Number} limit Maximum number of results. Default: 10
 */
export async function searchHandiwork<T extends IBasic>(
  query: HandiworkSearchQuery,
  limit = 10
): Promise<T[]> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  return search<T>(query, limit);
}

/**
 * Given the url, it gets all the information about the handiwork requested.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export async function getHandiworkFromURL<T extends IBasic>(
  url: string
): Promise<T> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Check URL validity
  const exists = await urlExists(url);
  if (!exists) throw new URIError(`${url} is not a valid URL`);
  if (!isF95URL(url)) throw new Error(`${url} is not a valid F95Zone URL`);

  // Get game data
  return getHandiworkInformation<T>(url);
}

/**
 * Gets the data of the currently logged in user.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @returns {Promise<UserProfile>} Data of the user currently logged in
 */
export async function getUserData(): Promise<UserProfile> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Create and fetch profile data
  const profile = new UserProfile();
  await profile.fetch();

  return profile;
}

/**
 * Gets the latest updated games that match the specified parameters.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @param {LatestSearchQuery} query Parameters used for the search.
 * @param {Number} limit Maximum number of results. Default: 10
 */
export async function getLatestUpdates<T extends IBasic>(
  query: LatestSearchQuery,
  limit = 10
): Promise<T[]> {
  // Check limit value
  if (limit <= 0) throw new Error("limit must be greater than 0");

  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  // Fetch the results
  const urls = await fetchLatestHandiworkURLs(query, limit);

  // Get the data from urls
  const promiseList = urls.map((u: string) => getHandiworkInformation<T>(u));
  return Promise.all(promiseList);
}

//#endregion
