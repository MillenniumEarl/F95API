// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import Basic from "../../../../src/scripts/classes/handiwork/basic";

export function suite(): void {
  it("Union of partial classes", () => {
    // Constants used in the test
    const ID = 0;
    const NAME = "TEST";
    const TAGS = ["tag1", "tag2", "tag3"];
    const COVER = "cover-URL";
    const OVERVIEW = "This is a test overview";
    const URL = "thread-URL";

    // Create two partial classes
    const firstPartial = new Basic({
      id: ID,
      name: NAME,
      tags: TAGS
    });

    const secondPartial = new Basic({
      cover: COVER,
      overview: OVERVIEW,
      url: URL
    });

    // Merge the classes
    const merged = Object.assign(firstPartial, secondPartial);

    // Create the resulting object
    const result = new Basic(merged);

    // Check equality
    expect(result.id).to.be.equal(ID, "ID value must be equal");
    expect(result.name).to.be.equal(NAME, "Name value must be equal");
    expect(result.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(result.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(result.overview).to.be.equal(
      OVERVIEW,
      "Overview value must be equal"
    );
    expect(result.url).to.be.equal(URL, "URL value must be equal");
  });
}
