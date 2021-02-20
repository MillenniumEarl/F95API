"use strict";

// Modules from files
import { IAuthor, AnimationI, IRating } from "../../interfaces";

export default class Animation implements AnimationI {
    
    //#region Properties
    Censored: boolean;
    Genre: string[];
    Installation: string;
    Language: string[];
    Lenght: string;
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