// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

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
  // Login result
  let loginResult: LoginResult = null;

  // Try to load a previous session
  await shared.session.load();

  // If the session is valid, login from it
  if (shared.session.isValid(username, password)) {
    loginResult = loginFromLocalSession(username);
  }
  // Otherwise login from the F95Zone platform
  else {
    const creds = await createCredentials(username, password);
    loginResult = await loginInTheRemotePlatform(creds, cb2fa);

    // Recreate the session, overwriting the old one
    if (loginResult.success) {
      shared.session.create(username, password, creds.token);
      await shared.session.save();
    }
  }

  if (loginResult.success) {
    // Load platform data
    await fetchPlatformData();

    shared.logger.info("User logged in through the platform");
  } else
    shared.logger.warn(`Error during authentication: ${loginResult.message}`);

  // Set login status
  shared.setIsLogged(loginResult.success);
  return loginResult;
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

//#region Private methods

/**
 * Create login result used if there is a valid local session.
 */
function loginFromLocalSession(username: string): LoginResult {
  shared.logger.info(`Loading previous session for ${username}`);

  return new LoginResult(
    true,
    LoginResult.ALREADY_AUTHENTICATED,
    `${username} already authenticated (session)`
  );
}

/**
 * Create user credentials for login.
 */
async function createCredentials(username: string, password: string) {
  // Creating credentials and fetch unique platform token
  const creds = new Credentials(username, password);

  shared.logger.trace("Fetching token...");
  await creds.fetchToken();

  return creds;
}

/**
 * Login into the remote platform.
 */
async function loginInTheRemotePlatform(
  creds: Credentials,
  cb2fa?: () => Promise<number>
): Promise<LoginResult> {
  shared.logger.trace(`Authentication for ${creds.username}`);
  let result = await authenticate(creds);

  // 2FA Authentication is required, fetch OTP
  if (result.code === LoginResult.REQUIRE_2FA) {
    const code = await cb2fa();
    const response2fa = await send2faCode(code, creds.token);
    if (response2fa.isSuccess()) result = response2fa.value;
    else throw response2fa.value;
  }

  return result;
}

//#endregion Private methods
