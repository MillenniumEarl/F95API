"use strict";

// Modules from files
import fetchHandiworkURLs from "./fetch-handiwork.js";
import fetchLatestHandiworkURLs from "./fetch-latest.js";
import fetchThreadHandiworkURLs from "./fetch-thread.js";
import HandiworkSearchQuery from "../classes/query/handiwork-search-query.js";
import LatestSearchQuery from "../classes/query/latest-search-query.js";
import ThreadSearchQuery from "../classes/query/thread-search-query.js";

//#region Public methods
export default async function executeQuery(query: LatestSearchQuery, limit: number): Promise<string[]>

export default async function executeQuery(query: ThreadSearchQuery, limit: number): Promise<string[]>

export default async function executeQuery(query: HandiworkSearchQuery, limit: number): Promise<string[]>

/**
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
export default async function executeQuery(query: any, limit: number = 30): Promise<string[]> {
    // Local variables
    const searchMap = {
        "latest": fetchLatestHandiworkURLs,
        "thread": fetchThreadHandiworkURLs,
        "handiwork": fetchHandiworkURLs,
    }

    // Find the key for the mapping dict
    const key = query instanceof LatestSearchQuery ?
        "latest" :
        (query instanceof ThreadSearchQuery ?
            "thread" :
            "handiwork");

    // Fetch and return the urls
    return await searchMap[key](query, limit);
}
//#endregion