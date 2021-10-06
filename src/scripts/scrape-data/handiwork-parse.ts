// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import HandiWork from "../classes/handiwork/handiwork";
import Thread from "../classes/mapping/thread";
import {
  IBasic,
  ILink,
  IPostElement,
  TAuthor,
  TChangelog,
  TEngine,
  TExternalPlatform,
  TStatus
} from "../interfaces";
import shared, { TPrefixDict } from "../shared";
import Handiwork from "../classes/handiwork/handiwork";
import { isF95URL } from "../network-helper";
import { metadata as md } from "../constants/ot-metadata-values";

/**
 * Gets information of a particular handiwork from its thread.
 *
 * If you don't want to specify the object type, use `HandiWork`.
 */
export default async function getHandiworkInformation<T extends IBasic>(
  arg: string | Thread
): Promise<T> {
  // Local variables
  let thread: Thread = null;

  /* istanbul ignore if */
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
/* istanbul ignore next : it will not be called in tests*/
function extractIDFromURL(url: string): number {
  shared.logger.trace("Extracting ID from URL...");

  // URL are in the format https://f95zone.to/threads/GAMENAME-VERSION-DEVELOPER.ID/
  // or https://f95zone.to/threads/ID/
  const match = url.match(/((?<=\/|\.)(\d+)(?=\/{0,1}))(?!\w)/i);
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
 * Gets the first non-null element having one of
 * the specified ones as a name or `undefined`.
 *
 * Case-insensitive.
 */
function getPostElementByName(
  elements: IPostElement[],
  searchValue: string[]
): IPostElement | undefined {
  // Inside function used to find the element with the given name
  function findElement(es: IPostElement[], name: string) {
    return es.find((e) => e.name.toUpperCase() === name.toUpperCase());
  }

  // Find the elements with the given names, filter
  // for "undefined" and return the first element or
  // "undefined" if no element is found
  return searchValue
    .map((name) => findElement(elements, name))
    .filter((post) => post !== undefined)
    .shift();
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
    if (stringInDict(prefix, shared.prefixes["engines"]))
      engine = prefix as TEngine;
    else if (stringInDict(prefix, shared.prefixes["statuses"]))
      status = prefix as TStatus;
    else if (stringInDict(prefix, fakeModDict)) mod = true;

    // Anyway add the prefix to list
    hw.prefixes.push(prefix);
  });

  // If the status is not set, then the game is in development (Ongoing)
  status = status && hw.category === "games" ? status : "Ongoing";

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
  hw.os = getPostElementByName(elements, md.OS)
    ?.text?.split(",")
    .map((s) => s.trim());
  hw.language = getPostElementByName(elements, md.LANGUAGE)
    ?.text?.split(",")
    .map((s) => s.trim());
  hw.version = getPostElementByName(elements, md.VERSION)?.text;
  hw.installation = getPostElementByName(elements, md.INSTALLATION)?.text;
  hw.pages = getPostElementByName(elements, md.PAGES)?.text;
  hw.resolution = getPostElementByName(elements, md.RESOLUTION)
    ?.text?.split(",")
    .map((s) => s.trim());
  hw.length = getPostElementByName(elements, md.LENGHT)?.text;

  // Parse the censorship
  const censored = getPostElementByName(elements, md.CENSORED);
  if (censored) hw.censored = stringToBoolean(censored.text);

  // Get the genres
  const genre = getPostElementByName(elements, md.GENRE)?.text;
  hw.genre = genre
    ?.split(",")
    .map((s) => s.trim())
    .filter((s) => s !== "");

  // Fill the dates
  const releaseDateText = getPostElementByName(elements, md.RELEASE)?.text;
  const releaseDate = getDateFromString(releaseDateText);
  if (releaseDate) hw.lastRelease = releaseDate;

  //Get the overview
  const overview = getPostElementByName(elements, md.OVERVIEW)?.text;

  // Get the cover
  const cover = (getPostElementByName(elements, md.COVER) as ILink)?.href;

  // Get the author
  const authors = parseAuthor(elements);

  // Get the changelog
  const changelog = parseChangelog(elements);

  const merged = Object.assign(hw, { overview, cover, authors, changelog });
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
  const authorElement = getPostElementByName(elements, md.AUTHOR);

  if (authorElement) {
    // Set the author name
    author.name = authorElement.text;

    // Add the found platforms
    authorElement.content
      .filter((e: ILink) => e.href)
      .forEach((e: ILink) => {
        // Create and push the new platform
        const platform: TExternalPlatform = {
          name: e.text,
          link: e.href
        };

        author.platforms.push(platform);
      });

    // Sometimes the author has a profile on F95Zone and
    // it will be saved under platforms, not in name.
    const f95Profile = author.platforms.filter((p) => isF95URL(p.link)).shift();
    if (author.name === "" && f95Profile) author.name = f95Profile.name;

    // Sometimes there is only one "support" platform and no name of the author.
    // In these case, usually, the name on the platform is the author's name.
    if (author.name === "" && author.platforms.length === 1)
      author.name = author.platforms[0].name;
  }

  return [author];
}

/**
 * Parse the changelog from the post's data.
 */
function parseChangelog(elements: IPostElement[]): TChangelog[] {
  // Local variables
  const changelog = [];
  const changelogElement = getPostElementByName(elements, md.CHANGELOG);

  if (changelogElement) {
    // Regex used to match version tags
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

      // Fetch the group of data of this version tag
      const group = changelogElement.content.slice(i, diff);
      versionChangelog.version = group.shift().text.replace("v", "").trim();

      // Parse the data
      group.forEach((e) => {
        if (e.type === "Empty" || e.type === "Spoiler") {
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

/**
 * Gets all dates in the `YYYY-MM-DD` format and
 * sorts them according to the `older` parameter.
 */
function getDateFromString(
  s: string,
  order: "crescent" | "decrescent" = "decrescent"
): Date | undefined {
  // Use regex to find the date (if any)
  const regex = /\d{4}[/-](0?[1-9]|1[012])[/-](3[01]|[12][0-9]|0?[1-9])/gim;
  const match = s.match(regex);

  // Sort the array of date using "order"
  const orderCrescent = (a: Date, b: Date) => a.getTime() - b.getTime();
  const orderDecrescent = (a: Date, b: Date) => b.getTime() - a.getTime();
  const array = match.map((s) => new Date(s));
  order === "decrescent"
    ? array.sort(orderDecrescent)
    : array.sort(orderCrescent);

  // Return the first
  return array.shift();
}

//#endregion Private methods
