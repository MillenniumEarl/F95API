// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse
} from "axios";
import { wrapper } from "axios-cookiejar-support";
import cheerio from "cheerio";
import { Semaphore } from "await-semaphore";

// Modules from file
import shared from "./shared";
import { urls } from "./constants/url";
import { GENERIC } from "./constants/css-selector";
import LoginResult from "./classes/login-result";
import { failure, Result, success } from "./classes/result";
import {
  ERROR_CODE,
  GenericAxiosError,
  InvalidF95Token,
  UnexpectedResponseContentType
} from "./classes/errors";
import Credentials from "./classes/credentials";

// Types
type TLookupMapCode = {
  code: number;
  message: string;
};

type TProvider = "auto" | "totp" | "email";

// Global variables
const MAX_CONCURRENT_REQUESTS = 15;
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) " +
  "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Safari/605.1.15";
const AUTH_SUCCESSFUL_MESSAGE = "Authentication successful";
const INVALID_2FA_CODE_MESSAGE =
  "The two-step verification value could not be confirmed. Please try again";
const INCORRECT_CREDENTIALS_MESSAGE = "Incorrect password. Please try again.";
const REQUIRE_CAPTCHA_VERIFICATION =
  "You did not complete the CAPTCHA verification properly. Please try again.";

/**
 * Common configuration used to send request via Axios.
 */
const commonConfig: AxiosRequestConfig = {
  /**
   * Headers to add to the request.
   */
  headers: {
    "User-Agent": USER_AGENT,
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
  },
  timeout: 30000,
  /**
   * Explicit the HTTP adapter otherwise on Electron the XHR adapter
   * is used which is not supported by `axios-cookiejar-support`
   */
  adapter: require("axios/lib/adapters/http")
};

// Agent used to send requests
const agent: AxiosInstance = wrapper(axios.create(commonConfig));

// Semaphore used to avoid flooding the platform
const semaphore: Semaphore = new Semaphore(MAX_CONCURRENT_REQUESTS);

/**
 * Gets the HTML code of a page.
 */
export async function fetchHTML(
  url: string
): Promise<Result<GenericAxiosError | UnexpectedResponseContentType, string>> {
  // Secure the URL
  const secureURL = enforceHttpsUrl(url);

  // Fetch the response of the platform
  const response = await fetchGETResponse(secureURL);

  if (response.isSuccess()) {
    // Check if the response is a HTML source code
    const isHTML = response.value.headers["content-type"].includes("text/html");

    const unexpectedResponseError = new UnexpectedResponseContentType({
      id: ERROR_CODE.UNEXPECTED_HTML_RESPONSE,
      message: `Expected HTML but received ${response.value["content-type"]}`,
      error: new Error(
        `Expected HTML but received ${response.value["content-type"]}`
      )
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
 * @param {String} captchaToken reCAPTCHA token returned from Google after the correct interaction with the widget
 * @param {Boolean} force Specifies whether the request should be forced, ignoring any saved cookies
 * @returns {Promise<LoginResult>} Result of the operation
 */
export async function authenticate(
  credentials: Credentials,
  captchaToken?: string
): Promise<LoginResult> {
  shared.logger.info(`Authenticating with user ${credentials.username}`);
  if (!credentials.token)
    throw new InvalidF95Token(`Invalid token for auth: ${credentials.token}`);

  // Secure the URL
  const secureURL = enforceHttpsUrl(urls.LOGIN);

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
    _xfToken: credentials.token,
    "g-recaptcha-response": captchaToken
  };

  // Try to log-in
  let authResult: LoginResult = null;

  // Fetch the response to the login request
  const response = await fetchPOSTResponse(secureURL, params);

  // Parse the response
  const result = response.applyOnSuccess((r) => manageLoginPOSTResponse(r));

  // Manage result
  if (result.isFailure()) {
    const message = `Error ${result.value.message} occurred while authenticating`;
    shared.logger.error(message);
    authResult = new LoginResult(false, LoginResult.UNKNOWN_ERROR, message);
  } else authResult = result.value;
  return authResult;
}

/**
 * Send an OTP code if the login procedure requires it.
 * @param code OTP code.
 * @param token Unique token for the session associated with the credentials in use.
 * @param provider Provider used to generate the access code.
 * @param trustedDevice If the device in use is trusted, 2FA authentication is not required for 30 days.
 */
export async function send2faCode(
  code: number,
  token: string,
  provider: TProvider = "auto",
  trustedDevice: boolean = false
): Promise<Result<GenericAxiosError, LoginResult>> {
  // Prepare the parameters to send via POST request
  const params = {
    _xfRedirect: urls.BASE,
    _xfRequestUri:
      "/login/two-step?_xfRedirect=https%3A%2F%2Ff95zone.to%2F&remember=1",
    _xfResponseType: "json",
    _xfToken: token,
    _xfWithData: "1",
    code: code.toString(),
    confirm: "1",
    provider: provider,
    remember: "1",
    trust: trustedDevice ? "1" : "0"
  };

  // Send 2FA params
  const response = await fetchPOSTResponse(urls.LOGIN_2FA, params);

  // Check if the authentication is valid
  const validAuth = response.applyOnSuccess((r) => manage2faResponse(r));

  if (validAuth.isSuccess() && validAuth.value.isSuccess()) {
    // Valid login
    return success(validAuth.value.value);
  } else if (validAuth.isSuccess() && validAuth.value.isFailure()) {
    // Wrong provider, try with another
    const expectedProvider = validAuth.value.value;
    return await send2faCode(code, token, expectedProvider, trustedDevice);
  } else failure(validAuth.value);
}

/**
 * Obtain the token used to authenticate the user to the platform.
 */
export async function getF95Token(): Promise<string> {
  // Fetch the response of the platform
  const response = await fetchGETResponse(urls.LOGIN);

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
  // Get a token from the semaphore
  const release = await semaphore.acquire();

  try {
    // Fetch and return the response
    const response = await agent.get(url, {
      jar: shared.session.cookieJar
    });
    return success(response);
  } catch (e) {
    const err = `(GET) Error ${e.message} occurred while trying to fetch ${url}`;
    shared.logger.error(err);
    const genericError = new GenericAxiosError({
      id: ERROR_CODE.CANNOT_FETCH_GET_RESPONSE,
      message: err,
      error: e
    });
    return failure(genericError);
  } finally {
    // Release the token
    release();
  }
}

/**
 * Performs a POST request through Axios.
 * @param url URL to request
 * @param params List of value pairs to send with the request
 */
export async function fetchPOSTResponse(
  url: string,
  params: { [s: string]: string }
): Promise<Result<GenericAxiosError, AxiosResponse<any>>> {
  // Prepare the parameters for the POST request
  const urlParams = new URLSearchParams();
  Object.entries(params).map(([key, value]) => urlParams.append(key, value));

  // Get a token from the semaphore
  const release = await semaphore.acquire();

  // Send the POST request and await the response
  try {
    const response = await agent.post(url, urlParams, {
      jar: shared.session.cookieJar
    });
    return success(response);
  } catch (e) {
    const err = `(POST) Error ${e.message} occurred while trying to fetch ${url}`;
    shared.logger.error(err);
    const genericError = new GenericAxiosError({
      id: ERROR_CODE.CANNOT_FETCH_POST_RESPONSE,
      message: err,
      error: e
    });
    return failure(genericError);
  } finally {
    // Release the token
    release();
  }
}

/**
 * Performs a HEAD request to a specific URL and returns the response.
 */
export async function fetchHEADResponse(
  url: string
): Promise<Result<GenericAxiosError, AxiosResponse<any>>> {
  // Get a token from the semaphore
  const release = await semaphore.acquire();

  try {
    const response = await agent.head(url, {
      jar: shared.session.cookieJar
    });
    return success(response);
  } catch (e) {
    const err = `(HEAD) Error ${e.message} occurred while trying to fetch ${url}`;
    shared.logger.error(err);
    const genericError = new GenericAxiosError({
      id: ERROR_CODE.CANNOT_FETCH_HEAD_RESPONSE,
      message: err,
      error: e
    });
    return failure(genericError);
  } finally {
    // Release the token
    release();
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
  return url.startsWith(urls.BASE);
}

/**
 * Checks if the string passed by parameter has a
 * properly formatted and valid path to a URL (HTTP/HTTPS).
 *
 * @author Daveo
 * @see https://preview.tinyurl.com/y2f2e2pc
 */
export function isStringAValidURL(url: string): boolean {
  // Many thanks to Daveo at StackOverflow (https://preview.tinyurl.com/y2f2e2pc)
  const regex =
    /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/;
  return regex.test(url);
}

/**
 * Check if a particular URL is valid and reachable on the web.
 * @param {string} url URL to check
 * @param {boolean} [checkRedirect]
 * If `true`, the function will consider redirects a violation and return `false`.
 * Default: `false`
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
  const response = await fetchHEADResponse(url);

  if (response.isSuccess()) {
    const r = response.value.request;
    const redirect = new URL(r.path, `${r.protocol}//${r.host}`);
    return redirect.toString();
  } else throw response.value;
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

  // Send a HEAD request
  const r = await fetchHEADResponse(url);
  if (r.isSuccess())
    valid = r.value && !/4\d\d/.test(r.value.status.toString());
  else if (
    r.isFailure() &&
    !ERROR_CODES.includes((r.value.error as AxiosError<any>).code)
  )
    throw r.value.error;

  return valid;
}

/**
 * Manages the response obtained from the server after requesting authentication.
 */
function manageLoginPOSTResponse(response: AxiosResponse<any>) {
  // Parse the response HTML
  const $ = cheerio.load(response.data as string);

  // Check if 2 factor authentication is required
  if (response.config.url.startsWith(urls.LOGIN_2FA)) {
    return new LoginResult(
      false,
      LoginResult.REQUIRE_2FA,
      "Two-factor authentication is needed to continue"
    );
  }

  // Get the error message (if any) and remove the new line chars
  let errorMessage = $("body")
    .find(GENERIC.LOGIN_MESSAGE_ERROR)
    .text()
    .replace(/\n/g, "");

  // Check if the user ID is available
  const availableUserID = $("body").find(GENERIC.CURRENT_USER_ID).length !== 0;
  if (!availableUserID && !errorMessage)
    errorMessage = "Successful request but user not logged in";

  // Return the result of the authentication
  const result = errorMessage.trim() === "" && availableUserID;
  const message = result ? AUTH_SUCCESSFUL_MESSAGE : errorMessage;
  const code = messageToCode(message);
  return new LoginResult(result, code, message);
}

/**
 * Given the login message response of the
 * platform, return the login result code.
 */
function messageToCode(message: string): number {
  // Prepare the lookup dict
  const mapDict: TLookupMapCode[] = [
    {
      code: LoginResult.AUTH_SUCCESSFUL,
      message: AUTH_SUCCESSFUL_MESSAGE
    },
    {
      code: LoginResult.INCORRECT_CREDENTIALS,
      message: INCORRECT_CREDENTIALS_MESSAGE
    },
    {
      code: LoginResult.INCORRECT_2FA_CODE,
      message: INVALID_2FA_CODE_MESSAGE
    },
    {
      code: LoginResult.REQUIRE_CAPTCHA,
      message: REQUIRE_CAPTCHA_VERIFICATION
    }
  ];

  const result = mapDict.find((e) => e.message === message);
  return result ? result.code : LoginResult.UNKNOWN_ERROR;
}

/**
 * Manage the response given by the platform when the 2FA is required.
 */
function manage2faResponse(
  r: AxiosResponse<any>
): Result<TProvider, LoginResult> {
  // The html property exists only if the provider is wrong
  const rightProvider = !("html" in r.data);

  // Wrong provider!
  if (!rightProvider) {
    const $ = cheerio.load(r.data.html.content);
    const expectedProvider = $(GENERIC.EXPECTED_2FA_PROVIDER).attr("value");
    return failure(expectedProvider as TProvider);
  }

  // r.data.status is 'ok' if the authentication is successful
  const result = r.data.status === "ok";
  const message: string = result
    ? AUTH_SUCCESSFUL_MESSAGE
    : r.data.errors.join(",");
  const loginCode = messageToCode(message);
  return success(new LoginResult(result, loginCode, message));
}

//#endregion
