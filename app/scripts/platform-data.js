"use strict";

// Core modules
const {readFileSync, writeFileSync, existsSync} = require("fs");

// Public modules from npm
const cheerio = require("cheerio");

// Modules from file
const shared = require("./shared.js");
const f95url = require("./constants/url.js");
const f95selector = require("./constants/css-selector.js");
const {fetchHTML} = require("./network-helper.js");

/**
 * @protected
 * Gets the basic data used for game data processing 
 * (such as graphics engines and progress statuses)
 */
module.exports.fetchPlatformData = async function () {
    // Check if the data are cached
    if (!_readCache(shared.cachePath)) {
        // Load the HTML
        const html = await fetchHTML(f95url.F95_LATEST_UPDATES);

        // Parse data
        const data = _parseLatestPlatformHTML(html);

        // Assign data
        _assignLatestPlatformData(data);

        // Cache data
        _saveCache(shared.cachePath);
    }
};

//#region Private methods
/**
 * @private
 * Read the platform cache (if available)
 * @param {String} path Path to cache
 */
function _readCache(path) {
    // Local variables
    let returnValue = false;

    if (existsSync(path)) {
        const data = readFileSync(path);
        const json = JSON.parse(data);
        shared.engines = json.engines;
        shared.statuses = json.statuses;
        shared.tags = json.tags;
        shared.others = json.others;
        returnValue = true;
    }
    return returnValue;
}

/**
 * @private
 * Save the current platform variables to disk.
 * @param {String} path Path to cache
 */
function _saveCache(path) {
    const saveDict = {
        engines: shared.engines,
        statuses: shared.statuses,
        tags: shared.tags,
        others: shared.others,
    };
    const json = JSON.stringify(saveDict);
    writeFileSync(path, json);
}

/**
 * @private
 * Given the HTML code of the response from the F95Zone, 
 * parse it and return the result.
 * @param {String} html 
 * @returns {Object.<string, object>} Parsed data
 */
function _parseLatestPlatformHTML(html) {
    const $ = cheerio.load(html);

    // Clean the JSON string
    const unparsedText = $(f95selector.LU_TAGS_SCRIPT).html().trim();
    const startIndex = unparsedText.indexOf("{");
    const endIndex = unparsedText.lastIndexOf("}");
    const parsedText = unparsedText.substring(startIndex, endIndex + 1);
    return JSON.parse(parsedText);
}

/**
 * @private
 * Assign to the local variables the values from the F95Zone.
 * @param {Object.<string, object>} data 
 */
function _assignLatestPlatformData(data) {
    // Local variables
    const scrapedData = {};

    // Extract and parse the data
    const prefixes = data.prefixes.games.map(e => {
        return {
            element: e.name,
            data: e.prefixes
        };
    });

    // Parse and assign the values that are NOT tags
    for (const p of prefixes) {
        // Prepare the dict
        const dict = {};
        for (const e of p.data) dict[parseInt(e.id)] = e.name.replace("&#039;", "'");

        // Save the property
        scrapedData[p.element] = dict;
    }

    // Save the values
    shared.engines = scrapedData["Engine"];
    shared.statuses = scrapedData["Status"];
    shared.others = scrapedData["Other"];
    shared.tags = data.tags;
}
//#endregion