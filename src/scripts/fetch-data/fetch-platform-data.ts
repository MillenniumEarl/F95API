// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Core modules
import { readFileSync, writeFileSync, existsSync } from "fs";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import shared, { TPrefixDict } from "../shared";
import { urls as f95url } from "../constants/url";
import { GENERIC } from "../constants/css-selector";
import { fetchHTML } from "../network-helper";

//#region Interface definitions

/**
 * Represents the single element contained in the data categories.
 */
interface ISingleOption {
  id: number;
  name: string;
  class: string;
}

/**
 * Represents the set of values associated with a specific category of data.
 */
interface ICategoryResource {
  id: number;
  name: string;
  prefixes: ISingleOption[];
}

/**
 * Represents the set of tags present on the platform-
 */
interface ILatestResource {
  prefixes: { [s: string]: ICategoryResource[] };
  tags: TPrefixDict;
  options: string;
}

//#endregion Interface definitions

//#region Public methods

/**
 * Gets the basic data used for game data processing
 * (such as graphics engines and progress statuses)
 */
export default async function fetchPlatformData(): Promise<void> {
  // Check if the data are cached
  if (!readCache(shared.cachePath)) {
    // Load the HTML
    const response = await fetchHTML(f95url.LATEST_UPDATES);

    // Parse data
    const result = response.applyOnSuccess((html) => {
      const data = parseLatestPlatformHTML(html);

      // Assign data
      assignLatestPlatformData(data);

      // Cache data
      saveCache(shared.cachePath);
    });

    if (result.isFailure()) throw result.value;
  }
}

//#endregion Public methods

//#region Private methods

/**
 * Read the platform cache (if available).
 */
function readCache(path: string) {
  // Local variables
  let returnValue = false;

  if (existsSync(path)) {
    const data = readFileSync(path, { encoding: "utf-8", flag: "r" });
    const json: { [s: string]: TPrefixDict } = JSON.parse(data);

    shared.setPrefixPair("engines", json.engines);
    shared.setPrefixPair("statuses", json.statuses);
    shared.setPrefixPair("tags", json.tags);
    shared.setPrefixPair("others", json.others);

    returnValue = true;
  }
  return returnValue;
}

/**
 * Save the current platform variables to disk.
 */
function saveCache(path: string): void {
  const saveDict = {
    engines: shared.prefixes["engines"],
    statuses: shared.prefixes["statuses"],
    tags: shared.prefixes["tags"],
    others: shared.prefixes["others"]
  };
  const json = JSON.stringify(saveDict);
  writeFileSync(path, json);
}

/**
 * Given the HTML code of the response from the F95Zone,
 * parse it and return the result.
 */
function parseLatestPlatformHTML(html: string): ILatestResource {
  const $ = cheerio.load(html);

  // Clean the JSON string
  const unparsedText = $(GENERIC.LATEST_UPDATES_TAGS_SCRIPT).html().trim();
  const startIndex = unparsedText.indexOf("{");
  const endIndex = unparsedText.lastIndexOf("}");
  const parsedText = unparsedText.substring(startIndex, endIndex + 1);
  return JSON.parse(parsedText);
}

/**
 * Assign to the local variables the values from the F95Zone.
 */
function assignLatestPlatformData(data: ILatestResource): void {
  // Local variables
  const scrapedData = {};

  // Parse and assign the values that are NOT tags
  for (const [key, value] of Object.entries(data.prefixes)) {
    for (const res of value) {
      // Prepare the dict
      const dict: TPrefixDict = {};

      // Assign values
      res.prefixes.map((e) => (dict[e.id] = e.name.replace("&#039;", "'")));

      // Merge the dicts ("Other"/"Status" field)
      if (scrapedData[res.name]) {
        const newKeys = Object.keys(dict)
          .map((k) => parseInt(k, 10))
          .filter((k) => !scrapedData[res.name][k]);

        newKeys.map((k) => (scrapedData[res.name][k] = dict[k]));
      }
      // Assign the property
      else scrapedData[res.name] = dict;
    }
  }

  // Save the values
  shared.setPrefixPair("engines", Object.assign({}, scrapedData["Engine"]));
  shared.setPrefixPair("statuses", Object.assign({}, scrapedData["Status"]));
  shared.setPrefixPair("others", Object.assign({}, scrapedData["Other"]));
  shared.setPrefixPair("tags", data.tags);
}

//#endregion
