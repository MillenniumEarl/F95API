import { TAuthor, TRating, IHandiwork, TEngine, TCategory, TStatus } from "../../interfaces";
/**
 * It represents a generic work, be it a game, a comic, an animation or an asset.
 */
export default class HandiWork implements IHandiwork {
    censored: boolean;
    engine: TEngine;
    genre: string[];
    installation: string;
    language: string[];
    lastRelease: Date;
    mod: boolean;
    os: string[];
    status: TStatus;
    version: string;
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
    pages: string;
    resolution: string[];
    lenght: string;
    assetLink: string;
    associatedAssets: string[];
    compatibleSoftware: string;
    includedAssets: string[];
    officialLinks: string[];
    sku: string;
}
