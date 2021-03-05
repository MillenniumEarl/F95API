import log4js from "log4js";
import Session from "./classes/session.js";
export declare type TPrefixDict = {
  [n: number]: string;
};
declare type TPrefixKey = "engines" | "statuses" | "tags" | "others";
/**
 * Class containing variables shared between modules.
 */
export default abstract class Shared {
  private static _isLogged;
  private static _prefixes;
  private static _logger;
  private static _session;
  /**
   * Indicates whether a user is logged in to the F95Zone platform or not.
   */
  static get isLogged(): boolean;
  /**
   * List of platform prefixes and tags.
   */
  static get prefixes(): {
    [s: string]: TPrefixDict;
  };
  /**
   * Logger object used to write to both file and console.
   */
  static get logger(): log4js.Logger;
  /**
   * Path to the cache used by this module wich contains engines, statuses, tags...
   */
  static get cachePath(): string;
  /**
   * Session on the F95Zone platform.
   */
  static get session(): Session;
  static setPrefixPair(key: TPrefixKey, val: TPrefixDict): void;
  static setIsLogged(val: boolean): void;
}
export {};
