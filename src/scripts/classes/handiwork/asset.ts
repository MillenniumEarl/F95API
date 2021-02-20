"use strict";

// Modules from files
import { IAuthor, AssetI, IRating } from "../../interfaces";

export default class Asset implements AssetI {

    //#region Properties
    AssetLink: string;
    AssociatedAssets: string[];
    CompatibleSoftware: string;
    IncludedAssets: string[];
    OfficialLinks: string[];
    SKU: string;
    Authors: IAuthor[];
    Category: string;
    Changelog: string[];
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