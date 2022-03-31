// Copyright (c) 2022 MillenniumEarl
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
import { suite as nodetype } from "./scrape-data/post-node-parse/node-type.test";
import { suite as nodeutility } from "./scrape-data/post-node-parse/node-utility.test";
import { suite as nodeparse } from "./scrape-data/post-node-parse/node-parse.test";
import { suite as jsonldparse } from "./scrape-data/json-ld.test";
import { suite as handiworkparse } from "./scrape-data/handiwork-parse.test";
import { suite as utils } from "./utils.test";

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
  describe("Test for Cheerio node types", nodetype.bind(this));
  describe("Test for IPosteElement utility", nodeutility.bind(this));
  describe(
    "Test parsing from Cheerio node to IPosteElement",
    nodeparse.bind(this)
  );
  describe("Test JSON+LD parsing", jsonldparse.bind(this));
  describe("Test parsing of handiwork", handiworkparse.bind(this));
  describe("Test utils module", utils.bind(this));
});
