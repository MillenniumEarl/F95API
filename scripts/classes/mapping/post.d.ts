import PlatformUser from "./platform-user.js";
import { IPostElement } from "../../scrape-data/post-parse.js";
/**
 * Represents a post published by a user on the F95Zone platform.
 */
export default class Post {
  private _id;
  private _number;
  private _published;
  private _lastEdit;
  private _owner;
  private _bookmarked;
  private _message;
  private _body;
  /**
   * Represents a post published by a user on the F95Zone platform.
   */
  get id(): number;
  /**
   * Unique ID of the post within the thread in which it is present.
   */
  get number(): number;
  /**
   * Date the post was first published.
   */
  get published(): Date;
  /**
   * Date the post was last modified.
   */
  get lastEdit(): Date;
  /**
   * User who owns the post.
   */
  get owner(): PlatformUser;
  /**
   * Indicates whether the post has been bookmarked.
   */
  get bookmarked(): boolean;
  /**
   * Post message text.
   */
  get message(): string;
  /**
   * Set of the elements that make up the body of the post.
   */
  get body(): IPostElement[];
  constructor(id: number);
  /**
   * Gets the post data starting from its unique ID for the entire platform.
   */
  fetch(): Promise<void>;
  private parsePost;
}
