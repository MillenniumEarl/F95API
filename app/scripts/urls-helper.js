'use strict';

// Modules from file
const {
    F95_BASE_URL
} = require('./constants/urls.js');

/**
 * @protected
 * Check if the url belongs to the domain of the F95 platform.
 * @param {String} url URL to check
 * @returns {Boolean} true if the url belongs to the domain, false otherwise
 */
module.exports.isF95URL = function(url) {
    if (url.toString().startsWith(F95_BASE_URL)) return true;
    else return false;
}

/**
 * @protected
 * Checks if the string passed by parameter has a properly formatted and valid path to a URL.
 * @param {String} url String to check for correctness
 * @returns {Boolean} true if the string is a valid URL, false otherwise
 */
module.exports.isStringAValidURL = function(url) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}