// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public modules from npm
import { DateTime } from "luxon";
import { Handiwork } from "../..";

// Modules from files
import HandiWork from "../classes/handiwork/handiwork";
import Thread from "../classes/mapping/thread";
import { IBasic, TAuthor, TChangelog, TEngine, TExternalPlatform, TStatus } from "../interfaces";
import shared, { TPrefixDict } from "../shared";
import { ILink, IPostElement } from "./post-parse";

/**
 * Gets information of a particular handiwork from its thread.
 *
 * If you don't want to specify the object type, use `HandiWork`.
 *
 * @todo It does not currently support assets.
 */
export default async function getHandiworkInformation<T extends IBasic>(
  arg: string | Thread
): Promise<T> {
  // Local variables
  let thread: Thread = null;

  if (typeof arg === "string") {
    // Fetch thread data
    const id = extractIDFromURL(arg);
    thread = new Thread(id);
    await thread.fetch();
  } else thread = arg;

  shared.logger.info(`Obtaining handiwork from ${thread.url}`);

  // Convert the info from thread to handiwork
  let hw: HandiWork = new Handiwork({
    id: thread.id,
    url: thread.url,
    name: thread.title,
    category: thread.category,
    threadPublishingDate: thread.publication,
    lastThreadUpdate: thread.modified,
    tags: thread.tags,
    rating: thread.rating,
    prefixes: []
  });
  fillWithPrefixes(hw, thread.prefixes);

  // Fetch info from first post
  const post = await thread.getPost(1);
  hw = fillWithPostData(hw, post.body);

  return <T>(<unknown>hw);
}

//#region Private methods

//#region Utilities

/**
 * Extracts the work's unique ID from its URL.
 */
function extractIDFromURL(url: string): number {
  shared.logger.trace("Extracting ID from URL...");

  // URL are in the format https://f95zone.to/threads/GAMENAME-VERSION-DEVELOPER.ID/
  // or https://f95zone.to/threads/ID/
  const match = url.match(/([0-9]+)(?=\/|\b)(?!-|\.)/);
  if (!match) return -1;

  // Parse and return number
  return parseInt(match[0], 10);
}

/**
 * Makes an array of strings uppercase.
 */
function toUpperCaseArray(a: string[]): string[] {
  /**
   * Makes a string uppercase.
   */
  function toUpper(s: string): string {
    return s.toUpperCase();
  }
  return a.map(toUpper);
}

/**
 * Check if the string `s` is in the dict `a`.
 *
 * Case insensitive.
 */
function stringInDict(s: string, a: TPrefixDict): boolean {
  // Make uppercase all the strings in the array
  const values = toUpperCaseArray(Object.values(a));

  return values.includes(s.toUpperCase());
}

/**
 * Convert a string to a boolean.
 *
 * Check also for `yes`/`no` and `1`/`0`.
 */
function stringToBoolean(s: string): boolean {
  // Local variables
  const positiveTerms = ["true", "yes", "1"];
  const negativeTerms = ["false", "no", "0"];
  const cleanString = s.toLowerCase().trim();
  let result = Boolean(s);

  if (positiveTerms.includes(cleanString)) result = true;
  else if (negativeTerms.includes(cleanString)) result = false;
  return result;
}

/**
 * Gets the element with the given name or `undefined`.
 *
 * Case-insensitive.
 */
function getPostElementByName(elements: IPostElement[], name: string): IPostElement | undefined {
  return elements.find((el) => el.name.toUpperCase() === name.toUpperCase());
}

//#endregion Utilities

/**
 * Parse the post prefixes.
 *
 * In particular, it elaborates the following prefixes for games:
 * `Engine`, `Status`, `Mod`.
 */
function fillWithPrefixes(hw: HandiWork, prefixes: string[]) {
  shared.logger.trace("Parsing prefixes...");

  // Local variables
  let mod = false;
  let engine: TEngine = null;
  let status: TStatus = null;

  /**
   * Emulated dictionary of mod prefixes.
   */
  const fakeModDict: TPrefixDict = {
    0: "MOD",
    1: "CHEAT MOD"
  };

  prefixes.map((item) => {
    // Remove the square brackets
    const prefix = item.replace("[", "").replace("]", "");

    // Check what the prefix indicates
    if (stringInDict(prefix, shared.prefixes["engines"])) engine = prefix as TEngine;
    else if (stringInDict(prefix, shared.prefixes["statuses"])) status = prefix as TStatus;
    else if (stringInDict(prefix, fakeModDict)) mod = true;

    // Anyway add the prefix to list
    hw.prefixes.push(prefix);
  });

  // If the status is not set, then the game is in development (Ongoing)
  status = !status && hw.category === "games" ? status : "Ongoing";

  hw.engine = engine;
  hw.status = status;
  hw.mod = mod;
}

/**
 * Compiles a HandiWork object with the data extracted
 * from the main post of the HandiWork page.
 *
 * The values that will be added are:
 * `Overview`, `OS`, `Language`, `Version`, `Installation`,
 * `Pages`, `Resolution`, `Lenght`, `Genre`, `Censored`,
 * `LastRelease`, `Authors`, `Changelog`, `Cover`.
 */
function fillWithPostData(hw: HandiWork, elements: IPostElement[]): Handiwork {
  // First fill the "simple" elements
  hw.os = getPostElementByName(elements, "os")
    ?.text?.split(",")
    .map((s) => s.trim());
  hw.language = getPostElementByName(elements, "language")
    ?.text?.split(",")
    .map((s) => s.trim());
  hw.version = getPostElementByName(elements, "version")?.text;
  hw.installation = getPostElementByName(elements, "installation")?.text;
  hw.pages = getPostElementByName(elements, "pages")?.text;
  hw.resolution = getPostElementByName(elements, "resolution")
    ?.text?.split(",")
    .map((s) => s.trim());
  hw.length = getPostElementByName(elements, "lenght")?.text;

  // Parse the censorship
  const censored =
    getPostElementByName(elements, "censored") || getPostElementByName(elements, "censorship");
  if (censored) hw.censored = stringToBoolean(censored.text);

  // Get the genres
  const genre = getPostElementByName(elements, "genre")?.text;
  hw.genre = genre
    ?.split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");

  // Fill the dates
  const releaseDate = getPostElementByName(elements, "release date")?.text;
  if (DateTime.fromISO(releaseDate).isValid) hw.lastRelease = new Date(releaseDate);

  //Get the overview
  const overview = getPostElementByName(elements, "overview")?.text;

  // Get the cover
  const cover = (elements.find((e) => e.type === "Image") as ILink)?.href;

  // Get the author
  const authors = parseAuthor(elements);

  // Get the changelog
  const changelog = parseChangelog(elements);

  const merged = Object.assign({ overview, cover, authors, changelog }, hw);
  return new Handiwork(merged);
}

/**
 * Parse the author from the post's data.
 */
function parseAuthor(elements: IPostElement[]): TAuthor[] {
  // Local variables
  const author: TAuthor = {
    name: "",
    platforms: []
  };

  // Fetch the authors from the post data
  const authorElement =
    getPostElementByName(elements, "developer") ||
    getPostElementByName(elements, "developer/publisher") ||
    getPostElementByName(elements, "artist");

  if (authorElement) {
    // Set the author name
    author.name = authorElement.text;

    // Add the found platforms
    authorElement.content.forEach((e: ILink) => {
      // Ignore invalid links
      if (e.href) {
        // Create and push the new platform
        const platform: TExternalPlatform = {
          name: e.text,
          link: e.href
        };

        author.platforms.push(platform);
      }
    });
  }

  return [author];
}

/**
 * Parse the changelog from the post's data.
 */
function parseChangelog(elements: IPostElement[]): TChangelog[] {
  // Local variables
  const changelog = [];
  const changelogElement =
    getPostElementByName(elements, "changelog") || getPostElementByName(elements, "change-log");

  if (changelogElement) {
    // regex used to match version tags
    const versionRegex = /^v[0-9]+\.[0-9]+.*/;

    // Get the indexes of the version tags
    const indexesVersion = changelogElement.content
      .filter((e) => e.type === "Text" && versionRegex.test(e.text))
      .map((e) => changelogElement.content.indexOf(e));

    const results = indexesVersion.map((i, j) => {
      // In-loop variable
      const versionChangelog: TChangelog = {
        version: "",
        information: []
      };

      // Get the difference in indexes between this and the next version tag
      const diff = indexesVersion[j + 1] ?? changelogElement.content.length;

      // fetch the group of data of this version tag
      const group = changelogElement.content.slice(i, diff);
      versionChangelog.version = group.shift().text.replace("v", "").trim();

      // parse the data
      group.forEach((e) => {
        if (e.type === "Generic" || e.type === "Spoiler") {
          const textes = e.content.map((c) => c.text);
          versionChangelog.information.push(...textes);
        } else versionChangelog.information.push(e.text);
      });

      return versionChangelog;
    });

    changelog.push(...results);
  }

  return changelog;
}

//#endregion Private methods
