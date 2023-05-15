// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

// Modules from file
import { USER_NOT_LOGGED } from "../../src/scripts/classes/errors";
import HandiWork from "../../src/scripts/classes/handiwork/handiwork";
import { getHandiworkFromURL } from "../../src/scripts/handiwork-from-url";
import Shared from "../../src/scripts/shared";

chai.use(chaiAsPromised);
const { expect } = chai;

export function suite(): void {
  it("Get handiwork when not logged", async function () {
    // Local variable
    const URL = "https://www.google.com/";

    // Set the session as not logged
    Shared.setIsLogged(false);

    await expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(USER_NOT_LOGGED);
  });

  it("Get handiwork from invalid URL", async function () {
    // Local variable
    const URL = "www.thisurlhastoofewlevels";

    // Set the session as logged
    Shared.setIsLogged(true);
    
    await expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(`'${URL}' is not a valid URL`);
  });

  it("Get handiwork from not existing URL", async function () {
    // Local variable
    const URL = "www.thisurldoesnotexists4688j765f8.not";

    // Set the session as logged
    Shared.setIsLogged(true);
    
    await expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(`${URL} does not exists`);
  });

  it("Get handiwork from non-F95Zone URL", async function () {
    // Local variable
    const URL = "https://www.google.com/";

    // Set the session as logged
    Shared.setIsLogged(true);
    
    await expect(getHandiworkFromURL(URL, HandiWork)).to.be.rejectedWith(`${URL} is not a valid F95Zone URL`);
  });
}
