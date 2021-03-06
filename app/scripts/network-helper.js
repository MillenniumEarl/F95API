"use strict";

// Public modules from npm
const axios = require("axios").default;
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

const commonConfig = {
    headers: {
        "User-Agent": userAgent,
        "Connection": "keep-alive"
    },
    withCredentials: true,
    jar: new tough.CookieJar() // Used to store the token in the PC
};

/**
 * @protected
 * Gets the HTML code of a page.
 * @param {String} url URL to fetch
 * @returns {Promise<String>} HTML code or `null` if an error arise
 */
module.exports.fetchHTML = async function (url) {
    // Local variables
    let returnValue = null;

    // Fetch the response of the platform
    const response = await exports.fetchGETResponse(url);

    // Manage response
    /* istambul ignore next */
    if (!response) {
        shared.logger.warn(`Unable to fetch HTML for ${url}`);
    }
    /* istambul ignore next */
    else if (!response.headers["content-type"].includes("text/html")) {
        // The response is not a HTML page
        shared.logger.warn(`The ${url} returned a ${response.headers["content-type"]} response`);
    }

    returnValue = response.data;
    return returnValue;
};

/**
 * @protected
 * It authenticates to the platform using the credentials 
 * and token obtained previously. Save cookies on your 
 * device after authentication.
 * @param {Credentials} credentials Platform access credentials
 * @param {Boolean} force Specifies whether the request should be forced, ignoring any saved cookies
 * @returns {Promise<LoginResult>} Result of the operation
 */
module.exports.authenticate = async function (credentials, force) {
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
        let config = Object.assign({}, commonConfig);
        if (force) delete config.jar;
        const response = await axios.post(secureURL, params, config);

        // Parse the response HTML
        const $ = cheerio.load(response.data);

        // Get the error message (if any) and remove the new line chars
        const errorMessage = $("body").find(f95selector.LOGIN_MESSAGE_ERROR).text().replace(/\n/g, "");

        // Return the result of the authentication
        const result = errorMessage.trim() === "";
        const message = errorMessage.trim() === "" ? "Authentication successful" : errorMessage;
        return new LoginResult(result, message);
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
    /* istambul ignore next */
    if (!response) {
        shared.logger.warn("Unable to get the token for the session");
        return null;
    }

    // The response is a HTML page, we need to find the <input> with name "_xfToken"
    const $ = cheerio.load(response.data);
    const token = $("body").find(f95selector.GET_REQUEST_TOKEN).attr("value");
    return token;
};

//#region Utility methods
/**
 * @protected
 * Performs a GET request to a specific URL and returns the response.
 * If the request generates an error (for example 400) `null` is returned.
 * @param {String} url 
 */
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
 * @returns {String} Secure URL or `null` if the argument is not a string
 */
module.exports.enforceHttpsUrl = function (url) {
    return exports.isStringAValidURL(url) ? url.replace(/^(https?:)?\/\//, "https://") : null;
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
 * Checks if the string passed by parameter has a 
 * properly formatted and valid path to a URL (HTTP/HTTPS).
 * @param {String} url String to check for correctness
 * @returns {Boolean} true if the string is a valid URL, false otherwise
 */
module.exports.isStringAValidURL = function (url) {
    // Many thanks to Daveo at StackOverflow (https://preview.tinyurl.com/y2f2e2pc)
    const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
    const regex = new RegExp(expression);
    if (url.match(regex)) return true;
    else return false;
};

/**
 * @protected
 * Check if a particular URL is valid and reachable on the web.
 * @param {String} url URL to check
 * @param {Boolean} [checkRedirect] 
 * If true, the function will consider redirects a violation and return false.
 * Default: false
 * @returns {Promise<Boolean>} true if the URL exists, false otherwise
 */
module.exports.urlExists = async function (url, checkRedirect = false) {
    // Local variables
    let valid = false;

    if (exports.isStringAValidURL(url)) {
        valid = await _axiosUrlExists(url);

        if (valid && checkRedirect) {
            const redirectUrl = await exports.getUrlRedirect(url);
            valid = redirectUrl === url;
        }
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
    const response = await axios.head(url);
    return response.config.url;
};
//#endregion Utility methods

//#region Private methods
/**
 * @private
 * Check with Axios if a URL exists.
 * @param {String} url 
 */
async function _axiosUrlExists(url) {
    // Local variables
    let valid = false;
    try {
        const response = await axios.head(url, {timeout: 3000});
        valid = response && !/4\d\d/.test(response.status);
    } catch (error) {
        if (error.code === "ENOTFOUND") valid = false;
        else if (error.code === "ETIMEDOUT") valid = false;
        else throw error;
    }
    return valid;
}
//#endregion
