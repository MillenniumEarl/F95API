// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public imports from npm
import axiosCookieJarSupport from "axios-cookiejar-support";
import localforage from "localforage";
import memoryDriver from "localforage-memoryStorageDriver";
import { setup } from "axios-cache-adapter";
import { AxiosInstance } from "axios";

// `async` wrapper to configure `localforage` and instantiate `axios` with `axios-cache-adapter`
export default async function configure(): Promise<AxiosInstance> {
  // Register the custom `memoryDriver` to `localforage`
  await localforage.defineDriver(memoryDriver);

  // Create `localforage` instance
  const forageStore = localforage.createInstance({
    // List of drivers used
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE, memoryDriver._driver],
    // Prefix all storage keys to prevent conflicts
    name: "F95API-cache"
  });

  // Create `axios` instance with pre-configured `axios-cache-adapter` using a `localforage` store
  const agent = setup({
    // `axios` options
    baseURL: "http://f95zone.to",

    // `axios-cache-adapter` options
    cache: {
      // Tell adapter to attempt using response headers
      readHeaders: true,
      store: forageStore, // Pass `localforage` store to `axios-cache-adapter`
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
