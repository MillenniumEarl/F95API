"use strict";

const expect = require("chai").expect;
const F95API = require("../app/index");
const fs = require("fs");

const COOKIES_SAVE_PATH = "./f95cache/cookies.json";
const ENGINES_SAVE_PATH = "./f95cache/engines.json";
const STATUSES_SAVE_PATH = "./f95cache/statuses.json";
const USERNAME = "MillenniumEarl";
const PASSWORD = "f9vTcRNuvxj4YpK";
const FAKE_USERNAME = "FakeUsername091276";
const FAKE_PASSWORD = "fake_password";

F95API.setIsolation(true);

describe("Login without cookies", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  beforeEach("Remove all cookies", function () {
    // Runs before each test in this block
    if (fs.existsSync(COOKIES_SAVE_PATH)) fs.unlinkSync(COOKIES_SAVE_PATH);
    F95API.logout();
  });
  //#endregion Set-up

  it("Test with valid credentials", async function () {
    const result = await F95API.login(USERNAME, PASSWORD);
    expect(result.success).to.be.true;
    expect(result.message).equal("Authentication successful");
  });
  it("Test with invalid username", async function () {
    const result = await F95API.login(FAKE_USERNAME, FAKE_PASSWORD);
    expect(result.success).to.be.false;
    expect(result.message).to.equal("Incorrect username");
  });
  it("Test with invalid password", async function () {
    const result = await F95API.login(USERNAME, FAKE_PASSWORD);
    expect(result.success).to.be.false;
    expect(result.message).to.equal("Incorrect password");
  });
  it("Test with invalid credentials", async function () {
    const result = await F95API.login(FAKE_USERNAME, FAKE_PASSWORD);
    expect(result.success).to.be.false;
    expect(result.message).to.equal("Incorrect username"); // It should first check the username
  });
});

describe("Login with cookies", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout

  before("Log in to create cookies then logout", async function () {
    // Runs once before the first test in this block
    if (!fs.existsSync(COOKIES_SAVE_PATH))
      await F95API.login(USERNAME, PASSWORD); // Download cookies
    F95API.logout();
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
    let loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    let result = await F95API.loadF95BaseData();

    let enginesCacheExists = fs.existsSync(ENGINES_SAVE_PATH);
    let statusesCacheExists = fs.existsSync(STATUSES_SAVE_PATH);

    expect(result).to.be.true;
    expect(enginesCacheExists).to.be.true;
    expect(statusesCacheExists).to.be.true;
  });

  it("Without login", async function () {
    F95API.logout();
    let result = await F95API.loadF95BaseData();
    expect(result).to.be.false;
  });
});

describe("Search game data", function () {
  //#region Set-up
  this.timeout(60000); // All tests in this suite get 60 seconds before timeout

  beforeEach("Prepare API", function () {
    // Runs once before the first test in this block
    F95API.logout();
  });
  //#endregion Set-up

  it("Search game when logged", async function () {
    const loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    const loadResult = await F95API.loadF95BaseData();
    expect(loadResult).to.be.true;

    // This test depend on the data on F95Zone at
    // https://f95zone.to/threads/kingdom-of-deception-v0-10-8-hreinn-games.2733/
    const result = (await F95API.getGameData("Kingdom of Deception", false))[0];
    let src = "https://attachments.f95zone.to/2018/09/162821_f9nXfwF.png";

    // Test only the main information
    expect(result.name).to.equal("Kingdom of Deception");
    expect(result.author).to.equal("Hreinn Games");
    expect(result.isMod, "Should be false").to.be.false;
    expect(result.engine).to.equal("REN'PY");
    // expect(result.previewSource).to.equal(src); could be null -> Why sometimes doesn't get the image?
  });
  it("Search game when not logged", async function () {
    const result = await F95API.getGameData("Kingdom of Deception", false);
    expect(result, "Without being logged should return null").to.be.null;
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
    let data = await F95API.getUserData();

    expect(data).to.exist;
    expect(data.username).to.equal(USERNAME);
  });
  it("Retrieve when not logged", async function () {
    // Logout
    F95API.logout();

    // Try to retrieve user data
    let data = await F95API.getUserData();

    expect(data).to.be.null;
  });
});

describe("Check game version", function () {
  //#region Set-up
  this.timeout(30000); // All tests in this suite get 30 seconds before timeout
  //#endregion Set-up

  it("Get game version", async function () {
    const loginResult = await F95API.login(USERNAME, PASSWORD);
    expect(loginResult.success).to.be.true;

    const loadResult = await F95API.loadF95BaseData();
    expect(loadResult).to.be.true;

    // This test depend on the data on F95Zone at
    // https://f95zone.to/threads/kingdom-of-deception-v0-10-8-hreinn-games.2733/
    const result = (await F95API.getGameData("Kingdom of Deception", false))[0];

    let version = await F95API.getGameVersion(result);
    expect(version).to.be.equal(result.version);
  });
});
