// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { DEFAULT_DATE } from "../../constants/generic";
import { TEngine, IGame, TStatus } from "../../interfaces";
import Basic from "./basic";

export default class Game extends Basic implements IGame {
  //#region Properties
  readonly censored: boolean = false;
  readonly engine: TEngine = "Ren'Py";
  readonly genre: string[] = [];
  readonly installation: string = "";
  readonly language: string[] = [];
  readonly lastRelease: Date = DEFAULT_DATE;
  readonly os: string[] = [];
  readonly status: TStatus = "Ongoing";
  readonly version: string = "";
  //#endregion Properties

  public constructor(init?: Partial<Game>) {
    super();
    Object.assign(this, init);
  }
}
