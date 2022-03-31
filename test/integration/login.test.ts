// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public module from npm
import chai from "chai";
import spies from "chai-spies";
import rewire from "rewire";

// Modules from file
import shared from "../../src/scripts/shared";
import LoginResult from "../../src/scripts/classes/login-result";
import Credentials from "../../src/scripts/classes/credentials";
import { login, logout } from "../../src/scripts/login";
import { USER_NOT_LOGGED } from "../../src/scripts/classes/errors";

// Allow chai to use chai-spies
chai.use(spies);

// Global variables
const USERNAME = "TEST_USER";
const PASSWORD = "";
const CAPTCHA_RETRIEVE = async () => "";
const CB_2FA = async () => -1;

export function suite(): void {
  //#region Setup
  // Local variables
  let rewiredLogin = null;
  let validValue = false;

  this.beforeAll(() => {
    // Rewire module
    rewiredLogin = rewireLoginScript();

    // Set spies on session object
    chai.spy.on(shared.session, "isValid", () => validValue);
    chai.spy.on(shared.session, "load", () => undefined);
    chai.spy.on(shared.session, "save", () => undefined);
    chai.spy.on(shared.session, "delete", () => undefined);
  });
  this.afterAll(() => chai.spy.restore(shared.session));
  //#endregion Setup

  describe("Successful login", () => {
    it("With existing session", (done) => {
      validValue = true;

      // Use callback to avoid race condition with spies
      login(USERNAME, PASSWORD, CAPTCHA_RETRIEVE, CB_2FA)
        .then((result) => {
          chai.expect(result.success).to.be.true;
          chai
            .expect(result.code)
            .to.be.equal(LoginResult.ALREADY_AUTHENTICATED);
          chai.expect(shared.isLogged).to.be.true;
        })
        .finally(done);
    });

    it("Without existing session", (done) => {
      validValue = false;

      // Try to log-in
      const promise = rewiredLogin["login"](
        USERNAME,
        PASSWORD,
        CAPTCHA_RETRIEVE,
        CB_2FA
      ) as Promise<LoginResult>;

      // Use callback to avoid race condition with spies
      promise
        .then((result) => {
          chai.expect(result.success).to.be.true;
          chai.expect(result.code).to.be.equal(LoginResult.AUTH_SUCCESSFUL);
          chai.expect(shared.isLogged).to.be.true;
        })
        .finally(done);
    });
  });

  it("Unsuccessful login", (done) => {
    validValue = false;

    // Change mock method to return negative result
    const privateLoginMock = () =>
      new LoginResult(false, LoginResult.UNKNOWN_ERROR, "TEST_LOGIN");
    rewiredLogin.__set__("loginInTheRemotePlatform", privateLoginMock);

    // Try to log-in
    const promise = rewiredLogin["login"](
      USERNAME,
      PASSWORD,
      CAPTCHA_RETRIEVE,
      CB_2FA
    ) as Promise<LoginResult>;

    // Use callback to avoid race condition with spies
    promise
      .then((result) => {
        chai.expect(result.success).to.be.false;
        chai.expect(result.code).to.be.equal(LoginResult.UNKNOWN_ERROR);
        chai.expect(shared.isLogged).to.be.false;
      })
      .finally(done);
  });

  describe("Logout", () => {
    it("When logged", (done) => {
      // Simulate a logged session
      shared.setIsLogged(true);

      logout()
        .then(() => chai.expect(shared.isLogged).to.be.false)
        .finally(done);
    });

    it("When not logged", () => {
      // Set the session as not logged
      shared.setIsLogged(false);

      chai.expect(logout()).to.be.rejectedWith(USER_NOT_LOGGED);
    });
  });
}

function rewireLoginScript() {
  // Rewire the "login.ts" module
  const rewiredLogin = rewire("../../src/scripts/login");

  // Mock the internal methods of "login.ts"
  const privateLoginMock = () =>
    new LoginResult(true, LoginResult.AUTH_SUCCESSFUL, "TEST_LOGIN");
  const createCredentialsMock = () => new Credentials(USERNAME, PASSWORD);
  //const fetchDataMock = () => undefined;

  // Set the mocked methods
  rewiredLogin.__set__({
    loginInTheRemotePlatform: privateLoginMock,
    createCredentials: createCredentialsMock
    //fetchPlatformData: fetchDataMock
  });

  return rewiredLogin;
}
