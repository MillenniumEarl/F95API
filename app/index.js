"use strict";

// Core modules
const fs = require("fs");

// Modules from file
const shared = require("./scripts/shared.js");
const constURLs = require("./scripts/constants/urls.js");
const selectors = require("./scripts/constants/css-selectors.js");
const {
  isStringAValidURL,
  urlExists,
  isF95URL,
} = require("./scripts/urls-helper.js");
const scraper = require("./scripts/game-scraper.js");
const {
  prepareBrowser,
  preparePage,
} = require("./scripts/puppeteer-helper.js");
const searcher = require("./scripts/game-searcher.js");

// Classes from file
const GameInfo = require("./scripts/classes/game-info.js");
const LoginResult = require("./scripts/classes/login-result.js");
const UserData = require("./scripts/classes/user-data.js");

//#region Export classes
module.exports.GameInfo = GameInfo;
module.exports.LoginResult = LoginResult;
module.exports.UserData = UserData;
//#endregion Export classes

//#region Export properties
/**
 * Shows log messages and other useful functions for module debugging.
 * @param {Boolean} value
 */
module.exports.debug = function (value) {
  shared.debug = value;
};
/**
 * @public
 * Indicates whether a user is logged in to the F95Zone platform or not.
 * @returns {String}
 */
module.exports.isLogged = function () {
  return shared.isLogged;
};
/**
 * @public
 * If true, it opens a new browser for each request
 * to the F95Zone platform, otherwise it reuses the same.
 * @returns {String}
 */
module.exports.setIsolation = function (value) {
  shared.isolation = value;
};
/**
 * @public
 * Path to the cache directory
 * @returns {String}
 */
module.exports.getCacheDir = function () {
  return shared.cacheDir;
};
/**
 * @public
 * Set path to the cache directory
 * @returns {String}
 */
module.exports.setCacheDir = function (value) {
  shared.cacheDir = value;

  // Create directory if it doesn't exist
  if (!fs.existsSync(shared.cacheDir)) fs.mkdirSync(shared.cacheDir);
};
/**
 * @public
 * Set local chromium path.
 * @returns {String}
 */
module.exports.setChromiumPath = function (value) {
  shared.chromiumLocalPath = value;
};
//#endregion Export properties

//#region Global variables
var _browser = null;
//#endregion

//#region Export methods
/**
 * @public
 * Log in to the F95Zone platform.
 * This **must** be the first operation performed before accessing any other script functions.
 * @param {String} username Username used for login
 * @param {String} password Password used for login
 * @returns {Promise<LoginResult>} Result of the operation
 */
module.exports.login = async function (username, password) {
  if (shared.isLogged) {
    if (shared.debug) console.log("Already logged in");
    const result = new LoginResult();
    result.success = true;
    result.message = "Already logged in";
    return result;
  }

  // If cookies are loaded, use them to authenticate
  shared.cookies = loadCookies();
  if (shared.cookies !== null) {
    if (shared.debug) console.log("Valid session, no need to re-authenticate");
    shared.isLogged = true;
    const result = new LoginResult();
    result.success = true;
    result.message = "Logged with cookies";
    return result;
  }

  // Else, log in throught browser
  if (shared.debug)
    console.log("No saved sessions or expired session, login on the platform");

  if (_browser === null && !shared.isolation) _browser = await prepareBrowser();
  const browser = shared.isolation ? await prepareBrowser() : _browser;

  const result = await loginF95(browser, username, password);
  shared.isLogged = result.success;

  if (result.success) {
    // Reload cookies
    shared.cookies = loadCookies();
    if (shared.debug) console.log("User logged in through the platform");
  } else {
    console.warn("Error during authentication: " + result.message);
  }
  if (shared.isolation) await browser.close();
  return result;
};
/**
 * @public
 * This method loads the main data from the F95 portal
 * used to provide game information. You **must** be logged
 * in to the portal before calling this method.
 * @returns {Promise<Boolean>} Result of the operation
 */
module.exports.loadF95BaseData = async function () {
  if (!shared.isLogged || !shared.cookies) {
    console.warn("User not authenticated, unable to continue");
    return false;
  }

  if (shared.debug) console.log("Loading base data...");

  // Prepare a new web page
  if (_browser === null && !shared.isolation) _browser = await prepareBrowser();
  const browser = shared.isolation ? await prepareBrowser() : _browser;

  const page = await preparePage(browser); // Set new isolated page
  await page.setCookie(...shared.cookies); // Set cookies to avoid login

  // Go to latest update page and wait for it to load
  await page.goto(constURLs.F95_LATEST_UPDATES, {
    waitUntil: shared.WAIT_STATEMENT,
  });

  // Obtain engines (disc/online)
  await page.waitForSelector(selectors.ENGINE_ID_SELECTOR);
  shared.engines = await loadValuesFromLatestPage(
    page,
    shared.enginesCachePath,
    selectors.ENGINE_ID_SELECTOR,
    "engines"
  );

  // Obtain statuses (disc/online)
  await page.waitForSelector(selectors.STATUS_ID_SELECTOR);
  shared.statuses = await loadValuesFromLatestPage(
    page,
    shared.statusesCachePath,
    selectors.STATUS_ID_SELECTOR,
    "statuses"
  );

  if (shared.isolation) await browser.close();
  if (shared.debug) console.log("Base data loaded");
  return true;
};
/**
 * @public
 * Chek if exists a new version of the game.
 * You **must** be logged in to the portal before calling this method.
 * @param {GameInfo} info Information about the game to get the version for
 * @returns {Promise<Boolean>} true if an update is available, false otherwise
 */
module.exports.chekIfGameHasUpdate = async function (info) {
  if (!shared.isLogged || !shared.cookies) {
    console.warn("user not authenticated, unable to continue");
    return info.version;
  }

  // F95 change URL at every game update,
  // so if the URL is different an update is available
  const exists = await urlExists(info.f95url, true);
  if (!exists) return true;

  // Parse version from title
  if (_browser === null && !shared.isolation) _browser = await prepareBrowser();
  const browser = shared.isolation ? await prepareBrowser() : _browser;

  const onlineVersion = await scraper.getGameVersionFromTitle(browser, info);

  if (shared.isolation) await browser.close();

  return onlineVersion.toUpperCase() !== info.version.toUpperCase();
};
/**
 * @public
 * Starting from the name, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} name Name of the game searched
 * @param {Boolean} includeMods Indicates whether to also take mods into account when searching
 * @returns {Promise<GameInfo[]>} List of information obtained where each item corresponds to
 * an identified game (in the case of homonymy). If no games were found, null is returned
 */
module.exports.getGameData = async function (name, includeMods) {
  if (!shared.isLogged || !shared.cookies) {
    console.warn("user not authenticated, unable to continue");
    return null;
  }

  // Gets the search results of the game being searched for
  if (_browser === null && !shared.isolation) _browser = await prepareBrowser();
  const browser = shared.isolation ? await prepareBrowser() : _browser;
  const urlList = await searcher.getSearchGameResults(browser, name);

  // Process previous partial results
  const promiseList = [];
  for (const url of urlList) {
    // Start looking for information
    promiseList.push(scraper.getGameInfo(browser, url));
  }

  // Filter for mods
  const result = [];
  for (const info of await Promise.all(promiseList)) {
    // Skip mods if not required
    if (!info) continue;
    if (info.isMod && !includeMods) continue;
    else result.push(info);
  }

  if (shared.isolation) await browser.close();
  return result;
};
/**
 * @public
 * Starting from the url, it gets all the information about the game you are looking for.
 * You **must** be logged in to the portal before calling this method.
 * @param {String} url URL of the game to obtain information of
 * @returns {Promise<GameInfo>} Information about the game. If no game was found, null is returned
 */
module.exports.getGameDataFromURL = async function (url) {
  if (!shared.isLogged || !shared.cookies) {
    console.warn("user not authenticated, unable to continue");
    return null;
  }

  // Check URL
  if (!urlExists(url)) return null;
  if (!isF95URL(url)) throw new Error(url + " is not a valid F95Zone URL");

  // Gets the search results of the game being searched for
  if (_browser === null && !shared.isolation) _browser = await prepareBrowser();
  const browser = shared.isolation ? await prepareBrowser() : _browser;

  // Get game data
  const result = await scraper.getGameInfo(browser, url);

  if (shared.isolation) await browser.close();
  return result;
};
/**
 * @public
 * Gets the data of the currently logged in user.
 * You **must** be logged in to the portal before calling this method.
 * @returns {Promise<UserData>} Data of the user currently logged in or null if an error arise
 */
module.exports.getUserData = async function () {
  if (!shared.isLogged || !shared.cookies) {
    console.warn("user not authenticated, unable to continue");
    return null;
  }

  // Prepare a new web page
  if (_browser === null && !shared.isolation) _browser = await prepareBrowser();
  const browser = shared.isolation ? await prepareBrowser() : _browser;
  const page = await preparePage(browser); // Set new isolated page
  await page.setCookie(...shared.cookies); // Set cookies to avoid login
  await page.goto(constURLs.F95_BASE_URL); // Go to base page

  // Explicitly wait for the required items to load
  await page.waitForSelector(selectors.USERNAME_ELEMENT);
  await page.waitForSelector(selectors.AVATAR_PIC);

  const threads = getUserWatchedGameThreads(browser);

  const username = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
      document.querySelector(selector).innerText,
    selectors.USERNAME_ELEMENT
  );

  const avatarSrc = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
      document.querySelector(selector).getAttribute("src"),
    selectors.AVATAR_PIC
  );

  const ud = new UserData();
  ud.username = username;
  ud.avatarSrc = isStringAValidURL(avatarSrc) ? avatarSrc : null;
  ud.watchedThreads = await threads;

  await page.close();
  if (shared.isolation) await browser.close();

  return ud;
};
/**
 * @public
 * Logout from the current user and gracefully close shared browser.
 * You **must** be logged in to the portal before calling this method.
 */
module.exports.logout = async function () {
  if (!shared.isLogged || !shared.cookies) {
    console.warn("user not authenticated, unable to continue");
    return;
  }
  shared.isLogged = false;

  // Gracefully close shared browser
  if (!shared.isolation && _browser !== null) {
    await _browser.close();
    _browser = null;
  }
};
//#endregion

//#region Private methods

//#region Cookies functions
/**
 * @private
 * Loads and verifies the expiration of previously stored cookies from disk
 * if they exist, otherwise it returns null.
 * @return {object[]} List of dictionaries or null if cookies don't exist
 */
function loadCookies() {
  // Check the existence of the cookie file
  if (fs.existsSync(shared.cookiesCachePath)) {
    // Read cookies
    const cookiesJSON = fs.readFileSync(shared.cookiesCachePath);
    const cookies = JSON.parse(cookiesJSON);

    // Check if the cookies have expired
    for (const cookie of cookies) {
      if (isCookieExpired(cookie)) return null;
    }

    // Cookies loaded and verified
    return cookies;
  } else return null;
}
/**
 * @private
 * Check the validity of a cookie.
 * @param {object} cookie Cookies to verify the validity. It's a dictionary
 * @returns {Boolean} true if the cookie has expired, false otherwise
 */
function isCookieExpired(cookie) {
  // Local variables
  let expiredCookies = false;

  // Ignore cookies that never expire
  const expirationUnixTimestamp = cookie.expire;

  if (expirationUnixTimestamp !== "-1") {
    // Convert UNIX epoch timestamp to normal Date
    const expirationDate = new Date(expirationUnixTimestamp * 1000);

    if (expirationDate < Date.now()) {
      if (shared.debug)
        console.log(
          "Cookie " + cookie.name + " expired, you need to re-authenticate"
        );
      expiredCookies = true;
    }
  }

  return expiredCookies;
}
//#endregion Cookies functions

//#region Latest Updates page parserer
/**
 * @private
 * If present, it reads the file containing the searched values (engines or states)
 * from the disk, otherwise it connects to the F95 portal (at the page
 * https://f95zone.to/latest) and downloads them.
 * @param {puppeteer.Page} page Page used to locate the required elements
 * @param {String} path Path to disk of the JSON file containing the data to read / write
 * @param {String} selector CSS selector of the required elements
 * @param {String} elementRequested Required element (engines or states) used to detail log messages
 * @returns {Promise<String[]>} List of required values in uppercase
 */
async function loadValuesFromLatestPage(
  page,
  path,
  selector,
  elementRequested
) {
  // If the values already exist they are loaded from disk without having to connect to F95
  if (shared.debug) console.log("Load " + elementRequested + " from disk...");
  if (fs.existsSync(path)) {
    const valueJSON = fs.readFileSync(path);
    return JSON.parse(valueJSON);
  }

  // Otherwise, connect and download the data from the portal
  if (shared.debug)
    console.log("No " + elementRequested + " cached, downloading...");
  const values = await getValuesFromLatestPage(
    page,
    selector,
    "Getting " + elementRequested + " from page"
  );
  fs.writeFileSync(path, JSON.stringify(values));
  return values;
}
/**
 * @private
 * Gets all the textual values of the elements present
 * in the F95 portal page and identified by the selector
 * passed by parameter
 * @param {puppeteer.Page} page Page used to locate items specified by the selector
 * @param {String} selector CSS selector
 * @param {String} logMessage Log message indicating which items the selector is requesting
 * @return {Promise<String[]>} List of uppercase strings indicating the textual values of the elements identified by the selector
 */
async function getValuesFromLatestPage(page, selector, logMessage) {
  if (shared.debug) console.log(logMessage);

  const result = [];
  const elements = await page.$$(selector);

  for (const element of elements) {
    const text = await element.evaluate(
      /* istanbul ignore next */ (e) => e.innerText
    );

    // Save as upper text for better match if used in query
    result.push(text.toUpperCase());
  }
  return result;
}
//#endregion

//#region User
/**
 * @private
 * Log in to the F95Zone portal and, if successful, save the cookies.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @param {String} username Username to use during login
 * @param {String} password Password to use during login
 * @returns {Promise<LoginResult>} Result of the operation
 */
async function loginF95(browser, username, password) {
  const page = await preparePage(browser); // Set new isolated page
  await page.goto(constURLs.F95_LOGIN_URL); // Go to login page

  // Explicitly wait for the required items to load
  await Promise.all([
    page.waitForSelector(selectors.USERNAME_INPUT),
    page.waitForSelector(selectors.PASSWORD_INPUT),
    page.waitForSelector(selectors.LOGIN_BUTTON),
  ]);
  
  await page.type(selectors.USERNAME_INPUT, username); // Insert username
  await page.type(selectors.PASSWORD_INPUT, password); // Insert password
  await Promise.all([
    page.click(selectors.LOGIN_BUTTON), // Click on the login button
    page.waitForNavigation({
      waitUntil: shared.WAIT_STATEMENT,
    }), // Wait for page to load
  ]);

  // Prepare result
  const result = new LoginResult();

  // Check if the user is logged in
  result.success = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
      document.querySelector(selector) !== null,
    selectors.AVATAR_INFO
  );

  // Save cookies to avoid re-auth
  if (result.success) {
    const c = await page.cookies();
    fs.writeFileSync(shared.cookiesCachePath, JSON.stringify(c));
    result.message = "Authentication successful";
  } else if (
    // Obtain the error message
    await page.evaluate(
      /* istanbul ignore next */ (selector) =>
        document.querySelector(selector) !== null,
      selectors.LOGIN_MESSAGE_ERROR
    )
  ) {
    const errorMessage = await page.evaluate(
      /* istanbul ignore next */ (selector) =>
        document.querySelector(selector).innerText,
      selectors.LOGIN_MESSAGE_ERROR
    );

    if (errorMessage === "Incorrect password. Please try again.") {
      result.message = "Incorrect password";
    } else if (
      errorMessage ===
      'The requested user "' + username + '" could not be found.'
    ) {
      result.message = "Incorrect username";
    } else result.message = errorMessage;
  } else result.message = "Unknown error";

  await page.close(); // Close the page
  return result;
}
/**
 * @private
 * Gets the list of URLs of threads the user follows.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @returns {Promise<String[]>} URL list
 */
async function getUserWatchedGameThreads(browser) {
  const page = await preparePage(browser); // Set new isolated page
  await page.goto(constURLs.F95_WATCHED_THREADS); // Go to the thread page

  // Explicitly wait for the required items to load
  await page.waitForSelector(selectors.WATCHED_THREAD_FILTER_POPUP_BUTTON);

  // Show the popup
  await Promise.all([
   page.click(selectors.WATCHED_THREAD_FILTER_POPUP_BUTTON),
   page.waitForSelector(selectors.UNREAD_THREAD_CHECKBOX),
   page.waitForSelector(selectors.ONLY_GAMES_THREAD_OPTION),
   page.waitForSelector(selectors.FILTER_THREADS_BUTTON),
  ]);

  // Set the filters
  await page.evaluate(
    /* istanbul ignore next */ (selector) =>
      document.querySelector(selector).removeAttribute("checked"),
    selectors.UNREAD_THREAD_CHECKBOX
  ); // Also read the threads already read
  
  // Filter the threads
  await Promise.all([
    page.click(selectors.ONLY_GAMES_THREAD_OPTION),
    page.click(selectors.FILTER_THREADS_BUTTON),
    page.waitForSelector(selectors.WATCHED_THREAD_URLS),
  ]);

  // Get the threads urls
  const urls = [];
  let nextPageExists = false;
  do {
    // Get all the URLs
    for (const handle of await page.$$(selectors.WATCHED_THREAD_URLS)) {
      const src = await page.evaluate(
        /* istanbul ignore next */ (element) => element.href,
        handle
      );
      // If 'unread' is left, it will redirect to the last unread post
      const url = src.replace("/unread", "");
      urls.push(url);
    }

    nextPageExists = await page.evaluate(
      /* istanbul ignore next */ (selector) => document.querySelector(selector),
      selectors.WATCHED_THREAD_NEXT_PAGE
    );

    // Click to next page
    if (nextPageExists) {
      await page.click(selectors.WATCHED_THREAD_NEXT_PAGE);
      await page.waitForSelector(selectors.WATCHED_THREAD_URLS);
    }
  } while (nextPageExists);

  await page.close();
  return urls;
}
//#endregion User

//#endregion Private methods
