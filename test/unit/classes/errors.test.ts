// Copyright (c) 2022 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

// Public modules from npm
import { expect } from "chai";

// Modules from file
import {
  BaseAPIError,
  GenericAxiosError,
  UnexpectedResponseContentType,
  INVALID_ERROR_ERROR,
  INVALID_ERROR_ID,
  INVALID_ERROR_MESSAGE,
  AxiosRequestError,
  AxiosResponseError
} from "../../../src/scripts/classes/errors";

export function suite(): void {
  // Constants
  const ID = 1;
  const MESSAGE = "Test message";
  const ERROR = new Error("Test error");

  describe("Test class BaseAPIError", () => {
    it("BaseAPIError - Null ID", () => {
      // Arguments
      const args = { id: null, message: MESSAGE, error: ERROR };

      // Property call
      expect(() => new BaseAPIError(args)).throw(INVALID_ERROR_ID);
    });

    it("BaseAPIError - Negative ID", () => {
      // Arguments
      const args = { id: -1, message: MESSAGE, error: ERROR };

      // Property call
      expect(() => new BaseAPIError(args)).throw(INVALID_ERROR_ID);
    });

    it("BaseAPIError - Null message", () => {
      // Arguments
      const args = { id: ID, message: null, error: ERROR };

      // Property call
      expect(() => new BaseAPIError(args)).throw(INVALID_ERROR_MESSAGE);
    });

    it("BaseAPIError - Empty message", () => {
      // Arguments
      const args = { id: ID, message: "", error: ERROR };

      // Property call
      expect(() => new BaseAPIError(args)).throw(INVALID_ERROR_MESSAGE);
    });

    it("BaseAPIError - Null error", () => {
      // Arguments
      const args = { id: ID, message: MESSAGE, error: null };

      // Property call
      expect(() => new BaseAPIError(args)).throw(INVALID_ERROR_ERROR);
    });

    it("BaseAPIError - Valid arguments", () => {
      // Arguments
      const args = { id: ID, message: MESSAGE, error: ERROR };

      // Property call
      const baseAPIError = new BaseAPIError(args);

      expect(baseAPIError.id).to.be.equal(ID, "ID value must be equal");
      expect(baseAPIError.message).to.be.equal(MESSAGE, "Message value must be equal");
      expect(baseAPIError.error).to.be.equal(ERROR, "Error value must be equal");
    });
  });

  describe("Test class GenericAxiosError", () => {
    it("GenericAxiosError - Valid arguments", () => {
      // Arguments
      const args = { id: ID, message: MESSAGE, error: ERROR };

      // Property call
      const genericAxiosError = new GenericAxiosError(args);

      expect(genericAxiosError.id).to.be.equal(ID, "ID value must be equal");
      expect(genericAxiosError.message).to.be.equal(MESSAGE, "Message value must be equal");
      expect(genericAxiosError.error).to.be.equal(ERROR, "Error value must be equal");
    });
  });

  describe("Test class AxiosRequestError", () => {
    it("AxiosRequestError - Valid arguments", () => {
      // Arguments
      const args = { id: ID, message: MESSAGE, error: ERROR };

      // Property call
      const axiosRequestError = new AxiosRequestError(args);

      expect(axiosRequestError.id).to.be.equal(ID, "ID value must be equal");
      expect(axiosRequestError.message).to.be.equal(MESSAGE, "Message value must be equal");
      expect(axiosRequestError.error).to.be.equal(ERROR, "Error value must be equal");
    });
  });

  describe("Test class AxiosResponseError", () => {
    it("AxiosResponseError - Valid arguments", () => {
      // Arguments
      const args = { id: ID, message: MESSAGE, error: ERROR };

      // Property call
      const axiosResponseError = new AxiosResponseError(args);

      expect(axiosResponseError.id).to.be.equal(ID, "ID value must be equal");
      expect(axiosResponseError.message).to.be.equal(MESSAGE, "Message value must be equal");
      expect(axiosResponseError.error).to.be.equal(ERROR, "Error value must be equal");
    });
  });

  describe("Test class UnexpectedResponseContentType", () => {
    it("UnexpectedResponseContentType - Valid arguments", () => {
      // Arguments
      const args = { id: ID, message: MESSAGE, error: ERROR };

      // Property call
      const error = new UnexpectedResponseContentType(args);

      expect(error.id).to.be.equal(ID, "ID value must be equal");
      expect(error.message).to.be.equal(MESSAGE, "Message value must be equal");
      expect(error.error).to.be.equal(ERROR, "Error value must be equal");
    });
  });
}
