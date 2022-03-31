// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Data relating to an external platform (i.e. Patreon).
 */
export type TExternalPlatform = {
  /**
   * name of the platform.
   */
  name: string;
  /**
   * link to the platform.
   */
  link: string;
};

/**
 * Information about the author of a work.
 */
export type TAuthor = {
  /**
   * Plain name or username of the author.
   */
  name: string;
  /**
   *
   */
  platforms: TExternalPlatform[];
};

/**
 * Information on the evaluation of a work.
 */
export type TRating = {
  /**
   * average value of evaluations.
   */
  average: number;
  /**
   * Best rating received.
   */
  best: number;
  /**
   * Number of ratings made by users.
   */
  count: number;
};

/**
 * Information about a single version of the product.
 */
export type TChangelog = {
  /**
   * Product version.
   */
  version: string;
  /**
   * Version information.
   */
  information: string[];
};

/**
 * List of possible graphics engines used for game development.
 */
export type TEngine =
  | "QSP"
  | "RPGM"
  | "Unity"
  | "HTML"
  | "RAGS"
  | "Java"
  | "Ren'Py"
  | "Flash"
  | "ADRIFT"
  | "Others"
  | "Tads"
  | "Wolf RPG"
  | "Unreal Engine"
  | "WebGL";

/**
 * List of possible progress states associated with a game.
 */
export type TStatus = "Completed" | "Ongoing" | "Abandoned" | "Onhold";

/**
 * List of possible categories of a particular work.
 */
export type TCategory = "games" | "mods" | "comics" | "animations" | "assets";

/**
 * Valid names of classes that implement the IQuery interface.
 */
export type TQueryInterface =
  | "LatestSearchQuery"
  | "ThreadSearchQuery"
  | "HandiworkSearchQuery";

/**
 * Types of reaction that can be used in response to a post.
 */
export type TAlertReactionType =
  | "Like"
  | "HeyThere"
  | "Love"
  | "Jizzed"
  | "Hearth"
  | "Yay"
  | "Haha"
  | "Sad"
  | "Thinking"
  | "Facepalm"
  | "Wow";

/**
 * Types of alert messages that can be notified to the currently logged in user.
 */
export type TAlertType =
  | "Quote"
  | "Reaction"
  | "Award"
  | "Reply"
  | "Rating"
  | "Unknown";
