"use strict";

// Test suite
const api = require("./suites/api-test.js").suite;
const credentials = require("./suites/credentials-test.js").suite;
const network = require("./suites/network-helper-test.js").suite;
const platform = require("./suites/platform-data-test.js").suite;
const scraper = require("./suites/scraper-test.js").suite;
const searcher = require("./suites/searcher-test.js").suite;
const uScraper = require("./suites/user-scraper-test.js").suite;
const prefixParser = require("./suites/prefix-parser-test.js").suite;

describe("Test basic function", function testBasic() {
    //#region Set-up
    this.timeout(30000); // All tests in this suite get 30 seconds before timeout
    //#endregion Set-up

    describe("Test credentials class", credentials.bind(this));
    describe("Test network helper", network.bind(this));
    describe("Test prefix parser", prefixParser.bind(this));
});

describe("Test F95 modules", function testF95Modules() {
    //#region Set-up
    this.timeout(15000); // All tests in this suite get 15 seconds before timeout
    //#endregion Set-up
    
    describe("Test platform data fetch", platform.bind(this));
    describe("Test scraper methods", scraper.bind(this));
    describe("Test searcher methods", searcher.bind(this));
    describe("Test user scraper methods", uScraper.bind(this));
});

describe("Test complete API", function testAPI() {
    //#region Set-up
    this.timeout(15000); // All tests in this suite get 15 seconds before timeout
    //#endregion Set-up

    describe("Test API", api.bind(this));
});