/// <reference types="cheerio" />
export interface IPostElement {
    type: "Empty" | "Text" | "Link" | "Image" | "Spoiler";
    name: string;
    text: string;
    content: IPostElement[];
}
export interface ILink extends IPostElement {
    type: "Image" | "Link";
    href: string;
}
/**
 * Given a post of a thread page it extracts the information contained in the body.
 */
export declare function parseF95ThreadPost($: cheerio.Root, post: cheerio.Cheerio): IPostElement[];
