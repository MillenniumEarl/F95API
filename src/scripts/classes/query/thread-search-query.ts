// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { IsInt, Min, validateSync } from "class-validator";

// Module from files
import { IQuery, TCategory, TQueryInterface } from "../../interfaces";
import { urls } from "../../constants/url";
import PrefixParser from "./../prefix-parser";
import { fetchPOSTResponse } from "../../network-helper";
import { AxiosResponse } from "axios";
import { GenericAxiosError } from "../errors";
import { Result } from "../result";
import Shared from "../../shared";

// Type definitions
export type TThreadOrder = "relevance" | "date" | "last_update" | "replies";

export default class ThreadSearchQuery implements IQuery {
  //#region Private fields

  static MIN_PAGE = 1;

  //#endregion Private fields

  //#region Properties

  /**
   * Keywords to use in the search.
   */
  public keywords = "";
  /**
   * Indicates to search by checking only the thread titles and not the content.
   */
  public onlyTitles = false;
  /**
   * The results must be more recent than the date indicated.
   */
  public newerThan: Date = null;
  /**
   * The results must be older than the date indicated.
   */
  public olderThan: Date = null;
  public includedTags: string[] = [];
  /**
   * Tags to exclude from the search.
   */
  public excludedTags: string[] = [];
  /**
   * Minimum number of answers that the thread must possess.
   */
  public minimumReplies = 0;
  public includedPrefixes: string[] = [];
  public category: TCategory = null;
  /**
   * Results presentation order.
   */
  public order: TThreadOrder = "relevance";
  @IsInt({
    message: "$property expect an integer, received $value"
  })
  @Min(ThreadSearchQuery.MIN_PAGE, {
    message: "The minimum $property value must be $constraint1, received $value"
  })
  public page = 1;
  itype: TQueryInterface = "ThreadSearchQuery";

  //#endregion Properties

  //#region Public methods

  public validate(): boolean {
    return validateSync(this).length === 0;
  }

  public async execute(): Promise<Result<GenericAxiosError, AxiosResponse<any>>> {
    // Check if the query is valid
    if (!this.validate()) {
      throw new Error(`Invalid query: ${validateSync(this).join("\n")}`);
    }

    // Define the POST parameters
    const params = this.preparePOSTParameters();

    // Return the POST response
    return fetchPOSTResponse(urls.SEARCH, params);
  }

  //#endregion Public methods

  //#region Private methods

  /**
   * Prepare the parameters for post request with the data in the query.
   */
  private preparePOSTParameters(): { [s: string]: string } {
    // Local variables
    const params = {};

    // Ad the session token
    params["_xfToken"] = Shared.session.token;

    // Specify if only the title should be searched
    if (this.onlyTitles) params["c[title_only]"] = "1";

    // Add keywords
    params["keywords"] = this.keywords ?? "*";

    // Specify the scope of the search (only "threads/post")
    params["search_type"] = "post";

    // Set the dates
    if (this.newerThan) {
      const date = this.convertShortDate(this.newerThan);
      params["c[newer_than]"] = date;
    }

    if (this.olderThan) {
      const date = this.convertShortDate(this.olderThan);
      params["c[older_than]"] = date;
    }

    // Set included and excluded tags (joined with a comma)
    if (this.includedTags) params["c[tags]"] = this.includedTags.join(",");
    if (this.excludedTags) params["c[excludeTags]"] = this.excludedTags.join(",");

    // Set minimum reply number
    if (this.minimumReplies > 0) params["c[min_reply_count]"] = this.minimumReplies.toString();

    // Add prefixes
    const parser = new PrefixParser();
    const ids = parser.prefixesToIDs(this.includedPrefixes);
    for (let i = 0; i < ids.length; i++) {
      const name = `c[prefixes][${i}]`;
      params[name] = ids[i].toString();
    }

    // Set the category
    params["c[child_nodes]"] = "1"; // Always set
    if (this.category) {
      const catID = this.categoryToID(this.category).toString();
      params["c[nodes][0]"] = catID;
    }

    // Set the other values
    params["order"] = this.order.toString();
    params["page"] = this.page.toString();

    return params;
  }

  /**
   * Convert a date in the YYYY-MM-DD format taking into account the time zone.
   */
  private convertShortDate(d: Date): string {
    const offset = d.getTimezoneOffset();
    d = new Date(d.getTime() - offset * 60 * 1000);
    return d.toISOString().split("T")[0];
  }

  /**
   * Gets the unique ID of the selected category.
   */
  private categoryToID(category: TCategory): number {
    const catMap = {
      games: 2,
      mods: 41,
      comics: 40,
      animations: 94,
      assets: 95
    };

    return catMap[category as string];
  }

  //#endregion Private methods
}
