"use strict";

// Public module from npm
const expect = require("chai").expect;
const dotenv = require("dotenv");
const { isEqual } = require("lodash");

// Modules from file
const Credentials = require("../../app/scripts/classes/credentials.js");
const PrefixParser = require("../../app/scripts/classes/prefix-parser.js");
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

    it("Parse prefixes", async function testPrefixParser() {
        // Create a new parser
        const parser = new PrefixParser();
        
        const testPrefixes = ["corruption", "pregnancy", "slave", "VN", "RPGM", "Ren'Py", "Abandoned"];
        const ids = parser.prefixesToIDs(testPrefixes);
        const tags = parser.idsToPrefixes(ids);

        const tagsEquality = isEqual(testPrefixes, tags);
        expect(tagsEquality, "The tags must be the same").to.be.true;
        const idsEquality = isEqual([103, 225, 44, 13, 2, 7, 22], ids);
        expect(idsEquality, "The IDs must be the same").to.be.true;
    });
};