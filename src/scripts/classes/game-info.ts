"use strict";

/**
 * Information of a game/mod on the platform.
 */
export class GameInfo {
    //#region Properties
    /**
    * Unique ID of the game on the platform.
    */
    id = -1;
    /**
     * Game name
     */
    name: string = null;
    /**
     * Game author
     */
    author: string = null;
    /**
     * URL to the game's official conversation on the F95Zone portal
     */
    url: string = null;
    /**
     * Game description
     */
    overview: string = null;
    /**
     * Game language
     */
    language: string = null;
    /**
     * List of supported OS
     */
    supportedOS: string[] = [];
    /**
     * Specify whether the game has censorship 
     * measures regarding NSFW scenes
     */
    censored: boolean = null;
    /**
     * List of tags associated with the game
     */
    tags: string[] = [];
    /**
     * Graphics engine used for game development
     */
    engine: string = null;
    /**
     * Development of the game
     */
    status: string = null;
    /**
     * Game description image URL
     */
    previewSrc: string = null;
    /**
     * Game version
     */
    version: string = null;
    /**
     * Last time the game underwent updates
     */
    lastUpdate: Date = null;
    /**
     * Specifies if the game is original or a mod
     */
    isMod = false;
    /**
     * Changelog for the last version
     */
    changelog: string = null;
    //#endregion Properties

    /**
    * Converts the object to a dictionary used for JSON serialization.
    */
    /* istanbul ignore next */
    toJSON(): Record<string, unknown> {
        return {
            id: this.id,
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
            isMod: this.isMod,
            changelog: this.changelog,
        };
    }

    /**
    * Return a new GameInfo from a JSON string.
    * @param {String} json JSON string used to create the new object
    * @returns {GameInfo}
    */
    static fromJSON(json: string): GameInfo {
        // Convert string
        const temp = Object.assign(new GameInfo(), JSON.parse(json));

        // JSON cannot transform a string to a date implicitly
        temp.lastUpdate = new Date(temp.lastUpdate);
        return temp;
    }
}
