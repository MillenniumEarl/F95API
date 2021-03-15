// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/* eslint-disable no-console */
/* istanbul ignore file */

/*
to use this example, create an .env file
in the project root with the following values:

F95_USERNAME = YOUR_USERNAME
F95_PASSWORD = YOUR_PASSWORD
*/

"use strict";

// Public modules from npm
import inquirer from "inquirer";
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
} from "./index";

// Configure the .env reader
dotenv.config();

main();

/**
 * Ask the user to enter the OTP code
 * necessary to authenticate on the server.
 */
async function insert2faCode(): Promise<number> {
  const questions = [
    {
      type: "input",
      name: "code",
      message: "Insert 2FA code:"
    }
  ];

  // Prompt the user to insert the code
  const answers = await inquirer.prompt(questions);
  return answers.code as number;
}

async function main() {
  // Local variables
  const gameList = ["City of broken dreamers", "Seeds of chaos", "MIST"];

  // Log in the platform
  console.log("Authenticating...");
  const result = await login(process.env.F95_USERNAME, process.env.F95_PASSWORD, insert2faCode);
  console.log(`Authentication result: ${result.message}\n`);

  // Manage failed login
  if (!result.success) {
    console.log("Failed authentication, impossible to continue");
    return;
  }

  // Get user data
  console.log("Fetching user data...");
  const userdata = await getUserData();
  const gameThreads = userdata.watched.filter((e) => e.forum === "Games").length;
  console.log(
    `${userdata.name} follows ${userdata.watched.length} threads of which ${gameThreads} are games\n`
  );

  // Get latest game update
  const latestQuery: LatestSearchQuery = new LatestSearchQuery();
  latestQuery.category = "games";
  latestQuery.includedTags = ["3d game"];

  const latestUpdates = await getLatestUpdates<Game>(latestQuery, 1);
  console.log(`"${latestUpdates.shift().name}" was the last "3d game" tagged game to be updated\n`);

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
    if (searchResult.length !== 0) {
      // Extract first game
      const gamedata = searchResult.shift();
      const authors = gamedata.authors.map((a, idx) => a.name).join(", ");
      console.log(`Found: ${gamedata.name} (${gamedata.version}) by ${authors}\n`);
    } else console.log(`No data found for '${gamename}'\n`);
  }
}
