"use strict";

import { fetchLatest } from "./scripts/latest-fetch";
import SearchQuery from "./scripts/classes/search-query";


async function test() {
    const query = new SearchQuery();
    const urls = await fetchLatest(query, 5);
}

test();