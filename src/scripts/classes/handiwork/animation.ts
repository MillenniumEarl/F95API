"use strict";

// Modules from files
import { AuthorI, AnimationI, RatingI } from "../../interfaces";

export default class Animation implements AnimationI {
    
    //#region Properties
    Censored: boolean;
    Genre: string[];
    Installation: string;
    Language: string[];
    Lenght: string;
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