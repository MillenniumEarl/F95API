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
    this.f95url = null;
    /**
     * Game description
     * @type String
     */
    this.overview = null;
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
     * Progress of the game
     * @type String
     */
    this.status = null;
    /**
     * Game description image URL
     * @type String
     */
    this.previewSource = null;
    /**
     * Game version
     * @type String
     */
    this.version = null;
    /**
     * Last time the game underwent updates
     * @type String
     */
    this.lastUpdate = null;
    /**
     * Last time the local copy of the game was run
     * @type String
     */
    this.lastPlayed = null;
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
    /**
     * Directory containing the local copy of the game
     * @type String
     */
    this.gameDir = null;
    /**
     * Information on game file download links,
     * including information on hosting platforms
     * and operating system supported by the specific link
     * @type GameDownload[]
     */
    this.downloadInfo = [];
    //#endregion Properties
  }

  /**
   * Converts the object to a dictionary used for JSON serialization
   */
  /* istanbul ignore next */
  toJSON() {
    return {
      name: this.name,
      author: this.author,
      f95url: this.f95url,
      overview: this.overview,
      engine: this.engine,
      status: this.status,
      previewSource: this.previewSource,
      version: this.version,
      lastUpdate: this.lastUpdate,
      lastPlayed: this.lastPlayed,
      isMod: this.isMod,
      changelog: this.changelog,
      gameDir: this.gameDir,
      downloadInfo: this.downloadInfo,
    };
  }

  /**
   * Return a new GameInfo from a JSON string
   * @param {String} json JSON string used to create the new object
   * @returns {GameInfo}
   */
  /* istanbul ignore next */
  static fromJSON(json) {
    return Object.assign(new GameInfo(), json);
  }
}
module.exports = GameInfo;
