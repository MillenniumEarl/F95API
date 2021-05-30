// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public module from npm
import { expect } from "chai";
import dotenv from "dotenv";

// Modules from file
import { login, PrefixParser } from "../../../src/index";

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

  // Test values
  const testIDs = [103, 225, 44, 13, 2, 7, 22];
  const testPrefixes = ["corruption", "pregnancy", "slave", "VN", "RPGM", "Ren'Py", "Abandoned"];

  it("Prefixes to IDs", function prefixesToIDs() {
    // Create a new parser
    const parser = new PrefixParser();

    // Parse values
    const ids = parser.prefixesToIDs(testPrefixes);

    // Assert equality
    expect(testIDs).to.be.deep.equal(ids, "The IDs must be the same");
  });

  it("IDs to prefixes", function IDsToPrefixes() {
    // Create a new parser
    const parser = new PrefixParser();

    // Parse values
    const tags = parser.idsToPrefixes(testIDs);

    // Assert equality
    expect(testPrefixes).to.be.deep.equal(tags, "The tags must be the same");
  });
}
