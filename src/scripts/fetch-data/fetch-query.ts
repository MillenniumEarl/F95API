"use strict";

// Modules from files
import fetchHandiworkURLs from "./fetch-handiwork.js";
import fetchLatestHandiworkURLs from "./fetch-latest.js";
import fetchThreadHandiworkURLs from "./fetch-thread.js";
import HandiworkSearchQuery from "../classes/query/handiwork-search-query.js";
import LatestSearchQuery from "../classes/query/latest-search-query.js";
import ThreadSearchQuery from "../classes/query/thread-search-query.js";
import { IQuery } from "../interfaces.js";

//#region Public methods

/**
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
export default async function getURLsFromQuery(query: IQuery, limit: number = 30): Promise<string[]> {
    switch (query.itype) {
        case "HandiworkSearchQuery":
            return await fetchHandiworkURLs(query as HandiworkSearchQuery, limit);
        case "LatestSearchQuery":
            return await fetchLatestHandiworkURLs(query as LatestSearchQuery, limit);
        case "ThreadSearchQuery":
            return await fetchThreadHandiworkURLs(query as ThreadSearchQuery, limit);
        default:
            throw Error(`Invalid query type: ${query.itype}`);
    }
}

//#endregion