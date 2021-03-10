// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import cheerio from "cheerio";
import { DateTime } from "luxon";

// Modules from files
import { urls } from "../../constants/url";
import { fetchHTML } from "../../network-helper";
import { GENERIC, MEMBER } from "../../constants/css-selector";
import shared from "../../shared";
import { UserNotLogged, USER_NOT_LOGGED } from "../errors";

/**
 * Represents a generic user registered on the platform.
 */
export default class PlatformUser {
  //#region Fields

  private _id: number;
  private _name: string;
  private _title: string;
  private _banners: string[];
  private _messages: number;
  private _reactionScore: number;
  private _points: number;
  private _ratingsReceived: number;
  private _joined: Date;
  private _lastSeen: Date;
  private _followed: boolean;
  private _ignored: boolean;
  private _private: boolean;
  private _avatar: string;
  private _amountDonated: number;

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
   * @todo Reaction score.
   */
  public get reactionScore(): number {
    return this._reactionScore;
  }
  /**
   * @todo Points.
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
    this._id = id;
  }

  //#region Public methods

  public setID(id: number): void {
    this._id = id;
  }

  public async fetch(): Promise<void> {
    // Check login
    if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

    // Check ID
    if (!this.id && this.id < 1) throw new Error("Invalid user ID");

    // Prepare the URL
    const url = new URL(this.id.toString(), `${urls.MEMBERS}/`).toString();

    // Fetch the page
    const htmlResponse = await fetchHTML(url);
    const result = htmlResponse.applyOnSuccess(this.elaborateResponse);
    if (result.isFailure()) throw htmlResponse.value;
  }

  //#endregion Public methods

  //#region Private methods

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
        .map((el, idx) => $(el).text().trim())
        .filter((el) => el);
      this._avatar = $(MEMBER.AVATAR).attr("src");
      this._followed = $(MEMBER.FOLLOWED).text() === "Unfollow";
      this._ignored = $(MEMBER.IGNORED).text() === "Unignore";
      this._messages = parseInt($(MEMBER.MESSAGES).text(), 10);
      this._reactionScore = parseInt($(MEMBER.REACTION_SCORE).text(), 10);
      this._points = parseInt($(MEMBER.POINTS).text(), 10);
      this._ratingsReceived = parseInt($(MEMBER.RATINGS_RECEIVED).text(), 10);

      // Parse date
      const joined = $(MEMBER.JOINED)?.attr("datetime");
      if (DateTime.fromISO(joined).isValid) this._joined = new Date(joined);

      const lastSeen = $(MEMBER.LAST_SEEN)?.attr("datetime");
      if (DateTime.fromISO(lastSeen).isValid) this._joined = new Date(lastSeen);

      // Parse donation
      const donation = $(MEMBER.AMOUNT_DONATED)?.text().replace("$", "");
      this._amountDonated = donation ? parseInt(donation, 10) : 0;
    }
  }

  //#endregion Private methods
}
