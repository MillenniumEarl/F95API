/**
 * Convert prefixes and platform tags from string to ID and vice versa.
 */
export default class PrefixParser {
    /**
     * Gets the key associated with a given value from a dictionary.
     * @param {Object} object Dictionary to search
     * @param {Any} value Value associated with the key
     * @returns {String|undefined} Key found or undefined
     */
    private getKeyByValue;
    /**
     * Makes an array of strings uppercase.
     */
    private toUpperCaseArray;
    /**
     * Check if `dict` contains `value` as a value.
     */
    private valueInDict;
    /**
     * Search within the platform prefixes for the
     * desired element and return the dictionary that contains it.
     * @param element Element to search in the prefixes as a key or as a value
     */
    private searchElementInPrefixes;
    /**
     * Convert a list of prefixes to their respective IDs.
     */
    prefixesToIDs(prefixes: string[]): number[];
    /**
     * It converts a list of IDs into their respective prefixes.
     */
    idsToPrefixes(ids: number[]): string[];
}
