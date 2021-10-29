// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public module from npm
import { expect } from "chai";

// Modules from file
import Credentials from "../../../src/scripts/classes/credentials";

export function suite(): void {
  it("Check token formatting", async function testValidToken() {
    // Token example:
    // 1604309951,0338213c00fcbd894fd9415e6ba08403
    // 1604309986,ebdb75502337699381f0f55c86353555
    // 1604310008,2d50d55808e5ec3a157ec01953da9d26

    // Fetch token (is a GET request, we don't need the credentials)
    const cred = new Credentials(null, null);
    await cred.fetchToken();

    // Parse token for assert
    const splitted = cred.token.split(",");
    const unique = splitted[0];
    const hash = splitted[1];
    expect(splitted.length).to.be.equal(2, "The token consists of two parts");

    // Check type of parts
    expect(isNumeric(unique)).to.be.true;
    expect(isNumeric(hash)).to.be.false;

    // The second part is most probably the MD5 hash of something
    expect(hash.length).to.be.equal(32, "Hash should have 32 hex chars");
  });
}

//#region Private methods

/**
 * Check if a string is a number.
 * @author Jeremy
 * @see https://preview.tinyurl.com/y46jqwkt
 */
function isNumeric(num: any): boolean {
  const isNan = Number.isNaN(num);
  const isNum = typeof num === "number";
  const isValidString = typeof num === "string" && num.trim() !== "";

  return (isNum || isValidString) && !isNan;
}

//#endregion
