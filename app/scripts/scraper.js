"use strict";

// Public modules from npm
const cheerio = require("cheerio");

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
 * looking for
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
    console.log(titleData);
    const tags = extractTags(body);
    console.log(tags);
    const mainPostData = extractInfoFromMainPost(mainPost);
    console.log(mainPostData);
    const structuredData = extractStructuredData(body);
    
    // Obtain the updated URL
    const redirectUrl = await getUrlRedirect(url);

    // TODO: Check to change
    const parsedInfos = parseMainPostText(mainPost.text());
    const overview = getOverview(mainPost.text(), info.isMod);

    // Fill in the GameInfo element with the information obtained
    const info = new GameInfo();
    info.name = titleData.name;
    info.author = titleData.author;
    info.isMod = titleData.mod;
    info.engine = titleData.engine;
    info.status = titleData.status;
    info.tags = tags;
    info.url = redirectUrl;
    info.overview = overview;
    info.lastUpdate = titleData.mod ? parsedInfos.UPDATED : parsedInfos.THREAD_UPDATED;
    info.previewSource = mainPostData.previewSource;
    info.changelog = mainPostData.changelog;
    info.version = titleData.version;
    
    shared.logger.info(`Founded data for ${info.name}`);
    return info;
};

//#region Private methods
/**
 * @private
 * Extracts all the possible informations from the title, including the prefixes.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {Object} Dictionary of values
 */
function extractInfoFromTitle(body) {
    const title = body
        .find(f95Selector.GT_TITLE)
        .text()
        .trim();

    // From the title we can extract: Name, author and version
    // TITLE [VERSION] [AUTHOR]
    const matches = title.match(/\[(.*?)\]/);
    const endIndex = title.indexOf("["); // The open bracket of the version
    const name = title.substring(0, endIndex).trim();
    const version = matches[0].trim();
    const author = matches[1].trim();

    // Parse the title prefixes
    const prefixeElements = body.find(f95Selector.GT_TITLE_PREFIXES);
    let mod = false, engine = null, status = null;
    prefixeElements.each(function parseGamePrefixes(el) {
        const prefix = el.text().trim();
        if(isEngine(prefix)) engine = prefix;
        else if(isStatus(prefix)) status = prefix;
        else if (isMod(prefix)) mod = true;
    });

    return {
        name,
        version,
        author,
        engine,
        status,
        mod
    };
}

/**
 * @private
 * Gets the tags used to classify the game.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {String[]} List of tags
 */
function extractTags(body) {
    // Get the game tags
    const tagResults = body.find(f95Selector.GT_TAGS);
    return tagResults.map((idx, el) => {
        return el.text().trim();
    }).get();
}

/**
 * @private
 * Extracts the name of the game, its author and its current version from the title of the page.
 * @param {cheerio.Cheerio} mainPost Selector of the main post
 * @returns {Object} Dictionary of values
 */
function extractInfoFromMainPost(mainPost) {
    // Get the preview image
    const previewElement = mainPost.find(f95Selector.GT_IMAGES);
    const previewSource = previewElement ? previewElement.first().attr("src") : null;

    // Get the latest changelog
    const changelogElement = mainPost.find(f95Selector.GT_LAST_CHANGELOG);
    const changelog = changelogElement ? changelogElement.text().trim() : null;
    
    return {
        previewSource,
        changelog
    };
}

/**
 * @private
 * Process the main post text to get all the useful
 * information in the format *DESCRIPTOR : VALUE*.
 * @param {String} text Structured text of the post
 * @returns {Object} Dictionary of information
 */
function parseMainPostText(text) {
    const dataPairs = {};

    // The information searched in the game post are one per line
    const splittedText = text.split("\n");
    for (const line of splittedText) {
        if (!line.includes(":")) continue;

        // Create pair key/value
        const splitted = line.split(":");
        const key = splitted[0].trim().toUpperCase().replace(/ /g, "_"); // Uppercase to avoid mismatch
        const value = splitted[1].trim();

        // Add pair to the dict if valid
        if (value !== "") dataPairs[key] = value;
    }

    return dataPairs;
}

/**
 * @private
 * Extracts and processes the JSON-LD values found at the bottom of the page.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns ???
 */
function extractStructuredData(body) {
    const structuredDataElements = body.find("...");
    for (const el in structuredDataElements) {
        for (const child in structuredDataElements[el].children) {
            const data = structuredDataElements[el].children[child].data;
            console.log(data);
            // TODO: The @type should be "Book"
            // TODO: Test here
        }
    }
}

/**
 * @private
 * Get the game description from its web page.
 * Different processing depending on whether the game is a mod or not.
 * @param {String} text Structured text extracted from the game's web page
 * @param {Boolean} mod Specify if it is a game or a mod
 * @returns {Promise<String>} Game description
 */
function getOverview(text, mod) {
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
    const engines = toUpperCaseArray(shared.engines);
    return engines.includes(prefix.toUpperCase());
}

/**
 * @private
 * Check if the prefix is a game's status.
 * @param {String} prefix Prefix to check
 * @return {Boolean}
 */
function isStatus(prefix) {
    const statuses = toUpperCaseArray(shared.statuses);
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
 * Makes an array of strings uppercase.
 * @param {String[]} a 
 * @returns {String[]}
 */
function toUpperCaseArray(a) {
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