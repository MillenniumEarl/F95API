// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from file
import { UserNotLogged, USER_NOT_LOGGED } from "./classes/errors";
import fetchPlatformData from "./fetch-data/fetch-platform-data";
import { authenticate, send2faCode } from "./network-helper";
import shared from "./shared";

// Classes from file
import LoginResult from "./classes/login-result";
import Credentials from "./classes/credentials";

//#region Public methods

/**
 * Log in to the F95Zone platform.
 *
 * This **must** be the first operation performed before accessing any other script functions.
 *
 * @param cb2fa
 * Callback used if two-factor authentication is required for the profile.
 * It must return he OTP code to use for the login.
 */
export async function login(
  username: string,
  password: string,
  cb2fa?: () => Promise<number>
): Promise<LoginResult> {
  // Try to load a previous session
  await shared.session.load();

  // If the session is valid, return
  if (shared.session.isValid(username, password)) {
    shared.logger.info(`Loading previous session for ${username}`);

    // Load platform data
    await fetchPlatformData();

    shared.setIsLogged(true);
    return new LoginResult(
      true,
      LoginResult.ALREADY_AUTHENTICATED,
      `${username} already authenticated (session)`
    );
  }

  // Creating credentials and fetch unique platform token
  shared.logger.trace("Fetching token...");
  const creds = new Credentials(username, password);
  await creds.fetchToken();

  shared.logger.trace(`Authentication for ${username}`);
  let result = await authenticate(creds);
  shared.setIsLogged(result.success);

  // 2FA Authentication is required, fetch OTP
  if (result.code === LoginResult.REQUIRE_2FA) {
    const code = await cb2fa();
    const response2fa = await send2faCode(code, creds.token);
    if (response2fa.isSuccess()) result = response2fa.value;
    else throw response2fa.value;
  }

  if (result.success) {
    // Recreate the session, overwriting the old one
    shared.session.create(username, password, creds.token);
    await shared.session.save();

    // Load platform data
    await fetchPlatformData();

    shared.logger.info("User logged in through the platform");
  } else shared.logger.warn(`Error during authentication: ${result.message}`);

  shared.setIsLogged(result.success);
  return result;
}

/**
 * Close the currently open session.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export async function logout(): Promise<void> {
  // Check if the user is logged
  if (!shared.isLogged) throw new UserNotLogged(USER_NOT_LOGGED);

  await shared.session.delete();
  shared.setIsLogged(false);
}

//#endregion Public methods
