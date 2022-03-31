// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";
import { load } from "cheerio";

// Modules from file
import { nodeType } from "../../../../src/scripts/scrape-data/post-node-parse/node-type";

export function suite(): void {
  it("Test for formatted node", function () {
    // Arrange
    const html = "<div><b id='test'></b></div>";
    const $ = load(html);
    const node = $("#test").get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("Formatted");
  });

  it("Test for text node", function () {
    // Arrange
    const html = "<div id='container'>Text</div>";
    const $ = load(html);
    const node = $("#container").contents().get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("Text");
  });

  it("Test for spoiler node", function () {
    // Arrange
    const html = "<div><div id='test' class='bbCodeSpoiler'></div></div>";
    const $ = load(html);
    const node = $("#test").get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("Spoiler");
  });

  it("Test for link node (Link)", function () {
    // Arrange
    const html = "<div><a href='' id='test'></a></div>";
    const $ = load(html);
    const node = $("#test").get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("Link");
  });

  it("Test for link node (Image)", function () {
    // Arrange
    const html = "<div><img id='test'></img></div>";
    const $ = load(html);
    const node = $("#test").get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("Link");
  });

  it("Test for list node", function () {
    // Arrange
    const html = "<div><ul id='test'></ul></div>";
    const $ = load(html);
    const node = $("#test").get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("List");
  });

  it("Test for noscript node", function () {
    // Arrange
    const html = "<div><noscript id='test'></noscript></div>";
    const $ = load(html);
    const node = $("#test").get().shift();

    // Act
    const type = nodeType($, node);

    // Assert
    expect(type).to.be.equal("Noscript");
  });
}
