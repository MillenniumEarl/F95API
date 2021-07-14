// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import { promises as fs } from "fs";
import { join } from "path";

// Public module from npm
import { expect } from "chai";

// Modules from file
import fetchAlertElements from "../../../src/scripts/fetch-data/user-data/fetch-alert";

export function suite(): void {
  it("Parse alert - quoted post", async function () {
    // Arrange
    const path = join(__dirname, "..", "resources", "quote-alert.html");
    const html = await fs.readFile(path, { encoding: "utf-8", flag: "r" });

    // Act
    const list = await fetchAlertElements(html);
    const alert = list.shift();

    // Assert
    expect(alert.userid).to.be.equal(12345);
    expect(alert.type).to.be.equal("Quote");
    expect(alert.reaction).to.be.null;
    expect(alert.read).to.be.true;
    expect(alert.linkedURL).to.be.equal("https://f95zone.to/posts/POST_ID/");
    const expectedDate = new Date("2021-07-05T09:39:36+0200").toISOString();
    expect(alert.date.toISOString()).to.be.equal(expectedDate);
  });

  it("Parse alert - reaction post", async function () {
    // Arrange
    const path = join(__dirname, "..", "resources", "reaction-alert.html");
    const html = await fs.readFile(path, { encoding: "utf-8", flag: "r" });

    // Act
    const list = await fetchAlertElements(html);
    const alert = list.shift();

    // Assert
    expect(alert.userid).to.be.equal(12345);
    expect(alert.type).to.be.equal("Reaction");
    expect(alert.reaction).to.be.equal("Like");
    expect(alert.read).to.be.true;
    expect(alert.linkedURL).to.be.equal("https://f95zone.to/posts/POST_ID/");
    const expectedDate = new Date("2021-06-27T09:33:48+0200").toISOString();
    expect(alert.date.toISOString()).to.be.equal(expectedDate);
  });
}
