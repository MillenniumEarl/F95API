"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");

// Modules from file
const Credentials = require("../../app/scripts/classes/credentials.js");
const uScraper = require("../../app/scripts/user-scraper.js");
const { authenticate } = require("../../app/scripts/network-helper.js");
const { fetchPlatformData } = require("../../app/scripts/platform-data.js");

// Configure the .env reader
dotenv.config();

// Global variables
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;

module.exports.suite = function suite() {
    // TODO: 
    // This method should delete the store F95Zone cookies, 
    // but what if the other tests require them?

    // it("Fetch data when not logged", async function fetchUserDataWhenLogged() {
    //     const data = await uScraper.getUserData();
    //     expect(data.username).to.be.equal("");
    //     expect(data.avatarSrc).to.be.equal("");
    //     expect(data.watchedThreads.length).to.be.equal(0);
    // });

    it("Fetch data when logged", async function fetchUserDataWhenNotLogged() {
        // Authenticate
        const result = await auth();
        expect(result.success, "Authentication should be successful").to.be.true;

        // We test only for the username, the other test data depends on the user logged
        const data = await uScraper.getUserData();
        expect(data.username).to.be.equal(USERNAME);
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
    const result = await authenticate(creds);
    if (result.success) await fetchPlatformData();
    return result;
}
//#endregion Private methods