"use strict";

// Modules from files
import { AuthorI, GameI, RatingI } from "../../interfaces";

export default class Game implements GameI {

    //#region Properties
    Censored: boolean;
    Genre: string[];
    Installation: string;
    Language: string[];
    LastRelease: Date;
    OS: string[];
    Version: string;
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