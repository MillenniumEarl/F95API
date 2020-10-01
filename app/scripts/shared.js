/**
 * Class containing variables shared between modules.
 */
class Shared {
    /**
     * Shows log messages and other useful functions for module debugging.
     */
    static _debug = false;
    static _isLogged = false;
    static _cookies = null;
    static _engines = null;
    static _statuses = null;
    static WAIT_STATEMENT = 'domcontentloaded';

    static set debug(val) {
        this._debug = val;
    }

    /**
     * Shows log messages and other useful functions for module debugging.
     * @returns {boolean}
     */
    static get debug() {
        return this._debug;
    }
    
    static set isLogged(val) {
        this._isLogged = val;
    }

    /**
     * @returns {boolean}
     */
    static get isLogged() {
        return this._isLogged;
    }

    static set cookies(val) {
        this._cookies = val;
    }

    /**
     * @returns {object[]}
     */
    static get cookies() {
        return this._cookies;
    }

    static set engines(val) {
        this._engines = val;
    }

    /**
     * @returns {string[]}
     */
    static get engines() {
        return this._engines;
    }

    static set statuses(val) {
        this._statuses = val;
    }
    /**
     * @returns {string[]}
     */
    static get statuses() {
        return this._statuses;
    }
}

module.exports = Shared;