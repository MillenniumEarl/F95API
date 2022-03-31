// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { Cheerio, Node, load } from "cheerio";
import { isValidISODateString } from "iso-datestring-validator";

// Modules from files
import { CONVERSATION } from "../../constants/css-selector";
import { urls } from "../../constants/url";
import { IConversation } from "../../interfaces";

/**
 * Process a page containing a list of conversations
 * returning a list of elements that follow the
 * `IConversation` interface.
 * @param html HTML source code of a page that contains a list of conversations
 */
export default async function fetchPageConversations(html: string): Promise<IConversation[]> {
  // Load the HTML string of the page
  const $ = load(html);

  // Find the bodies of the conversations
  const bodies = $(CONVERSATION.BODIES);

  // Parse every element in bodies
  return bodies.get().map((body) => parseConversationElement($(body)));
}

/**
 * Process a single node containing information
 * about a conversation by returning an element
 * that follows the `IConversation` interface.
 */
function parseConversationElement(e: Cheerio<Node>): IConversation {
  // Define the conversation element to return
  const conversation: IConversation = {} as IConversation;

  // Check if the conversation has unread messages
  conversation.unread = e.attr("is-unread") !== undefined;

  // Find the URL of the conversation
  const partialURL = e.find(CONVERSATION.TITLE).attr("href").trim();
  conversation.url = new URL(partialURL, urls.BASE).toString();

  conversation.title = e.find(CONVERSATION.TITLE).text().trim();

  // Parse numeric data
  const sAuthorID = e.find(CONVERSATION.AUTHOR).attr("data-user-id");
  conversation.authorid = parseInt(sAuthorID, 10);

  const sLastResponseUserID = e.find(CONVERSATION.LAST_RESPONSE_USER).attr("data-user-id");
  conversation.lastResponseUser = parseInt(sLastResponseUserID, 10);

  conversation.lastRecipients = e
    .find(CONVERSATION.LAST_RECIPIENTS)
    .get()
    .map((recipient) => recipient.attribs["data-user-id"])
    .map((s) => parseInt(s, 10));

  const sReplies = e.find(CONVERSATION.REPLIES).text().trim();
  conversation.replies = parseInt(sReplies, 10);

  const sPartecipants = e.find(CONVERSATION.PARTECIPANTS).text().trim();
  conversation.partecipants = parseInt(sPartecipants, 10);

  // Parse dates
  const sCreationDate = e.find(CONVERSATION.START_DATE).attr("datetime");
  conversation.creation =
    sCreationDate && isValidISODateString(sCreationDate) ? new Date(sCreationDate) : null;

  const sLastResponseDate = e.find(CONVERSATION.LAST_RESPONSE_TIME).attr("datetime");
  conversation.lastResponseTime =
    sLastResponseDate && isValidISODateString(sLastResponseDate)
      ? new Date(sLastResponseDate)
      : null;

  return conversation;
}
