// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

/**
 * Object obtained in response to an attempt to login to the portal.
 */
export default class LoginResult {
  /**
   * Result of the login operation
   */
  success: boolean;
  /**
   * Login response message
   */
  message: string;

  constructor(success: boolean, message: string) {
    this.success = success;
    this.message = message;
  }
}
