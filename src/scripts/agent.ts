// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { version } from "../../package.json";

// Local modules
import addDDoSSupport from "./ddos-guard-bypass";
import shared from "./shared";

// Public modules from npm
import axios, { AxiosRequestConfig, AxiosInstance } from "axios";
import axiosRetry from "axios-retry";
import { wrapper as addCookieJarSupport } from "axios-cookiejar-support";

/**
 * Explicit the HTTP adapter otherwise on Electron the XHR adapter
 * is used which is not supported by `axios-cookiejar-support`
 *
 * From v1.0, the adapters are not exposed to API, waiting for patch...
 */
axios.defaults.adapter = "http";

/**
 * User agent string used to describe this API.
 */
const USER_AGENT = `Mozilla/5.0 (compatible; F95API/${version}; MillenniumEarl@f95zone; https://github.com/MillenniumEarl/F95API)`;

/**
 * Common configuration used to send request via Axios.
 */
const commonConfig: AxiosRequestConfig = {
  /**
   * Headers to add to the request.
   */
  headers: {
    "User-Agent": USER_AGENT,
    Connection: "keep-alive",
    "Upgrade-Insecure-Requests": "1"
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
  timeout: 30000
};

/**
 * Create a custom Axios agent already configurated.
 */
export default function createAxiosAgent(): AxiosInstance {
  // Create the agent with the custom configuration
  let agent: AxiosInstance = axios.create(commonConfig);

  // Add support for cookies with tough-cookies
  agent = addCookieJarSupport(agent);

  // Add support to bypass DDoS guard
  addDDoSSupport(agent);

  // Enable Axios to retry a request in case of errors
  axiosRetry(agent, {
    retryDelay: axiosRetry.exponentialDelay, // Use exponential back-off retry delay
    shouldResetTimeout: true // Timer resets after every retry
  });

  return agent;
}
