// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { IHandiwork, TEngine, TStatus } from "../../interfaces";
import Animation from "./animation";
import Asset from "./asset";
import Basic from "./basic";
import Comic from "./comic";
import Game from "./game";

/**
 * It represents a generic work, be it a game, a comic, an animation or an asset.
 */
export default class HandiWork extends Basic implements IHandiwork {
  //#region Properties
  censored: boolean;
  engine: TEngine;
  genre: string[];
  installation: string;
  language: string[];
  lastRelease: Date;
  mod: boolean;
  os: string[];
  status: TStatus;
  version: string;
  pages: string;
  resolution: string[];
  length: string;
  assetLink: string;
  associatedAssets: string[];
  compatibleSoftware: string;
  includedAssets: string[];
  officialLinks: string[];
  sku: string;
  //#endregion Properties

  public constructor(
    init?: Partial<HandiWork | Comic | Animation | Asset | Game>
  ) {
    super();
    Object.assign(this, init);
  }
}
