// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import Asset from "../../../../src/scripts/classes/handiwork/asset";
import Basic from "../../../../src/scripts/classes/handiwork/basic";

export function suite(): void {
  // Constants used in the test
  const ID = 0;
  const NAME = "TEST";
  const TAGS = ["tag1", "tag2", "tag3"];
  const COVER = "cover-URL";
  const OVERVIEW = "This is a test overview";
  const URL = "thread-URL";
  const SKU = "01234";

  it("Creation from Basic class", () => {
    // Create base class
    const basic = new Basic({
      id: ID,
      name: NAME,
      tags: TAGS,
      cover: COVER,
      overview: OVERVIEW,
      url: URL
    });

    // Create Asset class
    const result = new Asset(basic);

    // Check equality
    expect(result.id).to.be.equal(ID, "ID value must be equal");
    expect(result.name).to.be.equal(NAME, "Name value must be equal");
    expect(result.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(result.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(result.overview).to.be.equal(OVERVIEW, "Overview value must be equal");
    expect(result.url).to.be.equal(URL, "URL value must be equal");
  });

  it("Union with Basic class", () => {
    // Create base class
    const basic = new Basic({
      id: ID,
      name: NAME,
      tags: TAGS,
      cover: COVER,
      overview: OVERVIEW,
      url: URL
    });

    // Create Asset class
    const merged = Object.assign(basic, { sku: SKU });
    const result = new Asset(merged);

    // Check equality
    expect(result.id).to.be.equal(ID, "ID value must be equal");
    expect(result.name).to.be.equal(NAME, "Name value must be equal");
    expect(result.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(result.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(result.overview).to.be.equal(OVERVIEW, "Overview value must be equal");
    expect(result.url).to.be.equal(URL, "URL value must be equal");
    expect(result.sku).to.be.equal(SKU, "SKU value must be equal");
  });
}
