// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import cheerio from "cheerio";

// Modules from files
import Post from "./post";
import PlatformUser from "./platform-user";
import { ILazy, TCategory, TRating } from "../../interfaces";
import { urls } from "../../constants/url";
import { POST, THREAD } from "../../constants/css-selector";
import {
  fetchHTML,
  fetchPOSTResponse,
  getUrlRedirect
} from "../../network-helper";
import Shared from "../../shared";
import {
  InvalidID,
  InvalidResponseParsing,
  INVALID_THREAD_CONSTRUCTOR_ARGUMENT,
  INVALID_THREAD_ID,
  ParameterError,
  UserNotLogged,
  USER_NOT_LOGGED
} from "../errors";
import { getJSONLD, TJsonLD } from "../../scrape-data/json-ld";
import shared from "../../shared";
import { DEFAULT_DATE } from "../../constants/generic";
import { getDateFromString } from "../../utils";

type TPostsForPage = 20 | 40 | 60 | 100;

/**
 * Represents a generic F95Zone platform thread.
 */
export default class Thread implements ILazy {
  //#region Fields

  private POST_FOR_PAGE: TPostsForPage = 20;
  private _id: number;
  private _url: string = "";
  private _title: string = "";
  private _tags: string[] = [];
  private _prefixes: string[] = [];
  private _rating: TRating = undefined as any;
  private _owner: PlatformUser = undefined as any;
  private _publication: Date = DEFAULT_DATE;
  private _modified: Date = DEFAULT_DATE;
  private _category: TCategory = undefined as any;
  private _headline: string = "";

  //#endregion Fields

  //#region Getters

  /**
   * Unique ID of the thread on the platform.
   */
  public get id(): number {
    return this._id;
  }
  /**
   * URL of the thread.
   *
   * It may vary depending on any versions of the contained product.
   */
  public get url(): string {
    return this._url !== ""
      ? this._url
      : new URL(`${this.id}/`, urls.THREADS).toString();
  }
  /**
   * Thread title.
   */
  public get title(): string {
    return this._title;
  }
  /**
   * Tags associated with the thread.
   */
  public get tags(): string[] {
    return this._tags;
  }
  /**
   * Prefixes associated with the thread
   */
  public get prefixes(): string[] {
    return this._prefixes;
  }
  /**
   * Rating assigned to the thread.
   */
  public get rating(): TRating {
    return this._rating;
  }
  /**
   * Owner of the thread.
   */
  public get owner(): PlatformUser {
    return this._owner;
  }
  /**
   * Date the thread was first published.
   */
  public get publication(): Date {
    return this._publication;
  }
  /**
   * Date the thread was last modified.
   */
  public get modified(): Date {
    return this._modified;
  }
  /**
   * Category to which the content of the thread belongs.
   */
  public get category(): TCategory {
    return this._category;
  }
  /**
   * The title without status tags and graphics engine.
   * It can be useful on old template threads when the
   * version is missing and needs to be retrieved from
   * the title.
   */
  public get headline(): string {
    return this._headline;
  }

  //#endregion Getters

  /**
   * Initializes an object for mapping a thread.
   *
   * The unique ID of the thread must be specified.
   */
  constructor(id: number);
  /**
   * Initializes an object for mapping a thread.
   *
   * The URL of the thread must be specified.
   */
  constructor(url: URL);
  constructor(args?: number | URL) {
    // Check argument
    if (!args) throw new ParameterError(INVALID_THREAD_CONSTRUCTOR_ARGUMENT);

    // Assign ID
    this._id = typeof args === "number" ? args : this.getIDFromURL(args);

    // Check ID
    if (!this.id || this.id < 1) throw new InvalidID(INVALID_THREAD_ID);
  }

  //#region Private methods

  /**
   * Set the number of posts to display for the current thread.
   */
  private async setMaximumPostsForPage(n: TPostsForPage): Promise<void> {
    // Prepare the parameters to send via POST request
    const params = {
      _xfResponseType: "json",
      _xfRequestUri: `/account/dpp-update?content_type=thread&content_id=${this.id}`,
      _xfToken: Shared.session.token,
      _xfWithData: "1",
      content_id: this.id.toString(),
      content_type: "thread",
      "dpp_custom_config[posts]": n.toString()
    };

    // Send POST request
    const response = await fetchPOSTResponse(urls.POSTS_NUMBER, params);
    if (response.isFailure()) throw response.value;
  }

  /**
   * Fetch one at a time the posts on the current page.
   */
  private async *parsePostsInPage(
    html: string
  ): AsyncGenerator<Post, void, unknown> {
    // Load the HTML
    const $ = cheerio.load(html);

    // Start parsing the posts
    const posts = $(THREAD.POSTS_IN_PAGE)
      .toArray()
      .map((el) => {
        // Force Typescript to accept "string" type instead of "undefined"
        const element = $(el).find(POST.ID).attr("id") as string;
        const id = parseInt(element.replace("post-", ""), 10);
        return new Post(id);
      });

    // Fetch the data of the posts
    for (const post of posts) {
      await post.fetch();
      yield post;
    }
  }

  /**
   * It processes the rating of the thread
   * starting from the data contained in the JSON+LD tag.
   */
  private parseRating(data: TJsonLD): TRating {
    const ratingTree = data["aggregateRating"] as TJsonLD;
    const rating: TRating = {
      average: ratingTree ? parseFloat(ratingTree["ratingValue"] as string) : 0,
      best: ratingTree ? parseInt(ratingTree["bestRating"] as string, 10) : 0,
      count: ratingTree ? parseInt(ratingTree["ratingCount"] as string, 10) : 0
    };

    return rating;
  }

  /**
   * Clean the title of a thread, removing prefixes
   * and generic elements between square brackets, and
   * returns the clean title of the work.
   */
  private cleanHeadline(headline: string): string {
    // From the title we can extract: Name, author and version
    // [PREFIXES] TITLE [VERSION] [AUTHOR]
    const matches = headline.match(/(?<=\s|^|\])\[.*?\](?=\s|$)/gi);

    // Get the title name
    let name = headline;
    if (matches) matches.forEach((e) => (name = name.replace(e, "")));
    return name.trim();
  }

  /**
   * Process the HTML code received as
   * an answer and gets the data contained in it.
   */
  private async elaborateResponse(html: string) {
    // Load the HTML
    const $ = cheerio.load(html);

    // Fetch data from selectors
    const ownerID = $(THREAD.OWNER_ID).attr("data-user-id");
    const tagArray = $(THREAD.TAGS).toArray();
    const prefixArray = $(THREAD.PREFIXES).toArray();
    const JSONLD = getJSONLD($("body"));
    const published = getDateFromString(JSONLD["datePublished"] as string);
    const modified = getDateFromString(JSONLD["dateModified"] as string);

    // Throws error if no ID is found
    if (!ownerID)
      throw new InvalidResponseParsing("Cannot get ID from HTML response");

    // Parse the thread's data
    this._headline = JSONLD["headline"] as string;
    this._title = this.cleanHeadline(this._headline);
    this._tags = tagArray.map((el) => $(el).text().trim());
    this._prefixes = prefixArray.map((el) => $(el).text().trim());
    this._owner = new PlatformUser(parseInt(ownerID, 10));
    await this._owner.fetch();
    this._rating = this.parseRating(JSONLD);
    const section = JSONLD["articleSection"].toString().toLowerCase();
    this._category = section as TCategory;

    // Validate the dates
    if (modified) this._modified = modified;
    if (published) this._publication = published;
  }

  /**
   * Gets the ID of the thread from its URL.
   */
  private getIDFromURL(url: URL): number {
    // Local variables
    const surl = url.toString();
    let id = -1;

    // Find IDs in URLs in the form:
    // + https://f95zone.to/threads/NAME.ID/
    // + https://f95zone.to/threads/ID/
    const regex = new RegExp(/(threads\/|\.)([0-9]+)/);
    const match = surl.match(regex);
    if (match) {
      const sid = match[0].replace(".", "").replace("threads/", "");
      id = parseInt(sid, 10);
    }

    return id;
  }

  //#endregion Private methods

  //#region Public methods

  /**
   * Gets information about this thread.
   */
  public async fetch(): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // Get the actual URL of the thread
    this._url = await getUrlRedirect(this.url);

    // Fetch the HTML source
    const response = await fetchHTML(this.url);
    if (response.isSuccess()) await this.elaborateResponse(response.value);
    else throw response.value;
  }

  /**
   * Gets the post in the `index` position with respect to the posts in the thread.
   *
   * `index` must be greater or equal to 1.
   * If the post is not found, `undefined` is returned.
   */
  public async getPost(index: number): Promise<Post | undefined> {
    // Validate parameters
    if (index < 1)
      throw new ParameterError("Index must be greater or equal than 1");

    // Reduce the maximum number of posts per page to POST_FOR_PAGE
    await this.setMaximumPostsForPage(this.POST_FOR_PAGE);

    // Get the page number of the post
    const page = Math.ceil(index / this.POST_FOR_PAGE);

    // Fetch the page
    const url = new URL(`page-${page}`, `${this.url}`).toString();
    const htmlResponse = await fetchHTML(url);

    if (htmlResponse.isSuccess()) {
      // Prepare the iterator that fetch the posts
      const iter = this.parsePostsInPage(htmlResponse.value);

      // Find and return the post with the same
      // position number as the specified index
      let curr = await iter.next();
      while (!curr.done) {
        // Explicit cast because the iterator doesn't return anything
        const post = curr.value as Post;

        if (post.number === index) return post;

        curr = await iter.next();
      }
    } else throw htmlResponse.value;
  }

  //#endregion Public methods
}
