// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

import { expect } from "chai";
import Session from "../../../src/scripts/classes/session";

export function suite(): void {
  describe("Test class Session", () => {
    it("Session - null path", () => {
      // Arguments
      const path = null;
      const ERROR_MESSAGE = "Invalid path for the session file";

      // Method call
      expect(() => new Session(path)).throw(ERROR_MESSAGE);
    });

    it("Session - empty path", () => {
      // Arguments
      const path = "";
      const ERROR_MESSAGE = "Invalid path for the session file";

      // Method call
      expect(() => new Session(path)).throw(ERROR_MESSAGE);
    });
  });
}
