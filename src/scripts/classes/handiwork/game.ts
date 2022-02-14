// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { DEFAULT_DATE } from "../../constants/generic";
import { IGame } from "../../interfaces";
import { TEngine, TStatus } from "../../types";
import Basic from "./basic";

export default class Game extends Basic implements IGame {
  //#region Properties
  censored: boolean = false;
  engine: TEngine = "Ren'Py";
  genre: string[] = [];
  installation: string = "";
  language: string[] = [];
  lastRelease: Date = DEFAULT_DATE;
  os: string[] = [];
  status: TStatus = "Ongoing";
  version: string = "";
  //#endregion Properties

  public constructor(init?: Partial<Basic>) {
    super();
    Object.assign(this, init);
  }
}
