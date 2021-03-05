/**
 * Represents the credentials used to access the platform.
 */
export default class Credentials {
    /**
     * Username
     */
    username: string;
    /**
     * Password of the user.
     */
    password: string;
    /**
     * One time token used during login.
     */
    token: string;
    constructor(username: string, password: string);
    /**
     * Fetch and save the token used to log in to F95Zone.
     */
    fetchToken(): Promise<void>;
}
