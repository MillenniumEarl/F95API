'use strict';

// Public modules from npm
const ky = require('ky-universal').create({
  throwHttpErrors: false
});

// Modules from file
const { F95_BASE_URL } = require('./constants/urls.js');

/**
 * @protected
 * Check if the url belongs to the domain of the F95 platform.
 * @param {String} url URL to check
 * @returns {Boolean} true if the url belongs to the domain, false otherwise
 */
module.exports.isF95URL = function (url) {
  if (url.toString().startsWith(F95_BASE_URL)) return true;
  else return false;
};

/**
 * @protected
 * Checks if the string passed by parameter has a properly formatted and valid path to a URL.
 * @param {String} url String to check for correctness
 * @returns {Boolean} true if the string is a valid URL, false otherwise
 */
module.exports.isStringAValidURL = function (url) {
  try {
    new URL(url); // skipcq: JS-0078
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * @public
 * Check if a particular URL is valid and reachable on the web.
 * @param {String} url URL to check
 * @param {Boolean} checkRedirect If true, the function will consider redirects a violation and return false
 * @returns {Promise<Boolean>} true if the URL exists, false otherwise
 */
module.exports.urlExists = async function (url, checkRedirect) {
  if (!exports.isStringAValidURL(url)) {
    return false;
  }

  const response = await ky.head(url);
  let valid = response !== undefined && !/4\d\d/.test(response.status);

  if (!valid) return false;

  if (checkRedirect) {
    if (response.url === url) valid = true;
    else valid = false;
  }

  return valid;
};
