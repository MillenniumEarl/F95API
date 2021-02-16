"use strict";

// Modules from files
import { AuthorI, ComicI, RatingI } from "../../interfaces";

export default class Comic implements ComicI {
    
    //#region Properties
    Genre: string[];
    Pages: string;
    Resolution: string[];
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