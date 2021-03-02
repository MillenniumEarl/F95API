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
export type TPrefixDict = { [n: number]: string; };
type TPrefixKey = "engines" | "statuses" | "tags" | "others";

/**
 * Class containing variables shared between modules.
 */
export default abstract class Shared {
    
    //#region Fields

    private static _isLogged = false;
    private static _prefixes: { [key in TPrefixKey]: TPrefixDict } = {} as { [key in TPrefixKey]: TPrefixDict };
    private static _logger: log4js.Logger = log4js.getLogger();
    private static _session = new Session(join(tmpdir(), "f95session.json"));

    //#endregion Fields

    //#region Getters

    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     */
    static get isLogged(): boolean { return this._isLogged; }
    /**
     * List of platform prefixes and tags.
     */
    static get prefixes(): { [s: string]: TPrefixDict } { return this._prefixes; }
    /**
     * Logger object used to write to both file and console.
     */
    static get logger(): log4js.Logger { return this._logger; }
    /**
     * Path to the cache used by this module wich contains engines, statuses, tags...
     */
    static get cachePath(): string { return join(tmpdir(), "f95cache.json"); }
    /**
     * Session on the F95Zone platform.
     */
    static get session(): Session { return this._session; }

    //#endregion Getters

    //#region Setters

    static setPrefixPair(key: TPrefixKey, val: TPrefixDict): void { this._prefixes[key] = val; }

    static setIsLogged(val: boolean): void { this._isLogged = val; }

    //#endregion Setters
}
