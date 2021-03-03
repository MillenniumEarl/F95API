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

    //#region Fields

    /**
    * Max number of days the session is valid.
    */
    private readonly SESSION_TIME: number = 1;
    private _path: string;
    private _isMapped: boolean;
    private _created: Date;
    private _hash: string;
    private _token: string;

    //#endregion Fields

    //#region Getters

    /**
     * Path of the session map file on disk.
     */
    public get path() { return this._path; }
    /**
     * Indicates if the session is mapped on disk.
     */
    public get isMapped() { return this._isMapped; }
    /**
     * Date of creation of the session.
     */
    public get created() { return this._created; }
    /**
     * MD5 hash of the username and the password.
     */
    public get hash() { return this._hash; }
    /**
     * Token used to login to F95Zone.
     */
    public get token() { return this._token; }

    //#endregion Getters

    /**
     * Initializes the session by setting the path for saving information to disk.
     */
    constructor(path: string) {
        this._path = path;
        this._isMapped = fs.existsSync(this.path);
        this._created = new Date(Date.now());
        this._hash = null;
        this._token = null;
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
            _created: this._created,
            _hash: this._hash,
            _token: this._token,
        };
    }

    //#endregion Private Methods

    //#region Public Methods

    /**
     * Create a new session.
     */
    create(username: string, password: string, token: string): void {
        // First, create the _hash of the credentials
        const value = `${username}%%%${password}`;
        this._hash = md5(value);

        // Set the token
        this._token = token;

        // Update the creation date
        this._created = new Date(Date.now());
    }

    /**
     * Save the session to disk.
     */
    async save(): Promise<void> {
        // Update the creation date
        this._created = new Date(Date.now());

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
        if (this.isMapped) {
            // Read data
            const data = await areadfile(this.path, { encoding: 'utf-8', flag: 'r' });
            const json = JSON.parse(data);

            // Assign values
            this._created = json._created;
            this._hash = json._hash;
            this._token = json._token;
        }
    }

    /**
     * Delete the session from disk.
     */
    async delete(): Promise<void> {
        if (this.isMapped) {
            await aunlinkfile(this.path);
        }
    }

    /**
     * Check if the session is valid.
     */
    isValid(username: string, password: string): boolean {
        // Get the number of days from the file creation
        const diff = this.dateDiffInDays(new Date(Date.now()), this._created);

        // The session is valid if the number of days is minor than SESSION_TIME
        let valid = diff < this.SESSION_TIME;
        
        if(valid) {
            // Check the _hash
            const value = `${username}%%%${password}`;
            valid = md5(value) === this._hash;
        }

        return valid;
    }

    //#endregion Public Methods

}