// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Import from files
import { POST } from "../constants/css-selector";

// Types
type TNodeType = "Text" | "Formatted" | "Spoiler" | "Link" | "List" | "Noscript" | "Unknown";

//#region Interfaces

/**
 * Represents an element contained in the post.
 */
export interface IPostElement {
  /**
   * Type of element.
   */
  type: "Generic" | "Text" | "Link" | "Image" | "Spoiler";
  /**
   * Name associated with the element.
   */
  name: string;
  /**
   * Text of the content of the element excluding any children.
   */
  text: string;
  /**
   * Children elements contained in this element.
   */
  content: IPostElement[];
}

/**
 * Represents a link type link in the post.
 */
export interface ILink extends IPostElement {
  type: "Image" | "Link";
  /**
   * Link to the resource.
   */
  href: string;
}

//#endregion Interfaces

//#region Public methods

/**
 * Given a post of a thread page it extracts the information contained in the body.
 */
export function parseF95ThreadPost($: cheerio.Root, post: cheerio.Cheerio): IPostElement[] {
  // The data is divided between "tag" and "text" elements.
  // Simple data is composed of a "tag" element followed
  // by a "text" element, while more complex data (contained
  // in spoilers) is composed of a "tag" element, followed
  // by a text containing only ":" and then by an additional
  // "tag" element having as the first term "Spoiler"

  // First fetch all the elements in the post
  const elements = post
    .contents()
    .toArray()
    .map((e) => parseCheerioNode($, e)); // Parse the nodes

  // Create a supernode
  let supernode = createGenericElement();
  supernode.content = elements;

  // Reduce the nodes
  supernode = reducePostElement(supernode);

  // Remove the empty nodes
  supernode = removeEmptyContentFromElement(supernode);

  // Finally parse the elements to create the pairs of title/data
  return pairUpElements(supernode.content);
}

//#endregion Public methods

//#region Private methods

//#region Node type

/**
 * Check if the node passed as a parameter is a formatting one (i.e. `<b>`).
 */
function isFormattingNode(node: cheerio.Element): boolean {
  const formattedTags = ["b", "i"];
  return node.type === "tag" && formattedTags.includes(node.name);
}

/**
 * Check if the node passed as a parameter is of text type.
 */
function isTextNode(node: cheerio.Element): boolean {
  return node.type === "text";
}

/**
 * Check if the node is a spoiler.
 */
function isSpoilerNode(node: cheerio.Cheerio): boolean {
  return node.attr("class") === "bbCodeSpoiler";
}

/**
 * Check if the node is a link or a image.
 */
function isLinkNode(node: cheerio.Element): boolean {
  // Local variables
  let valid = false;

  // The node is a valid DOM element
  if (node.type === "tag") {
    const e = node as cheerio.TagElement;
    valid = e.name === "a" || e.name === "img";
  }

  return valid;
}

/**
 * Check if the node is a `noscript` tag.
 */
function isNoScriptNode(node: cheerio.Element): boolean {
  return node.type === "tag" && node.name === "noscript";
}

/**
 * Check if the node is a list element, i.e. `<li>` or `<ul>` tag.
 */
function isListNode(node: cheerio.Element): boolean {
  return node.type === "tag" && (node.name === "ul" || node.name === "li");
}

/**
 * Idetnify the type of node passed by parameter.
 */
function nodeType($: cheerio.Root, node: cheerio.Element): TNodeType {
  // Function map
  const functionMap = {
    Text: (node: cheerio.Element) => isTextNode(node) && !isFormattingNode(node),
    Formatted: (node: cheerio.Element) => isFormattingNode(node),
    Spoiler: (node: cheerio.Element) => isSpoilerNode($(node)),
    Link: (node: cheerio.Element) => isLinkNode(node),
    List: (node: cheerio.Element) => isListNode(node),
    Noscript: (node: cheerio.Element) => isNoScriptNode(node)
  };

  // Parse and return the type of the node
  const result = Object.keys(functionMap).find((e) => functionMap[e](node));
  return result ? (result as TNodeType) : "Unknown";
}

//#endregion Node Type

//#region Parse Cheerio node

/**
 * Process a spoiler element by getting its text broken
 * down by any other spoiler elements present.
 */
function parseCheerioSpoilerNode($: cheerio.Root, node: cheerio.Cheerio): IPostElement {
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

  // Parse the content of the spoiler
  spoiler.content = node
    .find(POST.SPOILER_CONTENT)
    .contents()
    .toArray()
    .map((e) => parseCheerioNode($, e));

  // Clean text (Spoiler has no text) @todo
  // spoiler.text = spoiler.text.replace(/\s\s+/g, " ").trim();
  return spoiler;
}

/**
 * Process a node that contains a link or image.
 */
function parseCheerioLinkNode(element: cheerio.Cheerio): ILink {
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
function parseCheerioTextNode(node: cheerio.Cheerio): IPostElement {
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
function getCheerioNonChildrenText(node: cheerio.Cheerio): string {
  // Local variable
  let text = "";

  // If the node has no children, return the node's text
  if (node.contents().length === 1) {
    // @todo Remove IF after cheerio RC6
    text = node.text();
  } else {
    // Find all the text nodes in the node
    text = node
      .first()
      .contents() // @todo Change to children() after cheerio RC6
      .filter((idx, e) => isTextNode(e))
      .text();
  }

  // Clean and return the text
  return text.replace(/\s\s+/g, " ").trim();
}

//#endregion Parse Cheerio node

//#region IPostElement utility

/**
 * Check if the node has non empty `name` and `text`.
 */
function isPostElementUnknown(node: IPostElement): boolean {
  // @todo For some strange reason, if the node IS empty but
  // node.type === "Text" the 2nd statement return false.
  return node.name.trim() === "" && node.text.trim() === "";
}

/**
 * Check if the node has a non empty property
 * between `name`, `text` and `content`.
 */
function isPostElementEmpty(node: IPostElement): boolean {
  return node.content.length === 0 && isPostElementUnknown(node);
}

/**
 * Create a `IPostElement` without name, text or content.
 */
function createGenericElement(): IPostElement {
  return {
    type: "Generic",
    name: "",
    text: "",
    content: []
  };
}

/**
 * Clean the element `name` and `text` removing initial and final special characters.
 */
function cleanElement(element: IPostElement): IPostElement {
  // Local variables
  const shallow = Object.assign({}, element);
  const specialCharSet = /[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/;
  const startsWithSpecialCharsRegex = new RegExp("^" + specialCharSet.source);
  const endsWithSpecialCharsRegex = new RegExp(specialCharSet.source + "$");

  shallow.name = shallow.name
    .replace(startsWithSpecialCharsRegex, "")
    .replace(endsWithSpecialCharsRegex, "")
    .trim();

  shallow.text = shallow.text
    .replace(startsWithSpecialCharsRegex, "")
    .replace(endsWithSpecialCharsRegex, "")
    .trim();

  return shallow;
}

//#endregion IPostElement utility

/**
 * Collapse an `IPostElement` element with a single subnode
 * in the `Content` field in case it has no information.
 */
function reducePostElement(element: IPostElement): IPostElement {
  // Local variables
  const shallowCopy = Object.assign({}, element);

  // If the node has only one child, reduce and return it
  if (isPostElementUnknown(shallowCopy) && shallowCopy.content.length === 1) {
    return reducePostElement(shallowCopy.content[0]);
  }

  // Reduce element's childs
  shallowCopy.content = shallowCopy.content.map((e) => reducePostElement(e));

  return shallowCopy;
}

/**
 * Remove all empty children elements of the elements for parameter.
 */
function removeEmptyContentFromElement(element: IPostElement, recursive = true): IPostElement {
  // Create a copy of the element
  const copy = Object.assign({}, element);

  // Reduce nested contents if recursive
  const recursiveResult = recursive
    ? element.content.map((e) => removeEmptyContentFromElement(e))
    : copy.content;

  // Find the non-empty nodes
  const validNodes = recursiveResult
    .filter((e) => !isPostElementEmpty(e)) // Remove the empty nodes
    .filter((e) => !isPostElementEmpty(cleanElement(e))); // Remove the useless nodes

  // Assign the nodes
  copy.content = validNodes;

  return copy;
}

/**
 * Transform a `cheerio.Cheerio` node into an `IPostElement` element with its subnodes.
 */
function parseCheerioNode($: cheerio.Root, node: cheerio.Element): IPostElement {
  // Local variables
  const cheerioNode = $(node);

  // Function mapping
  const functionMap = {
    Text: (node: cheerio.Cheerio) => parseCheerioTextNode(node),
    Spoiler: (node: cheerio.Cheerio) => parseCheerioSpoilerNode($, node),
    Link: (node: cheerio.Cheerio) => parseCheerioLinkNode(node)
  };

  // Get the type of node
  const type = nodeType($, node);

  // Get the post based on the type of node
  const post = Object.keys(functionMap).includes(type)
    ? functionMap[type]($(node))
    : createGenericElement();

  // Parse the childrens only if the node is a <b>/<i> element, a list
  // or a unknown element. For the link in unnecessary while for the
  // spoilers is already done in parseCheerioSpoilerNode
  const includeTypes: TNodeType[] = ["Formatted", "List", "Unknown"];
  if (includeTypes.includes(type)) {
    const childPosts = cheerioNode
      .contents() // @todo Change to children() after cheerio RC6
      .toArray()
      .filter((e) => e) // Ignore undefined elements
      .map((e) => parseCheerioNode($, e))
      .filter((e) => !isPostElementEmpty(e));
    post.content.push(...childPosts);
  }

  return post;
}

/**
 * It simplifies the `IPostElement` elements by associating
 * the corresponding value to each characterizing element (i.e. author).
 */
function pairUpElements(elements: IPostElement[]): IPostElement[] {
  // Local variables
  const shallow = [...elements];

  // Parse all the generic elements that
  // act as "container" for other information
  shallow
    .filter((e) => e.type === "Generic")
    .map((e) => ({
      element: e,
      pairs: pairUpElements(e.content)
    }))
    .forEach((e) => {
      // Find the index of the elements
      const index = shallow.indexOf(e.element);

      // Remove that elements
      shallow.splice(index, 1);

      // Add the pairs at the index of the deleted element
      e.pairs.forEach((e, i) => shallow.splice(index + i, 0, e));
    });

  // Than we find all the IDs of the elements that are "titles".
  const indexes = shallow
    .filter((e, i) => isValidTitleElement(e, i, shallow))
    .map((e) => shallow.indexOf(e));

  // Now we find all the elements between indexes and
  // associate them with the previous "title" element
  return indexes.map((i, j) => parseGroupData(i, j, indexes, shallow));
}

/**
 * Verify if the `element` is a valid title.
 * @param element Element to check
 * @param index Index of the element in `array`
 * @param array Array of elements to check
 */
function isValidTitleElement(element: IPostElement, index: number, array: IPostElement[]): boolean {
  // Check if this element is a "title" checking also the next element
  const isPostfixDoublePoints = element.text.endsWith(":") && element.text !== ":";
  const nextElementIsValue = array[index + 1]?.text.startsWith(":");
  const elementIsTextTitle =
    element.type === "Text" && (isPostfixDoublePoints || nextElementIsValue);

  // Special values tha must be set has "title"
  const specialValues = ["DOWNLOAD", "CHANGELOG", "CHANGE-LOG", "GENRE"];
  const specialTypes = ["Image"];

  // Used to ignore already merged elements with name (ignore spoilers)
  // because they have as name the content of the spoiler button
  const hasName = element.name !== "" && element.type !== "Spoiler";

  return (
    elementIsTextTitle ||
    specialTypes.includes(element.type) ||
    specialValues.includes(element.text.toUpperCase()) ||
    hasName
  );
}

/**
 * Associate the relative values to a title.
 * @param start Title index in the `elements` array
 * @param index `start` index in `indexes`
 * @param indexes List of titles indices in the `elements` array
 * @param elements Array of elements to group
 */
function parseGroupData(
  start: number,
  index: number,
  indexes: number[],
  elements: IPostElement[]
): IPostElement {
  // Local variables
  const endsWithSpecialCharsRegex = /[-:]$/;
  const startsWithDoublePointsRegex = /^[:]/;

  // Find all the elements (title + data) of the same data group
  const nextIndex = indexes[index + 1] ?? elements.length;
  const group = elements.slice(start, nextIndex);

  // Extract the title
  const title = group.shift();

  // If the title is already named (beacuse it was
  // previously elaborated) return it witout
  if (title.name !== "" && title.type !== "Spoiler") return title;

  // Assign name and text of the title
  title.name = title.text.replace(endsWithSpecialCharsRegex, "").trim();
  title.text = group
    .filter((e) => e.type === "Text")
    .map((e) =>
      e.text
        .replace(startsWithDoublePointsRegex, "") // Remove the starting ":" from the element's text
        .replace(endsWithSpecialCharsRegex, "") // Remove any special chars at the end
        .trim()
    )
    .join(" ") // Join with space
    .trim();

  // Append all the content of the elements.
  group.forEach(
    (e) =>
      e.type === "Spoiler"
        ? title.content.push(...e.content) // Add all the content fo the spoiler
        : title.content.push(e) // Add the element itself
  );

  return title;
}

//#endregion Private methods
