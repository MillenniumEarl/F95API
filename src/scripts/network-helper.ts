// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import axios, { AxiosResponse } from "axios";
import cheerio from "cheerio";
import axiosCookieJarSupport from "axios-cookiejar-support";

// Modules from file
import shared from "./shared.js";
import { urls } from "./constants/url.js";
import { GENERIC } from "./constants/css-selector.js";
import LoginResult from "./classes/login-result.js";
import { failure, Result, success } from "./classes/result.js";
import {
  GenericAxiosError,
  InvalidF95Token,
  UnexpectedResponseContentType
} from "./classes/errors.js";
import Credentials from "./classes/credentials.js";

// @ts-ignore
// Configure axios to use the cookie jar
axiosCookieJarSupport.default(axios);

// Global variables
const userAgent =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15";

/**
 * Common configuration used to send request via Axios.
 */
const commonConfig = {
  /**
   * Headers to add to the request.
   */
  headers: {
    "User-Agent": userAgent,
    Connection: "keep-alive"
  },
  /**
   * Specify if send credentials along the request.
   */
  withCredentials: true,
  /**
   * Jar of cookies to send along the request.
   */
  jar: shared.session.cookieJar,
  validateStatus: function (status: number) {
    return status < 500; // Resolve only if the status code is less than 500
  }
};

/**
 * Gets the HTML code of a page.
 */
export async function fetchHTML(
  url: string
): Promise<Result<GenericAxiosError | UnexpectedResponseContentType, string>> {
  // Fetch the response of the platform
  const response = await fetchGETResponse(url);

  if (response.isSuccess()) {
    // Check if the response is a HTML source code
    const isHTML = response.value.headers["content-type"].includes("text/html");

    const unexpectedResponseError = new UnexpectedResponseContentType({
      id: 2,
      message: `Expected HTML but received ${response.value["content-type"]}`,
      error: null
    });

    return isHTML
      ? success(response.value.data as string)
      : failure(unexpectedResponseError);
  } else return failure(response.value as GenericAxiosError);
}

/**
 * It authenticates to the platform using the credentials
 * and token obtained previously. Save cookies on your
 * device after authentication.
 * @param {Credentials} credentials Platform access credentials
 * @param {Boolean} force Specifies whether the request should be forced, ignoring any saved cookies
 * @returns {Promise<LoginResult>} Result of the operation
 */
export async function authenticate(
  credentials: Credentials,
  force: boolean = false
): Promise<LoginResult> {
  shared.logger.info(`Authenticating with user ${credentials.username}`);
  if (!credentials.token)
    throw new InvalidF95Token(`Invalid token for auth: ${credentials.token}`);

  // Secure the URL
  const secureURL = enforceHttpsUrl(urls.F95_LOGIN_URL);

  // Prepare the parameters to send to the platform to authenticate
  const params = {
    login: credentials.username,
    url: "",
    password: credentials.password,
    password_confirm: "",
    additional_security: "",
    remember: "1",
    _xfRedirect: "https://f95zone.to/",
    website_code: "",
    _xfToken: credentials.token
  };

  // Try to log-in
  let authResult: LoginResult = null;
  try {
    // Fetch the response to the login request
    const response = await fetchPOSTResponse(urls.F95_LOGIN_URL, params, force);

    // Parse the response
    const result = response.applyOnSuccess((r) => manageLoginPOSTResponse(r));
    if (result.isSuccess()) authResult = result.value;
    else throw response.value;
  } catch (e) {
    shared.logger.error(
      `Error ${e.message} occurred while authenticating to ${secureURL}`
    );
    authResult = new LoginResult(
      false,
      LoginResult.UNKNOWN_ERROR,
      `Error ${e.message} while authenticating`
    );
  }
  return authResult;
}

/**
 * Send an OTP code if the login procedure requires it.
 * @param code OTP code.
 * @param token Unique token for the session associated with the credentials in use.
 * @param trustedDevice If the device in use is trusted, 2FA authentication is not required for 30 days.
 */
export async function send2faCode(
  code: number,
  token: string,
  trustedDevice: boolean = false
): Promise<Result<GenericAxiosError, LoginResult>> {
  // Prepare the parameters to send via POST request
  const params = {
    _xfRedirect: urls.F95_BASE_URL,
    _xfRequestUri: "/login/two-step?_xfRedirect=https%3A%2F%2Ff95zone.to%2F&remember=1",
    _xfResponseType: "json",
    _xfToken: token,
    _xfWithData: "1",
    code: code.toString(),
    confirm: "1",
    provider: "totp",
    remember: "1",
    trust: trustedDevice ? "1" : "0"
  };

  // Send 2FA params
  const response = await fetchPOSTResponse(urls.F95_2FA_LOGIN, params);
  return response.applyOnSuccess((r: AxiosResponse<any>) => {
    // r.data.status is 'ok' if the authentication is successful
    const result = r.data.status === "ok";
    const message = result ? "Authentication successful" : r.data.errors.join(",");
    const code = result
      ? LoginResult.AUTH_SUCCESSFUL_2FA
      : message ===
        "The two-step verification value could not be confirmed. Please try again"
      ? LoginResult.INCORRECT_2FA_CODE
      : LoginResult.UNKNOWN_ERROR;
    return new LoginResult(result, code, message as string);
  });
}

/**
 * Obtain the token used to authenticate the user to the platform.
 */
export async function getF95Token(): Promise<string> {
  // Fetch the response of the platform
  const response = await fetchGETResponse(urls.F95_LOGIN_URL);

  if (response.isSuccess()) {
    // The response is a HTML page, we need to find the <input> with name "_xfToken"
    const $ = cheerio.load(response.value.data as string);
    return $("body").find(GENERIC.GET_REQUEST_TOKEN).attr("value");
  } else throw response.value;
}

//#region Utility methods

/**
 * Performs a GET request to a specific URL and returns the response.
 */
export async function fetchGETResponse(
  url: string
): Promise<Result<GenericAxiosError, AxiosResponse<any>>> {
  // Secure the URL
  const secureURL = enforceHttpsUrl(url);

  try {
    // Fetch and return the response
    commonConfig.jar = shared.session.cookieJar;
    const response = await axios.get(secureURL, commonConfig);
    return success(response);
  } catch (e) {
    shared.logger.error(
      `(GET) Error ${e.message} occurred while trying to fetch ${secureURL}`
    );
    const genericError = new GenericAxiosError({
      id: 1,
      message: `(GET) Error ${e.message} occurred while trying to fetch ${secureURL}`,
      error: e
    });
    return failure(genericError);
  }
}

/**
 * Performs a POST request through axios.
 * @param url URL to request
 * @param params List of value pairs to send with the request
 * @param force If `true`, the request ignores the sending of cookies already present on the device.
 */
export async function fetchPOSTResponse(
  url: string,
  params: { [s: string]: string },
  force = false
): Promise<Result<GenericAxiosError, AxiosResponse<any>>> {
  // Secure the URL
  const secureURL = enforceHttpsUrl(url);

  // Prepare the parameters for the POST request
  const urlParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) urlParams.append(key, value);

  // Shallow copy of the common configuration object
  commonConfig.jar = shared.session.cookieJar;
  const config = Object.assign({}, commonConfig);

  // Remove the cookies if forced
  if (force) delete config.jar;

  // Send the POST request and await the response
  try {
    const response = await axios.post(secureURL, urlParams, config);
    return success(response);
  } catch (e) {
    shared.logger.error(
      `(POST) Error ${e.message} occurred while trying to fetch ${secureURL}`
    );
    const genericError = new GenericAxiosError({
      id: 3,
      message: `(POST) Error ${e.message} occurred while trying to fetch ${secureURL}`,
      error: e
    });
    return failure(genericError);
  }
}

/**
 * Enforces the scheme of the URL is https and returns the new URL.
 */
export function enforceHttpsUrl(url: string): string {
  if (isStringAValidURL(url)) return url.replace(/^(https?:)?\/\//, "https://");
  else throw new Error(`${url} is not a valid URL`);
}

/**
 * Check if the url belongs to the domain of the F95 platform.
 */
export function isF95URL(url: string): boolean {
  return url.toString().startsWith(urls.F95_BASE_URL);
}

/**
 * Checks if the string passed by parameter has a
 * properly formatted and valid path to a URL (HTTP/HTTPS).
 */
export function isStringAValidURL(url: string): boolean {
  // Many thanks to Daveo at StackOverflow (https://preview.tinyurl.com/y2f2e2pc)
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
  const regex = new RegExp(expression);
  return url.match(regex).length > 0;
}

/**
 * Check if a particular URL is valid and reachable on the web.
 * @param {string} url URL to check
 * @param {boolean} [checkRedirect]
 * If true, the function will consider redirects a violation and return false.
 * Default: false
 * @returns {Promise<Boolean>} true if the URL exists, false otherwise
 */
export async function urlExists(
  url: string,
  checkRedirect: boolean = false
): Promise<boolean> {
  // Local variables
  let valid = false;

  if (isStringAValidURL(url)) {
    valid = await axiosUrlExists(url);

    if (valid && checkRedirect) {
      const redirectUrl = await getUrlRedirect(url);
      valid = redirectUrl === url;
    }
  }

  return valid;
}

/**
 * Check if the URL has a redirect to another page.
 * @param {String} url URL to check for redirect
 * @returns {Promise<String>} Redirect URL or the passed URL
 */
export async function getUrlRedirect(url: string): Promise<string> {
  const response = await axios.head(url);
  return response.config.url;
}

//#endregion Utility methods

//#region Private methods

/**
 * Check with Axios if a URL exists.
 */
async function axiosUrlExists(url: string): Promise<boolean> {
  // Local variables
  const ERROR_CODES = ["ENOTFOUND", "ETIMEDOUT"];
  let valid = false;

  try {
    const response = await axios.head(url, {
      timeout: 3000
    });
    valid = response && !/4\d\d/.test(response.status.toString());
  } catch (error) {
    // Throw error only if the error is unknown
    if (!ERROR_CODES.includes(error.code)) throw error;
  }

  return valid;
}

/**
 * Manages the response obtained from the server after requesting authentication.
 */
function manageLoginPOSTResponse(response: AxiosResponse<any>) {
  // Parse the response HTML
  const $ = cheerio.load(response.data as string);

  // Check if 2 factor authentication is required
  if (response.config.url.startsWith(urls.F95_2FA_LOGIN)) {
    return new LoginResult(
      false,
      LoginResult.REQUIRE_2FA,
      "Two-factor authentication is needed to continue"
    );
  }

  // Get the error message (if any) and remove the new line chars
  const errorMessage = $("body")
    .find(GENERIC.LOGIN_MESSAGE_ERROR)
    .text()
    .replace(/\n/g, "");

  // Return the result of the authentication
  const result = errorMessage.trim() === "";
  const message = result ? "Authentication successful" : errorMessage;
  const code = result
    ? LoginResult.AUTH_SUCCESSFUL
    : message === "Incorrect password. Please try again."
    ? LoginResult.INCORRECT_CREDENTIALS
    : LoginResult.UNKNOWN_ERROR;
  return new LoginResult(result, code, message);
}

//#endregion
