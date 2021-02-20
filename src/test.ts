"use strict";

import { fetchLatest } from "./scripts/latest-fetch.js";
import SearchQuery from "./scripts/classes/search-query.js";


async function test() {
    const query = new SearchQuery();
    const urls = await fetchLatest(query, 5);
}

test();