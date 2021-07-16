// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { IsInt, Min, validateSync } from "class-validator";
import { AxiosResponse } from "axios";

// Module from files
import { IQuery, TCategory, TQueryInterface } from "../../interfaces";
import { GenericAxiosError } from "../errors";
import { Result } from "../result";
import LatestSearchQuery, { TLatestOrder } from "./latest-search-query";
import ThreadSearchQuery, { TThreadOrder } from "./thread-search-query";

// Type definitions
/**
 * Method of sorting results. Try to unify the two types of
 * sorts in the "Latest" section and in the "Thread search"
 * section. Being dynamic research, if a sorting type is not
 * available, the replacement sort is chosen.
 *
 * `date`: Order based on the latest update
 *
 * `likes`: Order based on the number of likes received. Replacement: `replies`.
 *
 * `relevance`: Order based on the relevance of the result (or rating).
 *
 * `replies`: Order based on the number of answers to the thread. Replacement: `views`.
 *
 * `title`: Order based on the growing alphabetical order of the titles.
 *
 * `views`: Order based on the number of visits. Replacement: `replies`.
 */
type THandiworkOrder =
  | "date"
  | "likes"
  | "relevance"
  | "replies"
  | "title"
  | "views";
type TExecuteResult = Result<GenericAxiosError, AxiosResponse<any>>;

export default class HandiworkSearchQuery implements IQuery {
  //#region Private fields

  static MIN_PAGE = 1;

  //#endregion Private fields

  //#region Properties

  /**
   * Keywords to use in the search.
   */
  public keywords = "";
  /**
   * The results must be more recent than the date indicated.
   */
  public newerThan: Date = null;
  /**
   * The results must be older than the date indicated.
   */
  public olderThan: Date = null;
  public includedTags: string[] = [];
  public excludedTags: string[] = [];
  public includedPrefixes: string[] = [];
  public category: TCategory = null;
  /**
   * Results presentation order.
   */
  public order: THandiworkOrder = "relevance";
  @IsInt({
    message: "$property expect an integer, received $value"
  })
  @Min(HandiworkSearchQuery.MIN_PAGE, {
    message: "The minimum $property value must be $constraint1, received $value"
  })
  public page = 1;
  itype: TQueryInterface = "HandiworkSearchQuery";

  //#endregion Properties

  //#region Public methods

  /**
   * Select what kind of search should be
   * performed based on the properties of
   * the query.
   */
  public selectSearchType(): "latest" | "thread" {
    // Local variables
    const MAX_TAGS_LATEST_SEARCH = 5;
    const DEFAULT_SEARCH_TYPE = "latest";

    // If the keywords are set or the number
    // of included tags is greather than 5,
    // we must perform a thread search
    if (this.keywords || this.includedTags.length > MAX_TAGS_LATEST_SEARCH)
      return "thread";

    return DEFAULT_SEARCH_TYPE;
  }

  public validate(): boolean {
    return validateSync(this).length === 0;
  }

  public async execute(): Promise<TExecuteResult> {
    // Local variables
    let response: TExecuteResult = null;

    // Check if the query is valid
    if (!this.validate()) {
      throw new Error(`Invalid query: ${validateSync(this).join("\n")}`);
    }

    // Convert the query
    if (this.selectSearchType() === "latest")
      response = await this.cast<LatestSearchQuery>(
        "LatestSearchQuery"
      ).execute();
    else
      response = await this.cast<ThreadSearchQuery>(
        "ThreadSearchQuery"
      ).execute();

    return response;
  }

  public cast<T extends IQuery>(type: TQueryInterface): T {
    // Local variables
    let returnValue = null;

    // Convert the query
    if (type === "LatestSearchQuery") returnValue = this.castToLatest();
    else if (type === "ThreadSearchQuery") returnValue = this.castToThread();
    else returnValue = this as HandiworkSearchQuery;

    // Cast the result to T
    return returnValue as T;
  }

  //#endregion Public methods

  //#region Private methods

  private castToLatest(): LatestSearchQuery {
    // Cast the basic query object and copy common values
    const query: LatestSearchQuery = new LatestSearchQuery();
    Object.keys(this).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        query[key] = this[key];
      }
    });

    // Adapt keyword
    query.title = this.keywords;

    // Adapt order filter
    let orderFilter = this.order as string;
    if (orderFilter === "relevance") orderFilter = "rating";
    else if (orderFilter === "replies") orderFilter = "views";
    query.order = orderFilter as TLatestOrder;

    // Adapt date
    if (this.newerThan) query.date = query.findNearestDate(this.newerThan);

    return query;
  }

  private castToThread(): ThreadSearchQuery {
    // Cast the basic query object and copy common values
    const query: ThreadSearchQuery = new ThreadSearchQuery();
    Object.keys(this).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        query[key] = this[key];
      }
    });

    // Set uncommon values
    query.onlyTitles = true;

    // Adapt order filter
    let orderFilter = this.order as string;
    if (orderFilter === "title") orderFilter = "relevance";
    else if (orderFilter === "likes") orderFilter = "replies";
    query.order = orderFilter as TThreadOrder;

    return query;
  }

  //#endregion
}
