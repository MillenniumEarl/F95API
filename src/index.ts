// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import shared from "./scripts/shared";

//#region Re-export classes

export { default as PrefixParser } from "./scripts/classes/prefix-parser";

export { default as Animation } from "./scripts/classes/handiwork/animation";
export { default as Asset } from "./scripts/classes/handiwork/asset";
export { default as Comic } from "./scripts/classes/handiwork/comic";
export { default as Game } from "./scripts/classes/handiwork/game";
export { default as Handiwork } from "./scripts/classes/handiwork/handiwork";

export { default as PlatformUser } from "./scripts/classes/mapping/platform-user";
export { default as Post } from "./scripts/classes/mapping/post";
export { default as Thread } from "./scripts/classes/mapping/thread";
export { default as UserProfile } from "./scripts/classes/mapping/user-profile";

export { default as HandiworkSearchQuery } from "./scripts/classes/query/handiwork-search-query";
export { default as LatestSearchQuery } from "./scripts/classes/query/latest-search-query";
export { default as ThreadSearchQuery } from "./scripts/classes/query/thread-search-query";

//#endregion Re-export classes

//#region Export properties

type TLog4JSLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";

/**
 * Set the logger level for module debugging.
 */
function setLoggerLevel(level: TLog4JSLevel): void {
  shared.logger.level = level;
}

/**
 * Indicates the current logging level.
 */
function loggerLevel(): TLog4JSLevel {
  return shared.logger.level as TLog4JSLevel;
}

/**
 * Indicates whether the current session is authenticated.
 */
function isLogged(): boolean {
  return shared.isLogged;
}

export { isLogged, loggerLevel, setLoggerLevel };

setLoggerLevel("warn"); // By default log only the warn messages

//#endregion Export properties

//#region Re-export methods

export * from "./scripts/handiwork-from-url";
export * from "./scripts/login";
export * from "./scripts/updates";
export { default as searchHandiwork } from "./scripts/search";

//#endregion Re-export methods
