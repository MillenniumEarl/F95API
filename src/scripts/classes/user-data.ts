"use strict";

/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
export default class UserData {
    /**
    * User name.
    */
    username: string = null;
    /**
     * Path to the user's profile picture.
     */
    avatarSrc: string = null;
    /**
     * List of followed game thread URLs.
     */
    watchedGameThreads: string[] = [];
}
