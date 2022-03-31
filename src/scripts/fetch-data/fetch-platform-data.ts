// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { promises as fs, constants } from "fs";

// Public modules from npm
import { load } from "cheerio";

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
 * Represents the set of tags present on the platform.
 */
interface ILatestResource {
  prefixes: Record<string, ICategoryResource[]>;
  tags: Record<number, string>;
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
  const cacheExists = await readCache(shared.cachePath);
  if (!cacheExists) {
    // Load the HTML
    const response = await fetchHTML(f95url.LATEST_UPDATES);

    // Parse data
    if (response.isSuccess()) {
      const data = parseLatestPlatformHTML(response.value);

      // Assign data
      assignLatestPlatformData(data);

      // Cache data
      await saveCache(shared.cachePath);
    } else throw response.value;
  }
}

//#endregion Public methods

//#region Private methods

/**
 * Read the platform cache (if available).
 */
async function readCache(path: string): Promise<boolean> {
  // Local variables
  let returnValue = false;

  async function checkFileExists(file: string) {
    return fs
      .access(file, constants.F_OK)
      .then(() => true)
      .catch(() => false);
  }

  const existsCache = await checkFileExists(path);

  if (existsCache) {
    const data = await fs.readFile(path, { encoding: "utf-8", flag: "r" });
    const json: Record<string, Record<string, string>> = JSON.parse(data);

    // Map objects don't natively support JSON conversion
    // so they were saved as normal object and we need to
    // re-covert them
    shared.setPrefixPair("engines", objectToMap(json.engines));
    shared.setPrefixPair("statuses", objectToMap(json.statuses));
    shared.setPrefixPair("tags", objectToMap(json.tags));
    shared.setPrefixPair("others", objectToMap(json.others));

    returnValue = true;
  }
  return returnValue;
}

/**
 * Save the current platform variables to disk.
 */
async function saveCache(path: string): Promise<void> {
  // Map objects don't natively support JSON conversion
  // so we will convert them to normal object and than
  // stringify them
  const saveDict: Record<string, Record<string, string>> = {
    engines: Object.fromEntries(shared.prefixes["engines"]),
    statuses: Object.fromEntries(shared.prefixes["statuses"]),
    tags: Object.fromEntries(shared.prefixes["tags"]),
    others: Object.fromEntries(shared.prefixes["others"])
  };
  const json = JSON.stringify(saveDict);
  await fs.writeFile(path, json);
}

/**
 * Given the HTML code of the response from the F95Zone,
 * parse it and return the result.
 */
function parseLatestPlatformHTML(html: string): ILatestResource {
  const $ = load(html);

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
  const scrapedData = new Map<string, TPrefixDict>();

  // Parse and assign the values that are NOT tags
  for (const res of Object.values(data.prefixes).flat()) {
    // Prepare the dict
    const dict = new Map<number, string>();

    // Assign values
    res.prefixes.map((e) => dict.set(e.id, e.name.replace("&#039;", "'")));

    // Merge the dicts ("Other"/"Status" field)
    if (scrapedData.has(res.name)) {
      for (const key of dict.keys()) {
        const field = scrapedData.get(res.name);

        // Add ("Merge") value only if it isn't already present
        if (!field.has(key)) {
          const value = dict.get(key);
          field.set(key, value);
        }
      }
    }
    // Assign the property
    else scrapedData.set(res.name, dict);
  }

  // Save the values
  shared.setPrefixPair("engines", scrapedData.get("Engine"));
  shared.setPrefixPair("statuses", scrapedData.get("Status"));
  shared.setPrefixPair("others", scrapedData.get("Other"));
  shared.setPrefixPair("tags", objectToMap(data.tags));
}

/**
 * Convert a `Record` object to `Map` (`TPrefixDict`).
 */
function objectToMap(data: Record<number | string, string>) {
  // file deepcode ignore CollectionUpdatedButNeverQueried: This map doesn't need to be queried here
  const map = new Map<number, string>();
  Object.entries(data).forEach(([key, value]) => map.set(parseInt(key, 10), value));

  return map as TPrefixDict;
}

//#endregion
