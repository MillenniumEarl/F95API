"use strict";

// Modules from files
import { IAuthor, IRating, IHandiwork } from "../../interfaces";

/**
 * It represents a generic work, be it a game, a comic, an animation or an asset.
 */
export default class HandiWork implements IHandiwork {

    //#region Properties
    AssetLink: string;
    AssociatedAssets: string[];
    Censored: boolean;
    Changelog: string[];
    CompatibleSoftware: string;
    Genre: string[];
    IncludedAssets: string[];
    Installation: string;
    Language: string[];
    LastRelease: Date;
    Lenght: string;
    OfficialLinks: string[];
    OS: string[];
    Pages: string;
    Password: string;
    Resolution: string[];
    SKU: string;
    Version: string;
    Authors: IAuthor[];
    Category: string;
    Cover: string;
    ID: number;
    LastThreadUpdate: Date;
    Name: string;
    Overview: string;
    Prefixes: string[];
    Rating: IRating;
    Tags: string[];
    ThreadPublishingDate: Date;
    Url: string;
    //#endregion Properties

}