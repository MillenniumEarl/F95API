/*
to use this example, create an .env file
in the project root with the following values:

F95_USERNAME = YOUR_USERNAME
F95_PASSWORD = YOUR_PASSWORD
*/

"use strict";

// Public modules from npm
import dotenv from "dotenv";

// Modules from file
import {
  login,
  getUserData,
  getLatestUpdates,
  LatestSearchQuery,
  Game,
  searchHandiwork,
  HandiworkSearchQuery
} from "./index.js";

// Configure the .env reader
dotenv.config();

main();

async function main() {
  // Local variables
  const gameList = ["City of broken dreamers", "Seeds of chaos", "MIST"];

  // Log in the platform
  console.log("Authenticating...");
  const result = await login(
    process.env.F95_USERNAME,
    process.env.F95_PASSWORD
  );
  console.log(`Authentication result: ${result.message}\n`);

  // Get user data
  console.log("Fetching user data...");
  const userdata = await getUserData();
  const gameThreads = userdata.watched.filter((e) => e.forum === "Games")
    .length;
  console.log(
    `${userdata.name} follows ${userdata.watched.length} threads of which ${gameThreads} are games\n`
  );

  // Get latest game update
  const latestQuery: LatestSearchQuery = new LatestSearchQuery();
  latestQuery.category = "games";
  latestQuery.includedTags = ["3d game"];

  const latestUpdates = await getLatestUpdates<Game>(latestQuery, 1);
  console.log(
    `"${
      latestUpdates.shift().name
    }" was the last "3d game" tagged game to be updated\n`
  );

  // Get game data
  for (const gamename of gameList) {
    console.log(`Searching '${gamename}'...`);

    // Prepare the query
    const query: HandiworkSearchQuery = new HandiworkSearchQuery();
    query.category = "games";
    query.keywords = gamename;
    query.order = "likes"; // To find the most popular games

    // Fetch the first result
    const searchResult = await searchHandiwork<Game>(query, 1);

    // No game found
    if (searchResult.length === 0) {
      console.log(`No data found for '${gamename}'\n`);
      continue;
    }

    // Extract first game
    const gamedata = searchResult.shift();
    const authors = gamedata.authors.map((a, idx) => a.name).join(", ");
    console.log(
      `Found: ${gamedata.name} (${gamedata.version}) by ${authors}\n`
    );
  }
}
