"use strict";

// Modules from file
const searcher = require("../plain-html/scripts/searcher.js");
const scraper = require("../plain-html/scripts/scraper.js");

// Search for Kingdom Of Deception data
searchKOD();

async function searchKOD() {
    console.log("Searching KOD...");
    const urls = await searcher.searchGame("kingdom of deception");
    console.log(`Found: ${urls}`);

    console.log("Scraping data...");
    for (const url of urls) {
        const gamedata = await scraper.getGameInfo(url);
        console.log(gamedata);
    }
    console.log("Scraping completed!");
}
