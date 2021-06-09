// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Import suites
import { suite as basicClass } from "./classes/handiwork/basic.test";
import { suite as assetClass } from "./classes/handiwork/asset.test";
import { suite as animationClass } from "./classes/handiwork/animation.test";
import { suite as comicClass } from "./classes/handiwork/comic.test";
import { suite as gameClass } from "./classes/handiwork/game.test";
import { suite as handiwork } from "./classes/handiwork/handiwork.test";
import { suite as platformUser } from "./classes/mapping/platform-user.test";
import { suite as post } from "./classes/mapping/post.test";
import { suite as thread } from "./classes/mapping/thread.test";
import { suite as userProfile } from "./classes/mapping/user-profile.test";
import { suite as errors } from "./classes/errors.test";
import { suite as result } from "./classes/result.test";
import { suite as session } from "./classes/session.test";
import { suite as loginresult } from "./classes/login-result.test";

describe("Unit tests", function testBasic() {
  describe("Test class Basic", basicClass.bind(this));
  describe("Test class Asset", assetClass.bind(this));
  describe("Test class Animation", animationClass.bind(this));
  describe("Test class Comic", comicClass.bind(this));
  describe("Test class Game", gameClass.bind(this));
  describe("Test class Handiwork", handiwork.bind(this));
  describe("Test class PlatformUser", platformUser.bind(this));
  describe("Test class Post", post.bind(this));
  describe("Test class Thread", thread.bind(this));
  describe("Test class UserProfile", userProfile.bind(this));
  describe("Test errors", errors.bind(this));
  describe("Test class Result", result.bind(this));
  describe("Test class Session", session.bind(this));
  describe("Test class LoginResult", loginresult.bind(this));
});
