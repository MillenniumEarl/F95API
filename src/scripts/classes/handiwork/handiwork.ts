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
  readonly censored: boolean;
  readonly engine: TEngine;
  readonly genre: string[];
  readonly installation: string;
  readonly language: string[];
  readonly lastRelease: Date;
  readonly os: string[];
  readonly status: TStatus;
  readonly version: string;
  readonly pages: string;
  readonly resolution: string[];
  readonly length: string;
  readonly assetLink: string;
  readonly associatedAssets: string[];
  readonly compatibleSoftware: string;
  readonly includedAssets: string[];
  readonly officialLinks: string[];
  readonly sku: string;
  //#endregion Properties

  public constructor(
    init?: Partial<HandiWork | Comic | Animation | Asset | Game>
  ) {
    super();
    Object.assign(this, init);
  }
}
