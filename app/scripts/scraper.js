"use strict";

// Public modules from npm
const cheerio = require("cheerio");
const {DateTime} = require("luxon");

// Modules from file
const { fetchHTML, getUrlRedirect } = require("./network-helper.js");
const shared = require("./shared.js");
const GameInfo = require("./classes/game-info.js");
const f95Selector = require("./constants/css-selector.js");

/**
 * @protected
 * Get information from the game's main page.
 * @param {String} url URL of the game/mod to extract data from
 * @return {Promise<GameInfo>} Complete information about the game you are
 * looking for or `null` if is impossible to parse information
 */
module.exports.getGameInfo = async function (url) {
    shared.logger.info("Obtaining game info");

    // Fetch HTML and prepare Cheerio
    const html = await fetchHTML(url);
    const $ = cheerio.load(html);
    const body = $("body");
    const mainPost = $(f95Selector.GS_POSTS).first();

    // Extract data
    const titleData = extractInfoFromTitle(body);
    const tags = extractTags(body);
    const prefixesData = parseGamePrefixes(body);
    const src = extractPreviewSource(body);
    const changelog = extractChangelog(mainPost);
    const structuredData = extractStructuredData(body);

    // Sometimes the JSON-LD are not set, especially in low-profile game
    if(!structuredData) return null;

    const parsedInfos = parseMainPostText(structuredData.description);
    const overview = getOverview(structuredData.description, prefixesData.mod);
    
    // Obtain the updated URL
    const redirectUrl = await getUrlRedirect(url);

    // Fill in the GameInfo element with the information obtained
    const info = new GameInfo();
    info.id = extractIDFromURL(url);
    info.name = titleData.name;
    info.author = titleData.author;
    info.isMod = prefixesData.mod;
    info.engine = prefixesData.engine;
    info.status = prefixesData.status;
    info.tags = tags;
    info.url = redirectUrl;
    info.language = parsedInfos.Language;
    info.overview = overview;
    info.supportedOS = parsedInfos.SupportedOS;
    info.censored = parsedInfos.Censored;
    info.lastUpdate = parsedInfos.LastUpdate;
    info.previewSrc = src;
    info.changelog = changelog;
    info.version = titleData.version;
    
    shared.logger.info(`Founded data for ${info.name}`);
    return info;
};

//#region Private methods
/**
 * @private
 * Parse the game prefixes obtaining the engine used, 
 * the advancement status and if the game is actually a game or a mod.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {Object.<string, object>} Dictionary of values with keys `engine`, `status`, `mod`
 */
function parseGamePrefixes(body) {
    shared.logger.trace("Parsing prefixes...");

    // Local variables
    let mod = false,
        engine = null,
        status = null;

    // Obtain the title prefixes
    const prefixeElements = body.find(f95Selector.GT_TITLE_PREFIXES);
    
    prefixeElements.each(function parseGamePrefix(idx, el) {
        // Obtain the prefix text
        let prefix = cheerio.load(el).text().trim();

        // Remove the square brackets
        prefix = prefix.replace("[", "").replace("]", "");

        // Check what the prefix indicates
        if (isEngine(prefix)) engine = prefix;
        else if (isStatus(prefix)) status = prefix;
        else if (isMod(prefix)) mod = true;
    });

    // If the status is not set, then the game in in development (Ongoing)
    if (!status) status = "Ongoing";

    return {
        engine,
        status,
        mod
    };
}

/**
 * @private
 * Extracts all the possible informations from the title.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {Object.<string, string>} Dictionary of values with keys `name`, `author`, `version`
 */
function extractInfoFromTitle(body) {
    shared.logger.trace("Extracting information from title...");
    const title = body
        .find(f95Selector.GT_TITLE)
        .text()
        .trim();

    // From the title we can extract: Name, author and version
    // [PREFIXES] TITLE [VERSION] [AUTHOR]
    const matches = title.match(/\[(.*?)\]/g);

    // Get the title name
    let name = title;
    matches.forEach(function replaceElementsInTitle(e) {
        name = name.replace(e, "");
    });
    name = name.trim();

    // The version is the penultimate element. 
    // If the matches are less than 2, than the title 
    // is malformes and only the author is fetched
    // (usually the author is always present)
    let version = null;
    if (matches.length >= 2) {
        // The regex [[\]]+ remove the square brackets
        version = matches[matches.length - 2].replace(/[[\]]+/g, "").trim();

        // Remove the trailing "v"
        if (version[0] === "v") version = version.replace("v", "");
    }
    else shared.logger.trace(`Malformed title: ${title}`);

    // Last element (the regex [[\]]+ remove the square brackets)
    const author = matches[matches.length - 1].replace(/[[\]]+/g, "").trim();

    return {
        name,
        version,
        author,
    };
}

/**
 * @private
 * Gets the tags used to classify the game.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {String[]} List of tags
 */
function extractTags(body) {
    shared.logger.trace("Extracting tags...");

    // Get the game tags
    const tagResults = body.find(f95Selector.GT_TAGS);
    return tagResults.map(function parseGameTags(idx, el) {
        return cheerio.load(el).text().trim();
    }).get();
}

/**
 * @private
 * Gets the URL of the image used as a preview.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {String} URL of the image
 */
function extractPreviewSource(body) {
    shared.logger.trace("Extracting image preview source...");
    const image = body.find(f95Selector.GT_IMAGES);
    
    // The "src" attribute is rendered only in a second moment, 
    // we need the "static" src value saved in the attribute "data-src"
    const source = image ? image.attr("data-src") : null;
    return source;
}

/**
 * @private
 * Gets the changelog of the latest version.
 * @param {cheerio.Cheerio} mainPost main post selector
 * @returns {String} Changelog of the last version or `null` if no changelog is fetched
 */
function extractChangelog(mainPost) {
    shared.logger.trace("Extracting last changelog...");

    // Obtain the changelog for ALL the versions
    let changelog = mainPost.find(f95Selector.GT_LAST_CHANGELOG).text().trim();

    // Parse the latest changelog
    const endChangelog = changelog.indexOf("\nv"); // \n followed by version (v)
    if (endChangelog !== -1) changelog = changelog.substring(0, endChangelog + 1);

    // Clean changelog
    changelog = changelog.replace("Spoiler", "");
    changelog = changelog.replace(/\n+/g, "\n"); // Multiple /n
    changelog = changelog.trim();

    // Delete the version at the start of the changelog
    const firstNewLine = changelog.indexOf("\n");
    const supposedVersion = changelog.substring(0, firstNewLine);
    if (supposedVersion[0] === "v") changelog = changelog.substring(firstNewLine).trim();
    
    // Return changelog
    return changelog ? changelog : null;
}

/**
 * @private
 * Process the main post text to get all the useful
 * information in the format *DESCRIPTOR : VALUE*.
 * Gets "standard" values such as: `Language`, `SupportedOS`, `Censored`, and `LastUpdate`.
 * All non-canonical values are instead grouped together as a dictionary with the key `Various`.
 * @param {String} text Structured text of the post
 * @returns {Object.<string, object>} Dictionary of information
 */
function parseMainPostText(text) {
    shared.logger.trace("Parsing main post raw text...");

    const data = {};

    // The information searched in the game post are one per line
    const splittedText = text.split("\n");
    for (const line of splittedText) {
        if (!line.includes(":")) continue;

        // Create pair key/value
        const splitted = line.split(":");
        const key = splitted[0].trim().toUpperCase().replace(/ /g, "_"); // Uppercase to avoid mismatch
        const value = splitted[1].trim();

        // Add pair to the dict if valid
        if (value !== "") data[key] = value;
    }

    // Parse the standard pairs
    const parsedDict = {};

    // Check if the game is censored
    if (data.CENSORED) {
        const censored = data.CENSORED.toUpperCase() === "NO" ? false : true;
        parsedDict["Censored"] = censored;
        delete data.CENSORED;
    }

    // Last update of the main post
    if (data.UPDATED && DateTime.fromISO(data.UPDATED).isValid) {
        parsedDict["LastUpdate"] = new Date(data.UPDATED);
        delete data.UPDATED;
    }
    else if (data.THREAD_UPDATED && DateTime.fromISO(data.THREAD_UPDATED).isValid) {
        parsedDict["LastUpdate"] = new Date(data.THREAD_UPDATED);
        delete data.THREAD_UPDATED;
    }

    // Parse the supported OS
    if (data.OS) {
        const listOS = [];

        // Usually the string is something like "Windows, Linux, Mac"
        const splitted = data.OS.split(",");
        splitted.forEach(function (os) {
            listOS.push(os.trim());
        });

        parsedDict["SupportedOS"] = listOS;
        delete data.OS;
    }

    // Rename the key for the language
    if (data.LANGUAGE) {
        parsedDict["Language"] = data.LANGUAGE;
        delete data.LANGUAGE;
    }

    // What remains is added to a sub dictionary
    parsedDict["Various"] = data;
    
    return parsedDict;
}

/**
 * @private
 * Extracts and processes the JSON-LD values found at the bottom of the page.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {Object.<string, string>} JSON-LD or `null` if no valid JSON is found
 */
function extractStructuredData(body) {
    shared.logger.trace("Extracting JSON-LD data...");
    const structuredDataElements = body.find(f95Selector.GT_JSONLD);
    const json = structuredDataElements.map(function parseScriptTag(idx, el) {
        // Get the element HTML
        const html = cheerio.load(el).html().trim();

        // Obtain the JSON-LD
        const data = html
            .replace("<script type=\"application/ld+json\">", "")
            .replace("</script>", "");

        // Convert the string to an object
        const json = JSON.parse(data);

        // Return only the data of the game
        if (json["@type"] === "Book") return json;
    }).get();
    return json.lenght !== 0 ? json[0] : null;
}

/**
 * @private
 * Get the game description from its web page.
 * Different processing depending on whether the game is a mod or not.
 * @param {String} text Structured text extracted from the game's web page
 * @param {Boolean} mod Specify if it is a game or a mod
 * @returns {String} Game description
 */
function getOverview(text, mod) {
    shared.logger.trace("Extracting game overview...");

    // Get overview (different parsing for game and mod)
    const overviewEndIndex = mod ? text.indexOf("Updated") : text.indexOf("Thread Updated");
    return text.substring(0, overviewEndIndex).replace("Overview:\n", "").trim();
}

/**
 * @private
 * Check if the prefix is a game's engine.
 * @param {String} prefix Prefix to check
 * @return {Boolean}
 */
function isEngine(prefix) {
    const engines = toUpperCaseArray(Object.values(shared.engines));
    return engines.includes(prefix.toUpperCase());
}

/**
 * @private
 * Check if the prefix is a game's status.
 * @param {String} prefix Prefix to check
 * @return {Boolean}
 */
function isStatus(prefix) {
    const statuses = toUpperCaseArray(Object.values(shared.statuses));
    return statuses.includes(prefix.toUpperCase());
}

/**
 * @private
 * Check if the prefix indicates a mod.
 * @param {String} prefix Prefix to check
 * @return {Boolean}
 */
function isMod(prefix) {
    const modPrefixes = ["MOD", "CHEAT MOD"];
    return modPrefixes.includes(prefix.toUpperCase());
}

/**
 * @private
 * Extracts the game's unique ID from the game's URL.
 * @param {String} url Game's URL
 * @return {Number} Game's ID
 */
function extractIDFromURL(url) {
    // URL are in the format https://f95zone.to/threads/GAMENAME-VERSION-DEVELOPER.ID/
    // or https://f95zone.to/threads/ID/
    const match = url.match(/([0-9]+)(?=\/|\b)(?!-|\.)/);
    if(!match) return -1;

    // Parse and return number
    return parseInt(match[0], 10);
}

/**
 * @private
 * Makes an array of strings uppercase.
 * @param {String[]} a 
 * @returns {String[]}
 */
function toUpperCaseArray(a) {
    // If the array is empty, return
    if(a.length === 0) return [];

    /**
     * Makes a string uppercase.
     * @param {String} s 
     * @returns {String}
     */
    function toUpper(s) {
        return s.toUpperCase();
    }
    return a.map(toUpper);
}
//#endregion Private methods