// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Import suites
import { suite as credentials } from "./classes/credentials.test";
import { suite as prefixParser } from "./classes/prefix-parser.test";
import { suite as session } from "./classes/session.test";

describe("Integration Tests", function testBasic() {
  //#region Set-up

  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  //#endregion Set-up

  describe("Test class Credentials", credentials.bind(this));
  describe("Test class PrefixParser", prefixParser.bind(this));
  describe("Test class Session", session.bind(this));
});
