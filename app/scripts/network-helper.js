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

// Global variables
const userAgent =
    "Mozilla/5.0 (X11; Linux x86_64)" +
    "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/64.0.3282.39 Safari/537.36";
axiosCookieJarSupport(axios);
const cookieJar = new tough.CookieJar();

/**
 * @protected
 * Gets the HTML code of a page.
 * @param {String} url URL to fetch
 * @returns {Promise<String>} HTML code or `null` if an error arise
 */
module.exports.fetchHTML = async function (url) {
    try {
        const response = await axios.get(url, {
            headers: {
                "User-Agent": userAgent
            },
            withCredentials: true,
            jar: cookieJar
        });
        return response.data;
    } catch (e) {
        shared.logger.error(`Error ${e.message} occurred while trying to fetch ${url}`);
        return null;
    }
};

/**
 * @protected
 * It authenticates to the platform using the credentials 
 * and token obtained previously. Save cookies on your 
 * device after authentication.
 * @param {Credentials} credentials Platform access credentials
 * @returns {Promise<Boolean>} Result of the operation
 */
module.exports.autenticate = async function (credentials) {
    shared.logger.info(`Authenticating with user ${credentials.username}`);
    if (!credentials.token) throw new Error(`Invalid token for auth: ${credentials.token}`);

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

    const config = {
        headers: {
            "User-Agent": userAgent,
            "Content-Type": "application/x-www-form-urlencoded",
            "Connection": "keep-alive"
        },
        withCredentials: true,
        jar: cookieJar // Retrieve the stored cookies! What a pain to understand that this is a MUST!
    };

    try {
        await axios.post(f95url.F95_LOGIN_URL, params, config);
        return true;
    } catch (e) {
        shared.logger.error(`Error ${e.message} occurred while authenticating to ${f95url.F95_LOGIN_URL}`);
        return false;
    }
};

/**
 * Obtain the token used to authenticate the user to the platform.
 * @returns {Promise<String>} Token or `null` if an error arise
 */
module.exports.getF95Token = async function() {
    try {
        const config = {
            headers: {
                "User-Agent": userAgent,
                "Connection": "keep-alive"
            },
            withCredentials: true,
            jar: cookieJar // Used to store the token in the PC
        };

        // Fetch the response of the platform
        const response = await axios.get(f95url.F95_LOGIN_URL, config);

        // The response is a HTML page, we need to find the <input> with name "_xfToken"
        const $ = cheerio.load(response.data);
        const token = $("body").find("input[name='_xfToken']").attr("value");
        return token;
    } catch (e) {
        shared.logger.error(`Error ${e.message} occurred while trying to fetch F95 token`);
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
    const value = _.isString(url) ? url.replace(/^(https?:)?\/\//, "https://") : null;
    return value;
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