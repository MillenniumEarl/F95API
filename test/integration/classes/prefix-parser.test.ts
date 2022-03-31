// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";

// Modules from file
import { PrefixParser } from "../../../src/index";
import shared, { TPrefixDict } from "../../../src/scripts/shared";

export function suite(): void {
  //#region Setup
  before(function beforeAll() {
    // Mock the fetching of the platform data from F95Zone
    // Set only the test data (in testPrefixes/testIDs)
    const tags: TPrefixDict = new Map<number, string>();
    const engines: TPrefixDict = new Map<number, string>();
    const statuses: TPrefixDict = new Map<number, string>();
    const others: TPrefixDict = new Map<number, string>();
    tags.set(44, "slave").set(103, "corruption").set(225, "pregnancy");
    engines.set(2, "RPGM").set(7, "Ren'Py");
    statuses.set(22, "Abandoned");
    others.set(13, "VN");

    // Set the test data
    shared.setPrefixPair("engines", engines);
    shared.setPrefixPair("statuses", statuses);
    shared.setPrefixPair("others", others);
    shared.setPrefixPair("tags", tags);
  });
  //#endregion Setup

  //#region Tear Down
  after(function afterAll() {
    // Reset the various prefixes, engines, statuses...
    shared["_prefixes"] = {} as any;
  });
  //#endregion Tear Down

  // Test values
  const testIDs = [103, 225, 44, 13, 2, 7, 22];
  const testPrefixes = [
    "corruption",
    "pregnancy",
    "slave",
    "VN",
    "RPGM",
    "Ren'Py",
    "Abandoned"
  ];

  it("Prefixes to IDs", function prefixesToIDs() {
    // Create a new parser
    const parser = new PrefixParser();

    // Parse values
    const ids = parser.prefixesToIDs(testPrefixes);

    // Assert equality
    expect(testIDs).to.be.deep.equal(ids, "The IDs must be the same");
  });

  /**
   * It seems that there are duplicated IDs, because it outside the
   * scope of the APIs we should wait until the admins on F95Zone
   * fix the duplicate IDs.
   */
  it("IDs to prefixes", function IDsToPrefixes() {
    // Create a new parser
    const parser = new PrefixParser();

    // Parse values
    const tags = parser.idsToPrefixes(testIDs);

    // Assert equality
    expect(testPrefixes).to.be.deep.equal(tags, "The tags must be the same");
  });
}
