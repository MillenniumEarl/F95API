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
    avatar: string = null;
    /**
     * List of followed thread URLs.
     */
    watched: string[] = [];
    /**
     * List of bookmarked thread URLs.
     */
    bookmarks: string[] = [];
    /**
     * List of notification messages for the user.
     */
    notifications: string[] = [];
    /**
     * List of messages received.
     */
    messages: string[];
}
