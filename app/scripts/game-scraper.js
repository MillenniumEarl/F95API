"use strict";

// Public modules from npm
const HTMLParser = require("node-html-parser");
const puppeteer = require("puppeteer");

// Modules from file
const shared = require("./shared.js");
const selectors = require("./constants/css-selectors.js");
const { preparePage } = require("./puppeteer-helper.js");
const GameDownload = require("./classes/game-download.js");
const GameInfo = require("./classes/game-info.js");
const { isStringAValidURL, isF95URL, urlExists } = require("./urls-helper.js");

/**
 * @protected
 * Get information from the game's main page.
 * @param {puppeteer.Browser} browser Browser object used for navigation
 * @param {String} url URL (String) of the game/mod to extract data from
 * @return {Promise<GameInfo>} Complete information about the game you are
 * looking for or null if the URL doesn't exists
 */
module.exports.getGameInfo = async function (browser, url) {
  if (shared.debug) console.log("Obtaining game info");

  // Verify the correctness of the URL
  if (!isF95URL(url)) throw url + " is not a valid F95Zone URL";
  let exists = await urlExists(url);
  if (!exists) return null;

  let page = await preparePage(browser); // Set new isolated page
  await page.setCookie(...shared.cookies); // Set cookies to avoid login
  await page.goto(url, {
    waitUntil: shared.WAIT_STATEMENT,
  }); // Go to the game page and wait until it loads

  // It asynchronously searches for the elements and
  // then waits at the end to compile the object to be returned
  let info = new GameInfo();
  let title = getGameTitle(page);
  let author = getGameAuthor(page);
  let tags = getGameTags(page);
  let previewSource = getGamePreviewSource(page);
  let downloadData = getGameDownloadLink(page);
  info = await parsePrefixes(page, info); // Fill status/engines/isMod
  let structuredText = await getMainPostStructuredText(page);
  let overview = getOverview(structuredText, info.isMod);
  let parsedInfos = parseConversationPage(structuredText);

  // Fill in the GameInfo element with the information obtained
  info.name = await title;
  info.author = await author;
  info.overview = overview;
  info.tags = await tags;
  info.f95url = url;
  info.version = info.isMod
    ? parsedInfos["MOD VERSION"]
    : parsedInfos["VERSION"];
  info.lastUpdate = info.isMod
    ? parsedInfos["UPDATED"]
    : parsedInfos["THREAD UPDATED"];
  info.previewSource = await previewSource;
  info.downloadInfo = await downloadData;

  await page.close(); // Close the page
  if (shared.debug) console.log("Founded data for " + info.name);
  return info;
};

//#region Private methods
/**
 * @private
 * Get the game description from its web page.
 * Different processing depending on whether the game is a mod or not.
 * @param {String} text Structured text extracted from the game's web page
 * @param {Boolean} isMod Specify if it is a game or a mod
 * @returns {Promise<String>} Game description
 */
function getOverview(text, isMod) {
  // Get overview (different parsing for game and mod)
  let overviewEndIndex;
  if (isMod) overviewEndIndex = text.indexOf("Updated");
  else overviewEndIndex = text.indexOf("Thread Updated");
  return text.substring(0, overviewEndIndex).replace("Overview:\n", "").trim();
}

/**
 * @private
 * Extrapolate the page structure by removing the element tags
 * and leaving only the text and its spacing.
 * @param {puppeteer.Page} page Page containing the text
 * @returns {Promise<String>} Structured text
 */
async function getMainPostStructuredText(page) {
  // Gets the first post, where are listed all the game's informations
  let post = (await page.$$(selectors.THREAD_POSTS))[0];

  // The info are plain text so we need to parse the HTML code
  let bodyHTML = await page.evaluate(
    /* istanbul ignore next */ (mainPost) => mainPost.innerHTML,
    post
  );
  return HTMLParser.parse(bodyHTML).structuredText;
}

/**
 * @private
 * Extrapolates and cleans the author from the page passed by parameter.
 * @param {puppeteer.Page} page Page containing the author to be extrapolated
 * @returns {Promise<String>} Game author
 */
async function getGameAuthor(page) {
  // Get the game/mod name (without square brackets)
  let titleHTML = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
      document.querySelector(selector).innerHTML,
    selectors.GAME_TITLE
  );
  let structuredTitle = HTMLParser.parse(titleHTML);

  // The last element **shoud be** the title without prefixes (engines, status, other...)
  let gameTitle = structuredTitle.childNodes.pop().rawText;

  // The last square brackets contain the author
  let startTitleIndex = gameTitle.lastIndexOf("[") + 1;
  return gameTitle.substring(startTitleIndex, gameTitle.length - 1).trim();
}

/**
 * @private
 * Process the post text to get all the useful
 * information in the format *DESCRIPTOR : VALUE*.
 * @param {String} text Structured text of the post
 * @returns {Object} Dictionary of information
 */
function parseConversationPage(text) {
  let dataPairs = {};

  // The information searched in the game post are one per line
  let splittedText = text.split("\n");
  for (let line of splittedText) {
    if (!line.includes(":")) continue;

    // Create pair key/value
    let splitted = line.split(":");
    let key = splitted[0].trim().toUpperCase(); // Uppercase to avoid mismatch
    let value = splitted[1].trim();

    // Add pair to the dict if valid
    if (value != "") dataPairs[key] = value;
  }

  return dataPairs;
}

/**
 * @private
 * Gets the URL of the image used as a preview for the game in the conversation.
 * @param {puppeteer.Page} page Page containing the URL to be extrapolated
 * @returns {Promise<String>} URL (String) of the image or null if failed to get it
 */
async function getGamePreviewSource(page) {
  let src = await page.evaluate(
    /* istanbul ignore next */ (selector) => {
      // Get the firs image available
      let img = document.querySelector(selector);

      if (img) return img.getAttribute("src");
      else return null;
    },
    selectors.GAME_IMAGES
  );

  // Check if the URL is valid
  return isStringAValidURL(src) ? src : null;
}

/**
 * @private
 * Extrapolates and cleans the title from the page passed by parameter.
 * @param {puppeteer.Page} page Page containing the title to be extrapolated
 * @returns {Promise<String>} Game title
 */
async function getGameTitle(page) {
  // Get the game/mod name (without square brackets)
  let titleHTML = await page.evaluate(
    /* istanbul ignore next */ (selector) =>
      document.querySelector(selector).innerHTML,
    selectors.GAME_TITLE
  );
  let structuredTitle = HTMLParser.parse(titleHTML);

  // The last element **shoud be** the title without prefixes (engines, status, other...)
  let gameTitle = structuredTitle.childNodes.pop().rawText;
  let endTitleIndex = gameTitle.indexOf("[");
  return gameTitle.substring(0, endTitleIndex).trim();
}

/**
 * @private
 * Get the alphabetically sorted list of tags associated with the game.
 * @param {puppeteer.Page} page Page containing the tags to be extrapolated
 * @returns {Promise<String[]>} List of uppercase tags
 */
async function getGameTags(page) {
  let tags = [];

  // Get the game tags
  for (let handle of await page.$$(selectors.GAME_TAGS)) {
    let tag = await page.evaluate(
      /* istanbul ignore next */ (element) => element.innerText,
      handle
    );
    tags.push(tag.toUpperCase());
  }
  return tags.sort();
}

/**
 * @private
 * Process the game title prefixes to extract information such as game status,
 * graphics engine used, and whether it is a mod or original game.
 * @param {puppeteer.Page} page Page containing the prefixes to be extrapolated
 * @param {GameInfo} info Object to assign the identified information to
 * @returns {Promise<GameInfo>} GameInfo object passed in to which the identified information has been added
 */
async function parsePrefixes(page, info) {
  const MOD_PREFIX = "MOD";

  // The 'Ongoing' status is not specified, only 'Abandoned'/'OnHold'/'Complete'
  info.status = "Ongoing";
  for (let handle of await page.$$(selectors.GAME_TITLE_PREFIXES)) {
    let value = await page.evaluate(
      /* istanbul ignore next */ (element) => element.innerText,
      handle
    );

    // Clean the prefix
    let prefix = value.toUpperCase().replace("[", "").replace("]", "").trim();

    // Getting infos...
    if (shared.statuses.includes(prefix)) info.status = prefix;
    else if (shared.engines.includes(prefix)) info.engine = prefix;
    // This is not a game but a mod
    else if (prefix === MOD_PREFIX) info.isMod = true;
  }
  return info;
}

/**
 * @private
 * Get game download links for different platforms.
 * @param {puppeteer.Page} page Page containing the links to be extrapolated
 * @returns {Promise<GameDownload[]>} List of objects used for game download
 */
async function getGameDownloadLink(page) {
  // Most used hosting platforms
  let hostingPlatforms = [
    "MEGA",
    "NOPY",
    "FILESUPLOAD",
    "MIXDROP",
    "UPLOADHAVEN",
    "PIXELDRAIN",
    "FILESFM",
  ];

  // Supported OS platforms
  let platformOS = ["WIN", "LINUX", "MAC", "ALL"];

  // Gets the <span> which contains the download links
  let temp = await page.$$(selectors.DOWNLOAD_LINKS_CONTAINER);
  if (temp.length === 0) return [];

  // Look for the container that contains the links
  // It is necessary because the same css selector
  // also identifies other elements on the page
  let container = null;
  for (let candidate of temp) {
    if (container !== null) break;
    let upperText = (
      await page.evaluate(
        /* istanbul ignore next */ (e) => e.innerText,
        candidate
      )
    ).toUpperCase();

    // Search if the container contains the name of a hosting platform
    for (let p of hostingPlatforms) {
      if (upperText.includes(p)) {
        container = candidate;
        break;
      }
    }
  }
  if (container === null) return [];

  // Extract the HTML text from the container
  let searchText = (
    await page.evaluate(
      /* istanbul ignore next */ (e) => e.innerHTML,
      container
    )
  ).toLowerCase();

  // Parse the download links
  let downloadData = [];
  for (let platform of platformOS) {
    let data = extractGameHostingData(platform, searchText);
    downloadData.push(...data);
  }
  return downloadData;
}

/**
 * @private
 * From the HTML text it extracts the game download links for the specified operating system.
 * @param {String} platform Name of the operating system to look for a compatible link to.
 * It can only be *WIN/LINUX/MAC/ALL*
 * @param {String} text HTML string to extract links from
 * @returns {GameDownload[]} List of game download links for the selected platform
 */
function extractGameHostingData(platform, text) {
  const PLATFORM_BOLD_OPEN = "<b>";
  const CONTAINER_SPAN_CLOSE = "</span>";
  const LINK_OPEN = "<a";
  const LINK_CLOSE = "</a>";
  const HREF_START = 'href="';
  const HREF_END = '"';
  const TAG_CLOSE = ">";

  // Identify the individual platforms
  let startIndex = text.indexOf(platform.toLowerCase());
  if (startIndex === -1) return [];
  else startIndex += platform.length;

  // Find the <b>platform</b>
  let endIndex =
    text.indexOf(PLATFORM_BOLD_OPEN, startIndex) + PLATFORM_BOLD_OPEN.length;

  // Find the end of the container
  if (endIndex === -1)
    text.indexOf(CONTAINER_SPAN_CLOSE, startIndex) +
      CONTAINER_SPAN_CLOSE.length;

  text = text.substring(startIndex, endIndex);

  let downloadData = [];
  let linkTags = text.split(LINK_OPEN);
  for (let tag of linkTags) {
    // Ignore non-link string
    if (!tag.includes(HREF_START)) continue;

    // Find the hosting platform name
    startIndex = tag.indexOf(TAG_CLOSE) + TAG_CLOSE.length;
    endIndex = tag.indexOf(LINK_CLOSE, startIndex);
    let hosting = tag.substring(startIndex, endIndex);

    // Find the 'href' attribute
    startIndex = tag.indexOf(HREF_START) + HREF_START.length;
    endIndex = tag.indexOf(HREF_END, startIndex);
    let link = tag.substring(startIndex, endIndex);

    if (isStringAValidURL(link)) {
      let gd = new GameDownload();
      gd.hosting = hosting.toUpperCase();
      gd.link = link;
      gd.supportedOS = platform.toUpperCase();

      downloadData.push(gd);
    }
  }
  return downloadData;
}
//#endregion Private methods
