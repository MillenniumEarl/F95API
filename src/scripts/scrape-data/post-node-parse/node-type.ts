// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { Cheerio, CheerioAPI, Element, AnyNode } from "cheerio";
import { ElementType } from "domelementtype";

/**
 * Possible kind of a Cheerio node.
 */
export type TNodeType = "Text" | "Formatted" | "Spoiler" | "Link" | "List" | "Noscript" | "Unknown";

/**
 * Identify the type of node passed by parameter.
 */
export function nodeType($: CheerioAPI, node: AnyNode): TNodeType {
  // !!! Cheerio Element type is a Node type with children !!!
  const element = node as Element;

  // Function map
  const functionMap: Record<string, (node: Element) => boolean> = {
    Text: (node: Element) => isTextNode(node) && !isFormattingNode(node) && !isImageTextNode(node),
    Formatted: (node: Element) => isFormattingNode(node),
    Spoiler: (node: Element) => isSpoilerNode($(node)),
    Link: (node: Element) => isLinkNode(node),
    List: (node: Element) => isListNode(node),
    Noscript: (node: Element) => isNoScriptNode(node)
  };

  // Parse and return the type of the node
  const result = Object.keys(functionMap).find((e) => functionMap[e](element));
  return result ? (result as TNodeType) : "Unknown";
}

//#region Utility

/**
 * Check if the node passed as a parameter is a formatting one (i.e. `<b>`).
 */
function isFormattingNode(node: Element): boolean {
  const formattedTags = ["b", "i"];
  return node.type === "tag" && formattedTags.includes(node.name);
}

/**
 * Check if the node passed as a parameter is of text type.
 */
function isTextNode(node: AnyNode): boolean {
  return node.type === ElementType.Text;
}

/**
 * Check if the node is a spoiler.
 */
function isSpoilerNode(node: Cheerio<AnyNode>): boolean {
  return node.attr("class") === "bbCodeSpoiler";
}

/**
 * Check if the node is a link or a image.
 */
function isLinkNode(node: Element): boolean {
  return node.type === ElementType.Tag && (node.name === "a" || node.name === "img");
}

/**
 * Check if the node is a `noscript` tag.
 */
function isNoScriptNode(node: Element): boolean {
  return node.type === ElementType.Tag && node.name === "noscript";
}

/**
 * Check if the node is a list element, i.e. `<li>` or `<ul>` tag.
 */
function isListNode(node: Element): boolean {
  return node.type === "tag" && (node.name === "ul" || node.name === "li");
}

/**
 * Check if the element is textual and nestled in a `noscript` tag.
 */
function isImageTextNode(node: AnyNode): boolean {
  return node.type === "text" && isNoScriptNode(node.parent as Element);
}

//#endregion Utility
