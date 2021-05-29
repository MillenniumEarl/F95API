// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Modules from files
import { IAnimation } from "../../interfaces";
import Basic from "./basic";

export default class Animation extends Basic implements IAnimation {
  //#region Properties
  readonly censored: boolean;
  readonly genre: string[];
  readonly installation: string;
  readonly language: string[];
  readonly length: string;
  readonly pages: string;
  readonly resolution: string[];
  //#endregion Properties

  public constructor(init?: Partial<Animation>) {
    super();
    Object.assign(this, init);
  }
}
