"use strict";

const urlHelper = require("../app/scripts/url-helper.js");
const expect = require("chai").expect;
const F95API = require("../app/index");
const fs = require("fs");
const sleep = require("sleep");
const dotenv = require("dotenv");
dotenv.config();

const COOKIES_SAVE_PATH = "./f95cache/cookies.json";
const ENGINES_SAVE_PATH = "./f95cache/engines.json";
const STATUSES_SAVE_PATH = "./f95cache/statuses.json";
const USERNAME = process.env.F95_USERNAME;
const PASSWORD = process.env.F95_PASSWORD;
const FAKE_USERNAME = "FakeUsername091276";
const FAKE_PASSWORD = "fake_password";

F95API.debug(false);

function randomSleep() {
  const random = Math.floor(Math.random() * 500) + 50;
  sleep.msleep(500 + random);
}

describe("Login without cookies", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  before("Set isolation", function () {
    F95API.setIsolation(true);
  });

  beforeEach("Remove all cookies", function () {
    // Runs before each test in this block
    if (fs.existsSync(COOKIES_SAVE_PATH)) fs.unlinkSync(COOKIES_SAVE_PATH);
    if (F95API.isLogged()) F95API.logout();
  });
  //#endregion Set-up

  let testOrder = 0;

  it("Test with valid credentials", async function () {
    // Gain exclusive use of the cookies
    while (testOrder !== 0) randomSleep();

    const result = await F95API.login(USERNAME, PASSWORD);
    expect(result.success).to.be.true;
    expect(result.message).equal("Authentication successful");

    testOrder = 1;
  });
  it("Test with invalid username", async function () {
    // Gain exclusive use of the cookies
    while (testOrder !== 1) randomSleep();

    const result = await F95API.login(FAKE_USERNAME, FAKE_PASSWORD);
    expect(result.success).to.be.false;
    expect(result.message).to.equal("Incorrect username");

    testOrder = 2;
  });
  it("Test with invalid password", async function () {
    // Gain exclusive use of the cookies
    while (testOrder !== 2) randomSleep();

    const result = await F95API.login(USERNAME, FAKE_PASSWORD);
    expect(result.success).to.be.false;
    expect(result.message).to.equal("Incorrect password");

    testOrder = 3;
  });
  it("Test with invalid credentials", async function () {
    // Gain exclusive use of the cookies
    while (testOrder !== 3) randomSleep();

    const result = await F95API.login(FAKE_USERNAME, FAKE_PASSWORD);
    expect(result.success).to.be.false;
    expect(result.message).to.equal("Incorrect username"); // It should first check the username

    testOrder = 4;
  });
});

describe("Login with cookies", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  before("Log in to create cookies then logout", async function () {
    // Runs once before the first test in this block
    if (!fs.existsSync(COOKIES_SAVE_PATH))
      await F95API.login(USERNAME, PASSWORD); // Download cookies
    if (F95API.isLogged()) F95API.logout();
  });
  //#endregion Set-up

  it("Test with valid credentials", async function () {
    const result = await F95API.login(USERNAME, PASSWORD);
    expect(result.success).to.be.true;
    expect(result.message).equal("Logged with cookies");
  });
});

describe("Load base data without cookies", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  before("Delete cache if exists", function () {
    // Runs once before the first test in this block
    if (fs.existsSync(ENGINES_SAVE_PATH)) fs.unlinkSync(ENGINES_SAVE_PATH);
    if (fs.existsSync(STATUSES_SAVE_PATH)) fs.unlinkSync(STATUSES_SAVE_PATH);
  });
  //#endregion Set-up

  it("With login", async function () {
    const loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    const result = await F95API.loadF95BaseData();

    const enginesCacheExists = fs.existsSync(ENGINES_SAVE_PATH);
    const statusesCacheExists = fs.existsSync(STATUSES_SAVE_PATH);

    expect(result).to.be.true;
    expect(enginesCacheExists).to.be.true;
    expect(statusesCacheExists).to.be.true;
  });

  it("Without login", async function () {
    if (F95API.isLogged()) F95API.logout();
    const result = await F95API.loadF95BaseData();
    expect(result).to.be.false;
  });
});

describe("Search game data", function () {
  //#region Set-up
  this.timeout(60000); // All tests in this suite get 60 seconds before timeout

  beforeEach("Prepare API", function () {
    // Runs once before the first test in this block
    if (F95API.isLogged()) F95API.logout();
  });
  //#endregion Set-up

  let testGame = null;

  it("Search game when logged", async function () {
    const loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    const loadResult = await F95API.loadF95BaseData();
    expect(loadResult).to.be.true;

    // This test depend on the data on F95Zone at
    // https://f95zone.to/threads/kingdom-of-deception-v0-10-8-hreinn-games.2733/
    const gamesList = await F95API.getGameData("Kingdom of Deception", false);
    expect(gamesList.length, "Should find only the game").to.equal(1);
    const result = gamesList[0];
    const src = "https://attachments.f95zone.to/2018/09/162821_f9nXfwF.png";

    // Test only the main information
    expect(result.name).to.equal("Kingdom of Deception");
    expect(result.author).to.equal("Hreinn Games");
    expect(result.isMod, "Should be false").to.be.false;
    expect(result.engine).to.equal("REN'PY");
    expect(result.previewSource).to.equal(src); // Could be null -> Why sometimes doesn't get the image?
    testGame = Object.assign({}, result);
  });
  it("Search game when not logged", async function () {
    const result = await F95API.getGameData("Kingdom of Deception", false);
    expect(result, "Without being logged should return null").to.be.null;
  });
  it("Test game serialization", function () {
    const json = JSON.stringify(testGame);
    const parsedGameInfo = JSON.parse(json);
    expect(parsedGameInfo).to.be.equal(testGame);
  });
});

describe("Load user data", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout
  //#endregion Set-up

  it("Retrieve when logged", async function () {
    // Login
    await F95API.login(USERNAME, PASSWORD);

    // Then retrieve user data
    const data = await F95API.getUserData();

    expect(data).to.exist;
    expect(data.username).to.equal(USERNAME);
  });
  it("Retrieve when not logged", async function () {
    // Logout
    if (F95API.isLogged()) F95API.logout();

    // Try to retrieve user data
    const data = await F95API.getUserData();

    expect(data).to.be.null;
  });
});

describe("Check game update", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout
  //#endregion Set-up

  it("Get online game and verify that no update exists", async function () {
    const loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    const loadResult = await F95API.loadF95BaseData();
    expect(loadResult).to.be.true;

    // This test depend on the data on F95Zone at
    // https://f95zone.to/threads/kingdom-of-deception-v0-10-8-hreinn-games.2733/
    const result = (await F95API.getGameData("Kingdom of Deception", false))[0];

    const update = await F95API.chekIfGameHasUpdate(result);
    expect(update).to.be.false;
  });

  it("Verify that update exists from old URL", async function () {
    const loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    // This test depend on the data on F95Zone at
    // https://f95zone.to/threads/perverted-education-v0-9701-april-ryan.1854/
    const url =
      "https://f95zone.to/threads/perverted-education-v0-9701-april-ryan.1854/";
    const result = await F95API.getGameDataFromURL(url);
    result.version = "0.9600";

    const update = await F95API.chekIfGameHasUpdate(result);
    expect(update).to.be.true;
  });
});

describe("Test url-helper", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout
  //#endregion Set-up

  it("Check if URL exists", async function () {
    // Check generic URLs...
    let exists = urlHelper.urlExists("https://www.google.com/");
    expect(exists).to.be.true;

    exists = urlHelper.urlExists("www.google.com");
    expect(exists).to.be.true;

    exists = urlHelper.urlExists("https://www.google/");
    expect(exists).to.be.false;

    // Now check for more specific URLs (with redirect)...
    exists = urlHelper.urlExists(
      "https://f95zone.to/threads/perverted-education-v0-9601-april-ryan.1854/"
    );
    expect(exists).to.be.true;

    exists = urlHelper.urlExists(
      "https://f95zone.to/threads/perverted-education-v0-9601-april-ryan.1854/",
      true
    );
    expect(exists).to.be.false;
  });

  it("Check if URL belong to the platform", async function () {
    let belong = urlHelper.isF95URL(
      "https://f95zone.to/threads/perverted-education-v0-9601-april-ryan.1854/"
    );
    expect(belong).to.be.true;

    belong = urlHelper.isF95URL("https://www.google/");
    expect(belong).to.be.false;
  });
});
