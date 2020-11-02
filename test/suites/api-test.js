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

    it("Test login", async function testLogin() {
        const result = await F95API.login(USERNAME, PASSWORD);
        expect(result.success).to.be.true;
        expect(F95API.isLogged()).to.be.true;
    });

    it("Test user data fetching", async function testUserDataFetch() {
        const userdata = await F95API.getUserData();
        expect(userdata.username).to.be.equal(USERNAME);
    });

    it("Test game update checking", async function testGameUpdateCheck() {
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
};