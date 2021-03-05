import Post from "./post.js";
import PlatformUser from "./platform-user.js";
interface IWatchedThread {
  /**
   * URL of the thread
   */
  url: string;
  /**
   * Indicates whether the thread has any unread posts.
   */
  unread: boolean;
  /**
   * Specifies the forum to which the thread belongs.
   */
  forum: string;
}
/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
export default class UserProfile extends PlatformUser {
  private _watched;
  private _bookmarks;
  private _alerts;
  private _conversations;
  /**
   * List of followed thread data.
   */
  get watched(): IWatchedThread[];
  /**
   * List of bookmarked posts.
   * @todo
   */
  get bookmarks(): Post[];
  /**
   * List of alerts.
   * @todo
   */
  get alerts(): string[];
  /**
   * List of conversations.
   * @todo
   */
  get conversation(): string[];
  constructor();
  fetch(): Promise<void>;
  private fetchUserID;
  private fetchWatchedThread;
  /**
   * Gets the pages containing the thread data.
   * @param url Base URL to use for scraping a page
   * @param n Total number of pages
   * @param s Page to start from
   */
  private fetchPages;
  /**
   * Gets thread data starting from the source code of the page passed by parameter.
   */
  private fetchPageThreadElements;
}
export {};
