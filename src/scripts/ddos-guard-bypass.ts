// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { Cookie } from "tough-cookie";

// Modules from file
import { ERROR_CODE, GenericAxiosError } from "./classes/errors";
import { urls } from "./constants/url";
import shared from "./shared";

/**
 * Allows `agent` to bypass the DDOS Guard protection service (https://ddos-guard.net/)
 */
export default function addDDoSSupport(agent: AxiosInstance): void {
  agent.interceptors.request.use(
    async (config) => {
      // Check if the guard was already bypassed
      const bypassed = await checkIfAlreadyBypassed(config);
      if (!bypassed) {
        // Try to bypass the guard
        const result = await bypass(config.url);

        // Add header and cookies used to bypass DDoS Guard
        config.headers.referer = result.referer;
        result.cookies.map((c) => config.jar.setCookie(c, urls.BASE));
      }

      return config;
    },
    /* c8 ignore start */
    (e) => {
      const message = `"${e.message}" occurred while trying to bypass DDoS Guard`;
      shared.logger.error(message);
      const error = new GenericAxiosError({
        id: ERROR_CODE.INTERCEPTOR_ERROR,
        message: message,
        error: e
      });
      return Promise.reject(error);
    }
    /* c8 ignore stop */
  );
}

/**
 * Connect to the URL protected by DDoS Guard obtaining the
 * bypass cookies and the referer url for the requested `url`
 */
async function bypass(url: string) {
  // Find referer URL and cookies
  const referer = await generateURLforReferer(url);

  // Using the referer url, find the ID of this user for the requested url
  const id = await getDDoSGuardID(referer.url, referer.cookies);

  // Obtains the cookies used to bypass the protection
  const bypassCookies = await getBypassCookies(
    referer.url,
    id,
    referer.cookies
  );

  // Add cookies used for the bypass to the list of cookies of the request
  const cookies = referer.cookies;
  cookies.push(...bypassCookies);

  return {
    referer: referer.url,
    cookies: cookies
  };
}

/**
 * Obtains the top domain for the requested `url` and the response cookies from DDoS Guard
 */
async function generateURLforReferer(url: string) {
  // Start by contacting the request page
  const response = await axios({
    url: url,
    validateStatus: function (status) {
      return [200, 403].includes(status);
    },
    headers: {
      Accept: "text/html",
      "Accept-Language": "en-US",
      Connection: "keep-alive",
      "Sec-Fetch-Dest": "document",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-User": "?1",
      TE: "trailers",
      DNT: "1"
    }
  });

  // Get the response cookies from the request
  const cookies = response.headers["set-cookie"].map((c) => Cookie.parse(c));
  shared.logger.trace("[DDoS Guard] Parsed cookies of first request");

  // Find referer URL
  const endSlice = url.includes("://") ? 3 : 1;
  const domain = url.split("/").slice(0, endSlice).join("/");
  shared.logger.trace(`[DDoS Guard] Extracted domain to refer "${domain}"`);

  return {
    url: domain,
    cookies: cookies
  };
}

/**
 * For the specified `url` obtains the one-time associated ID.
 */
async function getDDoSGuardID(url: string, cookies: Cookie[]) {
  // Contact the company page to get the ID requested
  const response = await axios({
    url: "https://check.ddos-guard.net/check.js",
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      Referer: url,
      Cookie: cookieString(cookies),
      "Sec-Fetch-Dest": "script",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site"
    }
  });

  // Gets the user ID for the search page
  const id = (response.data as string)
    .split(`'/.well-known/ddos-guard/id/`)[1]
    .split(`'`)[0];
  shared.logger.trace(`[DDoS Guard] Retrived id for this URL: "${id}"`);

  return id;
}

/**
 * Obtains cookies that define the agent as "reliable"
 */
async function getBypassCookies(url: string, id: string, cookies: Cookie[]) {
  // Contact the URL generated to obtain cookies needed for protection bypass
  const response = await axios({
    url: new URL(`/.well-known/ddos-guard/id/${id}`, url).toString(),
    headers: {
      Accept: "image/webp,*/*",
      "Accept-Language": "en-US,en;q=0.5",
      "Accept-Encoding": "gzip, deflate",
      "Cache-Control": "no-cache",
      Referer: url,
      Cookie: cookieString(cookies),
      "Sec-Fetch-Dest": "script",
      "Sec-Fetch-Mode": "no-cors",
      "Sec-Fetch-Site": "cross-site"
    }
  });

  shared.logger.trace(`[DDoS Guard] Retrived final cookies from id request`);
  return response.headers["set-cookie"].map((c) => Cookie.parse(c));
}

/**
 * COnvert an array of cookies into a string.
 */
function cookieString(cookies: Cookie[]) {
  return cookies.map((c) => c.cookieString()).join(" ");
}

/**
 * Check if a request already contains cookies used to bypass DDoS Guard protection.
 * @param config Configuration of the request
 */
async function checkIfAlreadyBypassed(config: AxiosRequestConfig) {
  // Constant used to determine if the agent has already
  // done at least one connection to bypass the DDoS Guard
  const BYPASS_STRING = "DDOS_GUARD_BYPASSED";

  // Check the cookies, if present
  if (!config[BYPASS_STRING]) {
    // Get all cookies referred to f95zone.to domain
    const cookies = await config.jar.getCookies(urls.BASE);

    // Get the DDoS cookies
    const ddgCookies = cookies.filter((c) => c.key.startsWith("__ddg"));

    // Check if the cookies are expired
    const expired = (cookie: Cookie) => cookie.TTL() === 0;
    const invalid = ddgCookies.some(expired);

    // Set the bypass string if all the cookies are valid
    if (!invalid && ddgCookies.length > 0) config[BYPASS_STRING] = true;
  }

  return config[BYPASS_STRING] ?? false;
}
