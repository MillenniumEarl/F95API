"use strict";

import { fetchLatest } from "./scripts/latest-fetch.js";
import SearchQuery from "./scripts/classes/search-query.js";
import { login } from "./index.js";


async function test() {
    const result = await login("MillenniumEarl", "f9vTcRNuvxj4YpK");
    const query = new SearchQuery();
    const urls = await fetchLatest(query, 5);
}

test();