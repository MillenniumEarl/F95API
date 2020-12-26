"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");
const { isEqual } = require("lodash");

// Core modules
const fs = require("fs");

// Modules from file
const shared = require("../../app/scripts/shared.js");
const platform = require("../../app/scripts/platform-data.js");
const Credentials = require("../../app/scripts/classes/credentials.js");
const { authenticate } = require("../../app/scripts/network-helper.js");

// Configure the .env reader
dotenv.config();

// Global variables
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;

module.exports.suite = function suite() {
    //#region Setup
    before(async function beforeAll() {
        // Authenticate
        const creds = new Credentials(USERNAME, PASSWORD);
        await creds.fetchToken();
        await authenticate(creds);
    });
    //#endregion Setup

    it("Fetch new platform data", async function fetchNewPlatformData() {
        // Delete the current platform data (if exists)
        if(fs.existsSync(shared.cachePath)) fs.unlinkSync(shared.cachePath);

        // Fetch data
        await platform.fetchPlatformData();

        // Check data
        const enginesEquality = isEqual({}, shared.engines);
        const statusEquality = isEqual({}, shared.statuses);
        const tagsEquality = isEqual({}, shared.tags);
        expect(enginesEquality, "Should not be empty").to.be.false;
        expect(statusEquality, "Should not be empty").to.be.false;
        expect(tagsEquality, "Should not be empty").to.be.false;

        // Check if the file exists
        expect(fs.existsSync(shared.cachePath)).to.be.true;
    });

    it("Fetch cached platform data", async function fetchCachedPlatformData() {
        // Fetch data
        await platform.fetchPlatformData();

        // Check data
        const enginesEquality = isEqual({}, shared.engines);
        const statusEquality = isEqual({}, shared.statuses);
        const tagsEquality = isEqual({}, shared.tags);
        expect(enginesEquality, "Should not be empty").to.be.false;
        expect(statusEquality, "Should not be empty").to.be.false;
        expect(tagsEquality, "Should not be empty").to.be.false;
    });
};
