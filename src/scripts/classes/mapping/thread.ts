// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import cheerio from "cheerio";
import { DateTime } from "luxon";

// Modules from files
import Post from "./post";
import PlatformUser from "./platform-user";
import { ILazy, TCategory, TRating } from "../../interfaces";
import { urls } from "../../constants/url";
import { POST, THREAD } from "../../constants/css-selector";
import { fetchHTML, fetchPOSTResponse } from "../../network-helper";
import Shared from "../../shared";
import { InvalidID, INVALID_THREAD_ID, ParameterError, UserNotLogged, USER_NOT_LOGGED } from "../errors";
import { getJSONLD, TJsonLD } from "../../scrape-data/json-ld";
import shared from "../../shared";

/**
 * Represents a generic F95Zone platform thread.
 */
export default class Thread implements ILazy {
  //#region Fields

  private POST_FOR_PAGE = 20;
  private _id: number;
  private _url: string;
  private _title: string;
  private _tags: string[];
  private _prefixes: string[];
  private _rating: TRating;
  private _owner: PlatformUser;
  private _publication: Date;
  private _modified: Date;
  private _category: TCategory;

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
    return this._url;
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

  //#endregion Getters

  /**
   * Initializes an object for mapping a thread.
   *
   * The unique ID of the thread must be specified.
   */
  constructor(id: number) {
    this._id = id;
  }

  //#region Private methods

  /**
   * Set the number of posts to display for the current thread.
   */
  private async setMaximumPostsForPage(n: 20 | 40 | 60 | 100): Promise<void> {
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
   * Gets all posts on a page.
   */
  private parsePostsInPage(html: string): Post[] {
    // Load the HTML
    const $ = cheerio.load(html);

    // Start parsing the posts
    const posts = $(THREAD.POSTS_IN_PAGE)
      .toArray()
      .map((el, idx) => {
        const id = $(el).find(POST.ID).attr("id").replace("post-", "");
        return new Post(parseInt(id, 10));
      });

    // Wait for the post to be fetched
    return posts;
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
    const matches = headline.match(/\[(.*?)\]/g);

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
    const published = JSONLD["datePublished"] as string;
    const modified = JSONLD["dateModified"] as string;

    // Parse the thread's data
    this._title = this.cleanHeadline(JSONLD["headline"] as string);
    this._tags = tagArray.map((el) => $(el).text().trim());
    this._prefixes = prefixArray.map((el) => $(el).text().trim());
    this._owner = new PlatformUser(parseInt(ownerID, 10));
    await this._owner.fetch();
    this._rating = this.parseRating(JSONLD);
    this._category = JSONLD["articleSection"] as TCategory;

    // Validate the dates
    if (DateTime.fromISO(modified).isValid) this._modified = new Date(modified);
    if (DateTime.fromISO(published).isValid) this._publication = new Date(published);
  }

  //#endregion Private methods

  //#region Public methods

  /**
   * Gets information about this thread.
   */
  public async fetch(): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // Check ID
    if (!this.id && this.id < 1) throw new InvalidID(INVALID_THREAD_ID);

    // Prepare the url
    this._url = new URL(this.id.toString(), urls.THREADS).toString();

    // Fetch the HTML source
    const response = await fetchHTML(this.url);
    const result = response.applyOnSuccess(this.elaborateResponse);
    if (result.isFailure()) throw result.value;
  }

  /**
   * Gets the post in the `index` position with respect to the posts in the thread.
   *
   * `index` must be greater or equal to 1.
   * If the post is not found, `null` is returned.
   */
  public async getPost(index: number): Promise<Post | null> {
    // Validate parameters
    if (index < 1) throw new ParameterError("Index must be greater or equal than 1");

    // Local variables
    let returnValue = null;

    // Get the page number of the post
    const page = Math.ceil(index / this.POST_FOR_PAGE);

    // Fetch the page
    const url = new URL(`page-${page}`, `${this.url}/`).toString();
    const htmlResponse = await fetchHTML(url);

    if (htmlResponse.isSuccess()) {
      // Parse the post
      const posts = this.parsePostsInPage(htmlResponse.value);

      // Find the searched post
      for (const p of posts) {
        await p.fetch();

        if (p.number === index) {
          returnValue = p;
          break;
        }
      }

      return returnValue;
    } else throw htmlResponse.value;
  }

  //#endregion Public methods
}
