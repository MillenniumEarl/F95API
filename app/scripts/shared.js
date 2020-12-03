/* istanbul ignore file */
"use strict";

// Core modules
const {tmpdir} = require("os");
const {join} = require("path");

// Public modules from npm
const log4js = require("log4js");

/**
 * Class containing variables shared between modules.
 */
class Shared {
    //#region Properties
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     * @type Boolean
     */
    static #_isLogged = false;
    /**
     * List of possible game engines used for development.
     * @type Object<number,string>
     */
    static #_engines = {};
    /**
     * List of possible development statuses that a game can assume.
     * @type Object<number,string>
     */
    static #_statuses = {};
    /**
     * List of other prefixes that a game can assume.
     * @type Object<number,string>
     */
    static #_others = {};
    /**
     * List of possible tags that a game can assume.
     * @type Object<number,string>
     */
    static #_tags = {};
    /**
     * Logger object used to write to both file and console.
     * @type log4js.Logger
     */
    static #_logger = log4js.getLogger();
    //#endregion Properties

    //#region Getters
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     * @returns {Boolean}
     */
    static get isLogged() {
        return this.#_isLogged;
    }
    /**
     * List of possible game engines used for development.
     * @returns @returns {Object<number, string>}
     */
    static get engines() {
        return this.#_engines;
    }
    /**
     * List of possible development states that a game can assume.
     * @returns {Object<number, string>}
     */
    static get statuses() {
        return this.#_statuses;
    }
    /**
     * List of other prefixes that a game can assume.
     * @returns {Object<number, string>}
     */
    static get others() {
        return this.#_others;
    }
    /**
     * List of possible tags that a game can assume.
     * @returns {Object<number, string>}
     */
    static get tags() {
        return this.#_tags;
    }
    /**
     * Logger object used to write to both file and console.
     * @returns {log4js.Logger}
     */
    static get logger() {
        return this.#_logger;
    }
    /**
     * Path to the cache used by this module wich contains engines, statuses, tags...
     */
    static get cachePath() {
        return join(tmpdir(), "f95cache.json");
    }
    //#endregion Getters

    //#region Setters
    static set engines(val) {
        this.#_engines = val;
    }

    static set statuses(val) {
        this.#_statuses = val;
    }

    static set tags(val) {
        this.#_tags = val;
    }

    static set others(val) {
        this.#_others = val;
    }

    static set isLogged(val) {
        this.#_isLogged = val;
    }
    //#endregion Setters
}

module.exports = Shared;
