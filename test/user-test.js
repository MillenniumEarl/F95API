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

// Login
auth().then(async function searchGames(result) {
    if(!result) return;

    // Search for Kingdom Of Deception data
    await search("kingdom of deception");

    // Search for Perverted Education data
    await search("perverted education");

    // Search for Corrupted Kingdoms data
    await search("corrupted kingdoms");

    // Search for Summertime Saga data
    await search("summertime saga");
});

async function auth() {
    console.log("Token fetch...");
    const creds = new Credentials(process.env.F95_USERNAME, process.env.F95_PASSWORD);
    await creds.fetchToken();
    console.log(`Token obtained: ${creds.token}`);

    console.log("Authenticating...");
    const result = await networkHelper.autenticate(creds);
    console.log(`Authentication result: ${result.message}`);
    
    return result.success;
}

async function search(gamename) {
    console.log(`Searching '${gamename}'...`);
    const urls = await searcher.searchGame(gamename);
    console.log(`Found: ${urls}`);

    console.log("Scraping data...");
    for (const url of urls) {
        const gamedata = await scraper.getGameInfo(url);
        console.log(`Found ${gamedata.name} (${gamedata.version}) by ${gamedata.author}`);
    }
    console.log("Scraping completed!");
}
