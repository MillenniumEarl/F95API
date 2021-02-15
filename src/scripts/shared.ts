/* istanbul ignore file */
"use strict";

// Core modules
import { tmpdir } from "os";
import { join } from "path";

// Public modules from npm
import { getLogger, Logger } from "log4js";

// Modules from file
import Session from "./classes/session";

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
     * List of possible game engines used for development.
     */
    static _engines: DictType = {};
    /**
     * List of possible development statuses that a game can assume.
     */
    static _statuses: DictType = {};
    /**
     * List of other prefixes that a game can assume.
     */
    static _others: DictType = {};
    /**
     * List of possible tags that a game can assume.
     */
    static _tags: DictType = {};
    /**
     * Logger object used to write to both file and console.
     */
    static _logger: Logger = getLogger();
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
     * List of possible game engines used for development.
     */
    static get engines(): DictType {
        return this._engines;
    }
    /**
     * List of possible development states that a game can assume.
     */
    static get statuses(): DictType {
        return this._statuses;
    }
    /**
     * List of other prefixes that a game can assume.
     */
    static get others(): DictType {
        return this._others;
    }
    /**
     * List of possible tags that a game can assume.
     */
    static get tags(): DictType {
        return this._tags;
    }
    /**
     * Logger object used to write to both file and console.
     */
    static get logger(): Logger {
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
    static setEngines(val: DictType): void {
        this._engines = val;
    }

    static setStatuses(val: DictType): void {
        this._statuses = val;
    }

    static setTags(val: DictType): void {
        this._tags = val;
    }

    static setOthers(val: DictType): void {
        this._others = val;
    }

    static setIsLogged(val: boolean): void {
        this._isLogged = val;
    }
    //#endregion Setters
}

module.exports = Shared;
