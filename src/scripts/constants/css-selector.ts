// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

export const GENERIC = {
  /**
   * The ID of the user currently logged into
   * the platform in the attribute `data-user-id`.
   */
  CURRENT_USER_ID: "span.avatar[data-user-id]",
  /**
   * Banner containing any error messages as text.
   */
  ERROR_BANNER: "div.p-body-pageContent > div.blockMessage",
  /**
   * Locate the token used for the session.
   */
  GET_REQUEST_TOKEN: 'input[name="_xfToken"]',
  /**
   * Block containing the text of any errors that occurred during the login.
   */
  LOGIN_MESSAGE_ERROR: "div.blockMessage.blockMessage--error.blockMessage--iconic",
  /**
   * Locate the script containing the tags and prefixes of the platform content in JSON format.
   */
  LATEST_UPDATES_TAGS_SCRIPT: "script:contains('latestUpdates')"
};

export const WATCHED_THREAD = {
  /**
   * List of elements containing the data of the watched threads.
   */
  BODIES: "div.structItem-cell--main",
  /**
   * Link element containing the partial URL
   * of the thread in the `href` attribute.
   *
   * It may be followed by the `/unread` segment.
   *
   * For use within a `WATCHED_THREAD.BODIES` selector.
   */
  URL: "div > a[data-tp-primary]",
  /**
   * Name of the forum to which the thread belongs as text.
   *
   * For use within a `WATCHED_THREAD.BODIES` selector.
   */
  FORUM:
    "div.structItem-cell--main > div.structItem-minor > ul.structItem-parts > li:last-of-type > a",
  /**
   * Index of the last page available as text.
   */
  LAST_PAGE: "ul.pageNav-main > li:last-child > a"
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
  PREFIXES: 'h1.p-title-value > a.labelLink > span[dir="auto"]',
  /**
   * Thread title.
   */
  TITLE: "h1.p-title-value",
  /**
   * JSON containing thread information.
   *
   * Two different elements are found.
   */
  JSONLD: 'script[type="application/ld+json"]',
  /**
   * Posts on the current page.
   */
  POSTS_IN_PAGE: "article.message"
};

export const THREAD_SEARCH = {
  /**
   * Thread title resulting from research.
   */
  THREAD_TITLE: "h3.contentRow-title > a",
  /**
   *Thread body resulting from research.
   */
  BODY: "div.contentRow-main"
};

export const POST = {
  /**
   * Unique post number for the current thread.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  NUMBER: '* ul.message-attribution-opposite > li > a:not([id])[rel="nofollow"]',
  /**
   * Unique ID of the post in the F95Zone platform in the `id` attribute.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  ID: 'span[id^="post"]',
  /**
   * Unique ID of the post author in the `data-user-id` attribute.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  OWNER_ID: "* div.message-cell--user > * a[data-user-id]",
  /**
   * Main body of the post where the message written by the user is contained.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  BODY: "* article.message-body > div.bbWrapper",
  /**
   * Publication date of the post contained in the `datetime` attribute as an ISO date.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  PUBLISH_DATE: "* div.message-attribution-main > a > time",
  /**
   * Last modified date of the post contained in the `datetime` attribute as the ISO date.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  LAST_EDIT: "* div.message-lastEdit > time",
  /**
   * Gets the element only if the post has been bookmarked.
   *
   * For use within a `THREAD.POSTS_IN_PAGE` selector.
   */
  BOOKMARKED: '* ul.message-attribution-opposite >li > a[title="Bookmark"].is-bookmarked'
};

export const MEMBER = {
  /**
   * Name of the user.
   *
   * It also contains the unique ID of the user in the `data-user-id` attribute.
   */
  NAME: 'span[class^="username"]',
  /**
   * Title of the user in the platform.
   *
   * i.e.: Member
   */
  TITLE: "span.userTitle",
  /**
   * Avatar used by the user.
   *
   * Source in the attribute `src`.
   */
  AVATAR: "span.avatarWrapper > a.avatar > img",
  /**
   * User assigned banners.
   *
   * The last element is always empty and can be ignored.
   */
  BANNERS: "em.userBanner > strong",
  /**
   * Date the user joined the platform.
   *
   * The date is contained in the `datetime` attribute as an ISO string.
   */
  JOINED: "div.uix_memberHeader__extra > div.memberHeader-blurb:nth-child(1) > * time",
  /**
   * Last time the user connected to the platform.
   *
   * The date is contained in the `datetime` attribute as an ISO string.
   */
  LAST_SEEN: "div.uix_memberHeader__extra > div.memberHeader-blurb:nth-child(2) > * time",
  MESSAGES: "div.pairJustifier > dl:nth-child(1) > * a",
  REACTION_SCORE: "div.pairJustifier > dl:nth-child(2) > dd",
  POINTS: "div.pairJustifier > dl:nth-child(3) > * a",
  RATINGS_RECEIVED: "div.pairJustifier > dl:nth-child(4) > dd",
  AMOUNT_DONATED: "div.pairJustifier > dl:nth-child(5) > dd",
  /**
   * Button used to follow/unfollow the user.
   *
   * If the text is `Unfollow` then the user is followed.
   * If the text is `Follow` then the user is not followed.
   */
  FOLLOWED:
    "div.memberHeader-buttons > div.buttonGroup:first-child > a[data-sk-follow] > span",
  /**
   * Button used to ignore/unignore the user.
   *
   * If the text is `Unignore` then the user is ignored.
   * If the text is `Ignore` then the user is not ignored.
   */
  IGNORED: "div.memberHeader-buttons > div.buttonGroup:first-child > a[data-sk-ignore]"
};
