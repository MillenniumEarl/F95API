// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public imports from npm
import axiosCookieJarSupport from "axios-cookiejar-support";
import { setup } from "axios-cache-adapter";
import { AxiosInstance } from "axios";

export default async function configure(): Promise<AxiosInstance> {
  const agent = setup({
    // `axios` options
    baseURL: "http://f95zone.to",

    // `axios-cache-adapter` options
    cache: {
      limit: 1500,
      // Keep cache for at most 15 minutes
      maxAge: 15 * 60 * 1000,
      exclude: {
        // Only exclude PUT, PATCH and DELETE methods from cache
        methods: ["put", "patch", "delete"],
        query: false
      }
    }
  });

  // Configure axios to use the cookie jar
  axiosCookieJarSupport(agent);

  return agent;
}
