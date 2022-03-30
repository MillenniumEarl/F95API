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
import { IPostElement, ILink } from "../../../src/scripts/interfaces";
import Game from "../../../src/scripts/classes/handiwork/game";
import { TRating, TCategory } from "../../../src/scripts/types";
import shared, { TPrefixDict } from "../../../src/scripts/shared";

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
  headline: string = "Test thread title [v2.0.0] [MillenniumEarl]";
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
          },
          {
            type: "Spoiler",
            name: "Container element",
            text: "In this spoiler there are nested elements",
            content: [
              {
                type: "Text",
                name: "",
                text: "This is a nested element in the changelog data",
                content: []
              }
            ]
          }
        ]
      }
    ];

    return Promise.resolve(post as Post);
  }
}

/**
 * Mock with no `version` data in the body, used to simulate
 * old thread where no standardization was present.
 */
class MockOldThread implements MockOf<MockThread> {
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
  headline: string = "Test thread title [2.0.0] [MillenniumEarl]";
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
          },
          {
            type: "Spoiler",
            name: "Container element",
            text: "In this spoiler there are nested elements",
            content: [
              {
                type: "Text",
                name: "",
                text: "This is a nested element in the changelog data",
                content: []
              }
            ]
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

//#endregion Mock Thread and Post classes

export function suite(): void {
  //#region Setup
  before(function beforeAll() {
    // Mock the fetching of the platform data from F95Zone
    // Set only the test data (status/engines in MockThread)
    const engines: TPrefixDict = new Map<number, string>();
    const statuses: TPrefixDict = new Map<number, string>();
    engines.set(3, "Unity");
    statuses.set(18, "Completed");

    // Set the test data
    shared.setPrefixPair("engines", engines);
    shared.setPrefixPair("statuses", statuses);
  });
  //#endregion Setup

  //#region Tear Down
  after(function afterAll() {
    // Reset the various prefixes, engines, statuses...
    shared["_prefixes"] = {} as any;
  });
  //#endregion Tear Down

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

  it("Create handiwork from old game thread", async function () {
    // Arrange
    const thread = new MockOldThread();

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
