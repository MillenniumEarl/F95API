export declare const GENERIC: {
    /**
     * The ID of the user currently logged into
     * the platform in the attribute `data-user-id`.
     */
    CURRENT_USER_ID: string;
    /**
     * Banner containing any error messages as text.
     */
    ERROR_BANNER: string;
    /**
     * Locate the token used for the session.
     */
    GET_REQUEST_TOKEN: string;
    /**
     * Block containing the text of any errors that occurred during the login.
     */
    LOGIN_MESSAGE_ERROR: string;
    /**
     * Locate the script containing the tags and prefixes of the platform content in JSON format.
     */
    LATEST_UPDATES_TAGS_SCRIPT: string;
};
export declare const WATCHED_THREAD: {
    /**
     * List of elements containing the data of the watched threads.
     */
    BODIES: string;
    /**
     * Link element containing the partial URL
     * of the thread in the `href` attribute.
     *
     * It may be followed by the `/unread` segment.
     *
     * For use within a `WATCHED_THREAD.BODIES` selector.
     */
    URL: string;
    /**
     * Name of the forum to which the thread belongs as text.
     *
     * For use within a `WATCHED_THREAD.BODIES` selector.
     */
    FORUM: string;
    /**
     * Index of the last page available as text.
     */
    LAST_PAGE: string;
};
export declare const THREAD: {
    /**
     * Number of pages in the thread (as text of the element).
     *
     * Two identical elements are identified.
     */
    LAST_PAGE: string;
    /**
     * Identify the creator of the thread.
     *
     * The ID is contained in the `data-user-id` attribute.
     */
    OWNER_ID: string;
    /**
     * Contains the creation date of the thread.
     *
     * The date is contained in the `datetime` attribute as an ISO string.
     */
    CREATION: string;
    /**
     * List of tags assigned to the thread.
     */
    TAGS: string;
    /**
     * List of prefixes assigned to the thread.
     */
    PREFIXES: string;
    /**
     * Thread title.
     */
    TITLE: string;
    /**
     * JSON containing thread information.
     *
     * Two different elements are found.
     */
    JSONLD: string;
    /**
     * Posts on the current page.
     */
    POSTS_IN_PAGE: string;
};
export declare const THREAD_SEARCH: {
    /**
     * Thread title resulting from research.
     */
    THREAD_TITLE: string;
    /**
     *Thread body resulting from research.
     */
    BODY: string;
};
export declare const POST: {
    /**
     * Unique post number for the current thread.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    NUMBER: string;
    /**
     * Unique ID of the post in the F95Zone platform in the `id` attribute.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    ID: string;
    /**
     * Unique ID of the post author in the `data-user-id` attribute.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    OWNER_ID: string;
    /**
     * Main body of the post where the message written by the user is contained.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    BODY: string;
    /**
     * Publication date of the post contained in the `datetime` attribute as an ISO date.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    PUBLISH_DATE: string;
    /**
     * Last modified date of the post contained in the `datetime` attribute as the ISO date.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    LAST_EDIT: string;
    /**
     * Gets the element only if the post has been bookmarked.
     *
     * For use within a `THREAD.POSTS_IN_PAGE` selector.
     */
    BOOKMARKED: string;
};
export declare const MEMBER: {
    /**
     * Name of the user.
     *
     * It also contains the unique ID of the user in the `data-user-id` attribute.
     */
    NAME: string;
    /**
     * Title of the user in the platform.
     *
     * i.e.: Member
     */
    TITLE: string;
    /**
     * Avatar used by the user.
     *
     * Source in the attribute `src`.
     */
    AVATAR: string;
    /**
     * User assigned banners.
     *
     * The last element is always empty and can be ignored.
     */
    BANNERS: string;
    /**
     * Date the user joined the platform.
     *
     * The date is contained in the `datetime` attribute as an ISO string.
     */
    JOINED: string;
    /**
     * Last time the user connected to the platform.
     *
     * The date is contained in the `datetime` attribute as an ISO string.
     */
    LAST_SEEN: string;
    MESSAGES: string;
    REACTION_SCORE: string;
    POINTS: string;
    RATINGS_RECEIVED: string;
    AMOUNT_DONATED: string;
    /**
     * Button used to follow/unfollow the user.
     *
     * If the text is `Unfollow` then the user is followed.
     * If the text is `Follow` then the user is not followed.
     */
    FOLLOWED: string;
    /**
     * Button used to ignore/unignore the user.
     *
     * If the text is `Unignore` then the user is ignored.
     * If the text is `Ignore` then the user is not ignored.
     */
    IGNORED: string;
};
