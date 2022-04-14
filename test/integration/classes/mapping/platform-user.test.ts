// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import fs from "fs/promises";
import { join } from "path";

// Public module from npm
import rewire from "rewire";
import { expect } from "chai";

// Modules from file
import type PlatformUser from "../../../../src/scripts/classes/mapping/platform-user";
import Shared from "../../../../src/scripts/shared";
import { success } from "../../../../src/scripts/classes/result";

export function suite(): void {
  it("Parse platform user data", async function () {
    // Arrange
    const path = join(__dirname, "..", "..", "resources", "platform-user-data.html");
    const html = await fs.readFile(path, { encoding: "utf-8", flag: "r" });

    // "Log-in" the user
    Shared.setIsLogged(true);

    // Rewire the "PlatformUser.ts" module overwritting the
    // "fetchHTML" function to return the custom HTML file
    const rewired = rewire("../../../../src/scripts/classes/mapping/platform-user");

    // Typescript transpile the code -> dist/**/platform-user.js
    rewired.__set__("network_helper_1.fetchHTML", () => success(html));

    // Use this to allow the creation of a class using "new"
    const RewiredPlatformUser = rewired.__get__("PlatformUser");

    // Act
    const FAKE_ID = 1000;
    const user: PlatformUser = new RewiredPlatformUser(FAKE_ID);
    await user.fetch();

    // Assert
    expect(user.avatar.includes("data/avatars/l/1470/1470797.jpg")).to.be.true;
    expect(user.banners.length).to.be.equal(0);
    expect(user.donation).to.be.equal(0);
    expect(user.messages).to.be.equal(53);
    expect(user.name).to.be.equal("MillenniumEarl");
    expect(user.points).to.be.equal(109);
    expect(user.private).to.be.false;
    expect(user.ratingsReceived).to.be.equal(1);
    expect(user.reactionScore).to.be.equal(44);
    expect(user.title).to.be.equal("Newbie");
  });
}
