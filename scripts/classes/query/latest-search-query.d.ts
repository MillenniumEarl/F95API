import { IQuery, TCategory, TQueryInterface } from "../../interfaces.js";
import { AxiosResponse } from "axios";
import { GenericAxiosError } from "../errors.js";
import { Result } from "../result.js";
export declare type TLatestOrder = "date" | "likes" | "views" | "title" | "rating";
declare type TDate = 365 | 180 | 90 | 30 | 14 | 7 | 3 | 1;
/**
 * Query used to search handiwork in the "Latest" tab.
 */
export default class LatestSearchQuery implements IQuery {
  private static MAX_TAGS;
  private static MIN_PAGE;
  category: TCategory;
  /**
   * Ordering type.
   *
   * Default: `date`.
   */
  order: TLatestOrder;
  /**
   * Date limit in days, to be understood as "less than".
   * Use `1` to indicate "today" or `null` to indicate "anytime".
   *
   * Default: `null`
   */
  date: TDate;
  includedTags: string[];
  includedPrefixes: string[];
  page: number;
  itype: TQueryInterface;
  validate(): boolean;
  execute(): Promise<Result<GenericAxiosError, AxiosResponse<any>>>;
  /**
   * Gets the value (in days) acceptable in the query starting from a generic date.
   */
  findNearestDate(d: Date): TDate;
  /**
   * Prepare the URL by filling out the GET parameters with the data in the query.
   */
  private prepareGETurl;
  /**
   *
   */
  private dateDiffInDays;
}
export {};
