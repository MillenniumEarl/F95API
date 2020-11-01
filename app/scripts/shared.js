"use strict";

// Public modules from npm
const log4js = require("log4js");

/**
 * Class containing variables shared between modules.
 */
class Shared {
    //#region Properties
    /**
     * Shows log messages and other useful functions for module debugging.
     * @type Boolean
     */
    static #_debug = false;
    /**
     * Indicates whether a user is logged in to the F95Zone platform or not.
     * @type Boolean
     */
    static #_isLogged = false;
    /**
     * List of possible game engines used for development.
     * @type String[]
     */
    static #_engines = ["ADRIFT", "Flash", "HTML", "Java", "Others", "QSP", "RAGS", "RPGM", "Ren'Py", "Tads", "Unity", "Unreal Engine", "WebGL", "Wolf RPG"];
    /**
     * List of possible development statuses that a game can assume.
     * @type String[]
     */
    static #_statuses = ["Completed", "Onhold", "Abandoned"];
    /**
     * Logger object used to write to both file and console.
     * @type log4js.Logger
     */
    static #_logger = log4js.getLogger();
    //#endregion Properties

    //#region Getters
    /**
   * Shows log messages and other useful functions for module debugging.
   * @returns {Boolean}
   */
    static get debug() {
        return this.#_debug;
    }
    /**
   * Indicates whether a user is logged in to the F95Zone platform or not.
   * @returns {Boolean}
   */
    static get isLogged() {
        return this.#_isLogged;
    }
    /**
   * List of possible game engines used for development.
   * @returns {String[]}
   */
    static get engines() {
        return this.#_engines;
    }
    /**
   * List of possible development states that a game can assume.
   * @returns {String[]}
   */
    static get statuses() {
        return this.#_statuses;
    }
    /**
   * Logger object used to write to both file and console.
   * @returns {log4js.Logger}
   */
    static get logger() {
        return this.#_logger;
    }
    //#endregion Getters

    //#region Setters
    static set engines(val) {
        this.#_engines = val;
    }

    static set statuses(val) {
        this.#_statuses = val;
    }

    static set debug(val) {
        this.#_debug = val;
    }

    static set isLogged(val) {
        this.#_isLogged = val;
    }
    //#endregion Setters
}

module.exports = Shared;
