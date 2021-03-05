/**
 * Represents a generic user registered on the platform.
 */
export default class PlatformUser {
  private _id;
  private _name;
  private _title;
  private _banners;
  private _messages;
  private _reactionScore;
  private _points;
  private _ratingsReceived;
  private _joined;
  private _lastSeen;
  private _followed;
  private _ignored;
  private _private;
  private _avatar;
  private _amountDonated;
  /**
   * Unique user ID.
   */
  get id(): number;
  /**
   * Username.
   */
  get name(): string;
  /**
   * Title assigned to the user by the platform.
   */
  get title(): string;
  /**
   * List of banners assigned by the platform.
   */
  get banners(): string[];
  /**
   * Number of messages written by the user.
   */
  get messages(): number;
  /**
   * @todo Reaction score.
   */
  get reactionScore(): number;
  /**
   * @todo Points.
   */
  get points(): number;
  /**
   * Number of ratings received.
   */
  get ratingsReceived(): number;
  /**
   * Date of joining the platform.
   */
  get joined(): Date;
  /**
   * Date of the last connection to the platform.
   */
  get lastSeen(): Date;
  /**
   * Indicates whether the user is followed by the currently logged in user.
   */
  get followed(): boolean;
  /**
   * Indicates whether the user is ignored by the currently logged on user.
   */
  get ignored(): boolean;
  /**
   * Indicates that the profile is private and not viewable by the user.
   */
  get private(): boolean;
  /**
   * URL of the image used as the user's avatar.
   */
  get avatar(): string;
  /**
   * Value of donations made.
   */
  get donation(): number;
  constructor(id?: number);
  setID(id: number): void;
  fetch(): Promise<void>;
}
