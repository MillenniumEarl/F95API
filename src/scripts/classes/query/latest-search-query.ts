// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { ArrayMaxSize, IsInt, Min, validateSync } from "class-validator";

// Modules from file
import { urls } from "../../constants/url";
import PrefixParser from "../prefix-parser";
import { IQuery, TCategory, TQueryInterface } from "../../interfaces";
import { fetchGETResponse } from "../../network-helper";
import { AxiosResponse } from "axios";
import { GenericAxiosError } from "../errors";
import { Result } from "../result";

// Type definitions
export type TLatestOrder = "date" | "likes" | "views" | "title" | "rating";
type TDate = 365 | 180 | 90 | 30 | 14 | 7 | 3 | 1;

/**
 * Query used to search handiwork in the "Latest" tab.
 */
export default class LatestSearchQuery implements IQuery {
  //#region Private fields

  private static MAX_TAGS = 10;
  private static MIN_PAGE = 1;

  //#endregion Private fields

  //#region Properties
  /**
   * Name of the creator of the work.
   */
  public creator: string = null;
  /**
   * Title (or part of it) to search.
   */
  public title: string = null;
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
  /**
   * Maximum number of items viewable per page.
   */
  public itemsPerPage: 15 | 30 | 45 | 60 | 75 | 90 = 30;

  @ArrayMaxSize(LatestSearchQuery.MAX_TAGS, {
    message: "Too many tags: $value instead of $constraint1"
  })
  public includedTags: string[] = [];
  public includedPrefixes: string[] = [];

  @ArrayMaxSize(LatestSearchQuery.MAX_TAGS, {
    message: "Too many tags: $value instead of $constraint1"
  })
  public excludedTags: string[] = [];

  @IsInt({
    message: "$property expect an integer, received $value"
  })
  @Min(LatestSearchQuery.MIN_PAGE, {
    message: "The minimum $property value must be $constraint1, received $value"
  })
  public page = LatestSearchQuery.MIN_PAGE;
  itype: TQueryInterface = "LatestSearchQuery";

  //#endregion Properties

  //#region Public methods

  public validate(): boolean {
    return validateSync(this).length === 0;
  }

  public async execute(): Promise<
    Result<GenericAxiosError, AxiosResponse<any>>
  > {
    // Check if the query is valid
    if (!this.validate()) {
      throw new Error(`Invalid query: ${validateSync(this).join("\n")}`);
    }

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
    url.searchParams.set("ignored", "hide"); // Exclude ignored threads

    // Set the category
    url.searchParams.set("cat", this.category);

    // Add tags and prefixes
    const parser = new PrefixParser();
    parser
      .prefixesToIDs(this.includedTags)
      .map((tag) => url.searchParams.append("tags[]", tag.toString()));

    parser
      .prefixesToIDs(this.excludedTags)
      .map((tag) => url.searchParams.append("notags[]", tag.toString()));

    parser
      .prefixesToIDs(this.includedPrefixes)
      .map((p) => url.searchParams.append("prefixes[]", p.toString()));

    // Set the other values
    if (this.title) url.searchParams.set("search", this.title);
    if (this.creator) url.searchParams.set("creator", this.creator);
    if (this.date) url.searchParams.set("date", this.date.toString());
    url.searchParams.set("sort", this.order.toString());
    url.searchParams.set("page", this.page.toString());
    url.searchParams.set("rows", this.itemsPerPage.toString());

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
