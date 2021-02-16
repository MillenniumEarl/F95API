/**
 * Data relating to an external platform (i.e. Patreon).
 */
export type ExternalPlatformI = {
    /**
     * Name of the platform.
     */
    Name: string,
    /**
     * Link to the platform.
     */
    Link: string
}

/**
 * Information about the author of a work.
 */
export type AuthorI = {
    /**
     * Plain name or username of the author.
     */
    Name: string,
    /**
     * 
     */
    Platforms: ExternalPlatformI[],
}

/**
 * Information on the evaluation of a work.
 */
export type RatingI = {
    /**
     * Average value of evaluations.
     */
    Average: number,
    /**
     * Best rating received.
     */
    Best: number,
    /**
     * Number of ratings made by users.
     */
    Count: number,
}

/**
 * Collection of values defined for each 
 * handiwork on the F95Zone platform.
 */
interface BasicI {
    /**
     * Authors of the work.
     */
    Authors: AuthorI[],
    /**
     * Category of the work between `games`, `comics`, `animations`, `assets`.
     */
    Category: string,
    /**
     * List of changes of the work for each version.
     */
    Changelog: string[],
    /**
     * Link to the cover image of the work.
     */
    Cover: string,
    /**
    * Unique ID of the work on the platform.
    */
    ID: number,
    /**
     * Last update of the opera thread.
     */
    LastThreadUpdate: Date,
    /**
     * Plain name of the work (without tags and/or prefixes)
     */
    Name: string,
    /**
     * Work description
     */
    Overview: string,
    /**
     * List of prefixes associated with the work.
     */
    Prefixes: string[],
    /**
     * Evaluation of the work by the users of the platform.
     */
    Rating: RatingI,
    /**
     * List of tags associated with the work.
     */
    Tags: string[],
    /**
     * Date of publication of the thread associated with the work.
     */
    ThreadPublishingDate: Date,
    /**
     * URL to the work's official conversation on the F95Zone portal.
     */
    Url: string,
}

/**
 * Collection of values representing a game present on the F95Zone platform.
 */
export interface GameI extends BasicI {
    /**
     * Specify whether the work has censorship
     * measures regarding NSFW scenes
     */
    Censored: boolean,
    /**
     * List of genres associated with the work.
     */
    Genre: string[],
    /**
     * Author's Guide to Installation.
     */
    Installation: string,
    /**
     * List of available languages.
     */
    Language: string[],
    /**
     * Last time the work underwent updates.
     */
    LastRelease: Date,
    /**
     * List of OS for which the work is compatible.
     */
    OS: string[],
    /**
     * Version of the work.
     */
    Version: string,
}

/**
 * Collection of values representing a comic present on the F95Zone platform.
 */
export interface ComicI extends BasicI {
    /**
     * List of genres associated with the work.
     */
    Genre: string[],
    /**
     * Number of pages or elements that make up the work.
     */
    Pages: string,
    /**
     * List of resolutions available for the work.
     */
    Resolution: string[],
}

/**
 * Collection of values representing an animation present on the F95Zone platform.
 */
export interface AnimationI extends BasicI {
    /**
     * Specify whether the work has censorship
     * measures regarding NSFW scenes
     */
    Censored: boolean,
    /**
     * List of genres associated with the work.
     */
    Genre: string[],
    /**
     * Author's Guide to Installation.
     */
    Installation: string,
    /**
     * List of available languages.
     */
    Language: string[],
    /**
     * Length of the animation.
     */
    Lenght: string,
    /**
     * Number of pages or elements that make up the work.
     */
    Pages: string,
    /**
     * List of resolutions available for the work.
     */
    Resolution: string[],
}

/**
 * Collection of values representing an asset present on the F95Zone platform.
 */
export interface AssetI extends BasicI {
    /**
     * External URL of the asset.
     */
    AssetLink: string,
    /**
     * List of URLs of assets associated with the work
     * (for example same collection).
     */
    AssociatedAssets: string[],
    /**
     * Software compatible with the work.
     */
    CompatibleSoftware: string,
    /**
     * List of assets url included in the work or used to develop it.
     */
    IncludedAssets: string[],
    /**
     * List of official links of the work, external to the platform.
     */
    OfficialLinks: string[],
    /**
     * Unique SKU value of the work.
     */
    SKU: string,
}

/**
 * Collection of values extrapolated from the 
 * F95 platform representing a particular work.
 */
export interface HandiworkI extends GameI, ComicI, AnimationI, AssetI {}