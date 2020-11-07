/* 
to use this example, create an .env file 
in the project root with the following values:

F95_USERNAME = YOUR_USERNAME
F95_PASSWORD = YOUR_PASSWORD
*/

"use strict";

// Public modules from npm
const dotenv = require("dotenv");

// Modules from file
const F95API = require("./index.js");

// Configure the .env reader
dotenv.config();

main();

async function main() {
    // Local variables
    const gameList = [
        "kingdom of deception",
        "perverted education",
        "corrupted kingdoms",
        "summertime saga",
        "brothel king"
    ];

    // Log in the platform
    console.log("Authenticating...");
    const result = await F95API.login(process.env.F95_USERNAME, process.env.F95_PASSWORD);
    console.log(`Authentication result: ${result.message}`);

    // Get user data
    console.log("Fetching user data...");
    const userdata = await F95API.getUserData();
    console.log(`${userdata.username} follows ${userdata.watchedThreads.length} threads`);

    for(const gamename of gameList) {
        console.log(`Searching '${gamename}'...`);
        const found = await F95API.getGameData(gamename, false);

        // If no game is found
        if (found.length === 0) {
            console.log(`No data found for '${gamename}'`);
            continue;
        }

        // Extract first game
        const gamedata = found[0];
        console.log(`Found ${gamedata.name} (${gamedata.version}, ID ${gamedata.id}) by ${gamedata.author}`);
    }
}
