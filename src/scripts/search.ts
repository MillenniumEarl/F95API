"use strict";

// Modules from file
import { IBasic } from "./interfaces.js";
import HandiworkSearchQuery from "./classes/query/handiwork-search-query.js";
import LatestSearchQuery from "./classes/query/latest-search-query.js";
import ThreadSearchQuery from "./classes/query/thread-search-query.js";
import { getPostInformation } from "./scrape-data/scrape-thread.js";
import executeQuery from "./fetch-data/fetch-query.js";

export async function search<T extends IBasic>(query: LatestSearchQuery, limit: number): Promise<T[]>

export async function search<T extends IBasic>(query: HandiworkSearchQuery, limit: number): Promise<T[]>

export async function search<T extends IBasic>(query: ThreadSearchQuery, limit: number): Promise<T[]>

/**
 * Gets the handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 */
export default async function search<T extends IBasic>(query: any, limit: number = 30): Promise<T[]> {
    // Fetch the URLs
    const urls: string[] = await executeQuery(query, limit);

    // Fetch the data
    const results = urls.map((url, idx) => {
        return getPostInformation<T>(url);
    });

    return Promise.all(results);
}
