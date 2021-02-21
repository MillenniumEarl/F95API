"use strict";

// Public modules from npm
import cheerio from "cheerio";
import luxon from "luxon";

// Modules from file
import shared from "./shared.js";
import { fetchHTML } from "./network-helper.js";
import { getJSONLD, JSONLD } from "./json-ld.js";
import { selectors as f95Selector } from "./constants/css-selector.js";
import HandiWork from "./classes/handiwork/handiwork.js";
import { RatingType, IBasic, AuthorType, ExternalPlatformType, EngineType, StatusType, CategoryType } from "./interfaces.js";
import { login } from "../index.js";
import { ILink, IPostElement, parseCheerioMainPost } from "./post-parser.js";
import Game from "./classes/handiwork/game.js";

//#region Public methods
/**
 * Gets information from the post of a particular job. 
 * If you don't want to specify the object type, use `HandiWork`.
 * @todo It does not currently support assets.
 */
export async function getPostInformation<T extends IBasic>(url: string): Promise<T | null> {
    shared.logger.info(`Obtaining post info from ${url}`);

    // Fetch HTML and prepare Cheerio
    const html = await fetchHTML(url);
    if (!html) return null;

    const $ = cheerio.load(html);
    const body = $("body");
    const mainPost = $(f95Selector.GS_POSTS).first();
    
    // Extract data
    const postData = parseCheerioMainPost($, mainPost);
    const JSONLD = getJSONLD($, body);

    // Fill in the HandiWork element with the information obtained
    const hw: HandiWork = {} as HandiWork;
    fillWithJSONLD(hw, JSONLD);
    fillWithPostData(hw, postData);
    fillWithPrefixes(hw, body);
    hw.Tags = extractTags(body);

    shared.logger.info(`Founded data for ${hw.Name}`);
    return <T><unknown>hw;
};
//#endregion Public methods

//#region Private methods

//#region Generic Utility

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
function parseRating(data: JSONLD): RatingType {
    shared.logger.trace("Parsing rating...");

    // Local variables
    const ratingTree = data["aggregateRating"] as JSONLD;
    const rating: RatingType = {
        Average: parseFloat(ratingTree["ratingValue"] as string),
        Best: parseInt(ratingTree["bestRating"] as string),
        Count: parseInt(ratingTree["ratingCount"] as string),
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

function cleanHeadline(headline: string): string {
    shared.logger.trace("Cleaning headline...");

    // From the title we can extract: Name, author and version
    // [PREFIXES] TITLE [VERSION] [AUTHOR]
    const matches = headline.match(/\[(.*?)\]/g);

    // Get the title name
    let name = headline;
    matches.forEach(function replaceElementsInTitle(e) {
        name = name.replace(e, "");
    });
    return name.trim();
}

/**
 * Gets the element with the given name or `undefined`.
 * Case-insensitive.
 */
function getPostElementByName(elements: IPostElement[], name: string): IPostElement | undefined {
    return elements.find(el => {
        return el.Name.toUpperCase() === name.toUpperCase();
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
function fillWithJSONLD(hw: HandiWork, data: JSONLD) {
    shared.logger.trace("Extracting data from JSON+LD...");

    // Set the basic values
    hw.Url = data["@id"] as string;
    hw.ID = extractIDFromURL(hw.Url);
    hw.Category = data["articleSection"] as CategoryType;
    hw.Rating = parseRating(data);
    hw.Name = cleanHeadline(data["headline"] as string);

    // Check and set the dates
    const published = data["datePublished"] as string;
    if (luxon.DateTime.fromISO(published).isValid) {
        hw.ThreadPublishingDate = new Date(published);
    }

    const modified = data["dateModified"] as string;
    if (luxon.DateTime.fromISO(modified).isValid) {
        hw.LastThreadUpdate = new Date(modified);
    }
}

/**
 * Compiles a HandiWork object with the data extracted
 * from the main post of the HandiWork page.
 * The values that will be added are:
 * `Overview`, `OS`, `Language`, `Version`, `Installation`,
 * `Pages`, `Resolution`, `Lenght`, `Genre`, `Censored`,
 * `LastRelease`, `Authors`, `Changelog`.
 */
function fillWithPostData(hw: HandiWork, elements: IPostElement[]) {
    // First fill the "simple" elements
    hw.Overview = getPostElementByName(elements, "overview")?.Text;
    hw.OS = getPostElementByName(elements, "os")?.Text?.split(",").map(s => s.trim());
    hw.Language = getPostElementByName(elements, "language")?.Text?.split(",").map(s => s.trim());
    hw.Version = getPostElementByName(elements, "version")?.Text;
    hw.Installation = getPostElementByName(elements, "installation")?.Content.shift()?.Text;
    hw.Pages = getPostElementByName(elements, "pages")?.Text;
    hw.Resolution = getPostElementByName(elements, "resolution")?.Text?.split(",").map(s => s.trim());
    hw.Lenght = getPostElementByName(elements, "lenght")?.Text;

    // Parse the censorship
    const censored = getPostElementByName(elements, "censored") || getPostElementByName(elements, "censorship");
    if (censored) hw.Censored = stringToBoolean(censored.Text);

    // Get the genres
    const genre = getPostElementByName(elements, "genre")?.Content.shift()?.Text;
    hw.Genre = genre?.split(",").map(s => s.trim());

    // Fill the dates
    const releaseDate = getPostElementByName(elements, "release date")?.Text;
    if (luxon.DateTime.fromISO(releaseDate).isValid) hw.LastRelease = new Date(releaseDate);

    //#region Convert the author
    const authorElement = getPostElementByName(elements, "developer") ||
        getPostElementByName(elements, "developer/publisher") ||
        getPostElementByName(elements, "artist");
    const author: AuthorType = {
        Name: authorElement.Text,
        Platforms: []
    };

    // Add the found platforms
    authorElement?.Content.forEach((el: ILink, idx) => {
        const platform: ExternalPlatformType = {
            Name: el.Text,
            Link: el.Href,
        };

        author.Platforms.push(platform);
    });
    hw.Authors = [author];
    //#endregion Convert the author

    //#region Get the changelog
    hw.Changelog = [];
    const changelogElement = getPostElementByName(elements, "changelog") || getPostElementByName(elements, "change-log");
    const changelogSpoiler = changelogElement?.Content.find(el => {
        return el.Type === "Spoiler" && el.Content.length > 0;
    });

    // Add to the changelog the single spoilers
    changelogSpoiler.Content.forEach(el => {
        if (el.Text.trim()) hw.Changelog.push(el.Text);
    });

    // Add at the ened also the text of the "changelog" element
    hw.Changelog.push(changelogSpoiler.Text);
    //#endregion Get the changelog
}

/**
 * Gets the tags used to classify the game.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {string[]} List of tags
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
    let engine: EngineType = null;
    let status: StatusType = null;

    // Initialize the array
    hw.Prefixes = [];

    // Obtain the title prefixes
    const prefixeElements = body.find(f95Selector.GT_TITLE_PREFIXES);

    prefixeElements.each(function parseGamePrefix(idx, el) {
        // Obtain the prefix text
        let prefix = cheerio(el).text().trim();

        // Remove the square brackets
        prefix = prefix.replace("[", "").replace("]", "");

        // Check what the prefix indicates
        if (isEngine(prefix)) engine = prefix as EngineType;
        else if (isStatus(prefix)) status = prefix as StatusType;
        else if (isMod(prefix)) mod = true;

        // Anyway add the prefix to list
        hw.Prefixes.push(prefix);
    });

    // If the status is not set, then the game is in development (Ongoing)
    status = (!status && hw.Category === "games") ? status : "Ongoing";

    hw.Engine = engine;
    hw.Status = status;
    hw.Mod = mod;
}

//#endregion
