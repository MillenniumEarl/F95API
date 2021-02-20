"use strict";

// Modules from files
import { IAuthor, GameI, IRating } from "../../interfaces";

export default class Game implements GameI {

    //#region Properties
    Censored: boolean;
    Genre: string[];
    Installation: string;
    Language: string[];
    LastRelease: Date;
    OS: string[];
    Version: string;
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