[![CodeFactor](https://www.codefactor.io/repository/github/millenniumearl/f95api/badge/2.0.0-ts)](https://www.codefactor.io/repository/github/millenniumearl/f95api/overview/2.0.0-ts)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FMillenniumEarl%2FF95API.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FMillenniumEarl%2FF95API?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/MillenniumEarl/F95API/badge.svg)](https://snyk.io/test/github/MillenniumEarl/F95API)
[![codecov](https://codecov.io/gh/MillenniumEarl/F95API/branch/2.0.0-ts/graph/badge.svg?token=KHN1TNIH7D)](https://codecov.io/gh/MillenniumEarl/F95API)
[![npm](https://img.shields.io/npm/v/f95api.svg)](https://www.npmjs.com/package/f95api)

# F95API

Unofficial Typescript API used for data scraping from the F95Zone platform.

These APIs have been developed to support [this application](https://github.com/MillenniumEarl/YAM) and allow you to obtain data on games and mods on the platform [F95zone](https://f95zone.to/) (**NSFW**)

A simple usage example can be found in [src/example.ts](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/example.ts)

# Main features
- Support for two-factor authentication
- Structured and typed data of games, mods, comics, assets and animations
- Structured and typed data of the current user (threads followed, favorites...)
- Structured and typed data of other users (titles, donations, registration date...)
- Standard search, through the "Latest Updates" page or advanced
- Saving of cookies to maintain the session

# Login
In addition to traditional login, two-factor authentication via callback that returns the OTP value is also supported.

```javascript
// Normal login
let result = await F95API.login(username, password);

// 2FA login
let 2faCallback = function () => Promise<number>;
let result = await F95API.login(username, password, 2faCallback);
````

Refer to [src/example.ts](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/example.ts#L35-L67) (lines 35-67) for a working example.

# Data scraping
Each game, mod, comic, animation or asset is identified as handiwork and obtaining this element is generic, it will then be up to the user to decide which property to use based on the type of handiwork that has been requested.

Handiworks can be obtained by query or by URL.

```javascript
// With query
const query = {
    category: "games";
    keywords = "Your game name";
    order = "likes";
};

let listOfFoundGames = await F95API.searchHandiwork<Game>(query);

// With URL
let specificGame = await F95API.getHandiworkFromURL<Game>("the URL of your game");
```

While user data (after authenticating) with 

```javascript
const userdata = new UserProfile();

// Fetch basic data (always necessary)
await userdata.fetch();

// Fetch all data (may take a while)
await userdata.fetch(true);

// Async properties
const threads = await userdata.watched;
const bookmarks = await userdata.bookmarks;
const alerts = await userdata.alerts;
const games = await userdata.featuredGames;
```

# Classes
## Handiwork
Information about games, mods, etc... are stored in a [Handiwork](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/scripts/classes/handiwork/handiwork.ts) object with the following fields:

### Basic properties

This list of properties is common to every handiwork, be it a game, a comic, etc...

| Property              | Type         | Description   |
| :--------------------:|:------------:|:--------------|
| `id`                  |`number`      | Unique ID of the thread associated with the handiwork in the platform|
| `name`                |`string`      | The handiwork name|
| `overview`            |`string`      | Description of the handiwork|
| `authors`             |`TAuthor[]`   | The developer of this handiwork including the platforms on which it can be found|
| `category`            |`TCategory`   | The membership category|
| `changelog`           |`TChangelog[]`| List of changes divided by version|
| `cover`               |`string`      | URL of the possible cover of the handiwork (in case of multiple images the first available is taken)|
| `lastThreadUpdate`    |`Date`        | Date of the last update of the thread associated with the handiwork|
| `prefixes`            |`string[]`    | List of prefixes|
| `rating`              |`TRating`     | Users' ratings on the handiwork (average, maximum, minimum, number of votes)|
| `tags`                |`string[]`    | List of tags|
| `threadPublishingDate`|`Date`        | Publication date of the thread associated with the handiwork|
| `url`                 |`string`      | The URL that leads to the handiwork's thread on F95Zone|

### Mixed properties

Each property is specific to a particular type of handiwork.

| Property            | Type     | Handiwork type    |Description   |
| :------------------:|:--------:|:-----------------:|:--------------|
| `genre`             |`string[]`|`Animation`/`Comic`/`Game`| List of genres represented in this work|
| `pages`             |`string`  |`Animation`/`Comic`| Number of pages or elements of which the work is composed|
| `resolution`        |`string[]`|`Animation`/`Comic`| List of resolutions available for the work |
| `installation`      |`string`  |`Animation`        | Installation instructions|
| `language`          |`string[]`|`Animation`        | List of available languages|
| `length`            |`string`  |`Animation`        | Length of the animation |
| `censored`          |`boolean` |`Animation`/`Game` | Are the NSFW parts censored?|
| `engine`            |`TEngine` |`Game`             | Game engine (Unity, Ren'Py, RPGM...)|
| `lastRelease`       |`Date`    |`Game`             | Date of the last update of this handiwork|
| `mod`               |`boolean` |`Game`             | Specify if it is a mod or a real game|
| `os`                |`string[]`|`Game`             | List of supported OS (Windows/Linux/Mac/Android...)|
| `status`            |`TStatus` |`Game`             | State of development (Completed/Abandoned/Ongoing/Onhold)|
| `version`           |`string`  |`Game`             | Version of the handiwork|
| `assetLink`         |`string`  |`Asset`            | External URL of the asset (es. Daz3D store) |
| `associatedAssets`  |`string[]`|`Asset`            | List of URLs of assets associated with the work (for example same collection) |
| `compatibleSoftware`|`string[]`|`Asset`            | Software compatible with the work |
| `includedAssets`    |`string[]`|`Asset`            | List of assets url included in the work or used to develop it |
| `officialLinks`     |`string[]`|`Asset`            | List of official links of the work, external to the platform (es. Daz3D store) |
| `sku`               |`string`  |`Asset`            | Unique SKU value of the work |

The serialization/deserialization in JSON format of this object is possible through `JSON.stringify()`/`JSON.parse()`.

## Platform user

A generic user registered on the platform is represented by a [PlatformUser](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/scripts/classes/mapping/platform-user.ts) object with the following fields:

| Property         | Type      | Description   |
| :---------------:|:---------:|:--------------|
| `id`             | `number`  | Unique user ID |
| `name`           | `string`  | Username |
| `title`          | `string`  | Title assigned to the user by the platform |
| `banners`        | `string[]`| List of banners assigned by the platform |
| `messages`       | `number`  | Number of messages written by the user |
| `reactionScore`  | `number`  | Total number of reactions received from other users |
| `points`         | `number`  | Total number of points received after the acquisition of trophies |
| `ratingsReceived`| `number`  | Number of ratings received |
| `joined`         | `Date`    | Date of joining the platform |
| `lastSeen`       | `Date`    | Date of the last connection to the platform |
| `followed`       | `boolean` | Indicates whether the user is followed by the currently logged in user |
| `ignored`        | `boolean` | Indicates whether the user is ignored by the currently logged on user |
| `private`        | `boolean` | Indicates that the profile is private and not viewable by the user |
| `avatar`         | `string`  | URL of the image used as the user's avatar |
| `amountDonated`  | `number`  | Value ($) of donations made |

## User data

The user data currently connected through this API extends the [PlatformUser](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/scripts/classes/mapping/platform-user.ts) class via the class [UserProfile](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/scripts/classes/mapping/user-profile.ts) and adds:

| Property         | Type                        | Description   |
| :---------------:|:---------------------------:|:--------------|
| `watched`        | `Promise<IWatchedThread[]>` | List of followed thread data|
| `bookmarks`      | `Promise<IBookmarkedPost[]>`| List of bookmarked posts data|
| `alerts`         | `Promise<IAlert[]>`         | List of alerts|
| `conversations`  | `Promise<IConversation[]>`  | List of conversations (only **without** labels)|
| `featuredGames`  | `Promise<Game[]>`           | List of featured games from the platform (carousel, may not be available if disabled in settings)|

## Login results

The outcome of the authentication process is represented by the [LoginResult](https://github.com/MillenniumEarl/F95API/blob/2.0.0-ts/src/scripts/classes/login-result.ts) object:


| Property | Type     | Description   |
| :-------:|:--------:|:--------------|
| `success`| `boolean`| List of followed thread data|
| `code`   | `number` | Code associated with the result of the login operation|
| `message`| `string` | Possible error message (unrecognized user, wrong password...) or authentication successful message|

# Logging
To log the behavior of the application [log4js-api](https://github.com/log4js-node/log4js-api) is used with a default level of "warn". This option can be changed with the `loggerLevel` property.

# Guidelines for errors

- If you can, return a meaningful value
- Return `null` only if the function should return a complex object (including strings)
- Return an empty array if the function should return an array
- Return `false`, `-1` when the function should return `boolean` or `number`
- Throw an exception only if it is an error or if a wrong value could mess up the functioning of the library
- For all network operations, return a `Result` object
