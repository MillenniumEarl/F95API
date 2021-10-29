// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { AxiosResponse } from "axios";

// Modules from file
import { fetchGETResponse } from "../../network-helper";
import { TCategory, TQueryInterface } from "../../types";
import { GenericAxiosError } from "../errors";
import PrefixParser from "../prefix-parser";
import { urls } from "../../constants/url";
import { IQuery } from "../../interfaces";
import { Result } from "../result";

// Type definitions
export type TLatestOrder = "date" | "likes" | "views" | "title" | "rating";
type TDate = 365 | 180 | 90 | 30 | 14 | 7 | 3 | 1;

/**
 * Query used to search handiwork in the "Latest" tab.
 */
export default class LatestSearchQuery implements IQuery {
  //#region Private fields

  private static MAX_TAGS = 5;
  private static MIN_PAGE = 1;
  #page: number = LatestSearchQuery.MIN_PAGE;
  #includedTags: string[] = [];
  #itype: TQueryInterface = "LatestSearchQuery";

  //#endregion Private fields

  //#region Properties

  public category: TCategory = "games";
  /**
   * Ordering type.
   *
   * Default: `date`.
   */
  public order: TLatestOrder = "date";
  /**
   * Date limit in days, to be understood as "less than".
   * Use `1` to indicate "today" or `null` to indicate "anytime".
   *
   * Default: `null`
   */
  public date: TDate = null;
  public includedPrefixes: string[] = [];

  //#endregion Properties

  //#region Getters/Setters
  public set page(v: number) {
    if (v < LatestSearchQuery.MIN_PAGE)
      throw new Error(
        `Page must be greater or equal to ${LatestSearchQuery.MIN_PAGE}`
      );
  }

  public get page(): number {
    return this.#page;
  }

  public set includedTags(v: string[]) {
    if (v.length > LatestSearchQuery.MAX_TAGS)
      throw new Error(
        `The included tags must be less or equal to ${LatestSearchQuery.MAX_TAGS}`
      );

    this.#includedTags = v;
  }

  public get includedTags(): string[] {
    return this.#includedTags;
  }

  public get itype(): TQueryInterface {
    return this.#itype;
  }
  //#endregion Getters/Setters

  //#region Public methods

  public async execute(): Promise<
    Result<GenericAxiosError, AxiosResponse<any>>
  > {
    // Prepare the URL
    const url = this.prepareGETurl();
    const decoded = decodeURIComponent(url.toString());

    // Fetch the result
    return fetchGETResponse(decoded);
  }

  /**
   * Gets the value (in days) acceptable in the query starting from a generic date.
   */
  public findNearestDate(d: Date): TDate {
    // Find the difference between today and the passed date
    const diff = this.dateDiffInDays(new Date(), d);

    // Find the closest valid value in the array
    const validDiffDays = [365, 180, 90, 30, 14, 7, 3, 1];
    const closest = validDiffDays.reduce((prev, curr) =>
      Math.abs(curr - diff) < Math.abs(prev - diff) ? curr : prev
    );

    return closest as TDate;
  }

  //#endregion Public methods

  //#region Private methods

  /**
   * Prepare the URL by filling out the GET parameters with the data in the query.
   */
  private prepareGETurl(): URL {
    // Create the URL
    const url = new URL(urls.LATEST_PHP);
    url.searchParams.set("cmd", "list");

    // Set the category
    const cat: TCategory = this.category === "mods" ? "games" : this.category;
    url.searchParams.set("cat", cat);

    // Add tags and prefixes
    const parser = new PrefixParser();
    for (const tag of parser.prefixesToIDs(this.includedTags)) {
      url.searchParams.append("tags[]", tag.toString());
    }

    for (const p of parser.prefixesToIDs(this.includedPrefixes)) {
      url.searchParams.append("prefixes[]", p.toString());
    }

    // Set the other values
    url.searchParams.set("sort", this.order.toString());
    url.searchParams.set("page", this.page.toString());
    if (this.date) url.searchParams.set("date", this.date.toString());

    return url;
  }

  /**
   *
   */
  private dateDiffInDays(a: Date, b: Date) {
    const MS_PER_DAY = 1000 * 60 * 60 * 24;

    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / MS_PER_DAY);
  }

  //#endregion Private methodss
}
