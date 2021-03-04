// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

//#region Interfaces

export interface IPostElement {
  type: "Empty" | "Text" | "Link" | "Image" | "Spoiler";
  name: string;
  text: string;
  content: IPostElement[];
}

export interface ILink extends IPostElement {
  type: "Image" | "Link";
  href: string;
}

//#endregion Interfaces

//#region Public methods
/**
 * Given a post of a thread page it extracts the information contained in the body.
 */
export function parseF95ThreadPost(
  $: cheerio.Root,
  post: cheerio.Cheerio
): IPostElement[] {
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
    .map((el) => {
      const node = parseCheerioNode($, el);
      if (node.name || node.text || node.content.length != 0) {
        return node;
      }
    })
    .filter((el) => el);

  // ... then parse the elements to create the pairs of title/data
  return parsePostElements(elements);
}
//#endregion Public methods

//#region Private methods

/**
 * Process a spoiler element by getting its text broken
 * down by any other spoiler elements present.
 */
function parseCheerioSpoilerNode(
  $: cheerio.Root,
  spoiler: cheerio.Cheerio
): IPostElement {
  // A spoiler block is composed of a div with class "bbCodeSpoiler",
  // containing a div "bbCodeSpoiler-content" containing, in cascade,
  // a div with class "bbCodeBlock--spoiler" and a div with class "bbCodeBlock-content".
  // This last tag contains the required data.

  // Local variables
  const BUTTON_CLASS = "button.bbCodeSpoiler-button";
  const SPOILER_CONTENT_CLASS =
    "div.bbCodeSpoiler-content > div.bbCodeBlock--spoiler > div.bbCodeBlock-content";
  const content: IPostElement = {
    type: "Spoiler",
    name: "",
    text: "",
    content: []
  };

  // Find the title of the spoiler (contained in the button)
  const button = spoiler.find(BUTTON_CLASS).toArray().shift();
  content.name = $(button).text().trim();

  // Parse the content of the spoiler
  spoiler
    .find(SPOILER_CONTENT_CLASS)
    .contents()
    .map((idx, el) => {
      // Convert the element
      const element = $(el);

      // Parse nested spoiler
      if (element.attr("class") === "bbCodeSpoiler") {
        const spoiler = parseCheerioSpoilerNode($, element);
        content.content.push(spoiler);
      } else if (el.type === "text") {
        // Append text
        content.text += element.text();
      }
    });

  // Clean text
  content.text = content.text.replace(/\s\s+/g, " ").trim();
  return content;
}

/**
 * Check if the node passed as a parameter is of text type.
 * This also includes formatted nodes (i.e. `<b>`).
 */
function isTextNode(node: cheerio.Element): boolean {
  const formattedTags = ["b", "i"];
  const isText = node.type === "text";
  const isFormatted = node.type === "tag" && formattedTags.includes(node.name);

  return isText || isFormatted;
}

/**
 * Gets the text of the node only, excluding child nodes.
 * Also includes formatted text elements (i.e. `<b>`).
 */
function getCheerioNonChildrenText(node: cheerio.Cheerio): string {
  // Find all the text nodes in the node
  const text = node
    .first()
    .contents()
    .filter((idx, el) => {
      return isTextNode(el);
    })
    .text();

  // Clean and return the text
  return text.replace(/\s\s+/g, " ").trim();
}

/**
 * Process a node and see if it contains a
 * link or image. If not, it returns `null`.
 */
function parseCheerioLinkNode(element: cheerio.Cheerio): ILink | null {
  //@ts-ignore
  const name = element[0]?.name;
  const link: ILink = {
    name: "",
    type: "Link",
    text: "",
    href: "",
    content: []
  };

  if (name === "img") {
    link.type = "Image";
    link.text = element.attr("alt");
    link.href = element.attr("data-src");
  } else if (name === "a") {
    link.type = "Link";
    link.text = element.text().replace(/\s\s+/g, " ").trim();
    link.href = element.attr("href");
  }

  return link.href ? link : null;
}

/**
 * Collapse an `IPostElement` element with a single subnode
 * in the `Content` field in case it has no information.
 */
function reducePostElement(element: IPostElement): IPostElement {
  if (element.content.length === 1) {
    const content = element.content[0] as IPostElement;
    const nullValues =
      (!element.name || !content.name) && (!element.text || !content.text);
    const sameValues =
      element.name === content.name || element.text === content.text;

    if (nullValues || sameValues) {
      element.name = element.name || content.name;
      element.text = element.text || content.text;
      element.content.push(...content.content);
      element.type = content.type;

      // If the content is a link, add the HREF to the element
      const contentILink = content as ILink;
      const elementILink = element as ILink;
      if (contentILink.href) elementILink.href = contentILink.href;
    }
  }

  return element;
}

/**
 * Transform a `cheerio.Cheerio` node into an `IPostElement` element with its subnodes.
 * @param reduce Compress subsequent subnodes if they contain no information. Default: `true`.
 */
function parseCheerioNode(
  $: cheerio.Root,
  node: cheerio.Element,
  reduce = true
): IPostElement {
  // Local variables
  const content: IPostElement = {
    type: "Empty",
    name: "",
    text: "",
    content: []
  };
  const cheerioNode = $(node);

  if (isTextNode(node)) {
    content.text = cheerioNode.text().replace(/\s\s+/g, " ").trim();
    content.type = "Text";
  } else {
    // Get the number of children that the element own
    const nChildren = cheerioNode.children().length;

    // Get the text of the element without childrens
    content.text = getCheerioNonChildrenText(cheerioNode);

    // Parse spoilers
    if (cheerioNode.attr("class") === "bbCodeSpoiler") {
      const spoiler = parseCheerioSpoilerNode($, cheerioNode);

      // Add element if not null
      if (spoiler) {
        content.content.push(spoiler);
        content.type = "Spoiler";
      }
    }
    // Parse links
    else if (nChildren === 0 && cheerioNode.length != 0) {
      const link = parseCheerioLinkNode(cheerioNode);

      // Add element if not null
      if (link) {
        content.content.push(link);
        content.type = "Link";
      }
    } else {
      cheerioNode.children().map((idx, el) => {
        // Parse the children of the element passed as parameter
        const childElement = parseCheerioNode($, el);

        // If the children is valid (not empty) push it
        if (
          (childElement.text || childElement.content.length !== 0) &&
          !isTextNode(el)
        ) {
          content.content.push(childElement);
        }
      });
    }
  }

  return reduce ? reducePostElement(content) : content;
}

/**
 * It simplifies the `IPostElement` elements by associating
 * the corresponding value to each characterizing element (i.e. author).
 */
function parsePostElements(elements: IPostElement[]): IPostElement[] {
  // Local variables
  const pairs: IPostElement[] = [];
  const specialCharsRegex = /^[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/;
  const specialRegex = new RegExp(specialCharsRegex);

  for (let i = 0; i < elements.length; i++) {
    // If the text starts with a special char, clean it
    const startWithSpecial = specialRegex.test(elements[i].text);

    // Get the latest IPostElement in "pairs"
    const lastIndex = pairs.length - 1;
    const lastPair = pairs[lastIndex];

    // If this statement is valid, we have a "data"
    if (elements[i].type === "Text" && startWithSpecial && pairs.length > 0) {
      // We merge this element with the last element appended to 'pairs'
      const cleanText = elements[i].text.replace(specialCharsRegex, "").trim();
      lastPair.text = lastPair.text || cleanText;
      lastPair.content.push(...elements[i].content);
    }
    // This is a special case
    else if (elements[i].text.startsWith("Overview:\n")) {
      // We add the overview to the pairs as a text element
      elements[i].type = "Text";
      elements[i].name = "Overview";
      elements[i].text = elements[i].text.replace("Overview:\n", "");
      pairs.push(elements[i]);
    }
    // We have an element referred to the previous "title"
    else if (elements[i].type != "Text" && pairs.length > 0) {
      // We append this element to the content of the last title
      lastPair.content.push(elements[i]);
    }
    // ... else we have a "title" (we need to swap the text to the name because it is a title)
    else {
      const swap: IPostElement = Object.assign({}, elements[i]);
      swap.name = elements[i].text;
      swap.text = "";
      pairs.push(swap);
    }
  }

  return pairs;
}

//#endregion Private methods
