// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import shared from "./scripts/shared";
import search from "./scripts/search";
import { authenticate, urlExists, isF95URL, send2faCode } from "./scripts/network-helper";
import fetchLatestHandiworkURLs from "./scripts/fetch-data/fetch-latest";
import fetchPlatformData from "./scripts/fetch-data/fetch-platform-data";
import getHandiworkInformation from "./scripts/scrape-data/handiwork-parse";
import { IBasic } from "./scripts/interfaces";

// Classes from file
import Credentials from "./scripts/classes/credentials";
import LoginResult from "./scripts/classes/login-result";
import UserProfile from "./scripts/classes/mapping/user-profile";
import LatestSearchQuery from "./scripts/classes/query/latest-search-query";
import HandiworkSearchQuery from "./scripts/classes/query/handiwork-search-query";
import HandiWork from "./scripts/classes/handiwork/handiwork";
import { UserNotLogged } from "./scripts/classes/errors";

//#region Global variables

const USER_NOT_LOGGED = "User not authenticated, unable to continue";

//#endregion

//#region Re-export classes

export { default as PrefixParser } from "./scripts/classes/prefix-parser";

export { default as Animation } from "./scripts/classes/handiwork/animation";
export { default as Asset } from "./scripts/classes/handiwork/asset";
export { default as Comic } from "./scripts/classes/handiwork/comic";
export { default as Game } from "./scripts/classes/handiwork/game";
export { default as Handiwork } from "./scripts/classes/handiwork/handiwork";

export { default as PlatformUser } from "./scripts/classes/mapping/platform-user";
export { default as Post } from "./scripts/classes/mapping/post";
export { default as Thread } from "./scripts/classes/mapping/thread";
export { default as UserProfile } from "./scripts/classes/mapping/user-profile";

export { default as HandiworkSearchQuery } from "./scripts/classes/query/handiwork-search-query";
export { default as LatestSearchQuery } from "./scripts/classes/query/latest-search-query";
export { default as ThreadSearchQuery } from "./scripts/classes/query/thread-search-query";

//#endregion Re-export classes

//#region Export properties

/**
 * Set the logger level for module debugging.
 */
// eslint-disable-next-line prefer-const
export let loggerLevel = shared.logger.level;
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
 *
 * @param cb2fa
 * Callback used if two-factor authentication is required for the profile.
 * It must return he OTP code to use for the login.
 */
export async function login(
  username: string,
  password: string,
  cb2fa?: () => Promise<number>
): Promise<LoginResult> {
  // Try to load a previous session
  await shared.session.load();

  // If the session is valid, return
  if (shared.session.isValid(username, password)) {
    shared.logger.info(`Loading previous session for ${username}`);

    // Load platform data
    await fetchPlatformData();

    shared.setIsLogged(true);
    return new LoginResult(
      true,
      LoginResult.ALREADY_AUTHENTICATED,
      `${username} already authenticated (session)`
    );
  }

  // Creating credentials and fetch unique platform token
  shared.logger.trace("Fetching token...");
  const creds = new Credentials(username, password);
  await creds.fetchToken();

  shared.logger.trace(`Authentication for ${username}`);
  let result = await authenticate(creds);
  shared.setIsLogged(result.success);

  // 2FA Authentication is required, fetch OTP
  if (result.message === "Two-factor authentication is needed to continue") {
    const code = await cb2fa();
    const response2fa = await send2faCode(code, creds.token);
    if (response2fa.isSuccess()) result = response2fa.value;
    else throw response2fa.value;
  }

  if (result.success) {
    // Recreate the session, overwriting the old one
    shared.session.create(username, password, creds.token);
    await shared.session.save();

    // Load platform data
    await fetchPlatformData();

    shared.logger.info("User logged in through the platform");
  } else shared.logger.warn(`Error during authentication: ${result.message}`);

  return result;
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
  limit: number = 10
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
export async function getHandiworkFromURL<T extends IBasic>(url: string): Promise<T> {
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
  limit: number = 10
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
