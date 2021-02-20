"use strict";

// Modules from files
import { IAuthor, ComicI, IRating } from "../../interfaces";

export default class Comic implements ComicI {
    
    //#region Properties
    Genre: string[];
    Pages: string;
    Resolution: string[];
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