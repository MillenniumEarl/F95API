import Post from "./post.js";
import PlatformUser from "./platform-user.js";
import { TCategory, TRating } from "../../interfaces.js";
/**
 * Represents a generic F95Zone platform thread.
 */
export default class Thread {
  private POST_FOR_PAGE;
  private _id;
  private _url;
  private _title;
  private _tags;
  private _prefixes;
  private _rating;
  private _owner;
  private _publication;
  private _modified;
  private _category;
  /**
   * Unique ID of the thread on the platform.
   */
  get id(): number;
  /**
   * URL of the thread.
   *
   * It may vary depending on any versions of the contained product.
   */
  get url(): string;
  /**
   * Thread title.
   */
  get title(): string;
  /**
   * Tags associated with the thread.
   */
  get tags(): string[];
  /**
   * Prefixes associated with the thread
   */
  get prefixes(): string[];
  /**
   * Rating assigned to the thread.
   */
  get rating(): TRating;
  /**
   * Owner of the thread.
   */
  get owner(): PlatformUser;
  /**
   * Date the thread was first published.
   */
  get publication(): Date;
  /**
   * Date the thread was last modified.
   */
  get modified(): Date;
  /**
   * Category to which the content of the thread belongs.
   */
  get category(): TCategory;
  /**
   * Initializes an object for mapping a thread.
   *
   * The unique ID of the thread must be specified.
   */
  constructor(id: number);
  /**
   * Set the number of posts to display for the current thread.
   */
  private setMaximumPostsForPage;
  /**
   * Gets all posts on a page.
   */
  private parsePostsInPage;
  /**
   * Gets all posts in the thread.
   */
  private fetchPosts;
  /**
   * It processes the rating of the thread
   * starting from the data contained in the JSON+LD tag.
   */
  private parseRating;
  /**
   * Clean the title of a thread, removing prefixes
   * and generic elements between square brackets, and
   * returns the clean title of the work.
   */
  private cleanHeadline;
  /**
   * Gets information about this thread.
   */
  fetch(): Promise<void>;
  /**
   * Gets the post in the `index` position with respect to the posts in the thread.
   *
   * `index` must be greater or equal to 1.
   * If the post is not found, `null` is returned.
   */
  getPost(index: number): Promise<Post | null>;
}
