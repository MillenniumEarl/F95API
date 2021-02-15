/**
 * Represents information contained in a JSON+LD tag.
 */
export type JSONLD = { [s: string]: string | JSONLD }

/**
 * Extracts and processes the JSON-LD values of the page.
 * @param {cheerio.Cheerio} body Page `body` selector
 * @returns {JSONLD[]} List of data obtained from the page
 */
export function getJSONLD(body: cheerio.Cheerio): JSONLD {
    shared.logger.trace("Extracting JSON-LD data...");

    // Fetch the JSON-LD data
    const structuredDataElements = body.find(f95Selector.GT_JSONLD);

    // Parse the data
    const values = structuredDataElements.map((idx, el) => parseJSONLD(el)).get();

    // Merge the data and return a single value
    return mergeJSONLD(values);
}

//#region Private methods
/**
 * Merges multiple JSON+LD tags into one object.
 * @param data List of JSON+LD tags
 */
function mergeJSONLD(data: JSONLD[]): JSONLD {
    // Local variables
    let merged: JSONLD = {};

    for (const value of data) {
        merged = Object.assign(merged, value);
    }

    return merged;
}

/**
 * Parse a JSON-LD element source code.
 */
function parseJSONLD(element: cheerio.Element): JSONLD {
    // Get the element HTML
    const html = cheerio.load(element).html().trim();

    // Obtain the JSON-LD
    const data = html
        .replace("<script type=\"application/ld+json\">", "")
        .replace("</script>", "");

    // Convert the string to an object
    return JSON.parse(data);
}
//#endregion Private methods