import { TAuthor, TEngine, IGame, TRating, TStatus, TCategory } from "../../interfaces";
export default class Game implements IGame {
  censored: boolean;
  engine: TEngine;
  genre: string[];
  installation: string;
  language: string[];
  lastRelease: Date;
  mod: boolean;
  os: string[];
  status: TStatus;
  version: string;
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
