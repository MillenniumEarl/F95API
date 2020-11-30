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
        "Four Elements Trainer",
        "corrupted kingdoms",
        "summertime saga"
    ];

    // Log in the platform
    console.log("Authenticating...");
    const result = await F95API.login(process.env.F95_USERNAME, process.env.F95_PASSWORD);
    console.log(`Authentication result: ${result.message}\n`);

    // Get user data
    console.log("Fetching user data...");
    const userdata = await F95API.getUserData();
    console.log(`${userdata.username} follows ${userdata.watchedGameThreads.length} threads\n`);

    // Get latest game update
    const latestUpdates = await F95API.getLatestUpdates({
        tags: ["3d game"]
    }, 1);
    console.log(`"${latestUpdates[0].name}" was the last "3d game" tagged game to be updated\n`);

    // Get game data
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
        console.log(`Found: ${gamedata.name} (${gamedata.version}) by ${gamedata.author}\n`);
    }
}
