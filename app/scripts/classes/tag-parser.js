"use strict";

// Public modules from npm
const cheerio = require("cheerio");

// Modules from file
const { fetchHTML } = require("../network-helper.js");
const f95Selector = require("../constants/css-selector.js");
const { F95_LATEST_UPDATES } = require("../constants/url.js");

class TagParser {
    constructor() {
        /**
         * Dictionary mapping the keys to the F95API game tags.
         * @type Object.<number,string>
         */
        this._tagsDict = {};
    }

    //#region Private methods
    /**
     * @private
     * Gets the key associated with a given value from a dictionary.
     * @param {Object} object Dictionary to search 
     * @param {Any} value Value associated with the key
     * @returns {String|undefined} Key found or undefined
     */
    _getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }
    //#endregion Private methods

    /**
     * @public
     * Gets all tags, with their IDs, from F95Zone.
     */
    async fetch() {
        // Clean dictionary
        this._tagsDict = {};

        // Load the HTML
        const html = await fetchHTML(F95_LATEST_UPDATES);
        const $ = cheerio.load(html);

        // Search for the tags
        const unparsedText = $(f95Selector.LU_TAGS_SCRIPT).html().trim();
        const startIndex = unparsedText.indexOf("{");
        const endIndex = unparsedText.lastIndexOf("}");
        const parsedText = unparsedText.substring(startIndex, endIndex + 1);
        const data = JSON.parse(parsedText);
        
        // Extract only the data we need
        this._tagsDict = data.tags;
    }

    /**
     * @public
     * Convert a list of tags to their respective IDs.
     * @param {String[]} tags 
     */
    tagsToIDs(tags) {
        const ids = [];
        for(const tag of tags) {
            // Extract the key from the value
            const key = this._getKeyByValue(this._tagsDict, tag);
            /* istanbul ignore next */
            if(key) ids.push(parseInt(key));
        }
        return ids.sort((a, b) => a - b); // JS sort alphabetically, same old problem
    }

    /**
     * @public
     * It converts a list of IDs into their respective tags.
     * @param {number[]} ids 
     */
    idsToTags(ids) {
        const tags = [];
        for(const id of ids) {
            // Check if the key exists in the dict
            const exist = id in this._tagsDict;
            /* istanbul ignore next */
            if (!exist) continue;

            // Save the value
            tags.push(this._tagsDict[id]);
        }
        return tags.sort();
    }
}

module.exports = TagParser;