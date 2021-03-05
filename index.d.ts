import { IBasic } from "./scripts/interfaces.js";
import LoginResult from "./scripts/classes/login-result.js";
import UserProfile from "./scripts/classes/mapping/user-profile.js";
import LatestSearchQuery from "./scripts/classes/query/latest-search-query.js";
import HandiworkSearchQuery from "./scripts/classes/query/handiwork-search-query.js";
import HandiWork from "./scripts/classes/handiwork/handiwork.js";
export { default as Animation } from "./scripts/classes/handiwork/animation.js";
export { default as Asset } from "./scripts/classes/handiwork/asset.js";
export { default as Comic } from "./scripts/classes/handiwork/comic.js";
export { default as Game } from "./scripts/classes/handiwork/game.js";
export { default as Handiwork } from "./scripts/classes/handiwork/handiwork.js";
export { default as PlatformUser } from "./scripts/classes/mapping/platform-user.js";
export { default as Post } from "./scripts/classes/mapping/post.js";
export { default as Thread } from "./scripts/classes/mapping/thread.js";
export { default as UserProfile } from "./scripts/classes/mapping/user-profile.js";
export { default as HandiworkSearchQuery } from "./scripts/classes/query/handiwork-search-query.js";
export { default as LatestSearchQuery } from "./scripts/classes/query/latest-search-query.js";
export { default as ThreadSearchQuery } from "./scripts/classes/query/thread-search-query.js";
/**
 * Set the logger level for module debugging.
 */
export declare let loggerLevel: string;
/**
 * Indicates whether a user is logged in to the F95Zone platform or not.
 */
export declare function isLogged(): boolean;
/**
 * Log in to the F95Zone platform.
 *
 * This **must** be the first operation performed before accessing any other script functions.
 *
 * @param cb2fa
 * Callback used if two-factor authentication is required for the profile.
 * It must return he OTP code to use for the login.
 */
export declare function login(username: string, password: string, cb2fa?: () => Promise<number>): Promise<LoginResult>;
/**
 * Chek if exists a new version of the handiwork.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export declare function checkIfHandiworkHasUpdate(hw: HandiWork): Promise<boolean>;
/**
 * Search for one or more handiworks identified by a specific query.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @param {HandiworkSearchQuery} query Parameters used for the search.
 * @param {Number} limit Maximum number of results. Default: 10
 */
export declare function searchHandiwork<T extends IBasic>(query: HandiworkSearchQuery, limit?: number): Promise<T[]>;
/**
 * Given the url, it gets all the information about the handiwork requested.
 *
 * You **must** be logged in to the portal before calling this method.
 */
export declare function getHandiworkFromURL<T extends IBasic>(url: string): Promise<T>;
/**
 * Gets the data of the currently logged in user.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @returns {Promise<UserProfile>} Data of the user currently logged in
 */
export declare function getUserData(): Promise<UserProfile>;
/**
 * Gets the latest updated games that match the specified parameters.
 *
 * You **must** be logged in to the portal before calling this method.
 *
 * @param {LatestSearchQuery} query Parameters used for the search.
 * @param {Number} limit Maximum number of results. Default: 10
 */
export declare function getLatestUpdates<T extends IBasic>(query: LatestSearchQuery, limit?: number): Promise<T[]>;
