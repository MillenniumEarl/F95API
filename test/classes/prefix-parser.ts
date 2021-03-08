"use strict";

// Public module from npm
import { expect } from "chai";
import dotenv from "dotenv";
import { isEqual } from "lodash";

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

    const testPrefixes = [
      "corruption",
      "pregnancy",
      "slave",
      "VN",
      "RPGM",
      "Ren'Py",
      "Abandoned"
    ];
    const ids = parser.prefixesToIDs(testPrefixes);
    const tags = parser.idsToPrefixes(ids);

    const tagsEquality = isEqual(testPrefixes, tags);
    expect(tagsEquality, "The tags must be the same").to.be.true;
    const idsEquality = isEqual([103, 225, 44, 13, 2, 7, 22], ids);
    expect(idsEquality, "The IDs must be the same").to.be.true;
  });
}
