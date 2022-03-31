// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import Game from "../../../../src/scripts/classes/handiwork/game";
import Basic from "../../../../src/scripts/classes/handiwork/basic";

export function suite(): void {
  // Constants used in the test
  const ID = 0;
  const NAME = "TEST";
  const TAGS = ["tag1", "tag2", "tag3"];
  const COVER = "cover-URL";
  const OVERVIEW = "This is a test overview";
  const URL = "thread-URL";
  const LANGUAGE = ["English", "Italian"];

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

    // Create Game class
    const result = new Game(basic);

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

    // Create Game class
    const merged = Object.assign(basic, { language: LANGUAGE });
    const result = new Game(merged);

    // Check equality
    expect(result.id).to.be.equal(ID, "ID value must be equal");
    expect(result.name).to.be.equal(NAME, "Name value must be equal");
    expect(result.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(result.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(result.overview).to.be.equal(OVERVIEW, "Overview value must be equal");
    expect(result.url).to.be.equal(URL, "URL value must be equal");
    expect(result.language).to.be.equal(LANGUAGE, "Language value must be equal");
  });
}
