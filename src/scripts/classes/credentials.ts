// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import { getF95Token } from "../network-helper";

/**
 * Represents the credentials used to access the platform.
 */
export default class Credentials {
  //#region Private fields

  private _token: string = null;

  //#endregion Private fields

  /**
   * Username
   */
  public readonly username: string;
  /**
   * Password of the user.
   */
  public readonly password: string;
  /**
   * One time token used during login.
   */
  get token(): string {
    return this._token;
  }

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  /**
   * Fetch and save the token used to log in to F95Zone.
   */
  async fetchToken(): Promise<void> {
    this._token = await getF95Token();
  }
}
