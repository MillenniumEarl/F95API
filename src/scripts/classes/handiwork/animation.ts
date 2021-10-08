// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { IAnimation } from "../../interfaces";
import Basic from "./basic";

export default class Animation extends Basic implements IAnimation {
  //#region Properties
  censored: boolean = false;
  genre: string[] = [];
  installation: string = "";
  language: string[] = [];
  length: string = "";
  pages: string = "";
  resolution: string[] = [];
  //#endregion Properties

  public constructor(init?: Partial<Basic>) {
    super();
    Object.assign(this, init);
  }
}
