export const selectors = {
    WT_FILTER_POPUP_BUTTON: "a.filterBar-menuTrigger",
    WT_NEXT_PAGE: "a.pageNav-jump--next",
    WT_URLS: "a[href^=\"/threads/\"][data-tp-primary]",
    WT_UNREAD_THREAD_CHECKBOX: "input[type=\"checkbox\"][name=\"unread\"]",
    GS_POSTS: "article.message-body:first-child > div.bbWrapper:first-of-type",
    GS_RESULT_THREAD_TITLE: "h3.contentRow-title > a",
    GS_RESULT_BODY: "div.contentRow-main",
    GS_MEMBERSHIP: "li > a:not(.username)",
    GET_REQUEST_TOKEN: "input[name=\"_xfToken\"]",
    UD_USERNAME_ELEMENT: "a[href=\"/account/\"] > span.p-navgroup-linkText",
    UD_AVATAR_PIC: "a[href=\"/account/\"] > span.avatar > img[class^=\"avatar\"]",
    LOGIN_MESSAGE_ERROR: "div.blockMessage.blockMessage--error.blockMessage--iconic",
    LU_TAGS_SCRIPT: "script:contains('latestUpdates')",
    BK_RESULTS: "ol.listPlain > *  div.contentRow-main",
    BK_POST_URL: "div.contentRow-title > a",
    BK_DESCRIPTION: "div.contentRow-snippet",
    BK_POST_OWNER: "div.contentRow-minor > * a.username",
    BK_TAGS: "div.contentRow-minor > * a.tagItem",
    /**
     * Attribute `datetime` contains an ISO date.
     */
    BK_TIME: "div.contentRow-minor > * time",
};

export const THREAD = {
    /**
     * Number of pages in the thread (as text of the element).
     * 
     * Two identical elements are identified.
     */
    LAST_PAGE: "ul.pageNav-main > li:last-child > a",
    /**
     * Identify the creator of the thread.
     * 
     * The ID is contained in the `data-user-id` attribute.
     */
    OWNER_ID: "div.uix_headerInner > * a.username[data-user-id]",
    /**
     * Contains the creation date of the thread.
     * 
     * The date is contained in the `datetime` attribute as an ISO string.
     */
    CREATION: "div.uix_headerInner > * time",
    /**
     * List of tags assigned to the thread.
     */
    TAGS: "a.tagItem",
    /**
     * List of prefixes assigned to the thread.
     */
    PREFIXES: "h1.p-title-value > a.labelLink > span[dir=\"auto\"]",
    /**
     * Thread title.
     */
    TITLE: "h1.p-title-value",
    /**
     * JSON containing thread information.
     * 
     * Two different elements are found.
     */
    JSONLD: "script[type=\"application/ld+json\"]",
    /**
     * Posts on the current page.
     */
    POSTS_IN_PAGE: "article.message",
}

export const POST = {
    /**
     * Unique post number for the current thread. 
     * 
     * For use within a `threads.POSTS_IN_PAGE` selector.
     */
    NUMBER: "* ul.message-attribution-opposite > li > a:not([id])[rel=\"nofollow\"]",
    /**
     * Unique ID of the post in the F95Zone platform.
     * 
     * For use within a `threads.POSTS_IN_PAGE` selector.
     */
    ID: "span[id^=\"post\"]",
    /**
     * Main body of the post where the message written by the user is contained.
     * 
     * For use within a `threads.POSTS_IN_PAGE` selector.
     */
    BODY: "* article.message-body > div.bbWrapper",
    /**
     * Publication date of the post contained in the `datetime` attribute as an ISO date.
     * 
     * For use within a `threads.POSTS_IN_PAGE` selector.
     */
    PUBLISH_DATE: "* div.message-attribution-main > a > time",
    /**
     * Last modified date of the post contained in the `datetime` attribute as the ISO date.
     * 
     * For use within a `threads.POSTS_IN_PAGE` selector.
     */
    LAST_EDIT: "* div.message-lastEdit > time",
    /**
     * Gets the element only if the post has been bookmarked.
     * 
     * For use within a `threads.POSTS_IN_PAGE` selector.
     */
    BOOKMARKED: "* ul.message-attribution-opposite >li > a[title=\"Bookmark\"].is-bookmarked",
};
