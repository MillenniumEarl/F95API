// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

/**
 * Object obtained in response to an attempt to login to the portal.
 */
export default class LoginResult {
  //#region Login result codes

  static REQUIRE_2FA = 100;
  static AUTH_SUCCESSFUL = 200;
  static AUTH_SUCCESSFUL_2FA = 201;
  static ALREADY_AUTHENTICATED = 202;
  static UNKNOWN_ERROR = 400;
  static INCORRECT_CREDENTIALS = 401;
  static INCORRECT_2FA_CODE = 402;

  //#endregion Login result codes

  //#region Properties
  /**
   * Result of the login operation
   */
  readonly success: boolean;
  /**
   * Code associated with the result of the login operation.
   */
  readonly code: number;
  /**
   * Login response message
   */
  readonly message: string;

  //#endregion Properties

  constructor(success: boolean, code: number, message?: string) {
    this.success = success;
    this.code = code;
    this.message = message;
  }
}
