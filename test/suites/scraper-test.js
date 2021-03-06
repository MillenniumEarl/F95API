"use strict";

// Public module from npm
const expect = require("chai").expect;
const { isEqual } = require("lodash");
const GameInfo = require("../../app/scripts/classes/game-info.js");

// Modules from file
const scraper = require("../../app/scripts/scraper.js");

module.exports.suite = function suite() {
    // Global suite variables
    const gameURL = "https://f95zone.to/threads/kingdom-of-deception-v0-10-8-hreinn-games.2733/";
    const modURL = "https://f95zone.to/threads/witch-trainer-silver-mod-v1-39-silver-studio-games.1697/";
    const previewSrc = "https://attachments.f95zone.to/2018/09/162821_f9nXfwF.png";
    const modPreviewSrc = "https://attachments.f95zone.to/2018/10/178357_banner.png";
    
    it("Search game", async function () {
        // This test depend on the data on F95Zone at gameURL
        const result = await scraper.getGameInfo(gameURL);
        
        // Test only the main information
        expect(result.name).to.equal("Kingdom of Deception");
        expect(result.author).to.equal("Hreinn Games");
        expect(result.isMod, "Should be false").to.be.false;
        expect(result.engine).to.equal("Ren'Py");
        expect(result.previewSrc).to.equal(previewSrc, "Preview not equals");
    });

    it("Search mod", async function () {
        // This test depend on the data on F95Zone at modURL
        const result = await scraper.getGameInfo(modURL);

        // Test only the main information
        expect(result.name).to.equal("Witch Trainer: Silver Mod");
        expect(result.author).to.equal("Silver Studio Games");
        expect(result.isMod, "Should be true").to.be.true;
        expect(result.engine).to.equal("Ren'Py");
        expect(result.previewSrc).to.equal(modPreviewSrc, "Preview not equals");
    });

    it("Test game serialization", async function testGameSerialization() {
        // This test depend on the data on F95Zone at gameURL
        const testGame = await scraper.getGameInfo(gameURL);

        // Serialize...
        const json = JSON.stringify(testGame);

        // Deserialize...
        const parsedGameInfo = GameInfo.fromJSON(json);

        // Compare with lodash
        const result = isEqual(parsedGameInfo, testGame);
        expect(result).to.be.true;
    });
};
