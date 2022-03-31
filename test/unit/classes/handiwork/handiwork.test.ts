// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import Handiwork from "../../../../src/scripts/classes/handiwork/handiwork";
import Basic from "../../../../src/scripts/classes/handiwork/basic";
import { Game } from "../../../../src";

export function suite(): void {
  // Constants used in the test
  const ID = 0;
  const NAME = "TEST";
  const TAGS = ["tag1", "tag2", "tag3"];
  const COVER = "cover-URL";
  const OVERVIEW = "This is a test overview";
  const URL = "thread-URL";
  const LANGUAGE = ["English", "Italian"];

  it("Creation from Game class", () => {
    // Create base game class
    const basic = new Basic({
      id: ID,
      name: NAME,
      tags: TAGS,
      cover: COVER,
      overview: OVERVIEW,
      url: URL
    });
    const game = new Game(basic);

    // Create Handiwork class
    const hw = new Handiwork(game);

    // Check equality
    expect(hw.id).to.be.equal(ID, "ID value must be equal");
    expect(hw.name).to.be.equal(NAME, "Name value must be equal");
    expect(hw.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(hw.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(hw.overview).to.be.equal(OVERVIEW, "Overview value must be equal");
    expect(hw.url).to.be.equal(URL, "URL value must be equal");
  });

  it("Union with Game class", () => {
    // Create base game class
    const basic = new Basic({
      id: ID,
      name: NAME,
      tags: TAGS,
      cover: COVER,
      overview: OVERVIEW,
      url: URL
    });
    const game = new Game(basic);

    // Create Game class
    const merged = Object.assign(game, { language: LANGUAGE });
    const hw = new Handiwork(merged);

    // Check equality
    expect(hw.id).to.be.equal(ID, "ID value must be equal");
    expect(hw.name).to.be.equal(NAME, "Name value must be equal");
    expect(hw.tags).to.be.equal(TAGS, "Tags value must be equal");
    expect(hw.cover).to.be.equal(COVER, "Cover value must be equal");
    expect(hw.overview).to.be.equal(OVERVIEW, "Overview value must be equal");
    expect(hw.url).to.be.equal(URL, "URL value must be equal");
    expect(hw.language).to.be.equal(LANGUAGE, "Language value must be equal");
  });
}
