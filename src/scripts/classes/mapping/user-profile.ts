// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import cheerio, { Node } from "cheerio";

// Modules from files
import PlatformUser from "./platform-user";
import { urls } from "../../constants/url";
import {
  ALERT,
  BOOKMARKED_POST,
  GENERIC,
  WATCHED_THREAD
} from "../../constants/css-selector";
import { fetchHTML } from "../../network-helper";
import { UserNotLogged, USER_NOT_LOGGED } from "../errors";
import shared from "../../shared";
import Game from "../handiwork/game";
import { IAlert, IBookmarkedPost, IWatchedThread } from "../../interfaces";
import fetchAlertElements from "../../fetch-data/fetch-alert";
import Thread from "./thread";
import getHandiworkFromURL from "../../handiwork-from-url";

interface IFetchOptions<T> {
  /**
   * URL of the page used to fetch `html` in `parseFunction`.
   */
  url: string;
  /**
   * CSS selector of the button for the last page of the list.
   */
  selector: string;
  /**
   * Function that gets individual elements from the list in the web pages.
   */
  parseFunction: (html: string) => Promise<T[]>;
}

/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
export default class UserProfile extends PlatformUser {
  //#region Fields

  private _watched: IWatchedThread[] = null;
  private _bookmarks: IBookmarkedPost[] = null;
  private _alerts: IAlert[] = null;
  private _conversations: string[] = null;
  private _featuredGames: Game[] = null;

  //#endregion Fields

  //#region Getters

  /**
   * List of followed thread data.
   */
  public get watched(): Promise<IWatchedThread[]> {
    return this.watchedThreadsGetWrapper();
  }
  /**
   * List of bookmarked posts data.
   */
  public get bookmarks(): Promise<IBookmarkedPost[]> {
    return this.bookmarksGetWrapper();
  }
  /**
   * List of alerts.
   */
  public get alerts(): Promise<IAlert[]> {
    return this.alertsGetWrapper();
  }
  /**
   * List of conversations.
   * @todo
   */
  public get conversations(): Promise<string[]> {
    return Promise.resolve([]);
  }
  /**
   * List of featured games from the platform.
   */
  public get featuredGames(): Promise<Game[]> {
    return this.featuredGamesGetWrapper();
  }

  //#endregion Getters

  //#region Getters async wrappers

  async watchedThreadsGetWrapper(): Promise<IWatchedThread[]> {
    // Cache data
    if (!this._watched) {
      // Prepare the url of the threads followed by
      // extending the selection to the threads already read
      const url = new URL(urls.WATCHED_THREADS);
      url.searchParams.set("unread", "0");

      // Prepare the options to use for fetching the data
      const options: IFetchOptions<IWatchedThread> = {
        url: url.toString(),
        selector: WATCHED_THREAD.LAST_PAGE,
        parseFunction: this.fetchPageThreadElements
      };

      // Fetch data
      this._watched = await this.fetchElementsInPages(options);
    }
    return Promise.resolve(this._watched);
  }

  async bookmarksGetWrapper(): Promise<IBookmarkedPost[]> {
    // Cache data
    if (!this._bookmarks) {
      // Prepare the options to use for fetching the data
      const options: IFetchOptions<IBookmarkedPost> = {
        url: urls.BOOKMARKS,
        selector: BOOKMARKED_POST.LAST_PAGE,
        parseFunction: this.fetchBookmarkElements
      };

      // Fetch data
      this._bookmarks = await this.fetchElementsInPages(options);
    }
    return Promise.resolve(this._bookmarks);
  }

  async alertsGetWrapper(): Promise<IAlert[]> {
    // Cache data
    if (!this._alerts) {
      // Prepare the options to use for fetching the data
      const options: IFetchOptions<IAlert> = {
        url: urls.ALERTS,
        selector: ALERT.LAST_PAGE,
        parseFunction: fetchAlertElements
      };

      // Fetch data
      this._alerts = await this.fetchElementsInPages(options);
    }
    return Promise.resolve(this._alerts);
  }

  async featuredGamesGetWrapper(): Promise<Game[]> {
    // Cache data
    if (!this._featuredGames) {
      this._featuredGames = await this.fetchFeaturedGames();
    }
    return Promise.resolve(this._featuredGames);
  }

  //#endregion Getters async wrappers

  constructor() {
    super();
  }

  //#region Public methods

  /**
   * Gets the basic data relating to the object.
   *
   * @param extended
   * If `true`, it also gets the threads followed
   * by the user, the conversations, the favorites.
   * Default: `false`
   */
  public async fetch(extended = false): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // First get the user ID and set it
    const id = await this.fetchUserID();
    const temp = new PlatformUser(id);

    // Than fetch the basic data
    await temp.fetch();

    // Copy the property of the superior class (PlatformUser) to this instance
    const superprops = Object.getOwnPropertyNames(temp);
    superprops.map((p) => (this[p] = temp[p]));

    if (extended) {
      // Fetch all the data in a list of this user
      await this.watchedThreadsGetWrapper();
      await this.bookmarksGetWrapper();
      await this.alertsGetWrapper();

      // Fetch the games in the slider (if the option is enabled on the platform)
      this._featuredGames = await this.fetchFeaturedGames();
    }
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
   * Gets all the elements that solve a specific
   * selector in a list on multiple web pages.
   */
  private async fetchElementsInPages<T>(
    options: IFetchOptions<T>
  ): Promise<T[]> {
    // Fetch page
    const response = await fetchHTML(options.url);
    if (response.isFailure()) throw response.value;

    // Load page in cheerio
    const $ = cheerio.load(response.value);

    // Fetch the pages (select only the first selector if multiple are found)
    const lastPageText = $(options.selector).first().text().trim();
    const lastPage = lastPageText ? parseInt(lastPageText, 10) : 1;

    // Create the async iterator used to fetch the pages
    const iter = this.fetchPages(options.url, lastPage);
    let curr = await iter.next();

    const promises: Promise<T[]>[] = [];
    while (!curr.done) {
      // Explicit cast because it always return a string
      const page = curr.value as string;

      // Parse elements but not resolve the promise
      const elements = options.parseFunction(page);
      promises.push(elements);

      curr = await iter.next();
    }

    // Resolve and flat the array then return the elements
    const elementsScraped = await Promise.all(promises);
    return [].concat(...elementsScraped) as T[];
  }

  /**
   * Gets the pages at the specified URL.
   * @param url Base URL to use for scraping a page
   * @param n Total number of pages
   * @param s Page to start from
   */
  private async *fetchPages(
    url: string,
    n: number,
    s = 1
  ): AsyncGenerator<string, void, unknown> {
    // Local variables
    const u = new URL(url);
    const pipeline = [];

    // Fetch the page' HTML in sequence
    for (let page = s; page <= n; page++) {
      // Set the page URL
      u.searchParams.set("page", page.toString());

      // Fetch HTML but not wait for it
      const promise = fetchHTML(u.toString());
      pipeline.push(promise);
    }

    // Now that we have all the promises,
    // resolve them and return the HTML code
    // of the pages
    for (const p of pipeline) {
      const response = await p;
      if (response.isSuccess()) yield response.value;
      else throw response.value;
    }
  }

  /**
   * Gets thread data starting from the source code of the page passed by parameter.
   */
  private async fetchPageThreadElements(
    html: string
  ): Promise<IWatchedThread[]> {
    // Local variables
    const $ = cheerio.load(html);

    function parseElement(el: Node) {
      // Parse the URL
      const partialURL = $(el).find(WATCHED_THREAD.URL).attr("href");
      const url = new URL(
        partialURL.replace("unread", ""),
        `${urls.BASE}`
      ).toString();

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
  private async fetchBookmarkElements(
    html: string
  ): Promise<IBookmarkedPost[]> {
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
      const sOwnerID = $(el)
        .find(BOOKMARKED_POST.OWNER_ID)
        .attr("data-user-id");

      return {
        id: foundID,
        userid: parseInt(sOwnerID, 10),
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

  private async fetchFeaturedGames(): Promise<Game[]> {
    // Local variables
    const url = new URL(urls.BASE).toString();

    // Fetch and parse page
    const response = await fetchHTML(url);

    if (response.isSuccess()) {
      // Load page with cheerio
      const $ = cheerio.load(response.value);

      // Get all the <a> elements containing the featured game urls
      const slider = $(GENERIC.FEATURED_GAMES).toArray();

      // Extract the URL from the attribute
      const partialURLs = slider.map((el) => $(el).attr("href").trim());

      // Prepare the unique URLs
      const gameURLs = [...new Set(partialURLs)].map((pu) =>
        new URL(pu, urls.BASE).toString()
      );

      // fetch the games
      const promises = gameURLs.map((url) => {
        return getHandiworkFromURL<Game>(url);
      });

      return Promise.all(promises);
    } else throw response.value;
  }

  //#endregion Private methods
}
