"use strict";

interface IBaseError {
  /**
   * Unique identifier of the error.
   */
  id: number;
  /**
   * Error message.
   */
  message: string;
  /**
   * Error to report.
   */
  error: Error;
}

export class GenericAxiosError extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;

  constructor(args: IBaseError) {
    super();
    this.id = args.id;
    this.message = args.message;
    this.error = args.error;
  }
}

export class UnexpectedResponseContentType extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;

  constructor(args: IBaseError) {
    super();
    this.id = args.id;
    this.message = args.message;
    this.error = args.error;
  }
}

export class InvalidF95Token extends Error {}

export class UserNotLogged extends Error {}

export class ParameterError extends Error {}
