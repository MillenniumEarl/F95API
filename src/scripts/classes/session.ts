"use strict";

// Core modules
import * as fs from "fs";
import { promisify } from "util";

// Public modules from npm
import md5 from "md5";

// Promisifed functions
const areadfile = promisify(fs.readFile);
const awritefile = promisify(fs.writeFile);
const aunlinkfile = promisify(fs.unlink);

export default class Session {
    //#region Properties
    /**
    * Max number of days the session is valid.
    */
    private readonly SESSION_TIME: number = 1;
    /**
     * Path of the session map file on disk.
     */
    private path: string  = null;
    /**
     * Indicates if the session is mapped on disk.
     */
    private isMapped = null;
    /**
     * Date of creation of the session.
     */
    private created = null;
    /**
     * MD5 hash of the username and the password.
     */
    private hash = null;
    //#endregion Properties

    constructor(path: string) {
        this.path = path;
        this.isMapped = fs.existsSync(this.path);
        this.created = new Date(Date.now());
        this.hash = null;
    }

    //#region Private Methods
    /**
     * Get the difference in days between two dates.
     */
    private dateDiffInDays(a: Date, b: Date) {
        const MS_PER_DAY = 1000 * 60 * 60 * 24;

        // Discard the time and time-zone information.
        const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

        return Math.floor((utc2 - utc1) / MS_PER_DAY);
    }

    /**
     * Convert the object to a dictionary serializable in JSON.
     */
    private toJSON(): Record<string, unknown> {
        return {
            created: this.created,
            hash: this.hash,
        };
    }
    //#endregion Private Methods

    //#region Public Methods
    /**
     * Create a new session
     */
    create(username: string, password: string):void {
        // First, create the hash of the credentials
        const value = `${username}%%%${password}`;
        this.hash = md5(value);

        // Update the creation date
        this.created = new Date(Date.now());
    }

    /**
     * Save the session to disk.
     */
    async save() : Promise<void> {
        // Update the creation date
        this.created = new Date(Date.now());

        // Convert data
        const json = this.toJSON();
        const data = JSON.stringify(json);

        // Write data
        await awritefile(this.path, data);
    }

    /**
     * Load the session from disk.
     */
    async load(): Promise<void> {
        // Read data
        const data = await areadfile(this.path, { encoding: 'utf-8', flag: 'r' });
        const json = JSON.parse(data);

        // Assign values
        this.created = json.created;
        this.hash = json.hash;
    }

    /**
     * Delete the session from disk.
     */
    async delete(): Promise<void> {
        await aunlinkfile(this.path);
    }

    /**
     * Check if the session is valid.
     */
    isValid(username:string, password:string) : boolean {
        // Get the number of days from the file creation
        const diff = this.dateDiffInDays(new Date(Date.now()), this.created);

        // The session is valid if the number of days is minor than SESSION_TIME
        let valid = diff < this.SESSION_TIME;
        
        if(valid) {
            // Check the hash
            const value = `${username}%%%${password}`;
            valid = md5(value) === this.hash;
        }
        return valid;
    }
    //#endregion Public Methods
}