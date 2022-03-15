// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { isValidISODateString } from "iso-datestring-validator";
import cheerio, { Cheerio, Node } from "cheerio";

// Modules from files
import PlatformUser from "./platform-user";
import { urls } from "../../constants/url";
import {
  ALERT,
  BOOKMARKED_POST,
  CONVERSATION,
  GENERIC,
  WATCHED_THREAD
} from "../../constants/css-selector";
import { fetchHTML } from "../../network-helper";
import {
  InvalidID,
  MissingOrInvalidParsingAttribute,
  UserNotLogged,
  USER_NOT_LOGGED
} from "../errors";
import shared from "../../shared";
import Game from "../handiwork/game";
import {
  IAlert,
  IBookmarkedPost,
  IConversation,
  IWatchedThread
} from "../../interfaces";
import fetchAlertElements from "../../fetch-data/user-data/fetch-alert";
import Thread from "./thread";
import { getHandiworkFromURL } from "../../handiwork-from-url";
import fetchPageConversations from "../../fetch-data/user-data/fetch-conversation";
import { DEFAULT_DATE } from "../../constants/generic";

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

  private _watched: IWatchedThread[] = undefined as any;
  private _bookmarks: IBookmarkedPost[] = undefined as any;
  private _alerts: IAlert[] = undefined as any;
  private _conversations: IConversation[] = undefined as any;
  private _featuredGames: Game[] = undefined as any;

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
   */
  public get conversations(): Promise<IConversation[]> {
    return this.conversationsGetWrapper();
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
    // Checks if basic data has already been retrieved
    if (!this.id)
      throw new InvalidID("First you need to call the fetch() method");

    // Cache data
    if (!this._watched) {
      shared.logger.trace("Fetching watched threads...");

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
    // Checks if basic data has already been retrieved
    if (!this.id)
      throw new InvalidID("First you need to call the fetch() method");

    // Cache data
    if (!this._bookmarks) {
      shared.logger.trace("Fetching bookmarks...");

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
    // Checks if basic data has already been retrieved
    if (!this.id)
      throw new InvalidID("First you need to call the fetch() method");

    // Cache data
    if (!this._alerts) {
      shared.logger.trace("Fetching alerts...");

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
    // Checks if basic data has already been retrieved
    if (!this.id)
      throw new InvalidID("First you need to call the fetch() method");

    // Cache data
    if (!this._featuredGames) {
      shared.logger.trace("Fetching featured games...");
      this._featuredGames = await this.fetchFeaturedGames();
    }
    return Promise.resolve(this._featuredGames);
  }

  async conversationsGetWrapper(): Promise<IConversation[]> {
    // Checks if basic data has already been retrieved
    if (!this.id)
      throw new InvalidID("First you need to call the fetch() method");

    // Cache data
    if (!this._conversations) {
      shared.logger.trace("Fetching conversations...");

      // Prepare the options to use for fetching the data
      const options: IFetchOptions<IConversation> = {
        url: urls.CONVERSATIONS,
        selector: CONVERSATION.LAST_PAGE,
        parseFunction: fetchPageConversations
      };

      // Fetch data
      this._conversations = await this.fetchElementsInPages(options);
    }
    return Promise.resolve(this._conversations);
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
    shared.logger.info(`Got user's ID: ${id}`);

    // Than fetch the basic data
    shared.logger.info("Fetching user information...");
    await temp.fetch();

    // Copy the property of the superior class (PlatformUser) to this instance
    const superprops = Object.getOwnPropertyNames(temp);
    superprops
      .filter((p) => !p.includes("__proto__"))
      // file deepcode ignore PrototypePollution: I already ignored __proto__ strings
      .map((p) => (this[p] = temp[p]));

    // Fetch all the "extra" data of this user
    if (extended) {
      shared.logger.info("Fetching extended information...");
      const promises = [
        this.watchedThreadsGetWrapper(),
        this.bookmarksGetWrapper(),
        this.alertsGetWrapper(),
        this.featuredGamesGetWrapper(),
        this.conversationsGetWrapper()
      ];

      // Await all the promises. We can use `any`
      // because the values are saved inside the functions.
      await Promise.all<any>(promises);
      shared.logger.trace("Extended information fetched");
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

      const sid = $(GENERIC.CURRENT_USER_ID).attr("data-user-id");
      if (!sid)
        throw new MissingOrInvalidParsingAttribute("Cannot extract user's ID");
      return parseInt(sid.trim(), 10);
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
      const partialURL = findAttribute($(el), WATCHED_THREAD.URL, "href");

      const url = new URL(
        partialURL.replace("unread", ""),
        urls.BASE
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
      const url = findAttribute($(el), BOOKMARKED_POST.URL, "href");

      // Check if the URL contains a post ID and get it,
      // otherwise it represents the first post of a
      // thread so set the ID to 1
      const regex = new RegExp(/posts\/([0-9]+)/);
      const match = url.match(regex);
      let foundID = null;
      if (match) {
        const sid = match[0].replace("posts/", "");
        foundID = parseInt(sid, 10);
      } else {
        const post = await new Thread(new URL(url)).getPost(1);
        foundID = post.id;
      }

      // Find the savedate
      const sDate = findAttribute(
        $(el),
        BOOKMARKED_POST.BOOKMARK_TIME,
        "datetime"
      );

      // Find the owner ID
      const sOwnerID = findAttribute(
        $(el),
        BOOKMARKED_POST.OWNER_ID,
        "data-user-id"
      );

      return {
        id: foundID,
        userid: parseInt(sOwnerID, 10),
        description: $(el).find(BOOKMARKED_POST.DESCRIPTION).text().trim(),
        savedate: isValidISODateString(sDate)
          ? new Date(sDate)
          : new Date(DEFAULT_DATE),
        labels: $(el)
          .find(BOOKMARKED_POST.LABELS)
          .map((_, label) => $(label).text())
          .toArray()
      } as IBookmarkedPost;
    }

    const promises = $(BOOKMARKED_POST.BODIES)
      .map((_idx, el) => parseElement(el))
      .get();

    return await Promise.all(promises);
  }

  /**
   * Fetch the game featured by the platform (if the option is enabled).
   *
   * The games are those highlighted in the carousel of the main page.
   */
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
      const partialURLs = slider
        .map((el) => $(el).attr("href")?.trim())
        .filter((url) => url !== undefined);

      // Prepare the unique URLs
      const gameURLs = [...new Set(partialURLs)].map((pu) =>
        new URL(pu, urls.BASE).toString()
      );

      // fetch the games
      const promises = gameURLs.map((url) => {
        return getHandiworkFromURL<Game>(url, Game);
      });

      return Promise.all(promises);
    } else throw response.value;
  }

  //#endregion Private methods
}

/**
 * Make sure you get the attribute you are looking for or throw an exception.
 *
 * Return empty string if no attribute is found and `raise` if false.
 */
function findAttribute(
  e: Cheerio<Node>,
  selector: string,
  attribute: string,
  raise: boolean = true
): string | "" {
  // Extract the attribute
  const extracted = e.find(selector).attr(attribute) ?? "";

  // Check if the attribute is undefined
  if (!extracted && raise) {
    const message = `Cannot find '${attribute}' attribute in element with selector '${selector}'`;
    throw new MissingOrInvalidParsingAttribute(message);
  } else return extracted;
}
