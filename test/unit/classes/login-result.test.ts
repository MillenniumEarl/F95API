// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import LoginResult from "../../../src/scripts/classes/login-result";

export function suite(): void {
  describe("Test class LoginResult", () => {
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
  });
}
