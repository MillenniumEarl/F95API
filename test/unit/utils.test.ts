// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { expect } from "chai";

// Local modules
import { getDateFromString } from "../../src/scripts/utils";

export function suite(): void {
  it("getDateFromString - No date in string", () => {
    const datestring = "no date in this string";

    const date = getDateFromString(datestring);

    expect(date).to.be.undefined;
  });

  it("getDateFromString - Invalid date format in string", () => {
    // Valid format is: YYYY-MM-DD
    const datestring = "23-03-2022%garbage%12-12-12";

    const date = getDateFromString(datestring);

    expect(date).to.be.undefined;
  });

  it("getDateFromString - Single date in string", () => {
    const datestring = "2022-03-03";
    const expected = new Date(datestring).toDateString();

    const date = getDateFromString(datestring);

    expect(date.toDateString()).to.be.equal(expected);
  });

  it("getDateFromString - Multiple date in string, crescent order", () => {
    const datestring = "2022-03-03%garbage%2021-05-05%garbage%2022-04-04";
    const expected = new Date("2021-05-05").toDateString();

    const date = getDateFromString(datestring, "crescent");

    expect(date.toDateString()).to.be.equal(expected);
  });

  it("getDateFromString - Multiple date in string, decrescent order", () => {
    const datestring = "2022-03-03%garbage%2021-05-05%garbage%2022-04-04";
    const expected = new Date("2022-04-04").toDateString();

    const date = getDateFromString(datestring, "decrescent");

    expect(date.toDateString()).to.be.equal(expected);
  });
}
