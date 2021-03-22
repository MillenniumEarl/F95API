// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from files
import { TAuthor, TEngine, IGame, TRating, TStatus, TCategory, TChangelog } from "../../interfaces";

export default class Game implements IGame {
  //#region Properties
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
  changelog: TChangelog[];
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
  //#endregion Properties
}
