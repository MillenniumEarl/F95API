// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { Cheerio, Node, Element, load } from "cheerio";

// Modules from file
import shared from "../shared";
import { THREAD } from "../constants/css-selector";

/**
 * Represents information contained in a JSON+LD tag.
 */
export type TJsonLD = { [s: string]: string | TJsonLD };

/**
 * Extracts and processes the JSON-LD values of the page.
 * @param {Cheerio<Node>} body Page `body` selector
 * @returns {TJsonLD[]} List of data obtained from the page
 */
export function getJSONLD(body: Cheerio<Node>): TJsonLD {
  shared.logger.trace("Extracting JSON-LD data...");

  // Fetch the JSON-LD data
  const structuredDataElements = body.find(THREAD.JSONLD);

  // Parse the data
  const values = structuredDataElements
    .get()
    .filter((el) => el)
    .map((el) => parseJSONLD(el));

  // Merge the data and return a single value
  return mergeJSONLD(values);
}

//#region Private methods
/**
 * Merges multiple JSON+LD tags into one object.
 * @param data List of JSON+LD tags
 */
function mergeJSONLD(data: TJsonLD[]): TJsonLD {
  // Local variables
  let merged: TJsonLD = {};

  for (const value of data) {
    merged = Object.assign(merged, value);
  }

  return merged;
}

/**
 * Parse a JSON-LD element source code.
 */
function parseJSONLD(element: Element): TJsonLD {
  // Get the element HTML
  const html = load(element).html().trim();

  // Obtain the JSON-LD
  const data = html
    .replace('<script type="application/ld+json">', "")
    .replace("</script>", "");

  // Convert the string to an object
  return JSON.parse(data);
}
//#endregion Private methods
