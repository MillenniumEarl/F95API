// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import { expect } from "chai";

// Modules from file
import { USER_NOT_LOGGED } from "../../src/scripts/classes/errors";
import HandiWork from "../../src/scripts/classes/handiwork/handiwork";
import { getHandiworkFromURL } from "../../src/scripts/handiwork-from-url";
import Shared from "../../src/scripts/shared";

export function suite(): void {
  it("Get handiwork when not logged", function () {
    // Local variable
    const URL = "www.google.com";

    // Set the session as not logged
    Shared.setIsLogged(false);

    expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(
      USER_NOT_LOGGED
    );
  });

  it("Get handiwork from invalid URL", function () {
    // Local variable
    const URL = "www.thisurlhastoomanylevels.too.many";

    // Set the session as logged
    Shared.setIsLogged(true);

    expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(
      /(is not a valid url)$/
    );
  });

  it("Get handiwork from not existing URL", function () {
    // Local variable
    const URL = "www.thisurldoesnotexists4688j765f8.not";

    // Set the session as logged
    Shared.setIsLogged(true);

    expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(
      /(does not exists)/
    );
  });

  it("Get handiwork from non-F95Zone URL", function () {
    // Local variable
    const URL = "www.google.com";

    // Set the session as logged
    Shared.setIsLogged(true);

    expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(
      /(is not a valid F95Zone URL)/
    );
  });
}
