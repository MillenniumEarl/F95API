"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");

// Modules from file
const Credentials = require("../../app/scripts/classes/credentials.js");
const networkHelper = require("../../app/scripts/network-helper.js");
const {
    F95_SEARCH_URL
} = require("../../app/scripts/constants/url.js");

// Configure the .env reader
dotenv.config();

// Global variables
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;
const FAKE_USERNAME = "Fake_Username091276";
const FAKE_PASSWORD = "fake_password";

module.exports.suite = function suite() {
    // Global suite variables
    const gameURL = "https://f95zone.to/threads/perverted-education-v0-9601-april-ryan.1854/";
    
    it("Check if URL exists", async function checkURLExistence() {
        // Check generic URLs...
        let exists = await networkHelper.urlExists("https://www.google.com/");
        expect(exists, "Complete valid URL").to.be.true;

        exists = await networkHelper.urlExists("www.google.com");
        expect(exists, "URl without protocol prefix").to.be.false;

        exists = await networkHelper.urlExists("https://www.google/");
        expect(exists, "URL without third level domain").to.be.false;

        // Now check for more specific URLs (with redirect)...
        exists = await networkHelper.urlExists(gameURL);
        expect(exists, "URL with redirect without check").to.be.true;

        exists = await networkHelper.urlExists(gameURL, true);
        expect(exists, "URL with redirect with check").to.be.false;
    });

    it("Check if URL belong to the platform", function checkIfURLIsF95() {
        let belong = networkHelper.isF95URL(gameURL);
        expect(belong).to.be.true;

        belong = networkHelper.isF95URL("https://www.google/");
        expect(belong).to.be.false;
    });

    it("Enforce secure URLs", function testSecureURLEnforcement() {
        // This URL is already secure, should remain the same
        let enforced = networkHelper.enforceHttpsUrl(gameURL);
        expect(enforced).to.be.equal(gameURL, "The game URL is already secure");

        // This URL is not secure
        enforced = networkHelper.enforceHttpsUrl("http://www.google.com");
        expect(enforced).to.be.equal("https://www.google.com", "The URL was without SSL/TLS (HTTPs)");

        // Finally, we check when we pass a invalid URL
        enforced = networkHelper.enforceHttpsUrl("http://invalidurl");
        expect(enforced).to.be.null;
    });

    it("Check URL redirect", async function checkURLRedirect() {
        // gameURL is an old URL it has been verified that it generates a redirect
        const redirectURL = await networkHelper.getUrlRedirect(gameURL);
        expect(redirectURL).to.not.be.equal(gameURL, "The original URL has redirect");

        // If we recheck the new URL, we find that no redirect happens
        const secondRedirectURL = await networkHelper.getUrlRedirect(redirectURL);
        expect(secondRedirectURL).to.be.equal(redirectURL, "The URL has no redirect");
    });

    it("Check response to GET request", async function testGETResponse() {
        // We should be able to fetch a game page
        let response = await networkHelper.fetchGETResponse(gameURL);
        expect(response.status).to.be.equal(200, "The operation must be successful");

        // We should NOT be able to fetch the search page (we must be logged)
        response = await networkHelper.fetchGETResponse(F95_SEARCH_URL);
        expect(response).to.be.null;
    });

    it("Test for authentication to platform", async function testAuthentication() {
        // Try to authenticate with valid credentials
        const creds = new Credentials(USERNAME, PASSWORD);
        await creds.fetchToken();
        const validResult = await networkHelper.authenticate(creds);
        expect(validResult.success).to.be.true;

        // Now we use fake credentials
        const fakeCreds = new Credentials(FAKE_USERNAME, FAKE_PASSWORD);
        await fakeCreds.fetchToken();
        const invalidResult = await networkHelper.authenticate(fakeCreds, true);
        expect(invalidResult.success).to.be.false;
    });

    it("Test fetching HTML", async function testFetchHTML() {
        // This should return the HTML code of the page
        const html = await networkHelper.fetchHTML(gameURL);
        expect(html.startsWith("<!DOCTYPE html>")).to.be.true;
    });
};