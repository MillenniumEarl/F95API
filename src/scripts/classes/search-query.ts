// Public modules from npm
import validator from 'class-validator';

// Modules from file
import { urls } from "../constants/url.js";

/**
 * Query used to search for specific threads on the platform.
 */
export default class SearchQuery {

    //#region Private fields
    private static MAX_TAGS = 5;
    private static MIN_PAGE = 1;
    private static VALID_CATEGORY = ["games", "comics", "animations", "assets"];
    private static VALID_SORT = ["date", "likes", "views", "title", "rating"];
    private static VALID_DATE = [365, 180, 90, 30, 14, 7, 3, 1, null];
    //#endregion Private fields

    //#region Properties
    /**
     * Category of items to search among:
     * `games`, `comics`, `animations`, `assets`.
     * Default: `games`
     */
    @validator.IsIn(SearchQuery.VALID_CATEGORY, {
        message: "Invalid $property parameter: $value"
    })
    public category = 'games';
    /**
     * List of IDs of tags to be included in the search.
     * Max. 5 tags
     */
    @validator.IsArray({
        message: "Expected an array, received $value"
    })
    @validator.ArrayMaxSize(SearchQuery.MAX_TAGS, {
        message: "Too many tags: $value instead of $constraint1"
    })
    public tags: number[] = [];
    /**
     * List of IDs of prefixes to be included in the search.
     */
    @validator.IsArray({
        message: "Expected an array, received $value"
    })
    public prefixes: number[] = [];
    /**
     * Sorting type between (default: `date`):
     * `date`, `likes`, `views`, `title`, `rating`
     */
    @validator.IsIn(SearchQuery.VALID_SORT, {
        message: "Invalid $property parameter: $value"
    })
    public sort = 'date';
    /**
     * Date limit in days, to be understood as "less than".
     * Possible values:
     * `365`, `180`, `90`, `30`, `14`, `7`, `3`, `1`.
     * Use `1` to indicate "today" or `null` to indicate "anytime".
     * Default: `null`
     */
    @validator.IsIn(SearchQuery.VALID_DATE, {
        message: "Invalid $property parameter: $value"
    })
    public date: number = null;
    /**
     * Index of the page to be obtained.
     * Between 1 and infinity.
     * Default: 1.
     */
    @validator.IsInt({
        message: "$property expect an integer, received $value"
    })
    @validator.Min(SearchQuery.MIN_PAGE, {
        message: "The minimum $property value must be $constraint1, received $value"
    })
    public page = SearchQuery.MIN_PAGE;
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
        for (const tag of this.tags) {
            url.searchParams.append("tags[]", tag.toString());
        }
        
        for (const p of this.prefixes) {
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