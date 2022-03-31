// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { expect } from "chai";

// Modules from file
import LoginResult from "../../../src/scripts/classes/login-result";

export function suite(): void {
  it("LoginResult - Test properties", () => {
    // Local variables
    const result = true;
    const code = LoginResult.AUTH_SUCCESSFUL;
    const message = "Test message";

    const loginResult = new LoginResult(result, code, message);

    expect(loginResult.success).to.be.true;
    expect(loginResult.code).to.be.equal(code);
    expect(loginResult.message).to.be.equal(message);
  });
}
