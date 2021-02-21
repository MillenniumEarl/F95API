"use strict";

// Modules from files
import { AuthorType, EngineType, IGame, RatingType, StatusType, CategoryType } from "../../interfaces";

export default class Game implements IGame {
    
    //#region Properties
    Censored: boolean;
    Genre: string[];
    Installation: string;
    Language: string[];
    LastRelease: Date;
    OS: string[];
    Version: string;
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
    Engine: EngineType;
    Mod: boolean;
    Status: StatusType;
    //#endregion Properties

}