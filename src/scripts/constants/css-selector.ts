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
   * Provider that the platform expects to use to verify the code for two-factor authentication.
   */
  EXPECTED_2FA_PROVIDER: 'input[name="provider"]',
  /**
   * Locate the token used for the session.
   */
  GET_REQUEST_TOKEN: 'input[name="_xfToken"]',
  /**
   * Block containing the text of any errors that occurred during the login.
   */
  LOGIN_MESSAGE_ERROR:
    "div.blockMessage.blockMessage--error.blockMessage--iconic",
  /**
   * Block containing the text of a security error occurred during the login.
   *
   * Usually described as: "Security error occurred. Please press back, refresh the page, and try again."
   */
  LOGIN_SECURITY_MESSAGE_ERROR: "div.blockMessage",
  /**
   * Locate the script containing the tags and prefixes of the platform content in JSON format.
   */
  LATEST_UPDATES_TAGS_SCRIPT: "script:contains('latestUpdates')",
  /**
   * List of games sponsored by the platform. Most objects are cloned and be used first ID be used.
   *
   * A partial URL at the game thread is present in the `href` attribute.
   */
  FEATURED_GAMES: "div#fullwidth_slider >ul.es-slides > li > a"
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

export const BOOKMARKED_POST = {
  /**
   * List of elements containing the data of the bookmarked posts.
   */
  BODIES: "li.block-row--separated",
  /**
   * Link element containing the full URL
   * of the post in the `href` attribute.
   *
   * It could be defined as URL of a post (`.../posts/ID`) otherwise indicates the first post of a thread.
   *
   * For use within a `BOOKMARKED_POST.BODIES` selector.
   */
  URL: "* div.contentRow-title > a",
  /**
   * Link element containing the description of the bookmark as text.
   *
   * For use within a `BOOKMARKED_POST.BODIES` selector.
   */
  DESCRIPTION: "* div.contentRow-snippet",
  /**
   * Link element containing the ID of author of the post in the `data-user-id` attribute.
   *
   * For use within a `BOOKMARKED_POST.BODIES` selector.
   */
  OWNER_ID: "* div.contentRow-minor > * a.username:last-child",
  /**
   * Bookmark save date.
   * The date is contained in the `datetime` attribute as an ISO string.
   *
   * For use within a `BOOKMARKED_POST.BODIES` selector.
   */
  BOOKMARK_TIME: "* div.contentRow-minor > * time",
  /**
   * Label elements for the current bookmarked post as text.
   *
   * For use within a `BOOKMARKED_POST.BODIES` selector.
   */
  LABELS: "* div.contentRow-minor > * li.tagList > a.tagItem",
  /**
   * Index of the last page available as text.
   */
  LAST_PAGE: "ul.pageNav-main > li:last-child > a"
};

export const ALERT = {
  /**
   * List of elements containing the data of the alerts.
   */
  BODIES:
    "ol.listPlain > * li[data-alert-id] > div.user-alert > div.contentRow-main",
  /**
   * Indicates the user who performed a specific action reported by the alert.
   * If the user has the symbols associated with the name may occur duplicate,
   * make sure to get the element without children.
   *
   * The `data-user-id` attribute contains the user ID.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  ACTOR: " > a.username",
  /**
   * The Alert page associated.
   *
   * Example: a thread post, the trophy page.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  REFERENCE_PAGE: "> a.fauxBlockLink-blockLink",
  /**
   * Type of reaction to a post/thread.
   *
   * It may not be present in all alerts.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  REACTION: "> span.reaction > span.reaction-text > bdi",
  /**
   * If the alert is summarized (so the `ALERT.SUMMARIZED_BUTTON` button is present),
   * this link shows the partial URL to the page containing the separate alerts.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  SUMMARIZED_SEPARATE_ALERTS: "> a[href*='alert_id']",
  /**
   * Date of receipt of the Alert in the `datetime` attribute.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  ALERT_TIME: "> div.contentRow-minor > time",
  /**
   * Button used to set an alert as unread.
   * Its absence indicates that the message has not been read.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  MARK_UNREAD_BUTTON: "> div.contentRow-minor > a.markAlertUnread",
  /**
   * If the button is present means that multiple similar alerts are grouped together.
   *
   * For use within a `ALERT.BODIES` selector.
   */
  SUMMARIZED_BUTTON: "> div.contentRow-minor > a.unsummarizeAlert",
  /**
   * Index of the last page available as text.
   */
  LAST_PAGE: "ul.pageNav-main > li:last-child > a"
};

export const CONVERSATION = {
  /**
   * List of elements containing the data of the conversations.
   *
   * If it contains the `is-unread` attribute then the conversation has new messages.
   */
  BODIES: "div.structItemContainer > div.structItem--conversation",
  /**
   * The title of the conversation.
   *
   * In the `href` attribute there is a part of the URL containing the conversation ID.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  TITLE: "div.structItem-cell--main > span > a.structItem-title",
  /**
   * Conversation creation date, corresponds to the sending date of the first message.
   *
   * The date is contained in the `datetime` attribute as a ISO string.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  START_DATE:
    "div.structItem-cell--main > div.structItem-minor > ul.structItem-parts > li.structItem-startDate > a > time",
  /**
   * The list of recipients of the last message.
   * If the user has the symbols associated with the name may occur duplicate,
   * make sure to get the element without children.
   *
   * The `data-user-id` attribute contains the user ID.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  LAST_RECIPIENTS:
    "div.structItem-cell--main > div.structItem-minor > ul.recipientsList > * a.username[data-user-id]",
  /**
   * Indicates the user who created the conversation, i.e. the one who sent the first message.
   * If the user has the symbols associated with the name may occur duplicate,
   * make sure to get the element without children.
   *
   * The `data-user-id` attribute contains the user ID.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  AUTHOR:
    "div.structItem-cell--main > div.structItem-minor > ul.structItem-parts > * a.username[data-user-id]",
  /**
   * Number of messages in the conversation.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  REPLIES: "div.structItem-cell--meta > dl:first-child > dd",
  /**
   * Number of participants in the conversation.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  PARTECIPANTS: "div.structItem-cell--meta > dl:nth-child(2) > dd",
  /**
   * Indicates the last user of the conversation to have replied to a message.
   * If the user has the symbols associated with the name may occur duplicate,
   * make sure to get the element without children.
   *
   * The `data-user-id` attribute contains the user ID.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  LAST_RESPONSE_USER:
    "div.structItem-cell--latest > div.structItem-minor > a.username[data-user-id]",
  /**
   * Date of the last reply to the conversation.
   *
   * The date is contained in the `datetime` attribute as a ISO string.
   *
   * For use within a `CONVERSATION.BODIES` selector.
   */
  LAST_RESPONSE_TIME: "div.structItem-cell--latest > a > time",
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
  NUMBER:
    '* ul.message-attribution-opposite > li > a:not([id])[rel="nofollow"]',
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
  BOOKMARKED:
    '* ul.message-attribution-opposite >li > a[title="Bookmark"].is-bookmarked',
  /**
   * Name visualized on the button used to hide/show a spoiler element of a post.
   */
  SPOILER_NAME:
    "button.bbCodeSpoiler-button > * span.bbCodeSpoiler-button-title",
  /**
   * Contents of a spoiler element in a post.
   */
  SPOILER_CONTENT:
    "div.bbCodeSpoiler-content > div.bbCodeBlock--spoiler > div.bbCodeBlock-content"
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
  JOINED:
    "div.uix_memberHeader__extra > div.memberHeader-blurb:nth-child(1) > * time",
  /**
   * Last time the user connected to the platform.
   *
   * The date is contained in the `datetime` attribute as an ISO string.
   */
  LAST_SEEN:
    "div.uix_memberHeader__extra > div.memberHeader-blurb:nth-child(2) > * time",
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
  IGNORED:
    "div.memberHeader-buttons > div.buttonGroup:first-child > a[data-sk-ignore]"
};
