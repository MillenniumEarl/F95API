import tough from "tough-cookie";
export default class Session {
    /**
     * Max number of days the session is valid.
     */
    private readonly SESSION_TIME;
    private readonly COOKIEJAR_FILENAME;
    private _path;
    private _isMapped;
    private _created;
    private _hash;
    private _token;
    private _cookieJar;
    private _cookieJarPath;
    /**
     * Path of the session map file on disk.
     */
    get path(): string;
    /**
     * Indicates if the session is mapped on disk.
     */
    get isMapped(): boolean;
    /**
     * Date of creation of the session.
     */
    get created(): Date;
    /**
     * MD5 hash of the username and the password.
     */
    get hash(): string;
    /**
     * Token used to login to F95Zone.
     */
    get token(): string;
    /**
     * Cookie holder.
     */
    get cookieJar(): tough.CookieJar;
    /**
     * Initializes the session by setting the path for saving information to disk.
     */
    constructor(p: string);
    /**
     * Get the difference in days between two dates.
     */
    private dateDiffInDays;
    /**
     * Convert the object to a dictionary serializable in JSON.
     */
    private toJSON;
    /**
     * Create a new session.
     */
    create(username: string, password: string, token: string): void;
    /**
     * Save the session to disk.
     */
    save(): Promise<void>;
    /**
     * Load the session from disk.
     */
    load(): Promise<void>;
    /**
     * Delete the session from disk.
     */
    delete(): Promise<void>;
    /**
     * Check if the session is valid.
     */
    isValid(username: string, password: string): boolean;
}
