"use strict";

// Modules from files
import { AuthorI, AssetI, RatingI } from "../../interfaces";

export default class Asset implements AssetI {

    //#region Properties
    AssetLink: string;
    AssociatedAssets: string[];
    CompatibleSoftware: string;
    IncludedAssets: string[];
    OfficialLinks: string[];
    SKU: string;
    Authors: AuthorI[];
    Category: string;
    Changelog: string[];
    Cover: string;
    ID: number;
    LastThreadUpdate: Date;
    Name: string;
    Overview: string;
    Prefixes: string[];
    Rating: RatingI;
    Tags: string[];
    ThreadPublishingDate: Date;
    Url: string;
    //#endregion Properties

}