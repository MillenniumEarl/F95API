import { IBasic, IQuery } from "./interfaces.js";
/**
 * Gets the handiworks that match the passed parameters.
 * You *must* be logged.
 * @param {Number} limit
 * Maximum number of items to get. Default: 30
 */
export default function search<T extends IBasic>(
  query: IQuery,
  limit?: number
): Promise<T[]>;
