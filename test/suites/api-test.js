"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");
const {
    isEqual
} = require("lodash");

// Modules from file
const F95API = require("../../app/index.js");

// Configure the .env reader
dotenv.config();

// Global variables
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;

module.exports.suite = function suite() {
    // Global suite variables
    const gameURL = "https://f95zone.to/threads/perverted-education-v0-9601-april-ryan.1854/";
    const updatedGameURL = "https://f95zone.to/threads/noxian-nights-v1-2-4-hreinn-games.2/";

    it("Test login", async function testLogin() {
        const result = await F95API.login(USERNAME, PASSWORD);
        expect(result.success).to.be.true;
        expect(F95API.isLogged()).to.be.true;
    });

    it("Test user data fetching", async function testUserDataFetch() {
        const userdata = await F95API.getUserData();
        expect(userdata.username).to.be.equal(USERNAME);
    });

    it("Test game for existing update", async function checkUpdateByURL() {
        // We force the creation of a GameInfo object, 
        // knowing that the checkIfGameHasUpdate() function 
        // only needs the game URL
        const info = new F95API.GameInfo();

        // The gameURL identifies a game for which we know there is an update
        info.url = gameURL;

        // Check for updates
        const update = await F95API.checkIfGameHasUpdate(info);
        expect(update).to.be.true;
    });

    it("Test game for non existing update", async function checkUpdateByVersion() {
        // We force the creation of a GameInfo object, 
        // knowing that the checkIfGameHasUpdate() function 
        // only needs the game URL
        const info = new F95API.GameInfo();

        // The updatedGameURL identifies a game for which 
        // we know there is **not** an update
        info.url = updatedGameURL;
        info.version = "1.2.4"; // The hame is marked as "Completed" so it shouldn't change it's version

        // Check for updates
        const update = await F95API.checkIfGameHasUpdate(info);
        expect(update).to.be.false;
    });

    it("Test game for fake update", async function checkFakeUpdateByVersion() {
        // We force the creation of a GameInfo object, 
        // knowing that the checkIfGameHasUpdate() function 
        // only needs the game URL
        const info = new F95API.GameInfo();

        // The updatedGameURL identifies a game for which 
        // we know there is **not** an update
        info.url = updatedGameURL;
        info.version = "ThisIsAFakeVersion"; // The real version is "1.2.4"

        // Check for updates
        const update = await F95API.checkIfGameHasUpdate(info);
        expect(update).to.be.true;
    });

    it("Test game data fetching", async function testGameDataFetch() {
        // Search a game by name
        const gameList = await F95API.getGameData("perverted education", false);

        // We know that there is only one game with the selected name
        expect(gameList.length).to.be.equal(1, `There should be only one game, not ${gameList.length}`);
        const game = gameList[0];

        // Than we fetch a game from URL
        const gameFromURL = await F95API.getGameDataFromURL(game.url);
        
        // The two games must be equal
        const equal = isEqual(game, gameFromURL);
        expect(equal).to.be.true;
    });

    it("Test latest games fetching", async function testLatestFetch() {
        // Prepare a search query
        const query = {
            datelimit: 0,
            tags: ["male protagonist", "3dcg"],
            prefixes: ["Completed", "Unity"],
            sorting: "views",
        };

        // TODO
        // First test the parameters validation
        // assert.throws(() => { F95API.getLatestUpdates(query, 0); }, 
        //     Error, 
        //     "Error thrown if limit is <= 0");

        // Now we fetch certain games that are "stables" as per 2020
        const LIMIT = 3;
        const result = await F95API.getLatestUpdates(query, LIMIT);
        expect(result[0].id).to.be.equal(3691, "The game should be: 'Man of the house'");
        expect(result[1].id).to.be.equal(5483, "The game should be: 'Lucky mark'");
        expect(result[2].id).to.be.equal(5949, "The game should be: 'Timestamps, Unconditional Love'");
    });
};