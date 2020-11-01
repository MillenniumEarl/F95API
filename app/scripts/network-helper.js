"use strict";

// Public modules from npm
const axios = require("axios").default;
const _ = require("lodash");
const ky = require("ky-universal").create({
    throwHttpErrors: false,
});
const cheerio = require("cheerio");
const axiosCookieJarSupport = require("axios-cookiejar-support").default;
const tough = require("tough-cookie");

// Modules from file
const shared = require("./shared.js");
const f95url = require("./constants/url.js");
const f95selector = require("./constants/css-selector.js");
const LoginResult = require("./classes/login-result.js");

// Global variables
const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) " + 
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15";
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

const commonConfig = {
    headers: {
        "User-Agent": userAgent,
        "Connection": "keep-alive"
    },
    withCredentials: true,
    jar: cookieJar // Used to store the token in the PC
};

/**
 * @protected
 * Gets the HTML code of a page.
 * @param {String} url URL to fetch
 * @returns {Promise<String>} HTML code or `null` if an error arise
 */
module.exports.fetchHTML = async function (url) {
    // Fetch the response of the platform
    const response = await exports.fetchGETResponse(url);
    if (!response) {
        shared.logger.warn(`Unable to fetch HTML for ${url}`);
        return null;
    }
    return response.data;
};

/**
 * @protected
 * It authenticates to the platform using the credentials 
 * and token obtained previously. Save cookies on your 
 * device after authentication.
 * @param {Credentials} credentials Platform access credentials
 * @returns {Promise<LoginResul>} Result of the operation
 */
module.exports.autenticate = async function (credentials) {
    shared.logger.info(`Authenticating with user ${credentials.username}`);
    if (!credentials.token) throw new Error(`Invalid token for auth: ${credentials.token}`);

    // Secure the URL
    const secureURL = exports.enforceHttpsUrl(f95url.F95_LOGIN_URL);

    // Prepare the parameters to send to the platform to authenticate
    const params = new URLSearchParams();
    params.append("login", credentials.username);
    params.append("url", "");
    params.append("password", credentials.password);
    params.append("password_confirm", "");
    params.append("additional_security", "");
    params.append("remember", "1");
    params.append("_xfRedirect", "https://f95zone.to/");
    params.append("website_code", "");
    params.append("_xfToken", credentials.token);

    try {
        // Try to log-in
        const response = await axios.post(secureURL, params, commonConfig);

        // Parse the response HTML
        const $ = cheerio.load(response.data);

        // Get the error message (if any) and remove the new line chars
        const errorMessage = $("body").find(f95selector.LOGIN_MESSAGE_ERROR).text().replace(/\n/g, "");

        // Return the result of the authentication
        if (errorMessage === "") return new LoginResult(true, "Authentication successful");
        else return new LoginResult(false, errorMessage);
    } catch (e) {
        shared.logger.error(`Error ${e.message} occurred while authenticating to ${secureURL}`);
        return new LoginResult(false, `Error ${e.message} while authenticating`);
    }
};

/**
 * Obtain the token used to authenticate the user to the platform.
 * @returns {Promise<String>} Token or `null` if an error arise
 */
module.exports.getF95Token = async function() {
    // Fetch the response of the platform
    const response = await exports.fetchGETResponse(f95url.F95_LOGIN_URL);
    if (!response) {
        shared.logger.warn("Unable to get the token for the session");
        return null;
    }

    // The response is a HTML page, we need to find the <input> with name "_xfToken"
    const $ = cheerio.load(response.data);
    const token = $("body").find(f95selector.GET_REQUEST_TOKEN).attr("value");
    return token;
};

/**
 * @protected
 * Gets the basic data used for game data processing 
 * (such as graphics engines and progress statuses)
 * @deprecated
 */
module.exports.fetchPlatformData = async function() {
    // Fetch the response of the platform
    const response = await exports.fetchGETResponse(f95url.F95_LATEST_UPDATES);
    if (!response) {
        shared.logger.warn("Unable to get the token for the session");
        return;
    }

    // The response is a HTML page, we need to find 
    // the base data, used when scraping the games
    const $ = cheerio.load(response.data);

    // Extract the elements
    const engineElements = $("body").find(f95selector.BD_ENGINE_ID_SELECTOR);
    const statusesElements = $("body").find(f95selector.BD_STATUS_ID_SELECTOR);

    // Extract the raw text
    engineElements.each(function extractEngineNames(idx, el) {
        const engine = cheerio.load(el).text().trim();
        shared.engines.push(engine);
    });

    statusesElements.each(function extractEngineNames(idx, el) {
        const status = cheerio.load(el).text().trim();
        shared.statuses.push(status);
    });
};

//#region Utility methods
module.exports.fetchGETResponse = async function(url) {
    // Secure the URL
    const secureURL = exports.enforceHttpsUrl(url);

    try {
        // Fetch and return the response
        return await axios.get(secureURL, commonConfig);
    } catch (e) {
        shared.logger.error(`Error ${e.message} occurred while trying to fetch ${secureURL}`);
        return null;
    }
};

/**
 * @protected
 * Enforces the scheme of the URL is https and returns the new URL.
 * @param {String} url 
 * @returns {String}
 */
module.exports.enforceHttpsUrl = function (url) {
    return _.isString(url) ? url.replace(/^(https?:)?\/\//, "https://") : null;
};

/**
 * @protected
 * Check if the url belongs to the domain of the F95 platform.
 * @param {String} url URL to check
 * @returns {Boolean} true if the url belongs to the domain, false otherwise
 */
module.exports.isF95URL = function (url) {
    if (url.toString().startsWith(f95url.F95_BASE_URL)) return true;
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
 * @protected
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
        const redirectUrl = await exports.getUrlRedirect(url);
        if (redirectUrl === url) valid = true;
        else valid = false;
    }

    return valid;
};

/**
 * @protected
 * Check if the URL has a redirect to another page.
 * @param {String} url URL to check for redirect
 * @returns {Promise<String>} Redirect URL or the passed URL
 */
module.exports.getUrlRedirect = async function (url) {
    const response = await ky.head(url);
    return response.url;
};
//#endregion Utility methods