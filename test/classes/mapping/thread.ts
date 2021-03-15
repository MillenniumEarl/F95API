"use strict";

// Public module from npm
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { INVALID_THREAD_ID, USER_NOT_LOGGED } from "../../../src/scripts/classes/errors";

// Module from files
import { Thread } from "../../../src";
import Shared from "../../../src/scripts/shared";

chai.use(chaiAsPromised);
const { expect } = chai;

export function suite(): void {
  it("Fetch thread with invalid ID", async function fetchWithInvalidID() {
    Shared.setIsLogged(true);
    const thread = new Thread(-1);
    await expect(thread.fetch()).to.be.rejectedWith(INVALID_THREAD_ID);
  });

  it("Fetch thread with null ID", async function fetchWithNullID() {
    Shared.setIsLogged(true);
    const thread = new Thread(null);
    await expect(thread.fetch()).to.be.rejectedWith(INVALID_THREAD_ID);
  });

  it("Fetch thread without authentication", async function fetchWithoutAuth() {
    Shared.setIsLogged(false);
    const thread = new Thread(1234);
    await expect(thread.fetch()).to.be.rejectedWith(USER_NOT_LOGGED);
  });

  it("Fetch post with invalid ID", async function fetchWithInvalidID() {
    Shared.setIsLogged(true);
    const thread = new Thread(-1);
    await expect(thread.getPost(0)).to.be.rejectedWith("Index must be greater or equal than 1");
  });
}
