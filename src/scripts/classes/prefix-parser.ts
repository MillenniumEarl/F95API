// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import shared, { TPrefixDict } from "../shared";

/**
 * Convert prefixes and platform tags from string to ID and vice versa.
 */
export default class PrefixParser {
  //#region Private methods
  /**
   * Gets the key associated with a given value from a dictionary.
   * @param object Dictionary to search
   * @param value Value associated with the key
   * @returns Key found or `undefined`
   */
  private getKeyByValue(
    object: TPrefixDict,
    value: string
  ): number | undefined {
    return Array.from(object.keys()).find((key) => object.get(key) === value);
  }

  /**
   * Check if `dict` contains `value` as a value.
   */
  private valueInDict(dict: TPrefixDict, value: string): boolean {
    const element = value.toUpperCase();

    for (const value of dict.values()) {
      if (value.toUpperCase() === element) return true;
    }

    return false;
  }

  /**
   * Search within the platform prefixes for the
   * desired element and return the dictionary that contains it.
   * @param element Element to search in the prefixes as a key or as a value
   */
  private searchElementInPrefixes(
    element: string | number
  ): TPrefixDict | null {
    // Local variables
    let dictName = null;

    // Iterate the key/value pairs in order to find the element
    for (const [key, subdict] of Object.entries(shared.prefixes)) {
      // Check if the element is a value in the sub-dict
      const valueInDict =
        typeof element === "string" &&
        this.valueInDict(subdict, element as string);

      // Check if the element is a key in the subdict
      const keyInDict = typeof element === "number" && subdict.has(element);

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

      // Extract the key from the dict
      if (dict) ids.push(this.getKeyByValue(dict, p));
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
      if (dict) prefixes.push(dict.get(id));
    }
    return prefixes;
  }
}
