[![DeepSource](https://deepsource.io/gh/MillenniumEarl/F95API.svg/?label=active+issues&show_trend=true)](https://deepsource.io/gh/MillenniumEarl/F95API/?ref=repository-badge)
[![CodeFactor](https://www.codefactor.io/repository/github/millenniumearl/f95api/badge)](https://www.codefactor.io/repository/github/millenniumearl/f95api)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FMillenniumEarl%2FF95API.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FMillenniumEarl%2FF95API?ref=badge_shield)
[![Known Vulnerabilities](https://snyk.io/test/github/MillenniumEarl/F95API/badge.svg)](https://snyk.io/test/github/MillenniumEarl/F95API)
[![codecov](https://codecov.io/gh/MillenniumEarl/F95API/branch/master/graph/badge.svg?token=KHN1TNIH7D)](https://codecov.io/gh/MillenniumEarl/F95API)

# F95API

Unofficial Node JS module for scraping F95Zone platform

These APIs have been developed to support this application and allow you to obtain data on games and mods on the platform [F95zone](https://f95zone.to/) (**NSFW**)

A simple usage example can be found in [app/example.js](https://github.com/MillenniumEarl/F95API/blob/master/app/example.js)

**Attention**: Two-factor authentication is not supported

# Data scraping

Games/mods can be obtained by name or URL

```javascript
// The name is case insensitive
let listOfFoundGames = await F95API.getGameData("your game name");
let listOfFoundMods = await F95API.getGameData("your mod name", true);

let specificGame = await F95API.getGameDataFromURL("the URL of your game");
```

While user data (after authenticating) with

```javascript
let authResult = await F95API.login(username, password);

let loggedUserData = await F95API.getUserData();
```

# Classes

## Games and mods

Information about games and mods is stored in a GameInfo object with the following fields:

```
name: The game name
author: The game developer
url: The URL that leads to the game thread on F95Zone
overview: Description of the game
language: Main language of the game
supportedOS: List of supported OS (Windows/Linux/Mac/Android...)
censored: Are the NSFW parts censored?
engine: Game engine (Unity, Ren'Py, RPGM...)
status: Completed/Abandoned/Ongoing/Onhold
tags: List of tags
previewSrc: Source URL of the game description image
version: Version of the game
lastUpdate: Date of the last update (it's a Date object)
isMod: Is it a game or a mod?
changelog: Latest changelog available
```

The serialization in JSON format of this object is possible through `JSON.stringfy()` while the deserialization must happen through the static method `GameInfo.fromJSON()`.

## User data

User data (after authentication) can be stored in a UserData object, consisting of the following fields:

```
username: Name of the logged in user
avatarSrc: Source URL of the user's profile picture
watchedThreads: List of URLs of threads followed by the user
```

## Login results

The outcome of the authentication process is represented by the LoginResult object:

```
success: Was the authentication successful?;
message: Possible error message (unrecognized user, wrong password ...) or authentication successful message
```

# Logging

To log the behavior of the application [log4js](https://github.com/log4js-node/log4js-node) is used with a default level of "warn". This option can be changed with the `loggerLevel` property.

# Guidelines for errors

- If you can, return a meaningful value
- Return `null` only if the function should return a complex object (including strings)
- Return an empty array if the function should return an array
- Return `false`, `-1` when the function should retrn `boolean` or `number`
- Throw an exception only if it is an error or if a wrong value could mess up the functioning of the library
