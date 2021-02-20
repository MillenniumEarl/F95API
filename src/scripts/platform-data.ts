"use strict";

// Core modules
import { readFileSync, writeFileSync, existsSync } from "fs";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import shared, { DictType } from "./shared.js";
import { urls as f95url } from "./constants/url.js";
import { selectors as f95selector} from "./constants/css-selector.js";
import { fetchHTML } from "./network-helper.js";

//#region Interface definitions
/**
 * Represents the single element contained in the data categories.
 */
interface SingleOptionObj {
    ID: number,
    Name: string,
    Class: string
}

/**
 * Represents the set of values associated with a specific category of data.
 */
interface CategoryResObj {
    ID: number,
    Name: string,
    Prefixes: SingleOptionObj[]
}

/**
 * Represents the set of tags present on the platform-
 */
interface LatestResObj {
    Prefixes: CategoryResObj[],
    Tags: DictType,
    Options: string
}
//#endregion Interface definitions

//#region Public methods
/**
 * Gets the basic data used for game data processing 
 * (such as graphics engines and progress statuses)
 */
export async function fetchPlatformData(): Promise<void> {
    // Check if the data are cached
    if (!readCache(shared.cachePath)) {
        // Load the HTML
        const html = await fetchHTML(f95url.F95_LATEST_UPDATES);

        // Parse data
        const data = parseLatestPlatformHTML(html);

        // Assign data
        assignLatestPlatformData(data);

        // Cache data
        saveCache(shared.cachePath);
    }
}
//#endregion Public methods

//#region Private methods
/**
 * @private
 * Read the platform cache (if available)
 */
function readCache(path: string) {
    // Local variables
    let returnValue = false;

    if (existsSync(path)) {
        const data = readFileSync(path, {encoding: "utf-8", flag: "r"});
        const json: { [s: string]: DictType } = JSON.parse(data);

        shared.setPrefixPair("engines", json.engines);
        shared.setPrefixPair("statuses", json.statuses);
        shared.setPrefixPair("tags", json.tags);
        shared.setPrefixPair("others", json.others);
        
        returnValue = true;
    }
    return returnValue;
}

/**
 * @private
 * Save the current platform variables to disk.
 */
function saveCache(path: string): void {
    const saveDict = {
        engines: shared.prefixes["engines"],
        statuses: shared.prefixes["statuses"],
        tags: shared.prefixes["tags"],
        others: shared.prefixes["others"],
    };
    const json = JSON.stringify(saveDict);
    writeFileSync(path, json);
}

/**
 * @private
 * Given the HTML code of the response from the F95Zone, 
 * parse it and return the result.
 */
function parseLatestPlatformHTML(html: string): LatestResObj{
    const $ = cheerio.load(html);

    // Clean the JSON string
    const unparsedText = $(f95selector.LU_TAGS_SCRIPT).html().trim();
    const startIndex = unparsedText.indexOf("{");
    const endIndex = unparsedText.lastIndexOf("}");
    const parsedText = unparsedText.substring(startIndex, endIndex + 1);
    return JSON.parse(parsedText);
}

/**
 * @private
 * Assign to the local variables the values from the F95Zone.
 */
function assignLatestPlatformData(data: LatestResObj): void {
    // Local variables
    const scrapedData = {};

    // Parse and assign the values that are NOT tags
    for (const p of data.Prefixes) {
        // Prepare the dict
        const dict: DictType = {};
        for (const e of p.Prefixes) dict[e.ID] = e.Name.replace("&#039;", "'");

        // Save the property
        scrapedData[p.Name] = dict;
    }

    // Save the values
    shared.setPrefixPair("engines", Object.assign({}, scrapedData["Engine"]));
    shared.setPrefixPair("statuses", Object.assign({}, scrapedData["Status"]));
    shared.setPrefixPair("others", Object.assign({}, scrapedData["Other"]));
    shared.setPrefixPair("tags", data.Tags);
}
//#endregion