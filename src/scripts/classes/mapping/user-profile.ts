// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import cheerio from "cheerio";

// Modules from files
import Post from "./post";
import PlatformUser from "./platform-user";
import { urls } from "../../constants/url";
import { GENERIC, WATCHED_THREAD } from "../../constants/css-selector";
import { fetchHTML } from "../../network-helper";
import {
  GenericAxiosError,
  UnexpectedResponseContentType,
  UserNotLogged,
  USER_NOT_LOGGED
} from "../errors";
import { Result } from "../result";
import shared from "../../shared";

// Interfaces
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

// Types
type TFetchResult = Result<GenericAxiosError | UnexpectedResponseContentType, string>;

/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
export default class UserProfile extends PlatformUser {
  //#region Fields

  private _watched: IWatchedThread[] = [];
  private _bookmarks: Post[] = [];
  private _alerts: string[] = [];
  private _conversations: string[];

  //#endregion Fields

  //#region Getters

  /**
   * List of followed thread data.
   */
  public get watched(): IWatchedThread[] {
    return this._watched;
  }
  /**
   * List of bookmarked posts.
   * @todo
   */
  public get bookmarks(): Post[] {
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
    const result = response.applyOnSuccess(async (html) => {
      // Load page in cheerio
      const $ = cheerio.load(html);

      // Fetch the pages
      const lastPage = parseInt($(WATCHED_THREAD.LAST_PAGE).text().trim(), 10);
      const pages = await this.fetchPages(url, lastPage);

      const watchedThreads = pages.map((r, idx) => {
        const elements = r.applyOnSuccess(this.fetchPageThreadElements);
        if (elements.isSuccess()) return elements.value;
      });

      return [].concat(...watchedThreads);
    });

    if (result.isFailure()) throw result.value;
    else return result.value as Promise<IWatchedThread[]>;
  }

  /**
   * Gets the pages containing the thread data.
   * @param url Base URL to use for scraping a page
   * @param n Total number of pages
   * @param s Page to start from
   */
  private async fetchPages(url: URL, n: number, s = 1): Promise<TFetchResult[]> {
    // Local variables
    const responsePromiseList: Promise<TFetchResult>[] = [];

    // Fetch the page' HTML
    for (let page = s; page <= n; page++) {
      // Set the page URL
      url.searchParams.set("page", page.toString());

      // Fetch HTML but not wait for it
      const promise = fetchHTML(url.toString());
      responsePromiseList.push(promise);
    }

    // Wait for the promises to resolve
    return Promise.all(responsePromiseList);
  }

  /**
   * Gets thread data starting from the source code of the page passed by parameter.
   */
  private fetchPageThreadElements(html: string): IWatchedThread[] {
    // Local variables
    const $ = cheerio.load(html);

    return $(WATCHED_THREAD.BODIES)
      .map((idx, el) => {
        // Parse the URL
        const partialURL = $(el).find(WATCHED_THREAD.URL).attr("href");
        const url = new URL(partialURL.replace("unread", ""), `${urls.BASE}`).toString();

        return {
          url: url.toString(),
          unread: partialURL.endsWith("unread"),
          forum: $(el).find(WATCHED_THREAD.FORUM).text().trim()
        } as IWatchedThread;
      })
      .get();
  }

  //#endregion Private methods
}
