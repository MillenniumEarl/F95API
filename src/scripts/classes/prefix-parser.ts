// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import shared, { TPrefixDict } from "../shared";

/**
 * Convert prefixes and platform tags from string to ID and vice versa.
 */
export default class PrefixParser {
  //#region Private methods
  /**
   * Gets the key associated with a given value from a dictionary.
   * @param {Object} object Dictionary to search
   * @param {Any} value Value associated with the key
   * @returns {String|undefined} Key found or undefined
   */
  private getKeyByValue(object: TPrefixDict, value: string): string | undefined {
    return Object.keys(object).find((key) => object[key] === value);
  }

  /**
   * Makes an array of strings uppercase.
   */
  private toUpperCaseArray(a: string[]): string[] {
    /**
     * Makes a string uppercase.
     */
    function toUpper(s: string): string {
      return s.toUpperCase();
    }
    return a.map(toUpper);
  }

  /**
   * Check if `dict` contains `value` as a value.
   */
  private valueInDict(dict: TPrefixDict, value: string): boolean {
    const array = Object.values(dict);
    const upperArr = this.toUpperCaseArray(array);
    const element = value.toUpperCase();
    return upperArr.includes(element);
  }

  /**
   * Search within the platform prefixes for the
   * desired element and return the dictionary that contains it.
   * @param element Element to search in the prefixes as a key or as a value
   */
  private searchElementInPrefixes(element: string | number): TPrefixDict | null {
    // Local variables
    let dictName = null;

    // Iterate the key/value pairs in order to find the element
    for (const [key, subdict] of Object.entries(shared.prefixes)) {
      // Check if the element is a value in the sub-dict
      const valueInDict =
        typeof element === "string" && this.valueInDict(subdict, element as string);

      // Check if the element is a key in the subdict
      const keyInDict =
        typeof element === "number" && Object.keys(subdict).includes(element.toString());

      if (valueInDict || keyInDict) {
        dictName = key;
        break;
      }
    }

    return shared.prefixes[dictName] ?? null;
  }
  //#endregion Private methods

  /**
   * Convert a list of prefixes to their respective IDs.
   */
  public prefixesToIDs(prefixes: string[]): number[] {
    const ids: number[] = [];

    for (const p of prefixes) {
      // Check what dict contains the value
      const dict = this.searchElementInPrefixes(p);

      if (dict) {
        // Extract the key from the dict
        const key = this.getKeyByValue(dict, p);
        ids.push(parseInt(key, 10));
      }
    }
    return ids;
  }

  /**
   * It converts a list of IDs into their respective prefixes.
   */
  public idsToPrefixes(ids: number[]): string[] {
    const prefixes: string[] = [];

    for (const id of ids) {
      // Check what dict contains the key
      const dict = this.searchElementInPrefixes(id);

      // Add the key to the list
      if (dict) {
        prefixes.push(dict[id]);
      }
    }
    return prefixes;
  }
}
