"use strict";

// Modules from files
import Post from "./post";

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
     * List of bookmarked posts.
     */
    bookmarks: Post[] = [];
    /**
     * List of alerts.
     * @todo
     */
    alerts: string[] = [];
    /**
     * List of conversations.
     * @todo
     */
    conversations: string[];
}
