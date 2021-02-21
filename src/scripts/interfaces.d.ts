/**
 * Data relating to an external platform (i.e. Patreon).
 */
export type ExternalPlatformType = {
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
export type AuthorType = {
    /**
     * Plain name or username of the author.
     */
    Name: string,
    /**
     * 
     */
    Platforms: ExternalPlatformType[],
}

/**
 * Information on the evaluation of a work.
 */
export type RatingType = {
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
 * List of possible graphics engines used for game development.
 */
export type EngineType = "QSP" | "RPGM" | "Unity" | "HTML" | "RAGS" | "Java" | "Ren'Py" | "Flash" | "ADRIFT" | "Others" | "Tads" | "Wolf RPG" | "Unreal Engine" | "WebGL";

/**
 * List of possible progress states associated with a game.
 */
export type StatusType = "Completed" | "Ongoing" | "Abandoned" | "Onhold";

/**
 * List of possible categories of a particular work.
 */
export type CategoryType = "games" | "comics" | "animations" | "assets";

/**
 * Collection of values defined for each 
 * handiwork on the F95Zone platform.
 */
export interface IBasic {
    /**
     * Authors of the work.
     */
    Authors: AuthorType[],
    /**
     * Category of the work..
     */
    Category: CategoryType,
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
    Rating: RatingType,
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
export interface IGame extends IBasic {
    /**
     * Specify whether the work has censorship
     * measures regarding NSFW scenes
     */
    Censored: boolean,
    /**
     * Graphics engine used for game development.
     */
    Engine: EngineType,
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
     * Indicates that this item represents a mod.
     */
    Mod: boolean,
    /**
     * List of OS for which the work is compatible.
     */
    OS: string[],
    /**
     * Indicates the progress of a game.
     */
    Status: StatusType,
    /**
     * Version of the work.
     */
    Version: string,
}

/**
 * Collection of values representing a comic present on the F95Zone platform.
 */
export interface IComic extends IBasic {
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
export interface IAnimation extends IBasic {
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
export interface IAsset extends IBasic {
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
export interface IHandiwork extends IGame, IComic, IAnimation, IAsset { }