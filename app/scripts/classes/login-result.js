/**
 * Object obtained in response to an attempt to login to the portal.
 */
class LoginResult {
    constructor() {
        /**
         * Result of the login operation
         * @type Boolean
         */
        this.success = false;
        /**
         * Login response message
         * @type String
         */
        this.message = '';
    }
}
module.exports.LoginResult = LoginResult;