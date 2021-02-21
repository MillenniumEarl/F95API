"use strict";

// Modules from files
import { AuthorType, IAnimation, RatingType, CategoryType } from "../../interfaces";

export default class Animation implements IAnimation {
    
    //#region Properties
    Censored: boolean;
    Genre: string[];
    Installation: string;
    Language: string[];
    Lenght: string;
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