// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";

// Modules from file
import getHandiworkInformation from "../../../src/scripts/scrape-data/handiwork-parse";
import Thread from "../../../src/scripts/classes/mapping/thread";
import Post from "../../../src/scripts/classes/mapping/post";
import PlatformUser from "../../../src/scripts/classes/mapping/platform-user";
import {
  TRating,
  TCategory,
  IPostElement,
  ILink
} from "../../../src/scripts/interfaces";
import Game from "../../../src/scripts/classes/handiwork/game";

//#region Mock Thread and Post classes
const mockDate = new Date("2021-07-06T15:26:41Z");

/**
 * The MockOf type takes a class and an optional union of
 * public members which we don't want to have to implement in
 * our mock.
 */
type MockOf<Class, Omit extends keyof Class = never> = {
  [Member in Exclude<keyof Class, Omit>]: Class[Member];
};

/**
 * Our mock need only implement the members we need. Note that even the omitted members
 * are still type-safe: changing the name of fileds/methods in Thread will
 * result in a compiler error in the mock.
 */
class MockThread implements MockOf<Thread, "fetch"> {
  //#region  Fields
  id: number = 0;
  title: string = "Test thread title";
  tags: string[] = ["Tag 1", "Tag 2", "Tag 3"];
  prefixes: string[] = ["Unity", "Completed"];
  rating: TRating = { average: 4, best: 5, count: 10 };
  owner: PlatformUser = new PlatformUser(0);
  publication: Date = mockDate;
  modified: Date = mockDate;
  category: TCategory = "games";
  url: string = "www.gameurl.com";
  headline: string = "Test thread title [version] [author]";
  //#endregion Fields

  getPost(index: number): Promise<Post> {
    const post = new MockPost();
    post.id = index;
    post.number = 1;
    post.bookmarked = false;
    post.owner = new PlatformUser(0);
    post.published = mockDate;
    post.lastEdit = mockDate;
    post.body = [
      {
        type: "Image",
        name: "Cover",
        text: "cover.jpg",
        href: "https://website.com/cover.jpg",
        content: []
      } as ILink,
      {
        type: "Text",
        name: "Overview",
        text: "This is the game overview",
        content: []
      },
      {
        type: "Text",
        name: "Thread Updated",
        text: "2021-04-27",
        content: []
      },
      {
        type: "Text",
        name: "Release Date",
        text: "2021-04-25",
        content: []
      },
      {
        type: "Text",
        name: "Developer",
        text: "MillenniumEarl",
        content: [
          {
            type: "Link",
            name: "",
            text: "Patreon",
            href: "www.thiscouldbeapatreonurl.com",
            content: []
          } as ILink
        ]
      },
      {
        type: "Text",
        name: "Censored",
        text: "No",
        content: []
      },
      {
        type: "Text",
        name: "Version",
        text: "2.0.0",
        content: []
      },
      {
        type: "Text",
        name: "OS",
        text: "Windows, Linux, Mac",
        content: []
      },
      {
        type: "Text",
        name: "Language",
        text: "English",
        content: []
      },
      {
        type: "Text",
        name: "Installation",
        text: "1. Extract and run.",
        content: []
      },
      {
        type: "Text",
        name: "Changelog",
        text: "Changelog",
        content: [
          {
            type: "Text",
            name: "",
            text: "v2.0.0",
            content: []
          },
          {
            type: "Text",
            name: "",
            text: "The changes of this version go here",
            content: []
          }
        ]
      }
    ];

    return Promise.resolve(post as Post);
  }
}

/**
 * Our mock need only implement the members we need. Note that even the omitted members
 * are still type-safe: changing the name of fileds/methods in Thread will
 * result in a compiler error in the mock.
 */
class MockPost implements MockOf<Post, "fetch"> {
  //#region Fields

  id: number;
  number: number;
  published: Date;
  lastEdit: Date;
  owner: PlatformUser;
  bookmarked: boolean;
  message: string;
  body: IPostElement[];

  //#endregion Fields
}

//#region Mock Thread and Post classes

export function suite(): void {
  it("Create handiwork from game thread", async function () {
    // Arrange
    const thread = new MockThread();

    // Act
    const hw = await getHandiworkInformation<Game>(thread as Thread, Game);

    // Assert
    expect(hw.censored).to.be.false;
    expect(hw.status).to.be.equal("Completed");
    expect(hw.engine).to.be.equal("Unity");
    expect(hw.cover).to.be.equal("https://website.com/cover.jpg");
    expect(hw.category === "mods").to.be.false;
    expect(hw.os.length).to.be.equal(3);
    expect(hw.version).to.be.equal("2.0.0");
    expect(hw.authors.length).to.be.equal(1);
    expect(hw.authors[0].name).to.be.equal("MillenniumEarl");
  });
}
