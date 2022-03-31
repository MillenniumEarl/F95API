// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { promises as fs } from "fs";
import { join } from "path";

// Public module from npm
import { expect } from "chai";
import { load } from "cheerio";

// Modules from file
import { extractDataFromFirstThreadPost } from "../../../src/scripts/scrape-data/post-parse-tree";
import { ILink } from "../../../src/scripts/interfaces";

export function suite(): void {
  it("Parse opening post", async function () {
    // Arrange
    const path = join(
      __dirname,
      "..",
      "resources",
      "opening-post-extract.html"
    );
    const html = await fs.readFile(path);
    const $ = load(html);
    const node = $("article.message-body > div.bbWrapper").get().shift();

    // Act
    const data = extractDataFromFirstThreadPost($, node);

    // Assert
    expect(data.length).to.be.equal(22);

    // Assert cover data
    const cover = data.find((e) => e.type === "Image") as ILink;
    expect(cover).to.not.be.undefined;
    expect(cover.href).to.be.equal(
      "https://attachments.f95zone.to/2021/04/1180728_episode7_release_banner.jpg"
    );
    expect(cover.text).to.be.equal("episode7_release_banner.jpg");

    // Assert previews
    const previews = data.find((e) => e.name === "Previews");
    expect(previews).to.not.be.undefined;
    expect(previews.content.length).to.be.equal(18);
    const allImages =
      previews.content.find((e) => e.type !== "Image") === undefined;
    expect(allImages).to.be.true;

    // Assert date
    const releaseDate = data.find((e) => e.name === "Release Date");
    expect(releaseDate).to.not.be.undefined;
    expect(releaseDate.text).to.be.equal("2021-04-25");

    // Assert developer
    const developer = data.find((e) => e.name === "Developer");
    expect(developer).to.not.be.undefined;
    expect(developer.text).to.be.equal("DrPinkCake");
    expect(developer.content.length).to.be.equal(4);

    // Assert changelog
    const changelog = data.find((e) => e.name === "Changelog");
    expect(changelog).to.not.be.undefined;
    expect(changelog.content.length).to.be.equal(79);
    expect(changelog.content[0].text).to.be.equal("v0.7.2"); // Last version
    expect(changelog.content[77].text).to.be.equal("v0.1.0"); // First released version
  });

  it("Parse generic post", async function () {
    // Arrange
    const path = join(
      __dirname,
      "..",
      "resources",
      "generic-post-extract.html"
    );
    const html = await fs.readFile(path);
    const $ = load(html);
    const node = $("article.message-body > div.bbWrapper").get().shift();

    // Act
    const data = extractDataFromFirstThreadPost($, node);

    // Assert
    expect(data.length).to.be.equal(0);
  });
}
