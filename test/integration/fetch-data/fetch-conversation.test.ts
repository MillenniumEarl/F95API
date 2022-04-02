// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Core modules
import fs from "fs/promises";
import { join } from "path";

// Public module from npm
import { expect } from "chai";

// Modules from file
import fetchPageConversations from "../../../src/scripts/fetch-data/user-data/fetch-conversation";

export function suite(): void {
  it("Parse conversation page", async function () {
    // Arrange
    const expectedCreationDate = new Date("2021-01-17T19:15:07+0100").toISOString();
    const partial = "/conversations/title-conversation.3000000/unread";
    const path = join(__dirname, "..", "resources", "conversations-page.html");
    const html = await fs.readFile(path, { encoding: "utf-8", flag: "r" });

    // Act
    const list = await fetchPageConversations(html);
    const conversation = list.shift();

    // Assert
    expect(conversation.authorid).to.be.equal(1000000);
    expect(conversation.title).to.be.equal("Conversation's title");
    expect(conversation.unread).to.be.false;
    expect(conversation.url.includes(partial)).to.be.true;
    expect(conversation.lastRecipients.length).to.be.equal(1);
    expect(conversation.partecipants).to.be.equal(2);
    expect(conversation.replies).to.be.equal(2);
    expect(conversation.creation.toISOString()).to.be.equal(expectedCreationDate);
  });
}
