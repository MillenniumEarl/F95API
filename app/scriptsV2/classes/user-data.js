"use strict";

/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
class UserData {
    constructor() {
    /**
     * User username.
     * @type String
     */
        this.username = "";
        /**
     * Path to the user's profile picture.
     * @type String
     */
        this.avatarSrc = null;
        /**
     * List of followed thread URLs.
     * @type URL[]
     */
        this.watchedThreads = [];
    }
}

module.exports = UserData;
