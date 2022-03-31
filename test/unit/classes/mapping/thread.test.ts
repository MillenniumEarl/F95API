// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import chai from "chai";
import chaiAsPromised from "chai-as-promised";

// Module from files
import { Thread } from "../../../../src";
import Shared from "../../../../src/scripts/shared";
import {
  INVALID_THREAD_CONSTRUCTOR_ARGUMENT,
  INVALID_THREAD_ID,
  USER_NOT_LOGGED
} from "../../../../src/scripts/classes/errors";

chai.use(chaiAsPromised);
const { expect } = chai;

export function suite(): void {
  it("Constructor with invalid parameter", function createWithInvalidID() {
    expect(() => new Thread(-1)).throw(INVALID_THREAD_ID);
  });

  it("Constructor with null parameter", function createWithNullID() {
    expect(() => new Thread(null)).throw(INVALID_THREAD_CONSTRUCTOR_ARGUMENT);
  });

  it("Fetch thread without authentication", async function fetchWithoutAuth() {
    Shared.setIsLogged(false);
    const thread = new Thread(1234);
    await expect(thread.fetch()).to.be.rejectedWith(USER_NOT_LOGGED);
  });
}
