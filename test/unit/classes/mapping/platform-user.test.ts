// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Public module from npm
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { INVALID_USER_ID, USER_NOT_LOGGED } from "../../../../src/scripts/classes/errors";

// Module from files
import { PlatformUser } from "../../../../src";
import Shared from "../../../../src/scripts/shared";

chai.use(chaiAsPromised);
const { expect } = chai;

export function suite(): void {
  it("Fetch platform user without ID", async function fetchWithoutID() {
    Shared.setIsLogged(true);
    const user = new PlatformUser();
    await expect(user.fetch()).to.be.rejectedWith(INVALID_USER_ID);
  });

  it("Fetch platform user with null ID", async function fetchWithNullID() {
    Shared.setIsLogged(true);
    const user = new PlatformUser(null);
    await expect(user.fetch()).to.be.rejectedWith(INVALID_USER_ID);
  });

  it("Fetch platform user with invalid ID", async function fetchWithInvalidID() {
    Shared.setIsLogged(true);
    const user = new PlatformUser(-1);
    await expect(user.fetch()).to.be.rejectedWith(INVALID_USER_ID);
  });

  it("Fetch platform user without authentication", async function fetchWithoutAuth() {
    Shared.setIsLogged(false);
    const user = new PlatformUser(1234);
    await expect(user.fetch()).to.be.rejectedWith(USER_NOT_LOGGED);
  });
}
