"use strict";

// Public modules from npm
import cheerio from "cheerio";
import luxon from "luxon";

// Modules from file
import shared from "../shared.js";
import { fetchHTML } from "../network-helper.js";
import { getJSONLD, TJsonLD } from "../json-ld.js";
import { selectors as f95Selector } from "../constants/css-selector.js";
import HandiWork from "../classes/handiwork/handiwork.js";
import { TRating, IBasic, TAuthor, TExternalPlatform, TEngine, TStatus, TCategory } from "../interfaces.js";
import { ILink, IPostElement, parseCheerioMainPost } from "./post-parse.js";

//#region Public methods
/**
 * Gets information from the post of a particular handiwork. 
 * If you don't want to specify the object type, use `HandiWork`.
 * @todo It does not currently support assets.
 */
export async function getPostInformation<T extends IBasic>(url: string): Promise<T | null> {
    shared.logger.info(`Obtaining post info from ${url}`);

    // Fetch HTML and prepare Cheerio
    const html = await fetchHTML(url);

    if (html.isSuccess()) {
        const $ = cheerio.load(html.value);
        const body = $("body");
        const mainPost = $(f95Selector.GS_POSTS).first();

        // Extract data
        const postData = parseCheerioMainPost($, mainPost);
        const TJsonLD = getJSONLD(body);

        // Fill in the HandiWork element with the information obtained
        const hw: HandiWork = {} as HandiWork;
        fillWithJSONLD(hw, TJsonLD);
        fillWithPostData(hw, postData);
        fillWithPrefixes(hw, body);
        hw.tags = extractTags(body);

        shared.logger.info(`Founded data for ${hw.name}`);
        return <T><unknown>hw;
    } else throw html.value;
};
//#endregion Public methods

//#region Private methods

//#region Generic Utility

/**
 * Convert a string to a boolean.
 * Check also for `yes`/`no` and `1`/`0`.
 */
function stringToBoolean(s: string): boolean {
    // Local variables
    const positiveTerms = ["true", "yes", "1"];
    const negativeTerms = ["false", "no", "0"];
    const cleanString = s.toLowerCase().trim();
    let result = Boolean(s);

    if (positiveTerms.includes(cleanString)) result = true;
    else if (negativeTerms.includes(cleanString)) result = false;
    return result;
}

/**
 * It processes the evaluations of a particular work starting from the data contained in the JSON+LD tag.
 */
function parseRating(data: TJsonLD): TRating {
    shared.logger.trace("Parsing rating...");

    // Local variables
    const ratingTree = data["aggregateRating"] as TJsonLD;
    const rating: TRating = {
        average: parseFloat(ratingTree["ratingValue"] as string),
        best: parseInt(ratingTree["bestRating"] as string),
        count: parseInt(ratingTree["ratingCount"] as string),
    };

    return rating;
}

/**
 * Extracts the work's unique ID from its URL.
 */
function extractIDFromURL(url: string): number {
    shared.logger.trace("Extracting ID from URL...");

    // URL are in the format https://f95zone.to/threads/GAMENAME-VERSION-DEVELOPER.ID/
    // or https://f95zone.to/threads/ID/
    const match = url.match(/([0-9]+)(?=\/|\b)(?!-|\.)/);
    if (!match) return -1;

    // Parse and return number
    return parseInt(match[0], 10);
}

/**
 * Clean the title of a HandiWork, removing prefixes
 * and generic elements between square brackets, and
 * returns the clean title of the work.
 */
function cleanHeadline(headline: string): string {
    shared.logger.trace("Cleaning headline...");

    // From the title we can extract: Name, author and version
    // [PREFIXES] TITLE [VERSION] [AUTHOR]
    const matches = headline.match(/\[(.*?)\]/g);

    // Get the title name
    let name = headline;
    matches.forEach(e => name = name.replace(e, ""));
    return name.trim();
}

/**
 * Gets the element with the given name or `undefined`.
 * Case-insensitive.
 */
function getPostElementByName(elements: IPostElement[], name: string): IPostElement | undefined {
    return elements.find(el => {
        return el.name.toUpperCase() === name.toUpperCase();
    });
}

/**
 * Makes an array of strings uppercase.
 */
function toUpperCaseArray(a: string[]): string[] {
    /**
     * Makes a string uppercase.
     */
    function toUpper(s: string): string {
        return s.toUpperCase();
    }
    return a.map(toUpper);
}

//#endregion Generic Utility


//#region Prefix Utility

/**
 * Check if the prefix is a game's engine.
 */
function isEngine(prefix: string): boolean {
    const engines = toUpperCaseArray(Object.values(shared.prefixes["engines"]));
    return engines.includes(prefix.toUpperCase());
}

/**
 * Check if the prefix is a game's status.
 */
function isStatus(prefix: string): boolean {
    const statuses = toUpperCaseArray(Object.values(shared.prefixes["statuses"]));
    return statuses.includes(prefix.toUpperCase());
}

/**
 * Check if the prefix indicates a mod.
 */
function isMod(prefix: string): boolean {
    const modPrefixes = ["MOD", "CHEAT MOD"];
    return modPrefixes.includes(prefix.toUpperCase());
}
//#endregion Prefix Utility


/**
 * Compiles a HandiWork object with the data extracted 
 * from the JSON+LD tags related to the object itself.
 * The values that will be added are: 
 * `URL`, `ID`, `Category`, `Rating`, 
 * `Name`, `ThreadPublishingDate`, `LastThreadUpdate`.
 */
function fillWithJSONLD(hw: HandiWork, data: TJsonLD) {
    shared.logger.trace("Extracting data from JSON+LD...");

    // Set the basic values
    hw.url = data["@id"] as string;
    hw.id = extractIDFromURL(hw.url);
    hw.category = data["articleSection"] as TCategory;
    hw.rating = parseRating(data);
    hw.name = cleanHeadline(data["headline"] as string);

    // Check and set the dates
    const published = data["datePublished"] as string;
    if (luxon.DateTime.fromISO(published).isValid) {
        hw.threadPublishingDate = new Date(published);
    }

    const modified = data["dateModified"] as string;
    if (luxon.DateTime.fromISO(modified).isValid) {
        hw.lastThreadUpdate = new Date(modified);
    }
}

/**
 * Compiles a HandiWork object with the data extracted
 * from the main post of the HandiWork page.
 * The values that will be added are:
 * `Overview`, `OS`, `Language`, `Version`, `Installation`,
 * `Pages`, `Resolution`, `Lenght`, `Genre`, `Censored`,
 * `LastRelease`, `Authors`, `Changelog`, `Cover`.
 */
function fillWithPostData(hw: HandiWork, elements: IPostElement[]) {
    // First fill the "simple" elements
    hw.overview = getPostElementByName(elements, "overview")?.text;
    hw.os = getPostElementByName(elements, "os")?.text?.split(",").map(s => s.trim());
    hw.language = getPostElementByName(elements, "language")?.text?.split(",").map(s => s.trim());
    hw.version = getPostElementByName(elements, "version")?.text;
    hw.installation = getPostElementByName(elements, "installation")?.content.shift()?.text;
    hw.pages = getPostElementByName(elements, "pages")?.text;
    hw.resolution = getPostElementByName(elements, "resolution")?.text?.split(",").map(s => s.trim());
    hw.lenght = getPostElementByName(elements, "lenght")?.text;

    // Parse the censorship
    const censored = getPostElementByName(elements, "censored") || getPostElementByName(elements, "censorship");
    if (censored) hw.censored = stringToBoolean(censored.text);

    // Get the genres
    const genre = getPostElementByName(elements, "genre")?.content.shift()?.text;
    hw.genre = genre?.split(",").map(s => s.trim());

    // Get the cover
    const cover = getPostElementByName(elements, "overview")?.content.find(el => el.type === "Image") as ILink;
    hw.cover = cover?.href;

    // Fill the dates
    const releaseDate = getPostElementByName(elements, "release date")?.text;
    if (luxon.DateTime.fromISO(releaseDate).isValid) hw.lastRelease = new Date(releaseDate);

    //#region Convert the author
    const authorElement = getPostElementByName(elements, "developer") ||
        getPostElementByName(elements, "developer/publisher") ||
        getPostElementByName(elements, "artist");
    const author: TAuthor = {
        name: authorElement.text,
        platforms: []
    };

    // Add the found platforms
    authorElement?.content.forEach((el: ILink, idx) => {
        const platform: TExternalPlatform = {
            name: el.text,
            link: el.href,
        };

        author.platforms.push(platform);
    });
    hw.authors = [author];
    //#endregion Convert the author

    //#region Get the changelog
    hw.changelog = [];
    const changelogElement = getPostElementByName(elements, "changelog") || getPostElementByName(elements, "change-log");
    const changelogSpoiler = changelogElement?.content.find(el => {
        return el.type === "Spoiler" && el.content.length > 0;
    });

    // Add to the changelog the single spoilers
    changelogSpoiler.content.forEach(el => {
        if (el.text.trim()) hw.changelog.push(el.text);
    });

    // Add at the ened also the text of the "changelog" element
    hw.changelog.push(changelogSpoiler.text);
    //#endregion Get the changelog
}

/**
 * Gets the tags used to classify the game.
 * @param {cheerio.Cheerio} body Page `body` selector
 */
function extractTags(body: cheerio.Cheerio): string[] {
    shared.logger.trace("Extracting tags...");

    // Get the game tags
    const tagResults = body.find(f95Selector.GT_TAGS);
    return tagResults.map(function parseGameTags(idx, el) {
        return cheerio(el).text().trim();
    }).get();
}

/**
 * Parse the post prefixes.
 * In particular, it elaborates the following prefixes for games:
 * `Engine`, `Status`, `Mod`.
 * @param {cheerio.Cheerio} body Page `body` selector
 */
function fillWithPrefixes(hw: HandiWork, body: cheerio.Cheerio) {
    shared.logger.trace("Parsing prefixes...");

    // Local variables
    let mod = false;
    let engine: TEngine = null;
    let status: TStatus = null;

    // Initialize the array
    hw.prefixes = [];

    // Obtain the title prefixes
    const prefixeElements = body.find(f95Selector.GT_TITLE_PREFIXES);

    prefixeElements.each(function parseGamePrefix(idx, el) {
        // Obtain the prefix text
        let prefix = cheerio(el).text().trim();

        // Remove the square brackets
        prefix = prefix.replace("[", "").replace("]", "");

        // Check what the prefix indicates
        if (isEngine(prefix)) engine = prefix as TEngine;
        else if (isStatus(prefix)) status = prefix as TStatus;
        else if (isMod(prefix)) mod = true;

        // Anyway add the prefix to list
        hw.prefixes.push(prefix);
    });

    // If the status is not set, then the game is in development (Ongoing)
    status = (!status && hw.category === "games") ? status : "Ongoing";

    hw.engine = engine;
    hw.status = status;
    hw.mod = mod;
}

//#endregion
