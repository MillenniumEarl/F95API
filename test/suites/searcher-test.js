"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");

// Modules from file
const Credentials = require("../../app/scripts/classes/credentials.js");
const searcher = require("../../app/scripts/searcher.js");
const {
    authenticate
} = require("../../app/scripts/network-helper.js");

// Configure the .env reader
dotenv.config();

// Global variables
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;

module.exports.suite = function suite() {
    // TODO: 
    // This method should delete the store F95Zone cookies, 
    // but what if the other tests require them?
    
    // it("Search game when not logged", async function searchGameWhenNotLogged() {
    //     // Search for a game that we know has only one result
    //     // but without logging in first
    //     const urls = await searcher.searchGame("kingdom of deception");
    //     expect(urls.lenght).to.be.equal(0, "There should not be any URL");
    // });

    it("Search game", async function searchGame() {
        // Authenticate
        const result = await auth();
        expect(result.success, "Authentication should be successful").to.be.true;

        // Search for a game that we know has only one result
        const urls = await searcher.searchGame("kingdom of deception");
        expect(urls.length).to.be.equal(1, `There should be only one game result instead of ${urls.length}`);
    });

    it("Search mod", async function searchMod() {
        // Authenticate
        const result = await auth();
        expect(result.success, "Authentication should be successful").to.be.true;

        // Search for a mod that we know has only one result
        const urls = await searcher.searchMod("kingdom of deception jdmod");
        expect(urls.length).to.be.equal(1, `There should be only one mod result instead of ${urls.length}`);
    });
};

//#region Private methods
/**
 * @private
 * Simple wrapper for authentication.
 */
async function auth() {
    const creds = new Credentials(USERNAME, PASSWORD);
    await creds.fetchToken();
    return await authenticate(creds);
}
//#endregion Private methods