// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import cheerio, { CheerioAPI, Node } from "cheerio";
import { ALERT } from "../constants/css-selector";
import { urls } from "../constants/url";
import { IAlert, TAlertReactionType, TAlertType } from "../interfaces";
import { fetchHTML } from "../network-helper";

/**
 * Gets alert data starting from the source code of the page passed by parameter.
 */
export default async function fetchAlertElements(html: string): Promise<IAlert[]> {
  // Local variables
  const $ = cheerio.load(html);

  const promises = $(ALERT.BODIES)
    .toArray()
    .map((el) => parseAlertElement($, el));

  // Wait for all the promises to finish then flat the list
  const listToFlatten = await Promise.all(promises);
  return [].concat(...listToFlatten);
}

/**
 * Given the partial URL of a summarized alert, it obtains the data of all summarized alerts.
 */
async function fetchSummarizedAlerts(partialURL: string) {
  // Find the URL
  const url = new URL(partialURL, urls.BASE);

  // Fetch the new page
  const response = await fetchHTML(url.toString());

  // Fetch the alerts
  if (response.isSuccess()) return await fetchAlertElements(response.value);
  else throw response.value;
}

/**
 * Given the text message identifies the type of alert.
 */
function parseAlertType(text: string): TAlertType {
  // Keywords to define alert types
  const RATING = "RATED";
  const REPLY = "REPLIED";
  const REACTION = "REACTED";
  const QUOTE = "QUOTED";
  const TROPHY = "YOU HAVE BEEN AWARDED A TROPHY";

  // Prepare the text
  const t = text.trim().toUpperCase();

  // Function map
  const functionMap = {
    Rating: (t: string) => t.includes(RATING),
    Reply: (t: string) => t.includes(REPLY),
    Reaction: (t: string) => t.includes(REACTION),
    Quote: (t: string) => t.includes(QUOTE),
    Award: (t: string) => t.includes(TROPHY)
  };

  // Parse and return the type of the node
  const result = Object.keys(functionMap).find((e) => functionMap[e](t));
  return result ? (result as TAlertType) : "Unknown";
}

/**
 * Given the text value of the reaction to a post returns
 * the value suitable for the `TAlertReactionType` type.
 */
function parseReactionTypeFromAlert(text: string): TAlertReactionType {
  // Keywords to define reaction types
  const LIKE = "LIKE";
  const HEY_THERE = "?";
  const LOVE = "LOVE";
  const JIZZED = "?";
  const HEARTH = "HEARTH";
  const YAY = "RATED";
  const HAHA = "HAHA";
  const SAD = "SAD";
  const THINKING = "?";
  const FACEPALM = "?";
  const WOW = "WOW";

  // Prepare the text
  const t = text.trim().toUpperCase();

  // Function map
  const functionMap = {
    Like: (t: string) => t.includes(LIKE),
    HeyThere: (t: string) => t.includes(HEY_THERE),
    Love: (t: string) => t.includes(LOVE),
    Jizzed: (t: string) => t.includes(JIZZED),
    Hearth: (t: string) => t.includes(HEARTH),
    Yay: (t: string) => t.includes(YAY),
    Haha: (t: string) => t.includes(HAHA),
    Sad: (t: string) => t.includes(SAD),
    Thinking: (t: string) => t.includes(THINKING),
    Facepalm: (t: string) => t.includes(FACEPALM),
    Wow: (t: string) => t.includes(WOW)
  };

  // Parse and return the type of the node
  const result = Object.keys(functionMap).find((e) => functionMap[e](t));
  return result ? (result as TAlertReactionType) : null;
}

async function parseAlertElement($: CheerioAPI, el: Node) {
  // First check if the alert is summarized
  if ($(el).find(ALERT.SUMMARIZED_BUTTON).length === 1) {
    // Find the URL
    const partialURL = $(el).find(ALERT.SUMMARIZED_SEPARATE_ALERTS).attr("href");
    return await fetchSummarizedAlerts(partialURL);
  }

  // Find the ID of the user that caused the alert
  const sid = $(el).find(ALERT.ACTOR).attr("data-user-id");

  // Find the referenced URL
  const partial = $(el).find(ALERT.REFERENCE_PAGE).attr("href");
  const url = new URL(partial, urls.BASE);

  // Find the reaction type (if any)
  const reactionText = $(el).find(ALERT.REACTION).text();

  // Find the alert date
  const isotime = $(el).find(ALERT.ALERT_TIME).attr("datetime");

  // Return as array so if there are summarized alerts we can flatten at the end
  return [
    {
      type: parseAlertType($(el).text()),
      userid: parseInt(sid, 10),
      linkedURL: url,
      reaction: reactionText ? parseReactionTypeFromAlert(reactionText) : null,
      date: new Date(isotime),
      read: $(el).find(ALERT.MARK_UNREAD_BUTTON).length === 1
    } as IAlert
  ];
}