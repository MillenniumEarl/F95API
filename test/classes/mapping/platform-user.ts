"use strict";

// Public module from npm
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { INVALID_USER_ID, USER_NOT_LOGGED } from "../../../src/scripts/classes/errors";

// Module from files
import { auth } from "../../helpers";
import PlatformUser from "../../../src/scripts/classes/mapping/platform-user";
import { logout } from "../../../src";

chai.use(chaiAsPromised);
const { expect } = chai;

export function suite(): void {
  it("Fetch platform user without ID", async function fetchWithoutID() {
    await auth();
    const user = new PlatformUser();
    await expect(user.fetch()).to.be.rejectedWith(INVALID_USER_ID);
  });

  it("Fetch platform user with invalid ID", async function fetchWithInvalidID() {
    await auth();
    const user = new PlatformUser(-1);
    await expect(user.fetch()).to.be.rejectedWith(INVALID_USER_ID);
  });

  it("Fetch platform user without authentication", async function fetchWithoutAuth() {
    await logout();
    const user = new PlatformUser(1234);
    await expect(user.fetch()).to.be.rejectedWith(USER_NOT_LOGGED);
  });
}
