# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

* Password is set in a masked text box (wait for [Feature Request](https://github.com/RocketChat/Rocket.Chat.Apps-engine/issues/238))

## [0.3.0] - 2020-10-20

### Added

* It is possible to set server wide setting to replace issue ids with links
* It is possible to set server wide setting to add attachments
* Messages can be filtered to ignore specific message parts (like code blocks)

### Fixed

* Do not add additional links when editing messages (this is maybe a bug in RocketChat)
* Updating Issue overwrites all attachments to message
* Issue Tags in hpyerlinks add additional hyperlinks

## [0.2.1] - 2020-07-05

### Fixed

* Wrong Link is set in attachment
* Server returning non-success result (http message result > 300) caused issue to be replaced with undefined.

## [0.2.0] - 2020-03-18

### Added

* Search for issues on the server
* i18n Labels for settings
* Setting to deactivate attachments (default is activated)
* German i18n language file

## [0.1.0] - 2020-03-17

### Added

* Issue names in posted messages are linked to jira issues
* Issues are relinked when updating the messages
