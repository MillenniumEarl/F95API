import { AxiosResponse } from "axios";
import LoginResult from "./classes/login-result.js";
import { Result } from "./classes/result.js";
import { GenericAxiosError, UnexpectedResponseContentType } from "./classes/errors.js";
import Credentials from "./classes/credentials.js";
/**
 * Gets the HTML code of a page.
 */
export declare function fetchHTML(
  url: string
): Promise<Result<GenericAxiosError | UnexpectedResponseContentType, string>>;
/**
 * It authenticates to the platform using the credentials
 * and token obtained previously. Save cookies on your
 * device after authentication.
 * @param {Credentials} credentials Platform access credentials
 * @param {Boolean} force Specifies whether the request should be forced, ignoring any saved cookies
 * @returns {Promise<LoginResult>} Result of the operation
 */
export declare function authenticate(
  credentials: Credentials,
  force?: boolean
): Promise<LoginResult>;
/**
 * Send an OTP code if the login procedure requires it.
 * @param code OTP code.
 * @param token Unique token for the session associated with the credentials in use.
 * @param trustedDevice If the device in use is trusted, 2FA authentication is not required for 30 days.
 */
export declare function send2faCode(
  code: number,
  token: string,
  trustedDevice?: boolean
): Promise<Result<GenericAxiosError, LoginResult>>;
/**
 * Obtain the token used to authenticate the user to the platform.
 */
export declare function getF95Token(): Promise<string>;
/**
 * Performs a GET request to a specific URL and returns the response.
 */
export declare function fetchGETResponse(
  url: string
): Promise<Result<GenericAxiosError, AxiosResponse<any>>>;
/**
 * Performs a POST request through axios.
 * @param url URL to request
 * @param params List of value pairs to send with the request
 * @param force If `true`, the request ignores the sending of cookies already present on the device.
 */
export declare function fetchPOSTResponse(
  url: string,
  params: {
    [s: string]: string;
  },
  force?: boolean
): Promise<Result<GenericAxiosError, AxiosResponse<any>>>;
/**
 * Enforces the scheme of the URL is https and returns the new URL.
 */
export declare function enforceHttpsUrl(url: string): string;
/**
 * Check if the url belongs to the domain of the F95 platform.
 */
export declare function isF95URL(url: string): boolean;
/**
 * Checks if the string passed by parameter has a
 * properly formatted and valid path to a URL (HTTP/HTTPS).
 */
export declare function isStringAValidURL(url: string): boolean;
/**
 * Check if a particular URL is valid and reachable on the web.
 * @param {string} url URL to check
 * @param {boolean} [checkRedirect]
 * If true, the function will consider redirects a violation and return false.
 * Default: false
 * @returns {Promise<Boolean>} true if the URL exists, false otherwise
 */
export declare function urlExists(url: string, checkRedirect?: boolean): Promise<boolean>;
/**
 * Check if the URL has a redirect to another page.
 * @param {String} url URL to check for redirect
 * @returns {Promise<String>} Redirect URL or the passed URL
 */
export declare function getUrlRedirect(url: string): Promise<string>;
