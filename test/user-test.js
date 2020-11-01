"use strict";

// Public modules from npm
const dotenv = require("dotenv");

// Modules from file
const searcher = require("../app/scripts/searcher.js");
const scraper = require("../app/scripts/scraper.js");
const Credentials = require("../app/scripts/classes/credentials.js");
const networkHelper = require("../app/scripts/network-helper.js");

// Configure the .env reader
dotenv.config();

// Search for Kingdom Of Deception data
searchKOD();

async function searchKOD() {
    console.log("Token fetch...");
    const creds = new Credentials(process.env.F95_USERNAME, process.env.F95_PASSWORD);
    await creds.fetchToken();
    console.log(`Token obtained: ${creds.token}`);

    const html = await networkHelper.fetchHTMLWithAuth("https://f95zone.to/login/login", creds);
    console.log(html);

    console.log("Searching KOD...");
    const urls = await searcher.searchGame("kingdom of deception", creds);
    console.log(`Found: ${urls}`);

    console.log("Scraping data...");
    for (const url of urls) {
        const gamedata = await scraper.getGameInfo(url);
        console.log(gamedata);
    }
    console.log("Scraping completed!");
}
