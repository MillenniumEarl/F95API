/**
 * Object obtained in response to an attempt to login to the portal.
 */
export default class LoginResult {
  static REQUIRE_2FA: number;
  static AUTH_SUCCESSFUL: number;
  static AUTH_SUCCESSFUL_2FA: number;
  static ALREADY_AUTHENTICATED: number;
  static UNKNOWN_ERROR: number;
  static INCORRECT_CREDENTIALS: number;
  static INCORRECT_2FA_CODE: number;
  /**
   * Result of the login operation
   */
  readonly success: boolean;
  /**
   * Code associated with the result of the login operation.
   */
  readonly code: number;
  /**
   * Login response message
   */
  readonly message: string;
  constructor(success: boolean, code: number, message?: string);
}
