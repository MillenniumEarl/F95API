// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Modules from file
import { IPostElement } from "../../interfaces";

/**
 * Check if the node has non empty `name` and `text`.
 */
export function isPostElementUnknown(node: IPostElement): boolean {
  return node.name.trim() === "" && node.text.trim() === "";
}

/**
 * Check if the node is defined and has a non empty
 * property between `name`, `text` and `content`.
 */
export function isPostElementEmpty(node: IPostElement): boolean {
  return node && node.content.length === 0 && isPostElementUnknown(node);
}

/**
 * Clean the element `name` and `text` removing initial and final special characters.
 */
export function cleanElement(element: IPostElement): IPostElement {
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

/**
 * Removes all invisible characters from the string,
 * such as control characters or the Zero Width Space.
 */
export function cleanTextFromInvisibleCharacters(s: string): string {
  // eslint-disable-next-line no-control-regex
  return s.replace(/[\u0000-\u001F\u007F-\u009F\u200B]/gmu, "");
}

/**
 * Create a `IPostElement` without name, text or content.
 */
export function createEmptyElement(): IPostElement {
  return {
    type: "Empty",
    name: "",
    text: "",
    content: []
  };
}
