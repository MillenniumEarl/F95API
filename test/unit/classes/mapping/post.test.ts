// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { INVALID_POST_ID, USER_NOT_LOGGED } from "../../../../src/scripts/classes/errors";

// Module from files
import { Post } from "../../../../src";
import Shared from "../../../../src/scripts/shared";

chai.use(chaiAsPromised);
const { expect } = chai;

export function suite(): void {
  it("Fetch post with null ID", async function fetchWithNullID() {
    Shared.setIsLogged(true);
    const post = new Post(null);
    await expect(post.fetch()).to.be.rejectedWith(INVALID_POST_ID);
  });

  it("Fetch post with invalid ID", async function fetchWithInvalidID() {
    Shared.setIsLogged(true);
    const post = new Post(-1);
    await expect(post.fetch()).to.be.rejectedWith(INVALID_POST_ID);
  });

  it("Fetch post without authentication", async function fetchWithoutAuth() {
    Shared.setIsLogged(false);
    const post = new Post(1234);
    await expect(post.fetch()).to.be.rejectedWith(USER_NOT_LOGGED);
  });
}
