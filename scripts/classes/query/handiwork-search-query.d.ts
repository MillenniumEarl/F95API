import { AxiosResponse } from "axios";
import { IQuery, TCategory, TQueryInterface } from "../../interfaces.js";
import { GenericAxiosError } from "../errors.js";
import { Result } from "../result.js";
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
declare type THandiworkOrder =
  | "date"
  | "likes"
  | "relevance"
  | "replies"
  | "title"
  | "views";
declare type TExecuteResult = Result<GenericAxiosError, AxiosResponse<any>>;
export default class HandiworkSearchQuery implements IQuery {
  static MIN_PAGE: number;
  /**
   * Keywords to use in the search.
   */
  keywords: string;
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
  includedPrefixes: string[];
  category: TCategory;
  /**
   * Results presentation order.
   */
  order: THandiworkOrder;
  page: number;
  itype: TQueryInterface;
  /**
   * Select what kind of search should be
   * performed based on the properties of
   * the query.
   */
  selectSearchType(): "latest" | "thread";
  validate(): boolean;
  execute(): Promise<TExecuteResult>;
  cast<T extends IQuery>(type: TQueryInterface): T;
  private castToLatest;
  private castToThread;
}
export {};
