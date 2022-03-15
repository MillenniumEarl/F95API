// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import axios, { AxiosInstance } from "axios";
import { Cookie } from "tough-cookie";

// Modules from file
import { ERROR_CODE, GenericAxiosError } from "./classes/errors";
import { urls } from "./constants/url";
import shared from "./shared";

export default function addDDoSSupport(agent: AxiosInstance): void {
  agent.interceptors.request.use(
    async (config) => {
      // Try to bypass the guard
      const result = await bypass(config.url);

      // Add header and cookies used to bypass DDoS Guard
      config.headers.referer = result.referer;
      result.cookies.map((c) => config.jar.setCookie(c, urls.BASE));

      return config;
    },
    (e) => {
      const message = `""${e.message}"" occurred while trying to bypass DDoS Guard`;
      shared.logger.error(message);
      const error = new GenericAxiosError({
        id: ERROR_CODE.INTERCEPTOR_ERROR,
        message: message,
        error: e
      });
      return Promise.reject(error);
    }
  );
}

async function bypass(url: string) {
  // Find referer URL and cookies
  const referer = await generateURLforReferer(url);

  // Using the referer url, find the ID of this user for the requested url
  const id = await getDDosGuardID(referer.url, referer.cookies);

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

async function generateURLforReferer(url: string) {
  // Inizia contattando la pagina richiesta
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

  // Ottieni i cookies di risposta dalla richiesta
  const cookies = response.headers["set-cookie"].map((c) => Cookie.parse(c));
  shared.logger.trace("[DDoS Guard] Parsed cookies of first request");

  // Find referer URL
  const endSlice = url.includes("://") ? 3 : 1;
  const domain = url.split("/").slice(0, endSlice).join("/");
  shared.logger.trace(
    `[DDoS Guard] Generated request url for referer to ddos-guard.net's check.js "${domain}"`
  );

  return {
    url: domain,
    cookies: cookies
  };
}

async function getDDosGuardID(url: string, cookies: Cookie[]) {
  // Contatta la pagina della società per ottenere l'ID richiesto
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

  // Ottiene l'ID dell'utente per la pagina cercata
  const id = response.data
    .split(`'/.well-known/ddos-guard/id/`)[1]
    .split(`'`)[0];
  shared.logger.trace(
    `[DDoS Guard] Retrived id from ddos-guard's check.js "${id}"`
  );

  return id;
}

async function getBypassCookies(url: string, id: number, cookies: Cookie[]) {
  // Contatta l'URL generata per ottenere i cookies necessari per il bypass della protezione
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

  shared.logger.trace(`[DDos Guard] Retrived final cookies from id request`);
  return response.headers["set-cookie"].map((c) => Cookie.parse(c));
}

function cookieString(cookies: Cookie[]) {
  return cookies.map((c) => c.cookieString()).join(" ");
}
