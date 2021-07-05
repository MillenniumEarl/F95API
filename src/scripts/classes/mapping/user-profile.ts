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
import { IAlert } from "../../interfaces";
import fetchAlertElements from "../../fetch-data/fetch-alert";
import Thread from "./thread";
import getHandiworkFromURL from "../../handiwork-from-url";

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
  userid: number;
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

type TRequestedTypes = IWatchedThread | IBookmarkedPost | IAlert;

/**
 * Class containing the data of the user currently connected to the F95Zone platform.
 */
export default class UserProfile extends PlatformUser {
  //#region Fields

  private _watched: IWatchedThread[] = [];
  private _bookmarks: IBookmarkedPost[] = [];
  private _alerts: IAlert[] = [];
  private _conversations: string[] = [];
  private _featuredGames: Game[] = [];

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
   */
  public get alerts(): IAlert[] {
    return this._alerts;
  }
  /**
   * List of conversations.
   * @todo
   */
  public get conversations(): string[] {
    return this._conversations;
  }
  /**
   * List of featured games from the platform.
   */
  public get featuredGames(): Game[] {
    return this._featuredGames;
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
    const temp = new PlatformUser(id);

    // Than fetch the basic data
    await temp.fetch();

    // Copy the property of the superior class to this instance
    const superprops = Object.getOwnPropertyNames(temp);
    superprops.map((p) => (this[p] = temp[p]));

    // Fetch all the data in a list of this user
    await this.fetchElementsWithinList();

    // Fetch the games in the slider (if the option is enabled on the platform)
    this._featuredGames = await this.fetchFeaturedGames();
  }

  //#endregion Public methods

  //#region Private methods
  /**
   * Wrapper that encloses the search for all non-basic data
   * that are in a list of the user who must be processed.
   */
  private async fetchElementsWithinList(): Promise<void> {
    interface IData {
      propertyName: string;
      url: string;
      selector: string;
      parseFunction: (html: string) => Promise<TRequestedTypes[]>;
    }

    // Prepare the URL for the watched threads
    const urlWatched = new URL(urls.WATCHED_THREADS);
    urlWatched.searchParams.set("unread", "0");

    const functionParametersMap: IData[] = [
      {
        propertyName: "_watched",
        url: urlWatched.toString(),
        selector: WATCHED_THREAD.LAST_PAGE,
        parseFunction: this.fetchPageThreadElements
      },
      {
        propertyName: "_bookmarks",
        url: urls.BOOKMARKS,
        selector: BOOKMARKED_POST.LAST_PAGE,
        parseFunction: this.fetchBookmarkElements
      },
      {
        propertyName: "_alerts",
        url: urls.ALERTS,
        selector: ALERT.LAST_PAGE,
        parseFunction: fetchAlertElements
      }
    ];

    // Execute the functions asynchronously
    const results = functionParametersMap.map((data) => {
      return {
        name: data.propertyName,
        elements: this.fetchElementsInPages(
          data.url,
          data.selector,
          data.parseFunction
        )
      };
    });

    // Assign the values to the propeties of the class
    for (const result of results) {
      this[result.name] = await result.elements;
    }
  }

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
   * @param url Page URL represented in `html`.
   * @param lastPageSelector CSS selector of the button for the last page of the list.
   * @param elementFunc Function that gets individual elements from the list in the web pages.
   */
  private async fetchElementsInPages<T extends TRequestedTypes>(
    url: string,
    lastPageSelector: string,
    parsingFunction: (html: string) => Promise<T[]>
  ): Promise<T[]> {
    // Fetch page
    const response = await fetchHTML(url);
    if (response.isFailure()) throw response.value;

    // Load page in cheerio
    const $ = cheerio.load(response.value);

    // Fetch the pages (select only the first selector if multiple are found)
    const lastPageText = $(lastPageSelector).first().text().trim();
    const lastPage = lastPageText ? parseInt(lastPageText, 10) : 1;

    // Create the async iterator used to fetch the pages
    const iter = this.fetchPages(url, lastPage);
    let curr = await iter.next();

    const promises: Promise<T[]>[] = [];
    while (!curr.done) {
      // Explicit cast because it always return a string
      const page = curr.value as string;

      // Parse elements but not resolve the promise
      const elements = parsingFunction(page);
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
