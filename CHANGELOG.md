# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.0-beta.10] - 2021-10-10
### Added
- Retry network requests on 5XX errors

### Changed
- Now `getHandiworkInformation` returns the object with type `T` without non-owned properties.
- `Handiwork`, `Game`, `Asset`, `Comic`, `Animation` have no longer `readonly` properties.

### Removed
- Removed `mod` property from `Game` class, use `category === "mods"` instead.

### Fixed
- Remove ending `-` in author's name
- Fix missing author's name when more platform were present
- Fix error on missing attribute during scrape

## [2.0.0-beta.9] - 2021-10-07
### Added
- COOKIES.md Used to describe cookies behaviour
- CHANGELOG.md Used to keep track of changes

### Changed
- Updated dependencies

### Security
- Fixed ReDOS on two Regex strings
- FIxed vulerabilities in dependencies

### Fixed
- Fixed #181, #182, #183


