"use strict";

class GameInfo {
    constructor() {
        //#region Properties
        /**
         * Game name
         * @type String
         */
        this.name = null;
        /**
         * Game author
         * @type String
         */
        this.author = null;
        /**
         * URL to the game's official conversation on the F95Zone portal
         * @type String
         */
        this.url = null;
        /**
         * Game description
         * @type String
         */
        this.overview = null;
        /**
         * Game language.
         * @type String
         */
        this.language = null;
        /**
         * List of supported OS.
         * @type
         */
        this.supportedOS = [];
        /**
         * Specify whether the game has censorship 
         * measures regarding NSFW scenes.
         * @type Boolean
         */
        this.censored = null;
        /**
         * List of tags associated with the game
         * @type String[]
         */
        this.tags = [];
        /**
         * Graphics engine used for game development
         * @type String
         */
        this.engine = null;
        /**
         * Development of the game
         * @type String
         */
        this.status = null;
        /**
         * Game description image URL
         * @type String
         */
        this.previewSrc = null;
        /**
         * Game version
         * @type String
         */
        this.version = null;
        /**
         * Last time the game underwent updates
         * @type Date
         */
        this.lastUpdate = null;
        /**
         * Specifies if the game is original or a mod
         * @type Boolean
         */
        this.isMod = false;
        /**
         * Changelog for the last version.
         * @type String
         */
        this.changelog = null;
        //#endregion Properties
    }

    /**
    * Converts the object to a dictionary used for JSON serialization.
    */
    /* istanbul ignore next */
    toJSON() {
        return {
            name: this.name,
            author: this.author,
            url: this.url,
            overview: this.overview,
            language: this.language,
            supportedOS: this.supportedOS,
            censored: this.censored,
            engine: this.engine,
            status: this.status,
            tags: this.tags,
            previewSrc: this.previewSrc,
            version: this.version,
            lastUpdate: this.lastUpdate,
            lastPlayed: this.lastPlayed,
            isMod: this.isMod,
            changelog: this.changelog,
            gameDir: this.gameDir,
        };
    }

    /**
    * Return a new GameInfo from a JSON string.
    * @param {String} json JSON string used to create the new object
    * @returns {GameInfo}
    */
    static fromJSON(json) {
        // Convert string
        const temp = Object.assign(new GameInfo(), JSON.parse(json));
        
        // JSON cannot transform a string to a date implicitly
        temp.lastUpdate = new Date(temp.lastUpdate);
        return temp;
    }
}
module.exports = GameInfo;
