// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { TEngine, IGame, TStatus } from "../../interfaces";
import Basic from "./basic";

export default class Game extends Basic implements IGame {
  //#region Properties
  readonly censored: boolean;
  readonly engine: TEngine;
  readonly genre: string[];
  readonly installation: string;
  readonly language: string[];
  readonly lastRelease: Date;
  readonly mod: boolean;
  readonly os: string[];
  readonly status: TStatus;
  readonly version: string;
  //#endregion Properties

  public constructor(init?: Partial<Game>) {
    super();
    Object.assign(this, init);
  }
}
