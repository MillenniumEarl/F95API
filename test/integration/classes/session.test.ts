// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import * as fs from "fs";
import { expect } from "chai";
import Session from "../../../src/scripts/classes/session";

// Constants
const USERNAME = "User";
const PASSWORD = "Password";
const TOKEN = "test-token";

export function suite(): void {
  it("Session - create", () => {
    // Arguments
    const path = "./sessionCreateTest";

    // Method call
    const session = createSession(path);

    expect(session.token).to.be.equal(TOKEN);
    expect(session.path).to.be.equal(path);
    expect(session.isMapped).to.be.false;
    expect(session.created).to.not.be.null;
    expect(session.hash).to.not.be.null;
  });

  it("Session - save", async () => {
    // Arguments
    const path = "./sessionSaveTest";

    // Method call
    const session = createSession(path);
    await session.save();

    // Verify test
    const exists = fs.existsSync(path);
    expect(exists).to.be.true;

    // Delete file
    if (exists) fs.unlinkSync(path);
  });

  it("Session - load", async () => {
    // Arguments
    const path = "./sessionLoadTest";

    // Method call
    const sessionSave = createSession(path);
    await sessionSave.save();

    const sessionLoad = createSession(path);
    await sessionLoad.load();

    // Verify test
    expect(sessionSave.hash).to.be.equal(sessionLoad.hash);
    expect(sessionSave.created.toISOString()).to.be.equal(
      sessionLoad.created.toISOString()
    );
    expect(sessionSave.token).to.be.equal(sessionLoad.token);

    // Delete file
    if (fs.existsSync(path)) fs.unlinkSync(path);
  });

  it("Session - delete", async () => {
    // Arguments
    const path = "./sessionDeleteTest";

    // Method call
    const session = createSession(path);
    await session.save();
    await session.delete();

    // Verify test
    const exists = fs.existsSync(path);
    expect(exists).to.be.false;
  });

  it("Session - isValid", () => {
    // Arguments
    const path = "./sessionValidateTest";

    // Method call
    const session = createSession(path);
    const result = session.isValid(USERNAME, PASSWORD);

    // Expect result
    expect(result).to.be.true;
  });
}

function createSession(path: string) {
  const session = new Session(path);
  session.create(USERNAME, PASSWORD, TOKEN);
  return session;
}
