// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Import suites
import { suite as prefixParser } from "./classes/prefix-parser";
import { suite as platformUser } from "./classes/mapping/platform-user";
import { suite as post } from "./classes/mapping/post";
import { suite as thread } from "./classes/mapping/thread";
import { suite as userProfile } from "./classes/mapping/user-profile";

describe("Test basic function (unit)", function testBasic() {
  //#region Set-up

  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  //#endregion Set-up

  // describe("Test network helper", network.bind(this));
  describe("Test PrefixParser", prefixParser.bind(this));
  describe("Test PlatformUser", platformUser.bind(this));
  describe("Test Post", post.bind(this));
  describe("Test Thread", thread.bind(this));
  describe("Test UserProfile", userProfile.bind(this));
});
