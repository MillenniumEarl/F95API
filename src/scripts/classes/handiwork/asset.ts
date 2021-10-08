// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from files
import { IAsset } from "../../interfaces";
import Basic from "./basic";

export default class Asset extends Basic implements IAsset {
  //#region Properties
  readonly assetLink: string = "";
  readonly associatedAssets: string[] = [];
  readonly compatibleSoftware: string = "";
  readonly includedAssets: string[] = [];
  readonly officialLinks: string[] = [];
  readonly sku: string = "";
  //#endregion Properties

  public constructor(init?: Partial<Asset>) {
    super();
    Object.assign(this, init);
  }
}
