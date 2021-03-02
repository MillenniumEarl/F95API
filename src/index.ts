"use strict";

// Modules from file
import shared from "./scripts/shared.js";
import search from "./scripts/search.js";
import { authenticate, urlExists, isF95URL } from "./scripts/network-helper.js";
import { getUserData as retrieveUserData } from "./scripts/scrape-data/scrape-user.js";
import fetchLatestHandiworkURLs from "./scripts/fetch-data/fetch-latest.js";
import fetchPlatformData from "./scripts/fetch-data/fetch-platform-data.js";
import getHandiworkInformation from "./scripts/scrape-data/handiwork-parse.js";
import { IBasic } from "./scripts/interfaces.js";

// Classes from file
import Credentials from "./scripts/classes/credentials.js";
import LoginResult from "./scripts/classes/login-result.js";
import UserData from "./scripts/classes/user-data.js";
import LatestSearchQuery from "./scripts/classes/query/latest-search-query.js";
import HandiworkSearchQuery from "./scripts/classes/query/handiwork-search-query.js";
import HandiWork from "./scripts/classes/handiwork/handiwork.js";

//#region Global variables
const USER_NOT_LOGGED = "User not authenticated, unable to continue";
//#endregion

//#region Export classes
// module.exports.GameInfo = GameInfo;
// module.exports.LoginResult = LoginResult;
// module.exports.UserData = UserData;
// module.exports.PrefixParser = PrefixParser;
//#endregion Export classes

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
};
//#endregion Export properties

//#region Export methods
/**
 * Log in to the F95Zone platform.
 * This **must** be the first operation performed before accessing any other script functions.
 * @returns {Promise<LoginResult>} Result of the operation
 */
export async function login(username: string, password: string): Promise<LoginResult> {
    /* istanbul ignore next */
    if (shared.isLogged) {
        shared.logger.info(`${username} already authenticated`);
        return new LoginResult(true, `${username} already authenticated`);
    }

    shared.logger.trace("Fetching token...");
    const creds = new Credentials(username, password);
    await creds.fetchToken();

    shared.logger.trace(`Authentication for ${username}`);
    const result = await authenticate(creds);
    shared.setIsLogged(result.success);

    // Load platform data
    if (result.success) {
        await fetchPlatformData();
        shared.session.create(username, password, creds.token);
    }

    /* istambul ignore next */
    if (result.success) shared.logger.info("User logged in through the platform");
    else shared.logger.warn(`Error during authentication: ${result.message}`);

    return result;
};

/**
 * Chek if exists a new version of the handiwork.
 * 
 * You **must** be logged in to the portal before calling this method.
 */
export async function checkIfHandiworkHasUpdate(hw: HandiWork): Promise<boolean> {
    // Local variables
    let hasUpdate = false;

    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return false;
    }

    // F95 change URL at every game update,
    // so if the URL is different an update is available
    if (await urlExists(hw.url, true)) {
        // Fetch the online handiwork
        const onlineHw = await getHandiworkFromURL<HandiWork>(hw.url);

        // Compare the versions
        hasUpdate = onlineHw.version?.toUpperCase() !== hw.version?.toUpperCase();
    }

    return hasUpdate;
};

/**
 * Starting from the name, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} name Name of the game searched
 * @param {Boolean} mod Indicate if you are looking for mods or games
 * @returns {Promise<GameInfo[]>} List of information obtained where each item corresponds to
 * an identified game (in the case of homonymy of titles)
 */
export async function getHandiwork<T extends IBasic>(query: HandiworkSearchQuery, limit: number = 30): Promise<T[]> {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    return await search<T>(query, limit);
};

/**
 * Starting from the url, it gets all the information 
 * about the handiwork requested.
 * 
 * You **must** be logged in to the portal before calling this method.
 */
export async function getHandiworkFromURL<T extends IBasic>(url: string): Promise<T> {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    // Check URL validity
    const exists = await urlExists(url);
    if (!exists) throw new URIError(`${url} is not a valid URL`);
    if (!isF95URL(url)) throw new Error(`${url} is not a valid F95Zone URL`);
    
    // Get game data
    return await getHandiworkInformation<T>(url);
};

/**
 * Gets the data of the currently logged in user.
 * You **must** be logged in to the portal before calling this method.
 * @returns {Promise<UserData>} Data of the user currently logged in
 */
export async function getUserData(): Promise<UserData> {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    return await retrieveUserData();
};

/**
 * Gets the latest updated games that match the specified parameters.
 * You **must** be logged in to the portal before calling this method.
 * @param {LatestSearchQuery} query
 * Parameters used for the search.
 * @param {Number} limit Maximum number of results
 */
export async function getLatestUpdates<T extends IBasic>(query: LatestSearchQuery, limit: number): Promise<T[]> {
    // Check limit value
    if (limit <= 0) throw new Error("limit must be greater than 0");

    // Fetch the results
    const urls = await fetchLatestHandiworkURLs(query, limit);

    // Get the data from urls
    const promiseList = urls.map((u: string) => getHandiworkInformation<T>(u));
    return await Promise.all(promiseList);
};
//#endregion
