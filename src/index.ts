"use strict";

// Modules from file
const shared = require("./scripts/shared.js");
const networkHelper = require("./scripts/network-helper.js");
const scraper = require("./scripts/scraper.js");
const searcher = require("./scripts/searcher.js");
const uScraper = require("./scripts/user-scraper.js");
const latestFetch = require("./scripts/latest-fetch.js");
const fetchPlatformData = require("./scripts/platform-data.js").fetchPlatformData;

// Classes from file
const Credentials = require("./scripts/classes/credentials.js");
const GameInfo = require("./scripts/classes/game-info.js");
const LoginResult = require("./scripts/classes/login-result.js");
const UserData = require("./scripts/classes/user-data.js");
const PrefixParser = require("./scripts/classes/prefix-parser.js");

//#region Global variables
const USER_NOT_LOGGED = "User not authenticated, unable to continue";
//#endregion

//#region Export classes
module.exports.GameInfo = GameInfo;
module.exports.LoginResult = LoginResult;
module.exports.UserData = UserData;
module.exports.PrefixParser = PrefixParser;
//#endregion Export classes

//#region Export properties
/**
 * @public
 * Set the logger level for module debugging.
 */
/* istambul ignore next */
module.exports.loggerLevel = shared.logger.level;
exports.loggerLevel = "warn"; // By default log only the warn messages
/**
 * @public
 * Indicates whether a user is logged in to the F95Zone platform or not.
 * @returns {String}
 */
module.exports.isLogged = function isLogged() {
    return shared.isLogged;
};
//#endregion Export properties

//#region Export methods
/**
 * @public
 * Log in to the F95Zone platform.
 * This **must** be the first operation performed before accessing any other script functions.
 * @param {String} username Username used for login
 * @param {String} password Password used for login
 * @returns {Promise<LoginResult>} Result of the operation
 */
module.exports.login = async function (username, password) {
    /* istanbul ignore next */
    if (shared.isLogged) {
        shared.logger.info(`${username} already authenticated`);
        return new LoginResult(true, `${username} already authenticated`);
    }

    shared.logger.trace("Fetching token...");
    const creds = new Credentials(username, password);
    await creds.fetchToken();

    shared.logger.trace(`Authentication for ${username}`);
    const result = await networkHelper.authenticate(creds);
    shared.isLogged = result.success;

    // Load platform data
    if (result.success) await fetchPlatformData();

    /* istambul ignore next */
    if (result.success) shared.logger.info("User logged in through the platform");
    else shared.logger.warn(`Error during authentication: ${result.message}`);

    return result;
};

/**
 * @public
 * Chek if exists a new version of the game.
 * You **must** be logged in to the portal before calling this method.
 * @param {GameInfo} info Information about the game to get the version for
 * @returns {Promise<Boolean>} true if an update is available, false otherwise
 */
module.exports.checkIfGameHasUpdate = async function (info) {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return false;
    }

    // F95 change URL at every game update,
    // so if the URL is different an update is available
    const exists = await networkHelper.urlExists(info.url, true);
    if (!exists) return true;

    // Parse version from title
    const onlineInfo = await scraper.getGameInfo(info.url);
    const onlineVersion = onlineInfo.version;
    
    // Compare the versions
    return onlineVersion.toUpperCase() !== info.version.toUpperCase();
};

/**
 * @public
 * Starting from the name, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} name Name of the game searched
 * @param {Boolean} mod Indicate if you are looking for mods or games
 * @returns {Promise<GameInfo[]>} List of information obtained where each item corresponds to
 * an identified game (in the case of homonymy of titles)
 */
module.exports.getGameData = async function (name, mod) {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    // Gets the search results of the game/mod being searched for
    const urls = mod ? 
        await searcher.searchMod(name) : 
        await searcher.searchGame(name);

    // Process previous partial results
    const results = [];
    for (const url of urls) {
        // Start looking for information
        const info = await scraper.getGameInfo(url);
        if (info) results.push(info);
    }
    return results;
};

/**
 * @public
 * Starting from the url, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} url URL of the game to obtain information of
 * @returns {Promise<GameInfo>} Information about the game. If no game was found, null is returned
 */
module.exports.getGameDataFromURL = async function (url) {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    // Check URL validity
    const exists = await networkHelper.urlExists(url);
    if (!exists) throw new URIError(`${url} is not a valid URL`);
    if (!networkHelper.isF95URL(url)) throw new Error(`${url} is not a valid F95Zone URL`);
    
    // Get game data
    return await scraper.getGameInfo(url);
};

/**
 * @public
 * Gets the data of the currently logged in user.
 * You **must** be logged in to the portal before calling this method.
 * @returns {Promise<UserData>} Data of the user currently logged in
 */
module.exports.getUserData = async function () {
    /* istanbul ignore next */
    if (!shared.isLogged) {
        shared.logger.warn(USER_NOT_LOGGED);
        return null;
    }

    return await uScraper.getUserData();
};

/**
 * @public
 * Gets the latest updated games that match the specified parameters.
 * You **must** be logged in to the portal before calling this method.
 * @param {Object} args
 * Parameters used for the search.
 * @param {String[]} [args.tags]
 * List of tags to be included in the search (max 5).
 * @param {Number} [args.datelimit]
 * Number of days since the game was last updated.
 * The entered value will be approximated to the nearest valid one.
 * Use `0` to select no time limit.
 * @param {String[]} [args.prefixes]
 * Prefixes to be included in the search.
 * @param {String} [args.sorting]
 * Method of sorting the results between (default: `date`):
 * `date`, `likes`, `views`, `name`, `rating`
 * @param {Number} limit Maximum number of results
 * @returns {Promise<GameInfo[]>} List of games
 */
module.exports.getLatestUpdates = async function(args, limit) {
    // Check limit value
    if(limit <= 0) throw new Error("limit must be greater than 0");

    // Prepare the parser
    const parser = new PrefixParser();

    // Get the closest date limit
    let filterDate = 0;
    if(args.datelimit) {
        const validDate = [365, 180, 90, 30, 14, 7, 3, 1, 0];
        filterDate = getNearestValueFromArray(validDate, args.datelimit);
    }

    // Fetch the games
    const query = {
        tags: args.tags ? parser.prefixesToIDs(args.tags) : [],
        prefixes: args.prefixes ? parser.prefixesToIDs(args.prefixes) : [],
        sort: args.sorting ? args.sorting : "date",
        date: filterDate,
    };
    const urls = await latestFetch.fetchLatest(query, limit);

    // Get the gamedata from urls
    const promiseList = urls.map(u => exports.getGameDataFromURL(u));
    return await Promise.all(promiseList);
};
//#endregion

//#region Private Methods
/**
 * @private
 * Given an array of numbers, get the nearest value for a given `value`.
 * @param {Number[]} array List of default values
 * @param {Number} value Value to search
 */
function getNearestValueFromArray(array, value) {
    // Script taken from:
    // https://www.gavsblog.com/blog/find-closest-number-in-array-javascript
    array.sort((a, b) => {
        return Math.abs(value - a) - Math.abs(value - b);
    });
    return array[0];
}
//#endregion
