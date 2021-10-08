// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { IComic } from "../../interfaces";
import Basic from "./basic";

export default class Comic extends Basic implements IComic {
  //#region Properties
  genre: string[] = [];
  pages: string = "";
  resolution: string[] = [];
  //#endregion Properties

  public constructor(init?: Partial<Comic>) {
    super();
    Object.assign(this, init);
  }
}
