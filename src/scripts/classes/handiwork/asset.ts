"use strict";

// Modules from files
import { TAuthor, IAsset, TRating, TCategory } from "../../interfaces";

export default class Asset implements IAsset {

    //#region Properties
    assetLink: string;
    associatedAssets: string[];
    compatibleSoftware: string;
    includedAssets: string[];
    officialLinks: string[];
    sku: string;
    authors: TAuthor[];
    category: TCategory;
    changelog: string[];
    cover: string;
    id: number;
    lastThreadUpdate: Date;
    name: string;
    overview: string;
    prefixes: string[];
    rating: TRating;
    tags: string[];
    threadPublishingDate: Date;
    url: string;
    //#endregion Properties

}