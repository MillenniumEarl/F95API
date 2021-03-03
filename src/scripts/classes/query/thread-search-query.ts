"use strict";

// Public modules from npm
import validator from 'class-validator';

// Module from files
import { IQuery, TCategory, TQueryInterface } from "../../interfaces.js";
import { urls } from "../../constants/url.js";
import PrefixParser from "./../prefix-parser.js";

// Type definitions
export type TThreadOrder = "relevance" | "date" | "last_update" | "replies";

export default class ThreadSearchQuery implements IQuery {

    //#region Private fields
    static MIN_PAGE = 1;
    //#endregion Private fields

    //#region Properties
    /**
     * Keywords to use in the search.
     */
    public keywords: string = "";
    /**
     * Indicates to search by checking only the thread titles and not the content.
     */
    public onlyTitles: boolean = false;
    /**
     * The results must be more recent than the date indicated.
     */
    public newerThan: Date = null;
    /**
     * The results must be older than the date indicated.
     */
    public olderThan: Date = null;
    public includedTags: string[] = [];
    /**
     * Tags to exclude from the search.
     */
    public excludedTags: string[] = [];
    /**
     * Minimum number of answers that the thread must possess.
     */
    public minimumReplies: number = 0;
    public includedPrefixes: string[] = [];
    public category: TCategory = null;
    /**
     * Results presentation order.
     */
    public order: TThreadOrder = "relevance";
    @validator.IsInt({
        message: "$property expect an integer, received $value"
    })
    @validator.Min(ThreadSearchQuery.MIN_PAGE, {
        message: "The minimum $property value must be $constraint1, received $value"
    })
    public page: number = 1;
    itype: TQueryInterface = "ThreadSearchQuery";
    //#endregion Properties

    //#region Public methods
    
    public validate(): boolean {
        return validator.validateSync(this).length === 0;
    }
    
    public createURL(): URL {
        // Check if the query is valid
        if (!this.validate()) {
            throw new Error(`Invalid query: ${validator.validateSync(this).join("\n")}`);
        }
        
        // Create the URL
        const url = new URL(urls.F95_SEARCH_URL);

        // Specifiy if only the title should be searched
        if (this.onlyTitles) url.searchParams.set("c[title_only]", "1");

        // Add keywords
        const encodedKeywords = this.keywords ? encodeURIComponent(this.keywords) : "*";
        url.searchParams.set("q", encodedKeywords);

        // Specify the scope of the search (only "threads/post")
        url.searchParams.set("t", "post");
        
        // Set the dates
        if (this.newerThan) {
            const date = this.convertShortDate(this.newerThan);
            url.searchParams.set("c[newer_than]", date);
        }

        if (this.olderThan) {
            const date = this.convertShortDate(this.olderThan);
            url.searchParams.set("c[older_than]", date);
        }

        // Set included and excluded tags
        // The tags are first joined with a comma, then encoded to URI
        const includedTags = encodeURIComponent(this.includedTags.join(","));
        const excludedTags = encodeURIComponent(this.excludedTags.join(","));
        url.searchParams.set("c[tags]", includedTags);
        url.searchParams.set("c[excludeTags]", excludedTags);

        // Set minimum reply number
        url.searchParams.set("c[min_reply_count]", this.minimumReplies.toString());

        // Add prefixes
        const parser = new PrefixParser();
        const ids = parser.prefixesToIDs(this.includedPrefixes);
        for (let i = 0; i < ids.length; i++) {
            const name = `c[prefixes][${i}]`;
            url.searchParams.set(name, ids[i].toString());
        }

        // Set the category
        url.searchParams.set("c[child_nodes]", "1"); // Always set
        if (this.category) {
            const catID = this.categoryToID(this.category).toString();
            url.searchParams.set("c[nodes][0]", catID);
        }

        // Set the other values
        url.searchParams.set("o", this.order.toString());
        url.searchParams.set("page", this.page.toString());

        return url;
    }
    //#endregion Public methods

    //#region Private methods
    /**
     * Convert a date in the YYYY-MM-DD format taking into account the time zone.
     */
    private convertShortDate(d: Date): string {
        const offset = d.getTimezoneOffset()
        d = new Date(d.getTime() - (offset * 60 * 1000))
        return d.toISOString().split('T')[0]
    }

    /**
     * Gets the unique ID of the selected category.
     */
    private categoryToID(category: TCategory): number {
        const catMap = {
            "games": 1,
            "mods": 41,
            "comics": 40,
            "animations": 94,
            "assets": 95,
        }

        return catMap[category as string];
    }
    //#endregion Private methods

}