// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { CheerioAPI, Cheerio, Node } from "cheerio";

// Modules from file
import { POST } from "../../constants/css-selector";
import { ILink, IPostElement } from "../../interfaces";
import { nodeType } from "./node-type";
import {
  cleanTextFromInvisibleCharacters,
  createEmptyElement
} from "./node-utility";

/**
 * Given a Cheerio node, it extracts the information into an IPostElement structure.
 */
export default function parseCheerioNode(
  $: CheerioAPI,
  node: Node
): IPostElement {
  // Function mapping
  const functionMap = {
    Text: (node: Cheerio<Node>) => parseCheerioTextNode(node),
    Spoiler: (node: Cheerio<Node>) => parseCheerioSpoilerNode(node),
    Link: (node: Cheerio<Node>) => parseCheerioLinkNode(node)
  };

  // Get the type of node
  const type = nodeType($, node);

  // Get the post based on the type of node
  const obj = Object.keys(functionMap).includes(type)
    ? (functionMap[type]($(node)) as IPostElement)
    : createEmptyElement();

  // Remove invisible characters from strings
  obj.text = cleanTextFromInvisibleCharacters(obj.text);
  obj.name = cleanTextFromInvisibleCharacters(obj.name);

  return obj;
}

/**
 * Process a spoiler element by getting its text broken
 * down by any other spoiler elements present.
 */
function parseCheerioSpoilerNode(node: Cheerio<Node>): IPostElement {
  // A spoiler block is composed of a div with class "bbCodeSpoiler",
  // containing a div "bbCodeSpoiler-content" containing, in cascade,
  // a div with class "bbCodeBlock--spoiler" and a div with class "bbCodeBlock-content".
  // This last tag contains the required data.

  // Local variables
  const spoiler: IPostElement = {
    type: "Spoiler",
    name: "",
    text: "",
    content: []
  };

  // Find the title of the spoiler (contained in the button)
  const name = node.find(POST.SPOILER_NAME)?.first();
  spoiler.name = name ? name.text().trim() : "";

  return spoiler;
}

/**
 * Process a node that contains a link or image.
 */
function parseCheerioLinkNode(element: Cheerio<Node>): ILink {
  // Local variable
  const link: ILink = {
    type: "Link",
    name: "",
    text: "",
    href: "",
    content: []
  };

  if (element.is("img")) {
    link.type = "Image";
    link.text = element.attr("alt") ?? "";
    link.href = element.attr("data-src");
  } else if (element.is("a")) {
    link.type = "Link";
    link.text = element.text().replace(/\s\s+/g, " ").trim();
    link.href = element.attr("href");
  }

  return link;
}

/**
 * Process a text only node.
 */
function parseCheerioTextNode(node: Cheerio<Node>): IPostElement {
  const content: IPostElement = {
    type: "Text",
    name: "",
    text: getCheerioNonChildrenText(node),
    content: []
  };
  return content;
}

/**
 * Gets the text of the node only, excluding child nodes.
 * Also includes formatted text elements (i.e. `<b>`).
 */
function getCheerioNonChildrenText(node: Cheerio<Node>): string {
  // Get text
  const text = node.first().text();

  // Clean and return the text
  return text.replace(/\s\s+/g, " ").trim();
}
