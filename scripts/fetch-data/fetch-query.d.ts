import { IQuery } from "../interfaces.js";
/**
 * @param query Query used for the search
 * @param limit Maximum number of items to get. Default: 30
 * @returns URLs of the fetched games
 */
export default function getURLsFromQuery(
  query: IQuery,
  limit?: number
): Promise<string[]>;
