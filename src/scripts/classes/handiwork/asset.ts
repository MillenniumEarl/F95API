"use strict";

// Modules from files
import { AuthorType, IAsset, RatingType, CategoryType } from "../../interfaces";

export default class Asset implements IAsset {

    //#region Properties
    AssetLink: string;
    AssociatedAssets: string[];
    CompatibleSoftware: string;
    IncludedAssets: string[];
    OfficialLinks: string[];
    SKU: string;
    Authors: AuthorType[];
    Category: CategoryType;
    Changelog: string[];
    Cover: string;
    ID: number;
    LastThreadUpdate: Date;
    Name: string;
    Overview: string;
    Prefixes: string[];
    Rating: RatingType;
    Tags: string[];
    ThreadPublishingDate: Date;
    Url: string;
    //#endregion Properties

}