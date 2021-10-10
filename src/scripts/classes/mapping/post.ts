// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import cheerio, { Cheerio, CheerioAPI, Node } from "cheerio";
import { isValidISODateString } from "iso-datestring-validator";

// Modules from file
import PlatformUser from "./platform-user";
import { POST, THREAD } from "../../constants/css-selector";
import { urls } from "../../constants/url";
import { fetchHTML } from "../../network-helper";
import shared from "../../shared";
import {
  InvalidID,
  INVALID_POST_ID,
  MissingOrInvalidParsingAttribute,
  UserNotLogged,
  USER_NOT_LOGGED
} from "../errors";
import { ILazy, IPostElement } from "../../interfaces";
import { extractDataFromFirstThreadPost } from "../../scrape-data/post-parse-tree";
import { DEFAULT_DATE } from "../../constants/generic";

/**
 * Represents a post published by a user on the F95Zone platform.
 */
export default class Post implements ILazy {
  //#region Fields

  private _id: number = -1;
  private _number: number = -1;
  private _published: Date = DEFAULT_DATE;
  private _lastEdit: Date = DEFAULT_DATE;
  private _owner: PlatformUser = undefined as any;
  private _bookmarked: boolean = false;
  private _message: string = "";
  private _body: IPostElement[] = [];

  //#endregion Fields

  //#region Getters

  /**
   * Unique ID of the post on the F95Zone platform.
   */
  public get id(): number {
    return this._id;
  }
  /**
   * Unique ID of the post within the thread in which it is present.
   */
  public get number(): number {
    return this._number;
  }
  /**
   * Date the post was first published.
   */
  public get published(): Date {
    return this._published;
  }
  /**
   * Date the post was last modified.
   */
  public get lastEdit(): Date {
    return this._lastEdit;
  }
  /**
   * User who owns the post.
   */
  public get owner(): PlatformUser {
    return this._owner;
  }
  /**
   * Indicates whether the post has been bookmarked.
   */
  public get bookmarked(): boolean {
    return this._bookmarked;
  }
  /**
   * Post message text.
   */
  public get message(): string {
    return this._message;
  }
  /**
   * Set of the elements that make up the body of the post.
   */
  public get body(): IPostElement[] {
    return this._body;
  }

  //#endregion Getters

  constructor(id: number) {
    this._id = id;
  }

  //#region Public methods

  /**
   * Gets the post data starting from its unique ID for the entire platform.
   * @param html HTML source code of the page that contains the post
   */
  public async fetch(html?: string): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // Check ID
    if (!this.id || this.id < 1) throw new InvalidID(INVALID_POST_ID);

    // Avoid to fetch the HTML if we already have it
    if (html) await this.elaborateResponse(html);

    // Fetch HTML page containing the post
    const url = new URL(this.id.toString(), urls.POSTS).toString();
    const response = await fetchHTML(url);

    if (response.isSuccess()) await this.elaborateResponse(response.value);
    else throw response.value;
  }

  //#endregion Public methods

  //#region Private methods

  /**
   * Process the HTML code received as
   * an answer and gets the data contained in it.
   */
  private async elaborateResponse(html: string) {
    // Load cheerio and find post
    const $ = cheerio.load(html);

    const post = $(THREAD.POSTS_IN_PAGE)
      .toArray()
      .find((el) => {
        // Fetch the ID and check if it is what we are searching
        const sid = findAttribute($(el), POST.ID, "id")
          .replace("post-", "")
          .trim();
        const id = parseInt(sid, 10);

        if (id === this.id) return el;
      });

    // Finally parse the post
    await this.parsePost($, $(post));
  }

  /**
   * Extract all the relevant data from the post.
   *
   * The following information are extracted:
   * `id`, `number`, `publishing date`, `bookmarked`, `message`, `body`
   *
   * These information could not exists:
   * `last edit date`, `owner id`
   */
  private async parsePost($: CheerioAPI, post: Cheerio<Node>): Promise<void> {
    // Find post's ID
    const sid: string = findAttribute(post, POST.ID, "id").replace("post-", "");
    this._id = parseInt(sid, 10);

    // Find post's number
    const sNumber: string = post.find(POST.NUMBER).text().replace("#", "");
    this._number = parseInt(sNumber, 10);

    // Find post's publishing date
    const sPublishing = findAttribute(post, POST.PUBLISH_DATE, "datetime");
    if (isValidISODateString(sPublishing))
      this._published = new Date(sPublishing);

    // Find post's last edit date (could not exists if the post was never edited)
    const sLastEdit = findAttribute(post, POST.LAST_EDIT, "datetime", false);
    if (isValidISODateString(sLastEdit)) this._lastEdit = new Date(sLastEdit);
    else this._lastEdit = this._published;

    // Find post's owner (if no ID is found than the user has been deleted)
    const ownerID = findAttribute(post, POST.OWNER_ID, "data-user-id", false);
    if (ownerID !== "") {
      this._owner = new PlatformUser(parseInt(ownerID.trim(), 10));
      await this._owner.fetch();
    }

    // Find if the post is bookmarked
    this._bookmarked = post.find(POST.BOOKMARKED).length !== 0;

    // Find post's message
    this._message = post.find(POST.BODY).text();

    // Parse post's body
    const body = post.find(POST.BODY).get()[0];
    this._body = extractDataFromFirstThreadPost($, body);
  }

  //#endregion
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
    const message = `Cannnot find '${attribute}' attribute in element with selector '${selector}'`;
    throw new MissingOrInvalidParsingAttribute(message);
  } else return extracted;
}
