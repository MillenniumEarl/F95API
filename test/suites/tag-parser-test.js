"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");
const { isEqual } = require("lodash");

// Modules from file
const Credentials = require("../../app/scripts/classes/credentials.js");
const TagParser = require("../../app/scripts/classes/tag-parser.js");
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

    it("Fetch tags and parse", async function testTagParser() {
        // Create a new parser
        const tp = new TagParser();
        await tp.fetch();
        
        const dictEquality = isEqual(tp._tagsDict, {});
        expect(dictEquality, "The dictionary should be filled with values").to.be.false;
        
        const testTags = ["corruption", "pregnancy", "slave"];
        const ids = tp.tagsToIDs(testTags);
        const tags = tp.idsToTags(ids);

        const tagsEquality = isEqual(testTags, tags);
        expect(tagsEquality, "The tags must be the same").to.be.true;
        const idsEquality = isEqual([44, 103, 225], ids);
        expect(idsEquality, "The IDs must be the same").to.be.true;
    });
};