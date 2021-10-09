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

// Public modules from npm
import inquirer from "inquirer";
import dotenv from "dotenv";
import { CaptchaHarvest } from "@millenniumearl/recaptcha-harvester";

// Modules from file
import {
  login,
  UserProfile,
  getLatestUpdates,
  LatestSearchQuery,
  Game,
  searchHandiwork,
  HandiworkSearchQuery,
  logout
} from "./index";

// Configure the .env reader
dotenv.config();

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

async function retrieveCaptchaToken(): Promise<string> {
  // Local variables
  const website = "https://f95zone.to";
  const sitekey = "6LcwQ5kUAAAAAAI-_CXQtlnhdMjmFDt-MruZ2gov";

  // Start the harvester
  console.log("CAPTCHA token required...");
  const harvester = new CaptchaHarvest();
  await harvester.start("reCAPTCHAv2");

  // Fetch token
  try {
    const token = await harvester.getCaptchaToken(website, sitekey);
    console.log("CAPTCHA token retrived successfully");
    return token.token;
  } catch (e) {
    console.log(`Error while retrieving CAPTCHA token:\n${e}`);
    return retrieveCaptchaToken();
  } finally {
    // Stop harvester
    harvester.stop();
  }
}

/**
 * Authenticate on the platform.
 */
async function authenticate(): Promise<boolean> {
  // Log in the platform
  console.log("Authenticating...");
  const result = await login(
    process.env.F95_USERNAME as string,
    process.env.F95_PASSWORD as string,
    retrieveCaptchaToken,
    insert2faCode
  );
  console.log(`Authentication result: ${result.message}\n`);

  return result.success;
}

/**
 * Fetch and show data of the current logger user.
 */
async function fetchUserData(): Promise<void> {
  console.log("Fetching user data...");

  // Fetch basic data + all the "extended" data of this logged user
  const userdata = new UserProfile();
  await userdata.fetch(true); // Using "true" is quicker than load all the properties separately

  // Assign the properties to local constants
  // to avoid use "await property" every time
  const watchedThreads = await userdata.watched;
  const alerts = await userdata.alerts;
  const bookmarks = await userdata.bookmarks;
  const conversations = await userdata.conversations;

  // Do some queries on the properties
  const gameThreads = watchedThreads.filter((e) => e.forum === "Games");
  const unreadGameThreads = gameThreads.filter((e) => e.unread).length;
  const unreadAlerts = alerts.filter((i) => !i.read).length;
  const unreadConversations = conversations.filter((i) => i.unread).length;

  console.log(`User: ${userdata.name}\n`);
  console.log(`Threads followed: ${watchedThreads.length}`);
  console.log(`Games followed: ${gameThreads.length}`);
  console.log(`Unread game threads: ${unreadGameThreads}`);
  console.log(`Number of bookmarks: ${bookmarks.length}`);
  console.log(`Unread alerts: ${unreadAlerts}`);
  console.log(`Unread conversations: ${unreadConversations}\n`);
}

/**
 * Fetch the data of the latest `3D game` updated.
 */
async function fetchLatestGameInfo(): Promise<void> {
  const latestQuery: LatestSearchQuery = new LatestSearchQuery();
  latestQuery.category = "games";
  latestQuery.includedTags = ["3d game"];

  const latestUpdates = await getLatestUpdates<Game>(latestQuery, Game, 1);

  if (latestUpdates.length !== 0) {
    const gamename = latestUpdates[0].name;
    const tags = latestQuery.includedTags.join();

    console.log(
      `"${gamename}" was the last "${tags}" tagged game to be updated\n`
    );
  } else console.log("No game found with the specified tags");
}

/**
 * Fetch data of the games given theirs names.
 */
async function fetchGameData(games: string[]): Promise<void> {
  for (const gamename of games) {
    console.log(`Searching '${gamename}'...`);

    // Prepare the query
    const query: HandiworkSearchQuery = new HandiworkSearchQuery();
    query.category = "games";
    query.keywords = gamename;
    query.order = "likes"; // Find the most popular games

    // Fetch the first result
    const searchResult = await searchHandiwork<Game>(query, Game, 1);

    if (searchResult.length !== 0) {
      // Extract first game
      const gamedata = searchResult[0];
      const authors = gamedata.authors.map((a) => a.name).join(", ");
      console.log(
        `Found: ${gamedata.name} (${gamedata.version}) by ${authors}\n`
      );
    } else console.log(`No data found for '${gamename}'\n`);
  }
}

async function main() {
  if (await authenticate()) {
    // Fetch and log user data
    await fetchUserData();

    // Get latest `3D GAME` game updated
    await fetchLatestGameInfo();

    // Get game data
    const gameList = ["City of broken dreamers", "Seeds of chaos", "MIST"];
    await fetchGameData(gameList);

    await logout();
  } else console.log("Failed authentication, impossible to continue");
}

main();
