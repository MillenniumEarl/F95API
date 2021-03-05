import { TAuthor, IAnimation, TRating, TCategory } from "../../interfaces";
export default class Animation implements IAnimation {
    censored: boolean;
    genre: string[];
    installation: string;
    language: string[];
    lenght: string;
    pages: string;
    resolution: string[];
    authors: TAuthor[];
    category: TCategory;
    changelog: string[];
    cover: string;
    id: number;
    lastThreadUpdate: Date;
    name: string;
    overview: string;
    prefixes: string[];
    rating: TRating;
    tags: string[];
    threadPublishingDate: Date;
    url: string;
}
