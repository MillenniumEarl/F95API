// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

import { expect } from "chai";
import { Success, Failure } from "../../../src/scripts/classes/result";

export function suite(): void {
  describe("Test class Failure", () => {
    it("Failure - isFailure", () => {
      // Arguments
      const value = undefined;

      // Method call
      const failure = new Failure(value);
      const result = failure.isFailure();

      // Expect result
      expect(result).to.be.true;
    });

    it("Failure - isSuccess", () => {
      // Arguments
      const value = undefined;

      // Method call
      const failure = new Failure(value);
      const result = failure.isSuccess();

      // Expect result
      expect(result).to.be.false;
    });

    it("Failure - applyOnSuccess", () => {
      // Arguments
      const value = undefined;
      const args = undefined;

      // Method call
      const failure = new Failure(value);
      const result = failure.applyOnSuccess(args);

      // Expect result
      expect(result).to.be.equal(
        failure,
        "In case of failure the function should returns the instance of the class"
      );
    });
  });

  describe("Test class Success", () => {
    it("Success - isFailure", () => {
      // Arguments
      const value = undefined;

      // Method call
      const success = new Success(value);
      const result = success.isFailure();

      // Expect result
      expect(result).to.be.false;
    });

    it("Success - isSuccess", () => {
      // Arguments
      const value = undefined;

      // Method call
      const success = new Success(value);
      const result = success.isSuccess();

      // Expect result
      expect(result).to.be.true;
    });

    it("Success - applyOnSuccess", () => {
      // Arguments
      const RESULT = "Success";
      const value = undefined;
      const func = () => RESULT;

      // Method call
      const success = new Success(value);
      const result = success.applyOnSuccess(func);

      // Expect result
      expect(result.value).to.be.equal(RESULT);
    });
  });
}
