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
export declare class GenericAxiosError extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;
  constructor(args: IBaseError);
}
export declare class UnexpectedResponseContentType extends Error implements IBaseError {
  id: number;
  message: string;
  error: Error;
  constructor(args: IBaseError);
}
export declare class InvalidF95Token extends Error {}
export declare class UserNotLogged extends Error {}
export declare class ParameterError extends Error {}
export {};
