/// <reference types="cheerio" />
/**
 * Represents information contained in a JSON+LD tag.
 */
export declare type TJsonLD = {
    [s: string]: string | TJsonLD;
};
/**
 * Extracts and processes the JSON-LD values of the page.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {TJsonLD[]} List of data obtained from the page
 */
export declare function getJSONLD(body: cheerio.Cheerio): TJsonLD;
