// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import HandiWork from "../classes/handiwork/handiwork";
import Thread from "../classes/mapping/thread";
import {
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
import Basic from "../classes/handiwork/basic";

/**
 * Gets information of a particular handiwork from its thread.
 *
 * If you don't want to specify the object type, use `HandiWork`.
 */
export default async function getHandiworkInformation<T extends Basic>(
  arg: string | Thread,
  type: new () => T
): Promise<T> {
  // Get thread
  const thread = await getThread(arg);
  shared.logger.info(`Obtaining handiwork from ${thread.url}`);

  // Convert the info from thread to handiwork
  const hw: HandiWork = new Handiwork({
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

  // Obtains the prefixes from the thread
  fillWithPrefixes(hw, thread.prefixes);

  // Fetch info from first post
  const post = await thread.getPost(1);
  fillWithPostData(hw, post.body);

  // On older game template the version is not
  // specified in the OP, so we need to parse
  // it from the title
  if (hw.version !== "") {
    const version = getVersionFromHeadline(thread.headline, hw);
    Object.assign(hw.version, version);
  }

  // Cast and return the object
  const castingObject = new type();
  castingObject.cast(hw);

  return castingObject;
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
 * Obtains the a `Thread` object from the argument.
 */
async function getThread(t: Thread | string): Promise<Thread> {
  // Local variable
  let thread = null;

  // Fetch thread data
  /* istanbul ignore if */
  if (typeof t === "string") {
    const id = extractIDFromURL(t);
    thread = new Thread(id);
    await thread.fetch();
  } else thread = t as Thread;

  return thread;
}

/**
 * Given the headline of a thread, return the
 * version without the trailing `v` (if any).
 */
function getVersionFromHeadline(headline: string, hw: Handiwork): string {
  // Find all the elements in the square brackets (version and author)
  const matches = headline.match(/(?<=\[)(.*?)(?=\])/g);

  // Parse the matches to ignore the author
  let version = matches
    .map((match) => {
      const isAuthor = hw.authors
        .map((a) => a.name.toUpperCase()) // Get all the author's names
        .some((name) => match.toUpperCase().includes(name)); // Check if the current match is an author

      return isAuthor ? null : match;
    })
    .filter((v) => v !== null)
    .shift();

  // Remove trailing "v" if any
  version =
    version.match(/^[v|V](?=\d)/i)?.length === 0
      ? version
      : version.replace("v", "");

  return version;
}

/**
 * Parse the post prefixes.
 *
 * In particular, it elaborates the following prefixes for games:
 * `Engine`, `Status`, `Mod`.
 */
function fillWithPrefixes(hw: Handiwork, prefixes: string[]) {
  shared.logger.trace("Parsing prefixes...");

  // Local variables
  let engine: TEngine = null;
  let status: TStatus = null;

  prefixes.map((item) => {
    // Remove the square brackets
    const prefix = item.replace("[", "").replace("]", "");

    // Check what the prefix indicates
    if (stringInDict(prefix, shared.prefixes["engines"]))
      engine = prefix as TEngine;
    else if (stringInDict(prefix, shared.prefixes["statuses"]))
      status = prefix as TStatus;

    // Anyway add the prefix to list
    hw.prefixes.push(prefix);
  });

  // If the status is not set, then the game is in development (Ongoing)
  status = status && hw.category === "games" ? status : "Ongoing";

  // Assign the parsed info
  Object.assign(hw.status, status);
  Object.assign(hw.engine, engine);
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
function fillWithPostData(hw: HandiWork, elements: IPostElement[]) {
  // Helper methods
  const getTextFromElement = (metadata: string[]) =>
    getPostElementByName(elements, metadata)?.text;

  const parseArrayOfStrings = (metadata: string[], separator = ",") =>
    getTextFromElement(metadata)
      ?.split(separator)
      .map((s) => s.trim())
      .filter((s) => s !== "");

  // First fill the "simple" elements
  Object.assign(hw.os, parseArrayOfStrings(md.OS));
  Object.assign(hw.language, parseArrayOfStrings(md.LANGUAGE));
  Object.assign(hw.version, getTextFromElement(md.VERSION));
  Object.assign(hw.installation, getTextFromElement(md.INSTALLATION));
  Object.assign(hw.pages, getTextFromElement(md.PAGES));
  Object.assign(hw.resolution, parseArrayOfStrings(md.RESOLUTION));
  Object.assign(hw.length, getTextFromElement(md.LENGTH));

  // Parse the censorship
  const censored = getTextFromElement(md.CENSORED);
  if (censored) Object.assign(hw.censored, stringToBoolean(censored));

  // Get the genres
  Object.assign(hw.genre, parseArrayOfStrings(md.GENRE));

  // Fill the dates
  const releaseDateText = getTextFromElement(md.RELEASE);
  const releaseDate = getDateFromString(releaseDateText);
  if (releaseDate) Object.assign(hw.lastRelease, releaseDate);

  // Get the overview
  Object.assign(hw.overview, getTextFromElement(md.OVERVIEW));

  // Get the cover
  const cover = (getPostElementByName(elements, md.COVER) as ILink)?.href;
  Object.assign(hw.cover, cover);

  // Get the author
  Object.assign(hw.authors, parseAuthor(elements));

  // Get the changelog
  Object.assign(hw.changelog, parseChangelog(elements));
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
