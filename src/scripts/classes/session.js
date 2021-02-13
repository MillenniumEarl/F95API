"use strict";

// Core modules
const fs = require("fs");
const promisify = require("util").promisify;

// Public modules from npm
const md5 = require("md5");

// Promisifed functions
const areadfile = promisify(fs.readFile);
const awritefile = promisify(fs.writeFile);
const aunlinkfile = promisify(fs.unlink);

class Session {
    constructor(path) {
        /**
         * Max number of days the session is valid.
         */
        this.SESSION_TIME = 1;

        /**
         * Path of the session map file on disk.
         */
        this._path = path;

        /**
         * Indicates if the session is mapped on disk.
         */
        this._isMapped = fs.existsSync(this._path);
        
        /**
         * Date of creation of the session.
         */
        this._created = new Date(Date.now());

        /**
         * MD5 hash of the username and the password.
         */
        this._hash = null;
    }

    //#region Private Methods
    /**
     * @private
     * Get the difference in days between two dates.
     * @param {Date} a 
     * @param {Date} b 
     */
    _dateDiffInDays(a, b) {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / MS_PER_DAY);
    }

    /**
     * @private
     * Convert the object to a dictionary serializable in JSON.
     */
    _toJSON() {
        return {
            created: this._created,
            hash: this._hash,
        };
    }
    //#endregion Private Methods

    //#region Public Methods
    create(username, password) {
        // First, create the hash of the credentials
        const value = `${username}%%%${password}`;
        this._hash = md5(value);

        // Update the creation date
        this._created = new Date(Date.now());
    }

    /**
     * @public
     * Save the session to disk.
     */
    async save() {
        // Update the creation date
        this._created = new Date(Date.now());

        // Convert data
        const json = this._toJSON();
        const data = JSON.stringify(json);

        // Write data
        await awritefile(this._path, data);
    }

    /**
     * @public
     * Load the session from disk.
     */
    async load() {
        // Read data
        const data = await areadfile(this._path);
        const json = JSON.parse(data);

        // Assign values
        this._created = json.created;
        this._hash = json.hash;
    }

    /**
     * @public
     * Delete the session from disk.
     */
    async delete() {
        await aunlinkfile(this._path);
    }

    /**
     * @public
     * Check if the session is valid.
     */
    isValid(username, password) {
        // Get the number of days from the file creation
        const diff = this._dateDiffInDays(new Date(Date.now()), this._created);

        // The session is valid if the number of days is minor than SESSION_TIME
        let valid = diff < this.SESSION_TIME;
        
        if(valid) {
            // Check the hash
            const value = `${username}%%%${password}`;
            valid = md5(value) === this._hash;
        }
        return valid;
    }
    //#endregion Public Methods
}

module.exports = Session;