"use strict";

/**
 * Object obtained in response to an attempt to login to the portal.
 */
class LoginResult {
    constructor(success, message) {
        /**
        * Result of the login operation
        * @type Boolean
        */
        this.success = success;
        /**
        * Login response message
        * @type String
        */
        this.message = message;
    }
}
module.exports = LoginResult;
