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
  TCategory,
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
import { getDateFromString } from "../utils";

/**
 * Gets information of a particular handiwork from its thread.
 *
 * If you don't want to specify the object type, use `HandiWork`.
 * @param {new () => T} type Handiwork class to use for casting the result.
 */
export default async function getHandiworkInformation<T extends Basic>(
  arg: string | Thread,
  type: new () => T
): Promise<T> {
  // Get thread
  const thread = await getThread(arg);
  shared.logger.info(`Obtaining handiwork from ${thread.url}`);

  // Obtains the prefixes from the thread
  const extracted = extractPrefixes(thread.prefixes, thread.category);

  // Fetch info from opening post
  const post = await thread.getPost(1);
  const postData = extractPostData(post.body);

  // On older game template the version is not
  // specified in the OP, so we need to parse
  // it from the title
  if (!postData.version || postData.version === "") {
    const authors = postData.authors as TAuthor[];
    const version = getVersionFromHeadline(thread.headline, authors);
    postData.version = version;
  }

  // Build the handiwork from the parsed and/or extracted data
  const hw: HandiWork = new Handiwork({
    id: thread.id,
    url: thread.url,
    name: thread.title,
    category: thread.category,
    threadPublishingDate: thread.publication,
    lastThreadUpdate: thread.modified,
    tags: thread.tags,
    rating: thread.rating,
    prefixes: extracted.prefixes,
    status: extracted.status,
    engine: extracted.engine,
    version: postData.version as string,
    overview: postData.overview as string,
    os: postData.os as string[],
    language: postData.language as string[],
    installation: postData.installation as string,
    pages: postData.pages as string,
    resolution: postData.os as string[],
    length: postData.length as string,
    genre: postData.genre as string[],
    censored: postData.censored as boolean,
    lastRelease: postData.lastRelease as Date,
    authors: postData.authors as TAuthor[],
    changelog: postData.changelog as TChangelog[],
    cover: postData.cover as string
  });

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
function getVersionFromHeadline(headline: string, authors: TAuthor[]): string {
  // Find all the elements in the square brackets (version and author)
  const matches = headline.match(/(?<=\[)(.*?)(?=\])/g);

  // Parse the matches to ignore the author
  let version = matches
    .map((match) => {
      const isAuthor = authors
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
function extractPrefixes(prefixes: string[], category: TCategory) {
  shared.logger.trace("Parsing prefixes...");

  // Local variables
  let engine: TEngine = null;
  let status: TStatus = null;
  const parsedPrefixes: string[] = [];

  prefixes.map((item) => {
    // Remove the square brackets
    const prefix = item.replace("[", "").replace("]", "");

    // Check what the prefix indicates
    if (stringInDict(prefix, shared.prefixes["engines"]))
      engine = prefix as TEngine;
    else if (stringInDict(prefix, shared.prefixes["statuses"]))
      status = prefix as TStatus;

    // Anyway add the prefix to list
    parsedPrefixes.push(prefix);
  });

  // If the status is not set, then the game is in development (Ongoing)
  status = status && category === "games" ? status : "Ongoing";

  return {
    status: status,
    engine: engine,
    prefixes: parsedPrefixes
  };
}

/**
 * Extract HandiWork data from the main post of the HandiWork's page.
 *
 * The values that will be added are:
 * `Overview`, `OS`, `Language`, `Version`, `Installation`,
 * `Pages`, `Resolution`, `Lenght`, `Genre`, `Censored`,
 * `LastRelease`, `Authors`, `Changelog`, `Cover`.
 */
function extractPostData(elements: IPostElement[]) {
  /**
   * Types of value extracted from the post.
   */
  type content = string | string[] | boolean | Date | TAuthor[] | TChangelog[];

  /**
   * Groups the values extracted from the post.
   */
  const extracted: Record<string, content> = {};

  // Helper methods
  const getTextFromElement = (metadata: string[]) =>
    getPostElementByName(elements, metadata)?.text;

  const parseArrayOfStrings = (metadata: string[], separator = ",") =>
    getTextFromElement(metadata)
      ?.split(separator)
      .map((s) => s.trim())
      .filter((s) => s !== "");

  // First fill the "simple" elements
  extracted.cover = (getPostElementByName(elements, md.COVER) as ILink)?.href;

  extracted.version = getTextFromElement(md.VERSION);
  extracted.installation = getTextFromElement(md.INSTALLATION);
  extracted.pages = getTextFromElement(md.PAGES);
  extracted.length = getTextFromElement(md.LENGTH);
  extracted.overview = getTextFromElement(md.OVERVIEW);

  extracted.os = parseArrayOfStrings(md.OS);
  extracted.language = parseArrayOfStrings(md.LANGUAGE);
  extracted.resolution = parseArrayOfStrings(md.RESOLUTION);
  extracted.genre = parseArrayOfStrings(md.GENRE);

  // Parse the censorship
  const censored = getTextFromElement(md.CENSORED);
  if (censored) extracted.censored = stringToBoolean(censored);

  // Get the release date
  const releaseDateText = getTextFromElement(md.RELEASE);
  const releaseDate = getDateFromString(releaseDateText);
  if (releaseDate) extracted.lastRelease = releaseDate;

  // Get the author
  extracted.authors = parseAuthor(elements);

  // Get the changelog
  extracted.changelog = parseChangelog(elements);

  return extracted;
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

//#endregion Private methods
