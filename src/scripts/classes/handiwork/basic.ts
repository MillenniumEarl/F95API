// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { DEFAULT_DATE } from "../../constants/generic";
import { IBasic } from "../../interfaces";
import { TAuthor, TCategory, TChangelog, TRating } from "../../types";

export default class Basic implements IBasic {
  //#region Properties
  authors: TAuthor[] = [];
  category: TCategory = "games";
  changelog: TChangelog[] = [];
  cover: string = "";
  id: number = -1;
  lastThreadUpdate: Date = DEFAULT_DATE;
  name: string = "";
  overview: string = "";
  prefixes: string[] = [];
  rating: TRating = undefined as any;
  tags: string[] = [];
  threadPublishingDate: Date = DEFAULT_DATE;
  url: string = "";
  //#endregion Properties

  public constructor(init?: Partial<Basic>) {
    Object.assign(this, init);
  }

  public cast<T extends Basic>(src: Partial<T>): Partial<this> {
    Object.entries(src) // Obtains all the key from the source object
      .filter(([key]) => key in this) // Get all the keys that are in both the objects
      .map(([key, val]) => (this[key as keyof this] = val)); // Save the key in this object

    return this;
  }
}
