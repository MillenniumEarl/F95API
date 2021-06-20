// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { promises as fs, existsSync } from "fs";
import path from "path";

// Public modules from npm
import { sha256 } from "js-sha256";
import tough, { CookieJar } from "tough-cookie";
import { BaseAPIError, ERROR_CODE, ParameterError } from "./errors";

export default class Session {
  //#region Fields

  /**
   * Max number of days the session is valid.
   */
  private readonly SESSION_TIME: number = 1;
  private readonly COOKIEJAR_FILENAME: string = "f95cookiejar.json";
  private _path: string;
  private _isMapped: boolean;
  private _created: Date;
  private _hash: string;
  private _token: string;
  private _cookieJar: CookieJar;
  private _cookieJarPath: string;

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
   * Token used to login to F95Zone.
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

    // Define the path for the cookiejar
    const basedir = path.dirname(p);
    this._cookieJarPath = path.join(basedir, this.COOKIEJAR_FILENAME);
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
      _token: this._token
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

    // Convert data
    const json = this.toJSON();
    const data = JSON.stringify(json);

    // Write data
    await fs.writeFile(this.path, data);

    // Write cookiejar
    const serializedJar = await this._cookieJar.serialize();
    await fs.writeFile(this._cookieJarPath, JSON.stringify(serializedJar));
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
      const serializedJar = await fs.readFile(this._cookieJarPath, {
        encoding: "utf-8",
        flag: "r"
      });
      this._cookieJar = await CookieJar.deserialize(JSON.parse(serializedJar));
    }
  }

  /**
   * Delete the session from disk.
   */
  async delete(): Promise<void> {
    if (this.isMapped) {
      // Delete the session data
      await fs.unlink(this.path);

      // Delete the cookiejar
      await fs.unlink(this._cookieJarPath);
    }
  }

  /**
   * Check if the session is valid.
   */
  isValid(username: string, password: string): boolean {
    // Get the number of days from the file creation
    const diff = this.dateDiffInDays(new Date(Date.now()), this.created);

    // The session is valid if the number of days is minor than SESSION_TIME
    const dateValid = diff < this.SESSION_TIME;

    // Check the hash
    const value = `${username}%%%${password}`;
    const hashValid = sha256(value) === this._hash;

    // Search for expired cookies
    const jarValid =
      this._cookieJar
        .getCookiesSync("https://f95zone.to")
        .filter((el) => el.TTL() === 0).length === 0;

    return dateValid && hashValid && jarValid;
  }

  //#endregion Public Methods
}
