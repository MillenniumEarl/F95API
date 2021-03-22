// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from files
import { TAuthor, IComic, TRating, TCategory, TChangelog } from "../../interfaces";

export default class Comic implements IComic {
  //#region Properties
  genre: string[];
  pages: string;
  resolution: string[];
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
