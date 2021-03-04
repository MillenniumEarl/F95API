"use strict";

// Modules from file
import { getF95Token } from "../network-helper.js";

/**
 * Represents the credentials used to access the platform.
 */
export default class Credentials {
  /**
   * Username
   */
  public username: string;
  /**
   * Password of the user.
   */
  public password: string;
  /**
   * One time token used during login.
   */
  public token: string = null;

  constructor(username: string, password: string) {
    this.username = username;
    this.password = password;
  }

  /**
   * Fetch and save the token used to log in to F95Zone.
   */
  async fetchToken(): Promise<void> {
    this.token = await getF95Token();
  }
}
