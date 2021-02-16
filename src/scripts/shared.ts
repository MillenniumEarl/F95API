/* istanbul ignore file */
"use strict";

// Core modules
import { tmpdir } from "os";
import { join } from "path";

// Public modules from npm
import log4js from "log4js";

// Modules from file
import Session from "./classes/session.js";

// Types declaration
export type DictType = { [n: number]: string; };

/**
 * Class containing variables shared between modules.
 */
export default abstract class Shared {
    //#region Properties
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     */
    static _isLogged = false;
    /**
     * List of platform prefixes and tags.
     */
    static _prefixes: {[s: string]: DictType} = {}
    /**
     * Logger object used to write to both file and console.
     */
    static _logger: log4js.Logger = log4js.getLogger();
    /**
     * Session on the F95Zone platform.
     */
    static _session = new Session(join(tmpdir(), "f95session.json"));
    //#endregion Properties

    //#region Getters
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     */
    static get isLogged(): boolean {
        return this._isLogged;
    }
    /**
     * List of platform prefixes and tags.
     */
    static get prefixes(): { [s: string]: DictType } {
        return this._prefixes;
    }
    /**
     * Logger object used to write to both file and console.
     */
    static get logger(): log4js.Logger {
        return this._logger;
    }
    /**
     * Path to the cache used by this module wich contains engines, statuses, tags...
     */
    static get cachePath(): string {
        return join(tmpdir(), "f95cache.json");
    }
    /**
     * Session on the F95Zone platform.
     */
    static get session(): Session {
        return this._session;
    }
    //#endregion Getters

    //#region Setters
    static setPrefixPair(key: string, val: DictType): void {
        this._prefixes[key] = val;
    }

    static setIsLogged(val: boolean): void {
        this._isLogged = val;
    }
    //#endregion Setters
}
