// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import cheerio from "cheerio";
import { isValidISODateString } from "iso-datestring-validator";

// Modules from files
import { urls } from "../../constants/url";
import { fetchHTML } from "../../network-helper";
import { GENERIC, MEMBER } from "../../constants/css-selector";
import shared from "../../shared";
import {
  InvalidID,
  INVALID_USER_ID,
  UserNotLogged,
  USER_NOT_LOGGED
} from "../errors";
import { ILazy } from "../../interfaces";

/**
 * Represents a generic user registered on the platform.
 */
export default class PlatformUser implements ILazy {
  //#region Fields

  private _id: number;
  private _name: string = "";
  private _title: string = "";
  private _banners: string[] = [];
  private _messages: number = 0;
  private _reactionScore: number = 0;
  private _points: number = 0;
  private _ratingsReceived: number = 0;
  private _joined: Date = new Date(-8640000000000000);
  private _lastSeen: Date = new Date(-8640000000000000);
  private _followed: boolean = false;
  private _ignored: boolean = false;
  private _private: boolean = false;
  private _avatar: string = "";
  private _amountDonated: number = 0;

  //#endregion Fields

  //#region Getters

  /**
   * Unique user ID.
   */
  public get id(): number {
    return this._id;
  }
  /**
   * Username.
   */
  public get name(): string {
    return this._name;
  }
  /**
   * Title assigned to the user by the platform.
   */
  public get title(): string {
    return this._title;
  }
  /**
   * List of banners assigned by the platform.
   */
  public get banners(): string[] {
    return this._banners;
  }
  /**
   * Number of messages written by the user.
   */
  public get messages(): number {
    return this._messages;
  }
  /**
   * Total number of reactions received from other users.
   */
  public get reactionScore(): number {
    return this._reactionScore;
  }
  /**
   * Total number of points received after the acquisition of trophies.
   */
  public get points(): number {
    return this._points;
  }
  /**
   * Number of ratings received.
   */
  public get ratingsReceived(): number {
    return this._ratingsReceived;
  }
  /**
   * Date of joining the platform.
   */
  public get joined(): Date {
    return this._joined;
  }
  /**
   * Date of the last connection to the platform.
   */
  public get lastSeen(): Date {
    return this._lastSeen;
  }
  /**
   * Indicates whether the user is followed by the currently logged in user.
   */
  public get followed(): boolean {
    return this._followed;
  }
  /**
   * Indicates whether the user is ignored by the currently logged on user.
   */
  public get ignored(): boolean {
    return this._ignored;
  }
  /**
   * Indicates that the profile is private and not viewable by the user.
   */
  public get private(): boolean {
    return this._private;
  }
  /**
   * URL of the image used as the user's avatar.
   */
  public get avatar(): string {
    return this._avatar;
  }
  /**
   * Value of donations made.
   */
  public get donation(): number {
    return this._amountDonated;
  }

  //#endregion Getters

  constructor(id?: number) {
    this._id = id ?? 0;
  }

  //#region Public methods

  public async fetch(): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // Check ID
    if (!this.id || this.id < 1) throw new InvalidID(INVALID_USER_ID);

    // Prepare the URL
    const url = new URL(this.id.toString(), `${urls.MEMBERS}/`).toString();

    // Fetch the page
    const response = await fetchHTML(url);
    const result = response.applyOnSuccess((html) =>
      this.elaborateResponse(html)
    );
    if (result.isFailure()) throw response.value;
  }

  //#endregion Public methods

  //#region Private methods

  /**
   * Process the HTML code received as
   * an answer and gets the data contained in it.
   */
  private elaborateResponse(html: string): void {
    // Prepare cheerio
    const $ = cheerio.load(html);

    // Check if the profile is private
    this._private =
      $(GENERIC.ERROR_BANNER)?.text().trim() ===
      "This member limits who may view their full profile.";

    if (!this._private) {
      // Parse the elements
      this._name = $(MEMBER.NAME).text();
      this._title = $(MEMBER.TITLE).text();
      this._banners = $(MEMBER.BANNERS)
        .toArray()
        .map((el) => $(el).text().trim())
        .filter((el) => el);
      this._avatar = $(MEMBER.AVATAR).attr("src") ?? "";
      this._followed = $(MEMBER.FOLLOWED).text() === "Unfollow";
      this._ignored = $(MEMBER.IGNORED).text() === "Unignore";
      this._messages = parseInt($(MEMBER.MESSAGES).text(), 10);
      this._reactionScore = parseInt($(MEMBER.REACTION_SCORE).text(), 10);
      this._points = parseInt($(MEMBER.POINTS).text(), 10);
      this._ratingsReceived = parseInt($(MEMBER.RATINGS_RECEIVED).text(), 10);

      // Parse date
      const joined = $(MEMBER.JOINED)?.attr("datetime");
      if (joined && isValidISODateString(joined))
        this._joined = new Date(joined);

      const lastSeen = $(MEMBER.LAST_SEEN)?.attr("datetime");
      if (lastSeen && isValidISODateString(lastSeen))
        this._joined = new Date(lastSeen);

      // Parse donation
      const donation = $(MEMBER.AMOUNT_DONATED)?.text().replace("$", "");
      this._amountDonated = donation ? parseInt(donation, 10) : 0;
    }
  }

  //#endregion Private methods
}
