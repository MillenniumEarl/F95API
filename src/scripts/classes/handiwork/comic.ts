"use strict";

// Modules from files
import { AuthorType, IComic, RatingType, CategoryType } from "../../interfaces";

export default class Comic implements IComic {
    
    //#region Properties
    Genre: string[];
    Pages: string;
    Resolution: string[];
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