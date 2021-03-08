// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import PlatformUser from "./platform-user";
import { IPostElement, parseF95ThreadPost } from "../../scrape-data/post-parse";
import { POST, THREAD } from "../../constants/css-selector";
import { urls } from "../../constants/url";
import { fetchHTML } from "../../network-helper";

/**
 * Represents a post published by a user on the F95Zone platform.
 */
export default class Post {
  //#region Fields

  private _id: number;
  private _number: number;
  private _published: Date;
  private _lastEdit: Date;
  private _owner: PlatformUser;
  private _bookmarked: boolean;
  private _message: string;
  private _body: IPostElement[];

  //#endregion Fields

  //#region Getters

  /**
   * Represents a post published by a user on the F95Zone platform.
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
   */
  public async fetch(): Promise<void> {
    // Fetch HTML page containing the post
    const url = new URL(this.id.toString(), urls.POSTS).toString();
    const htmlResponse = await fetchHTML(url);

    if (htmlResponse.isSuccess()) {
      // Load cheerio and find post
      const $ = cheerio.load(htmlResponse.value);

      const post = $(THREAD.POSTS_IN_PAGE)
        .toArray()
        .find((el, idx) => {
          // Fetch the ID and check if it is what we are searching
          const sid: string = $(el).find(POST.ID).attr("id").replace("post-", "");
          const id = parseInt(sid, 10);

          if (id === this.id) return el;
        });

      // Finally parse the post
      await this.parsePost($, $(post));
    } else throw htmlResponse.value;
  }

  //#endregion Public methods

  //#region Private methods

  private async parsePost($: cheerio.Root, post: cheerio.Cheerio): Promise<void> {
    // Find post's ID
    const sid: string = post.find(POST.ID).attr("id").replace("post-", "");
    this._id = parseInt(sid, 10);

    // Find post's number
    const sNumber: string = post.find(POST.NUMBER).text().replace("#", "");
    this._number = parseInt(sNumber, 10);

    // Find post's publishing date
    const sPublishing: string = post.find(POST.PUBLISH_DATE).attr("datetime");
    this._published = new Date(sPublishing);

    // Find post's last edit date
    const sLastEdit: string = post.find(POST.LAST_EDIT).attr("datetime");
    this._lastEdit = new Date(sLastEdit);

    // Find post's owner
    const sOwnerID: string = post.find(POST.OWNER_ID).attr("data-user-id").trim();
    this._owner = new PlatformUser(parseInt(sOwnerID, 10));
    await this._owner.fetch();

    // Find if the post is bookmarked
    this._bookmarked = post.find(POST.BOOKMARKED).length !== 0;

    // Find post's message
    this._message = post.find(POST.BODY).text();

    // Parse post's body
    const body = post.find(POST.BODY);
    this._body = parseF95ThreadPost($, body);
  }

  //#endregion
}
