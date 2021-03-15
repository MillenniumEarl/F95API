"use strict";

// Public module from npm
import { expect } from "chai";
import dotenv from "dotenv";

// Modules from file
import { login, PrefixParser } from "../../src/index";

// Configure the .env reader
dotenv.config();

// Global variables
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;

export function suite(): void {
  //#region Setup

  before(async function beforeAll() {
    await login(USERNAME, PASSWORD);
  });

  //#endregion Setup

  it("Parse prefixes", async function testPrefixParser() {
    // Create a new parser
    const parser = new PrefixParser();

    // Test values
    const testIDs = [103, 225, 44, 13, 2, 7, 22];
    const testPrefixes = ["corruption", "pregnancy", "slave", "VN", "RPGM", "Ren'Py", "Abandoned"];

    // Parse values
    const ids = parser.prefixesToIDs(testPrefixes);
    const tags = parser.idsToPrefixes(ids);

    // Assert equality
    expect(testPrefixes).to.be.deep.equal(tags, "The tags must be the same");
    expect(testIDs).to.be.deep.equal(ids, "The IDs must be the same");
  });
}
