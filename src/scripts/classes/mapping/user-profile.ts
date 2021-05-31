// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import cheerio, { Node } from "cheerio";

// Modules from files
import PlatformUser from "./platform-user";
import { urls } from "../../constants/url";
import { BOOKMARKED_POST, GENERIC, WATCHED_THREAD } from "../../constants/css-selector";
import { fetchHTML } from "../../network-helper";
import {
  GenericAxiosError,
  UnexpectedResponseContentType,
  UserNotLogged,
  USER_NOT_LOGGED
} from "../errors";
import { Result } from "../result";
import shared from "../../shared";
import Game from "../handiwork/game";
import { Thread } from "../../..";

// Interfaces
interface IWatchedThread {
  /**
   * URL of the thread.
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

interface IBookmarkedPost {
  /**
   * ID of the post.
   */
  id: number;
  /**
   * ID of the user that wrote this post.
   */
  authorID: number;
  /**
   * When this post was saved.
   */
  savedate: Date;
  /**
   * Description of the post.
   */
  description: string;
  /**
   * List of user-defined labels for the post.
   */
  labels: string[];
}

// Types
type TFetchResult = Result<GenericAxiosError | UnexpectedResponseContentType, string>;

/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
export default class UserProfile extends PlatformUser {
  //#region Fields

  private _watched: IWatchedThread[] = [];
  private _bookmarks: IBookmarkedPost[] = [];
  private _alerts: string[] = [];
  private _conversations: string[];
  private _suggestedGames: Game[];

  //#endregion Fields

  //#region Getters

  /**
   * List of followed thread data.
   */
  public get watched(): IWatchedThread[] {
    return this._watched;
  }
  /**
   * List of bookmarked posts data.
   */
  public get bookmarks(): IBookmarkedPost[] {
    return this._bookmarks;
  }
  /**
   * List of alerts.
   * @todo
   */
  public get alerts(): string[] {
    return this._alerts;
  }
  /**
   * List of conversations.
   * @todo
   */
  public get conversation(): string[] {
    return this._conversations;
  }
  /**
   * List of suggested games for this user from the platform.
   * @todo
   */
  public get suggestedGames(): Game[] {
    return this._suggestedGames;
  }

  //#endregion Getters

  constructor() {
    super();
  }

  //#region Public methods

  public async fetch(): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // First get the user ID and set it
    const id = await this.fetchUserID();
    super.setID(id);

    // Than fetch the basic data
    await super.fetch();

    // Now fetch the watched threads
    this._watched = await this.fetchWatchedThread();

    // Then the bookmarked posts
    this._bookmarks = await this.fetchBookmarkedPost();
  }

  //#endregion Public methods

  //#region Private methods

  /**
   * Gets the ID of the user currently logged.
   */
  private async fetchUserID(): Promise<number> {
    // Local variables
    const url = new URL(urls.BASE).toString();

    // Fetch and parse page
    const response = await fetchHTML(url);
    const result = response.applyOnSuccess((html) => {
      // Load page with cheerio
      const $ = cheerio.load(html);

      const sid = $(GENERIC.CURRENT_USER_ID).attr("data-user-id").trim();
      return parseInt(sid, 10);
    });

    if (result.isFailure()) throw result.value;
    else return result.value;
  }

  /**
   * Gets the list of threads followed by the user currently logged.
   */
  private async fetchWatchedThread(): Promise<IWatchedThread[]> {
    // Prepare and fetch URL
    const url = new URL(urls.WATCHED_THREADS);
    url.searchParams.set("unread", "0");

    const response = await fetchHTML(url.toString());

    if (response.isSuccess()) {
      // Fetch the elements in the page
      const result = await this.fetchDataInPage(
        response.value,
        url,
        WATCHED_THREAD.LAST_PAGE,
        this.fetchPageThreadElements
      );

      // Cast and return elements
      return result as IWatchedThread[];
    } else throw response.value;
  }

  /**
   * Get the list of post bookmarked by the user currently logged.
   */
  private async fetchBookmarkedPost(): Promise<IBookmarkedPost[]> {
    // Prepare and fetch URL
    const url = new URL(urls.BOOKMARKS);
    const response = await fetchHTML(url.toString());

    if (response.isSuccess()) {
      // Fetch the elements in the page
      const result = await this.fetchDataInPage(
        response.value,
        url,
        BOOKMARKED_POST.LAST_PAGE,
        this.fetchBookmarkElements
      );

      // Cast and return elements
      return (await Promise.all(result)) as IBookmarkedPost[];
    } else throw response.value;
  }

  /**
   * Gets all the elements that solve a specific selector in a list on an HTML page.
   * @param html Source code of the HTML page containing a part of the elements of a list..
   * @param url Page URL represented in `html`.
   * @param lastPageSelector CSS selector of the button for the last page of the list.
   * @param elementFunc Function that gets individual elements from the list in the web pages.
   */
  private async fetchDataInPage(
    html: string,
    url: URL,
    lastPageSelector: string,
    elementFunc: (html: string) => Promise<IWatchedThread[]> | Promise<IBookmarkedPost[]>
  ) {
    // Load page in cheerio
    const $ = cheerio.load(html);

    // Fetch the pages
    const lastPageText = $(lastPageSelector).text().trim();
    const lastPage = parseInt(lastPageText, 10);
    const pages = await this.fetchPages(url, lastPage);

    const promises = pages.map(async (page) => {
      const elements = page.applyOnSuccess(elementFunc);
      if (elements.isSuccess()) return await elements.value;
    });

    // Flat the array and return the elements
    const elementsScraped = await Promise.all(promises);
    return [].concat(...elementsScraped);
  }

  /**
   * Gets the pages at the specified URL.
   * @param url Base URL to use for scraping a page
   * @param n Total number of pages
   * @param s Page to start from
   */
  private async fetchPages(url: URL, n: number, s = 1): Promise<TFetchResult[]> {
    // Local variables
    const pages: TFetchResult[] = [];
    let responsePromiseList: Promise<TFetchResult>[] = [];
    const MAX_SIMULTANEOUS_CONNECTION = 25;

    // Fetch the page' HTML
    for (let page = s; page <= n; page++) {
      // Set the page URL
      url.searchParams.set("page", page.toString());

      // Fetch HTML but not wait for it
      const promise = fetchHTML(url.toString());
      responsePromiseList.push(promise);

      // Wait for the promises to resolve if we reach
      // the maximum number of simultaneous requests
      if (responsePromiseList.length === MAX_SIMULTANEOUS_CONNECTION) {
        const results = await Promise.all(responsePromiseList);
        pages.push(...results);

        // Reset the array
        responsePromiseList = [];
      }
    }

    // Fetch the last pages
    if (responsePromiseList.length > 0) {
      const results = await Promise.all(responsePromiseList);
      pages.push(...results);
    }
    return pages;
  }

  /**
   * Gets thread data starting from the source code of the page passed by parameter.
   */
  private async fetchPageThreadElements(html: string): Promise<IWatchedThread[]> {
    // Local variables
    const $ = cheerio.load(html);

    function parseElement(el: Node) {
      // Parse the URL
      const partialURL = $(el).find(WATCHED_THREAD.URL).attr("href");
      const url = new URL(partialURL.replace("unread", ""), `${urls.BASE}`).toString();

      return {
        url: url.toString(),
        unread: partialURL.endsWith("unread"),
        forum: $(el).find(WATCHED_THREAD.FORUM).text().trim()
      } as IWatchedThread;
    }

    return $(WATCHED_THREAD.BODIES)
      .map((_idx, el) => parseElement(el))
      .get();
  }

  /**
   * Gets bookmarks data starting from the source code of the page passed by parameter.
   */
  private async fetchBookmarkElements(html: string): Promise<IBookmarkedPost[]> {
    // Local variables
    const $ = cheerio.load(html);

    async function parseElement(el: Node) {
      // Parse the URL
      const url = $(el).find(BOOKMARKED_POST.URL).attr("href");

      // Check if the URL contains a post ID and get it,
      // otherwise it represents the first post of a
      // thread so set the ID to 1
      const regex = new RegExp(/posts\/([0-9]+)/);
      let foundID = null;
      if (url.match(regex)) {
        const sid = url.match(regex)[0].replace("posts/", "");
        foundID = parseInt(sid, 10);
      } else {
        const post = await new Thread(new URL(url)).getPost(1);
        foundID = post.id;
      }

      // Find the savedate
      const sDate = $(el).find(BOOKMARKED_POST.BOOKMARK_TIME).attr("datetime");

      // Find the owner ID
      const sOwnerID = $(el).find(BOOKMARKED_POST.OWNER_ID).attr("data-user-id");

      return {
        id: foundID,
        authorID: parseInt(sOwnerID, 10),
        description: $(el).find(BOOKMARKED_POST.DESCRIPTION).text().trim(),
        savedate: new Date(sDate),
        labels: $(el)
          .find(BOOKMARKED_POST.LABELS)
          .map((_, label) => $(label).text())
          .toArray()
      } as IBookmarkedPost;
    }

    const promises = $(BOOKMARKED_POST.BODIES)
      .map(async (_idx, el) => await parseElement(el))
      .get();

    return await Promise.all(promises);
  }

  //#endregion Private methods
}
