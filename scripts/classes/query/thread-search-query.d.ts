import { IQuery, TCategory, TQueryInterface } from "../../interfaces.js";
import { AxiosResponse } from "axios";
import { GenericAxiosError } from "../errors.js";
import { Result } from "../result.js";
export declare type TThreadOrder = "relevance" | "date" | "last_update" | "replies";
export default class ThreadSearchQuery implements IQuery {
  static MIN_PAGE: number;
  /**
   * Keywords to use in the search.
   */
  keywords: string;
  /**
   * Indicates to search by checking only the thread titles and not the content.
   */
  onlyTitles: boolean;
  /**
   * The results must be more recent than the date indicated.
   */
  newerThan: Date;
  /**
   * The results must be older than the date indicated.
   */
  olderThan: Date;
  includedTags: string[];
  /**
   * Tags to exclude from the search.
   */
  excludedTags: string[];
  /**
   * Minimum number of answers that the thread must possess.
   */
  minimumReplies: number;
  includedPrefixes: string[];
  category: TCategory;
  /**
   * Results presentation order.
   */
  order: TThreadOrder;
  page: number;
  itype: TQueryInterface;
  validate(): boolean;
  execute(): Promise<Result<GenericAxiosError, AxiosResponse<any>>>;
  /**
   * Prepare the parameters for post request with the data in the query.
   */
  private preparePOSTParameters;
  /**
   * Convert a date in the YYYY-MM-DD format taking into account the time zone.
   */
  private convertShortDate;
  /**
   * Gets the unique ID of the selected category.
   */
  private categoryToID;
}
