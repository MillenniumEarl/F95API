// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { promises as fs, existsSync } from "fs";

// Public modules from npm
import { sha256 } from "js-sha256";
import tough, { CookieJar } from "tough-cookie";
import { ParameterError } from "./errors";
import { urls } from "../constants/url";
import { DEFAULT_DATE } from "../constants/generic";

export default class Session {
  //#region Fields

  /**
   * Max number of days the session is valid.
   */
  private readonly SESSION_TIME: number = 30;
  private _path: string;
  private _isMapped: boolean;
  private _created: Date;
  private _hash: string;
  private _token: string;
  private _cookieJar: CookieJar;
  private _serializedCookieJar: CookieJar.Serialized;

  //#endregion Fields

  //#region Getters

  /**
   * Path of the session map file on disk.
   */
  public get path(): string {
    return this._path;
  }
  /**
   * Indicates if the session is mapped on disk.
   */
  public get isMapped(): boolean {
    return this._isMapped;
  }
  /**
   * Date of creation of the session.
   */
  public get created(): Date {
    return this._created;
  }
  /**
   * MD5 hash of the username and the password.
   */
  public get hash(): string {
    return this._hash;
  }
  /**
   * Token used for POST requests to the platform.
   */
  public get token(): string {
    return this._token;
  }
  /**
   * Cookie holder.
   */
  public get cookieJar(): tough.CookieJar {
    return this._cookieJar;
  }

  //#endregion Getters

  /**
   * Initializes the session by setting the path for saving information to disk.
   */
  constructor(p: string) {
    if (!p || p === "")
      throw new ParameterError("Invalid path for the session file");
    this._path = p;
    this._isMapped = existsSync(this.path);
    this._created = new Date(Date.now());
    this._hash = null;
    this._token = null;
    this._cookieJar = new tough.CookieJar();
  }

  //#region Private Methods

  /**
   * Get the difference in days between two dates.
   */
  private dateDiffInDays(a: Date, b: Date) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.abs(Math.floor((utc2 - utc1) / MS_PER_DAY));
  }

  /**
   * Convert the object to a dictionary serializable in JSON.
   */
  private toJSON(): Record<string, unknown> {
    return {
      _created: this._created,
      _hash: this._hash,
      _token: this._token,
      _serializedCookieJar: this._serializedCookieJar
    };
  }

  //#endregion Private Methods

  //#region Public Methods

  /**
   * Create a new session.
   */
  create(username: string, password: string, token: string): void {
    // First, create the _hash of the credentials
    const value = `${username}%%%${password}`;
    this._hash = sha256(value);

    // Set the token
    this._token = token;

    // Update the creation date
    this._created = new Date(Date.now());
  }

  /**
   * Save the session to disk.
   */
  async save(): Promise<void> {
    // Update the creation date
    this._created = new Date(Date.now());

    // Set the session as mapped on file
    this._isMapped = true;

    // Serialize the cookiejar
    this._serializedCookieJar = await this._cookieJar.serialize();

    // Convert data
    const json = this.toJSON();
    const data = JSON.stringify(json);

    // Write data
    await fs.writeFile(this.path, data);
  }

  /**
   * Load the session from disk.
   */
  async load(): Promise<void> {
    if (this.isMapped) {
      // Read data
      const data = await fs.readFile(this.path, {
        encoding: "utf-8",
        flag: "r"
      });
      const json = JSON.parse(data);

      // Assign values
      this._created = new Date(json._created);
      this._hash = json._hash;
      this._token = json._token;

      // Load cookiejar
      this._cookieJar = await CookieJar.deserialize(json._serializedCookieJar);

      // Remove session cookies
      await this.deleteSessionCookies();
    }
  }

  /**
   * Delete the session from disk.
   */
  async delete(): Promise<void> {
    // Delete the session data
    if (this.isMapped) await fs.unlink(this.path);
  }

  /**
   * Removes from memory the session cookies which
   * will have to be recreated to each session.
   */
  async deleteSessionCookies(): Promise<void> {
    // Get all the stored cookies
    const cookies = await this._cookieJar.getCookies(urls.BASE);

    // Get the user cookie, the only not session-based
    const userCookie = cookies.find((cookie) => cookie.key === "xf_user");

    // Remove all the cookies from the store and re-add the user cookie
    await this._cookieJar.removeAllCookies();
    if (userCookie) await this._cookieJar.setCookie(userCookie, urls.BASE);
  }

  /**
   * Check if the session is valid.
   */
  isValid(username: string, password: string): boolean {
    // Local variables
    const now = new Date(Date.now());

    // Get the number of days from the file creation
    const sessionDateDiff = this.dateDiffInDays(now, this.created);

    // The session is valid if the number of days is minor than SESSION_TIME
    const sessionDateValid = sessionDateDiff < this.SESSION_TIME;

    // Check the hash
    const value = `${username}%%%${password}`;
    const hashValid = sha256(value) === this._hash;

    // Verify if the user cookie is valid
    const xfUser = this._cookieJar
      .getCookiesSync(urls.BASE)
      .find((c) => c.key === "xf_user");
    const cookieCreation = xfUser ? xfUser.creation : DEFAULT_DATE;
    const cookieDateDiff = this.dateDiffInDays(now, cookieCreation);

    // The cookie has a validity of one year, however it is limited to SESSION_TIME
    const cookieDateValid = cookieDateDiff < this.SESSION_TIME;

    return sessionDateValid && hashValid && cookieDateValid;
  }

  /**
   * Update the `_xfToken` token.
   */
  updateToken(token: string): void {
    this._token = token;
  }

  //#endregion Public Methods
}
