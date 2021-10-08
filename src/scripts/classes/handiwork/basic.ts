// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { DEFAULT_DATE } from "../../constants/generic";
import {
  TAuthor,
  TRating,
  TCategory,
  TChangelog,
  IBasic
} from "../../interfaces";

export default class Basic implements IBasic {
  //#region Properties
  readonly authors: TAuthor[] = [];
  readonly category: TCategory = "games";
  readonly changelog: TChangelog[] = [];
  readonly cover: string = "";
  readonly id: number = -1;
  readonly lastThreadUpdate: Date = DEFAULT_DATE;
  readonly name: string = "";
  readonly overview: string = "";
  readonly prefixes: string[] = [];
  readonly rating: TRating = null as any;
  readonly tags: string[] = [];
  readonly threadPublishingDate: Date = DEFAULT_DATE;
  readonly url: string = "";
  //#endregion Properties

  public constructor(init?: Partial<Basic>) {
    Object.assign(this, init);
  }

  public cast<T extends IBasic>(src: T): this {
    Object.entries(src) // Obtains all the key from the source object
      .filter(([key]) => key in this) // Get all the keys that are in both the objects
      .map(([key, val]) => Object.assign(this[key], val)); // Save the key in this object

    return this;
  }
}
