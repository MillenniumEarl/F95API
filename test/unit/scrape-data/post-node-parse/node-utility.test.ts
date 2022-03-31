// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";

// Modules from file
import {
  isPostElementUnknown,
  isPostElementEmpty,
  cleanElement,
  cleanTextFromInvisibleCharacters,
  createEmptyElement
} from "../../../../src/scripts/scrape-data/post-node-parse/node-utility";

export function suite(): void {
  it("Test for unknown element", function () {
    // Arrange
    const node = createEmptyElement();

    // Act
    const unknown = isPostElementUnknown(node);

    // Assert
    expect(unknown).to.be.true;
  });

  it("Test for empty element", function () {
    // Arrange
    const node = createEmptyElement();

    // Act
    const unknown = isPostElementEmpty(node);

    // Assert
    expect(unknown).to.be.true;
  });

  it("Clean dirty element from special chars", function () {
    // Arrange
    const node = createEmptyElement();
    node.text = "$%%Te?xt==";
    node.name = "'%Name==!^";

    // Act
    const clean = cleanElement(node);

    // Assert
    expect(clean.text).to.be.equal("Te?xt");
    expect(clean.name).to.be.equal("Name");
  });

  it("Clean string from command chars", function () {
    // Arrange
    const dirty = "\u0008Text without \u200Bcommand characters\u200B";

    // Act
    const clean = cleanTextFromInvisibleCharacters(dirty);

    // Assert
    expect(clean).to.be.equal("Text without command characters");
  });
}
