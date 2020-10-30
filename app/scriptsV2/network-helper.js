"use strict";

// Public modules from npm
const axios = require("axios").default;
const _ = require("lodash");

// Modules from file
const shared = require("./scripts/shared.js");

/**
 * @protected
 * Gets the HTML code of a page.
 * @param {String} url URL to fetch
 * @returns {Promise<String>} HTML code or `null` if an error arise
 */
module.exports = async function fetchHTML(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch {
        shared.logger.error(`An error occurred while trying to fetch the URL: ${url}`);
        return null;
    }
};

/**
 * @protected
 * Enforces the scheme of the URL is https and returns the new URL.
 * @param {String} url 
 * @returns {String}
 */
module.exports = function enforceHttpsUrl(url) {
    const value = _.isString(url) ? url.replace(/^(https?:)?\/\//, "https://") : null;
    return value;
};