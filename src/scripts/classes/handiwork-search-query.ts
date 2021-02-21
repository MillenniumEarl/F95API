// Public modules from npm
import validator from 'class-validator';

// Modules from file
import { urls } from "../constants/url.js";
import PrefixParser from './prefix-parser.js';
import { TCategory } from "../interfaces";

// Type definitions
type TSort = "date" | "likes" | "views" | "title" | "rating";
type TDate = 365 | 180 | 90 | 30 | 14 | 7 | 3 | 1;

/**
 * Query used to search for specific threads on the platform.
 */
export default class HandiworkSearchQuery {

    //#region Private fields
    private static MAX_TAGS = 5;
    private static MIN_PAGE = 1;
    //#endregion Private fields

    //#region Properties
    /**
     * Category of items to search among.
     * Default: `games`
     */
    public category: TCategory = 'games';
    /**
     * List of IDs of tags to be included in the search.
     * Max. 5 tags
     */
    @validator.IsArray({
        message: "Expected an array, received $value"
    })
    @validator.ArrayMaxSize(HandiworkSearchQuery.MAX_TAGS, {
        message: "Too many tags: $value instead of $constraint1"
    })
    public tags: string[] = [];
    /**
     * List of IDs of prefixes to be included in the search.
     */
    @validator.IsArray({
        message: "Expected an array, received $value"
    })
    public prefixes: string[] = [];
    /**
     * Sorting type. Default: `date`.
     */
    public sort: TSort = 'date';
    /**
     * Date limit in days, to be understood as "less than".
     * Use `1` to indicate "today" or `null` to indicate "anytime".
     * Default: `null`
     */
    public date: TDate = null;
    /**
     * Index of the page to be obtained.
     * Between 1 and infinity.
     * Default: 1.
     */
    @validator.IsInt({
        message: "$property expect an integer, received $value"
    })
    @validator.Min(HandiworkSearchQuery.MIN_PAGE, {
        message: "The minimum $property value must be $constraint1, received $value"
    })
    public page = HandiworkSearchQuery.MIN_PAGE;
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
    public createUrl(): URL {
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
        for (const tag of parser.prefixesToIDs(this.tags)) {
            url.searchParams.append("tags[]", tag.toString());
        }
        
        for (const p of parser.prefixesToIDs(this.prefixes)) {
            url.searchParams.append("prefixes[]", p.toString());
        }
        
        // Set the other values
        url.searchParams.set("sort", this.sort.toString());
        url.searchParams.set("page", this.page.toString());
        if(this.date) url.searchParams.set("date", this.date.toString());

        return url;
    }
    //#endregion Public methods
}