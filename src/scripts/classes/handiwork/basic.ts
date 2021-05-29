// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from files
import { TAuthor, TRating, TCategory, TChangelog, IBasic } from "../../interfaces";

export default class Basic implements IBasic {
  //#region Properties
  readonly authors: TAuthor[];
  readonly category: TCategory;
  readonly changelog: TChangelog[];
  readonly cover: string;
  readonly id: number;
  readonly lastThreadUpdate: Date;
  readonly name: string;
  readonly overview: string;
  readonly prefixes: string[];
  readonly rating: TRating;
  readonly tags: string[];
  readonly threadPublishingDate: Date;
  readonly url: string;
  //#endregion Properties

  public constructor(init?: Partial<Basic>) {
    Object.assign(this, init);
  }
}
