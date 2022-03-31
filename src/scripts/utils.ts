// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

/**
 * Gets all dates in the `YYYY-MM-DD` format and
 * sorts them according to the `order` parameter.
 */
export function getDateFromString(
  s: string,
  order: "crescent" | "decrescent" = "decrescent"
): Date | undefined {
  // Use regex to find the date (if any)
  const regex = /\d{4}[/-](0?[1-9]|1[012])[/-](3[01]|[12][0-9]|0?[1-9])/gim;
  const match = s.match(regex);
  if (!match) return;

  // Sort the array of date using "order"
  const orderCrescent = (a: Date, b: Date) => a.getTime() - b.getTime();
  const orderDecrescent = (a: Date, b: Date) => b.getTime() - a.getTime();
  const array = match.map((s) => new Date(s));
  order === "decrescent"
    ? array.sort(orderDecrescent)
    : array.sort(orderCrescent);

  // Return the first
  return array.shift();
}
