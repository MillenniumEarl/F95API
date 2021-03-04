// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import cheerio from "cheerio";
import luxon from "luxon";

// Modules from files
import Post from "./post.js";
import PlatformUser from "./platform-user.js";
import { TCategory, TRating } from "../../interfaces.js";
import { urls } from "../../constants/url.js";
import { POST, THREAD } from "../../constants/css-selector.js";
import { fetchHTML, fetchPOSTResponse } from "../../network-helper.js";
import Shared from "../../shared.js";
import {
  GenericAxiosError,
  ParameterError,
  UnexpectedResponseContentType
} from "../errors.js";
import { Result } from "../result.js";
import { getJSONLD, TJsonLD } from "../../scrape-data/json-ld.js";

/**
 * Represents a generic F95Zone platform thread.
 */
export default class Thread {
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
    const response = await fetchPOSTResponse(urls.F95_POSTS_NUMBER, params);
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
   * Gets all posts in the thread.
   */
  private async fetchPosts(pages: number): Promise<Post[]> {
    // Local variables
    type TFetchResult = Promise<
      Result<GenericAxiosError | UnexpectedResponseContentType, string>
    >;
    const htmlPromiseList: TFetchResult[] = [];
    const fetchedPosts: Post[] = [];

    // Fetch posts for every page in the thread
    for (let i = 1; i <= pages; i++) {
      // Prepare the URL
      const url = new URL(`page-${i}`, `${this.url}/`).toString();

      // Fetch the HTML source
      const htmlResponse = fetchHTML(url);
      htmlPromiseList.push(htmlResponse);
    }

    // Wait for all the pages to load
    const responses = await Promise.all(htmlPromiseList);

    // Scrape the pages
    for (const response of responses) {
      if (response.isSuccess()) {
        const posts = this.parsePostsInPage(response.value);
        fetchedPosts.push(...posts);
      } else throw response.value;
    }

    // Sorts the list of posts
    return fetchedPosts.sort((a, b) =>
      a.id > b.id ? 1 : b.id > a.id ? -1 : 0
    );
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

  //#endregion Private methods

  //#region Public methods

  /**
   * Gets information about this thread.
   */
  public async fetch(): Promise<void> {
    // Prepare the url
    this._url = new URL(this.id.toString(), urls.F95_THREADS).toString();

    // Fetch the HTML source
    const htmlResponse = await fetchHTML(this.url);

    if (htmlResponse.isSuccess()) {
      // Load the HTML
      const $ = cheerio.load(htmlResponse.value);

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
      if (luxon.DateTime.fromISO(modified).isValid)
        this._modified = new Date(modified);
      if (luxon.DateTime.fromISO(published).isValid)
        this._publication = new Date(published);
    } else throw htmlResponse.value;
  }

  /**
   * Gets the post in the `index` position with respect to the posts in the thread.
   *
   * `index` must be greater or equal to 1.
   * If the post is not found, `null` is returned.
   */
  public async getPost(index: number): Promise<Post | null> {
    // Validate parameters
    if (index < 1)
      throw new ParameterError("Index must be greater or equal than 1");

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
