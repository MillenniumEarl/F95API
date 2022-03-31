// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import Basic from "../../../../src/scripts/classes/handiwork/basic";

export function suite(): void {
  it("Union of partial classes", () => {
    /*
     * This test is used to verify if it is possible to create a
     * Basic object given a Basic instance and some parameters
     */
    // Constants used in the test
    const ID = 0;
    const NAME = "TEST";
    const TAGS = ["tag1", "tag2", "tag3"];
    const COVER = "cover-URL";
    const OVERVIEW = "This is a test overview";
    const URL = "thread-URL";

    // Create a partial classes
    const firstPartial = new Basic({
      id: ID,
      name: NAME,
      tags: TAGS
    });

    // Merge two partial class
    const merged = new Basic({
      ...firstPartial,
      cover: COVER,
      overview: OVERVIEW,
      url: URL
    });

    // Check equality
    expect(merged.id).to.be.equal(ID, "ID value must be equal");
    expect(merged.name).to.be.equal(NAME, "Name value must be equal");
    expect(merged.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(merged.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(merged.overview).to.be.equal(OVERVIEW, "Overview value must be equal");
    expect(merged.url).to.be.equal(URL, "URL value must be equal");
  });
}
