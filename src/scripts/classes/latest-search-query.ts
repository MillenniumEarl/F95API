// Public modules from npm
import validator from 'class-validator';

// Modules from file
import { urls } from "../constants/url.js";
import PrefixParser from './prefix-parser.js';
import { IQuery, TCategory } from "../interfaces";

// Type definitions
type TOrder = "date" | "likes" | "views" | "title" | "rating";
type TDate = 365 | 180 | 90 | 30 | 14 | 7 | 3 | 1;

/**
 * Query used to search handiwork in the "Latest" tab.
 */
export default class LatestSearchQuery implements IQuery {

    //#region Private fields
    private static MAX_TAGS = 5;
    private static MIN_PAGE = 1;
    //#endregion Private fields

    //#region Properties
    public category: TCategory = 'games';
    /**
     * Ordering type. 
     * 
     * Default: `date`.
     */
    public order: TOrder = 'date';
    /**
     * Date limit in days, to be understood as "less than".
     * Use `1` to indicate "today" or `null` to indicate "anytime".
     * 
     * Default: `null`
     */
    public date: TDate = null;
    
    @validator.ArrayMaxSize(LatestSearchQuery.MAX_TAGS, {
        message: "Too many tags: $value instead of $constraint1"
    })
    public includedTags: string[] = [];

    public includedPrefixes: string[] = [];

    @validator.IsInt({
        message: "$property expect an integer, received $value"
    })
    @validator.Min(LatestSearchQuery.MIN_PAGE, {
        message: "The minimum $property value must be $constraint1, received $value"
    })
    public page = LatestSearchQuery.MIN_PAGE;
    //#endregion Properties

    //#region Public methods
    /**
     * Verify that the query values are valid.
     */
    public validate(): boolean {
        return validator.validateSync(this).length === 0;
    }

    /**
     * From the query values it generates the corresponding URL for the platform.
     * If the query is invalid it throws an exception.
     */
    public createURL(): URL {
        // Check if the query is valid
        if (!this.validate()) {
            throw new Error("Invalid query")
        }

        // Create the URL
        const url = new URL(urls.F95_LATEST_PHP);
        url.searchParams.set("cmd", "list");

        // Set the category
        url.searchParams.set("cat", this.category);

        // Add tags and prefixes
        const parser = new PrefixParser();
        for (const tag of parser.prefixesToIDs(this.includedTags)) {
            url.searchParams.append("tags[]", tag.toString());
        }

        for (const p of parser.prefixesToIDs(this.includedPrefixes)) {
            url.searchParams.append("prefixes[]", p.toString());
        }

        // Set the other values
        url.searchParams.set("sort", this.order.toString());
        url.searchParams.set("page", this.page.toString());
        if (this.date) url.searchParams.set("date", this.date.toString());

        return url;
    }
    //#endregion Public methods
}