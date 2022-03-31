// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";
import { load } from "cheerio";

// Modules from file
import parseCheerioNode from "../../../../src/scripts/scrape-data/post-node-parse/node-parse";
import { ILink } from "../../../../src/scripts/interfaces";

export function suite(): void {
  it("Parse spoiler node", function () {
    // Arrange
    const html = `
    <div class="bbCodeSpoiler">
        <button type="button" class="bbCodeSpoiler-button button--longText button rippleButton" data-xf-click="toggle">
            <span class="button-text">
                <span> Spoiler: 
                    <span class="bbCodeSpoiler-button-title">
                        TITLE
                    </span>
                </span>
            </span>
            <div class="ripple-container"/>
        </button>
        <div class="bbCodeSpoiler-content">
            <div class="bbCodeBlock bbCodeBlock--spoiler">
                <div class="bbCodeBlock-content">
                    CONTENT
                </div>
            </div>
        </div>
    </div>`;
    const $ = load(html);
    const node = $("div.bbCodeSpoiler").get().shift();

    // Act
    const post = parseCheerioNode($, node);

    // Assert
    expect(post.type).to.be.equal("Spoiler");
    expect(post.name).to.be.equal("TITLE");
    expect(post.text).to.be.equal("");
    expect(post.content.length).to.be.equal(0);
  });

  it("Parse text node", function () {
    // Arrange
    const html = "<div id='container'>TEXTVALUE</div>";
    const $ = load(html);
    const node = $("#container").contents().get().shift();

    // Act
    const post = parseCheerioNode($, node);

    // Assert
    expect(post.type).to.be.equal("Text");
    expect(post.name).to.be.equal("");
    expect(post.text).to.be.equal("TEXTVALUE");
    expect(post.content.length).to.be.equal(0);
  });

  it("Parse image node", function () {
    // Arrange
    const html = `
    <div id='container'>
        <img src="IMAGE_SRC" data-src="DATA_SRC" data-url="" 
        class="bbImage lazyloaded" data-zoom-target="1" alt="TITLE" style="">
    </div>`;
    const $ = load(html);
    const node = $("#container > img").get().shift();

    // Act
    const post = parseCheerioNode($, node) as ILink;

    // Assert
    expect(post.type).to.be.equal("Image");
    expect(post.name).to.be.equal("");
    expect(post.text).to.be.equal("TITLE");
    expect(post.href).to.be.equal("DATA_SRC");
    expect(post.content.length).to.be.equal(0);
  });

  it("Parse link node", function () {
    // Arrange
    const html = `
    <div id='container'>
        <a href="LINK" target="_blank" class="link link--external 
        has-favicon" rel="nofollow noopener">HYPERLINK TEXT</a>
    </div>`;
    const $ = load(html);
    const node = $("#container > a").get().shift();

    // Act
    const post = parseCheerioNode($, node) as ILink;

    // Assert
    expect(post.type).to.be.equal("Link");
    expect(post.name).to.be.equal("");
    expect(post.text).to.be.equal("HYPERLINK TEXT");
    expect(post.href).to.be.equal("LINK");
    expect(post.content.length).to.be.equal(0);
  });

  it("Parse generic node (empty)", function () {
    // Arrange
    const html = `
    <div id='container'>
        <ul>
            THIS SHOULD PARSE TO A EMPTY NODE
        </ul>
    </div>`;
    const $ = load(html);
    const node = $("#container > ul").get().shift();

    // Act
    const post = parseCheerioNode($, node);

    // Assert
    expect(post.type).to.be.equal("Empty");
    expect(post.name).to.be.equal("");
    expect(post.text).to.be.equal("");
    expect(post.content.length).to.be.equal(0);
  });
}
