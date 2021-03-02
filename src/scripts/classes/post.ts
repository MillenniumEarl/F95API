"use strict";

// Public modules from npm
import cheerio from "cheerio";

// Modules from file
import PlatformUser from "./platform-user.js";
import { IPostElement, parseF95ThreadPost } from "../scrape-data/post-parse.js";
import { POST, THREAD } from "../constants/css-selector.js";
import { urls } from "../constants/url.js";
import { fetchHTML } from "../network-helper.js";

/**
 * Represents a post published by a user on the F95Zone platform.
 */
export default class Post {

    //#region Fields

    private _id: number;
    private _number: number;
    private _published: Date;
    private _lastEdit: Date;
    private _owner: PlatformUser;
    private _bookmarked: boolean;
    private _message: string;
    private _body: IPostElement[];

    //#endregion Fields

    //#region Getters

    /**
     * Represents a post published by a user on the F95Zone platform.
     */
    public get id() { return this._id; }
    /**
     * Unique ID of the post within the thread in which it is present.
     */
    public get number() { return this._number; }
    /**
     * Date the post was first published.
     */
    public get published() { return this._published; }
    /**
     * Date the post was last modified.
     */
    public get lastEdit() { return this._lastEdit; }
    /**
     * User who owns the post.
     */
    public get owner() { return this._owner; }
    /**
     * Indicates whether the post has been bookmarked.
     */
    public get bookmarked() { return this._bookmarked; }
    /**
     * Post message text.
     */
    public get message() { return this._message; }
    /**
     * Set of the elements that make up the body of the post.
     */
    public get body() { return this._body; }

    //#endregion Getters

    //#region Public methods

    /**
     * Gets the post data starting from its unique ID for the entire platform.
     */
    public async fetchData(id: number): Promise<void>;

    public async fetchData(article: cheerio.Cheerio): Promise<void>;

    public async fetchData(arg: number | cheerio.Cheerio): Promise<void> {
        if (typeof arg === "number") {
            // Fetch HTML page containing the post
            const url = new URL(arg.toString(), urls.F95_POSTS).toString();
            const htmlResponse = await fetchHTML(url);

            if (htmlResponse.isSuccess()) {
                // Load cheerio and find post
                const $ = cheerio.load(htmlResponse.value);

                const post = $(THREAD.POSTS_IN_PAGE).toArray().find((el, idx) => {
                    // Fetch the ID and check if it is what we are searching
                    const sid: string = $(el).find(POST.ID).attr("id").replace("post-", "");
                    const id = parseInt(sid);

                    if (id === arg) return el;
                });

                // Finally parse the post
                this.parsePost($(post));
            } else throw htmlResponse.value;
            
        } else this.parsePost(arg);
    }

    //#endregion Public methods

    //#region Private methods

    private parsePost(post: cheerio.Cheerio): void {
        // Find post's ID
        const sid: string = post.find(POST.ID).attr("id").replace("post-", "");
        this._id = parseInt(sid);

        // Find post's number
        const sNumber: string = post.find(POST.NUMBER).text().replace("#", "");
        this._number = parseInt(sNumber);

        // Find post's publishing date
        const sPublishing: string = post.find(POST.PUBLISH_DATE).attr("datetime");
        this._published = new Date(sPublishing);

        // Find post's last edit date
        const sLastEdit: string = post.find(POST.LAST_EDIT).attr("datetime");
        this._lastEdit = new Date(sLastEdit);

        // Find post's owner
        this._owner = new PlatformUser(0);

        // Find if the post is bookmarked
        this._bookmarked = post.find(POST.BOOKMARKED).length !== 0;

        // Find post's message
        this._message = post.find(POST.BODY).text();
        
        // Parse post's body
        const $ = cheerio.load(post.html());
        this._body = parseF95ThreadPost($, post);
    }

    //#endregion
}