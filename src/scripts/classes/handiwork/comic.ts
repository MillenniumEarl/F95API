"use strict";

// Modules from files
import { TAuthor, IComic, TRating, TCategory } from "../../interfaces";

export default class Comic implements IComic {
  //#region Properties
  genre: string[];
  pages: string;
  resolution: string[];
  authors: TAuthor[];
  category: TCategory;
  changelog: string[];
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
