"use strict";

// Modules from file
import shared from "../shared";

/**
 * Convert prefixes and platform tags from string to ID and vice versa.
 */
export default class PrefixParser {
    //#region Private methods
    /**
     * @private
     * Gets the key associated with a given value from a dictionary.
     * @param {Object} object Dictionary to search 
     * @param {Any} value Value associated with the key
     * @returns {String|undefined} Key found or undefined
     */
    _getKeyByValue(object: { [x: string]: unknown; }, value: unknown): string | undefined {
        return Object.keys(object).find(key => object[key] === value);
    }

    /**
     * @private
     * Makes an array of strings uppercase.
     */
    _toUpperCaseArray(a: string[]): string[] {
        /**
         * Makes a string uppercase.
         */
        function toUpper(s: string): string {
            return s.toUpperCase();
        }
        return a.map(toUpper);
    }

    /**
     * @private
     * Check if `dict` contains `value` as a value.
     */
    _valueInDict(dict: { [s: number]: string; }, value: string): boolean {
        const array = Object.values(dict);
        const upperArr = this._toUpperCaseArray(array);
        const element = value.toUpperCase();
        return upperArr.includes(element);
    }
    //#endregion Private methods

    /**
     * @public
     * Convert a list of prefixes to their respective IDs.
     */
    prefixesToIDs(prefixes: string[]) : number[] {
        const ids: number[] = [];
        for(const p of prefixes) {
            // Check what dict contains the value
            let dict = null;
            if (this._valueInDict(shared.statuses, p)) dict = shared.statuses;
            else if (this._valueInDict(shared.engines, p)) dict = shared.engines;
            else if (this._valueInDict(shared.tags, p)) dict = shared.tags;
            else if (this._valueInDict(shared.others, p)) dict = shared.others;
            else continue;

            // Extract the key from the dict
            const key = this._getKeyByValue(dict, p);
            if(key) ids.push(parseInt(key));
        }
        return ids;
    }

    /**
     * @public
     * It converts a list of IDs into their respective prefixes.
     */
    idsToPrefixes(ids: number[]): string[] {
        const prefixes:string[] = [];
        for(const id of ids) {
            // Check what dict contains the key
            let dict = null;
            if (Object.keys(shared.statuses).includes(id.toString())) dict = shared.statuses;
            else if (Object.keys(shared.engines).includes(id.toString())) dict = shared.engines;
            else if (Object.keys(shared.tags).includes(id.toString())) dict = shared.tags;
            else if (Object.keys(shared.others).includes(id.toString())) dict = shared.others;
            else continue;

            // Check if the key exists in the dict
            if (id in dict) prefixes.push(dict[id]);
        }
        return prefixes;
    }
}