# Changelog

All notable changes to this project will be documented in this file.

## [1.2.4] - 2026-01-14

### Added
- **Update indicator** - Version in dialog footer highlights when update available; click to install
- **Greasemonkey 4+ support** - Added `GM.xmlHttpRequest` compatibility for newer Greasemonkey versions

### Fixed
- Added `github.com` to `@connect` list for overrides.json fetch (was causing "not part of @connect list" error)

## [1.2.2] - 2026-01-13

### Added
- **Font family tristate toggle** - Custom font now has auto/off/on states like other style variations (auto inherits from remote overrides)

### Fixed
- Bug with not removing userNotes from styles
- MANUAL_OVERRIDES now properly merge with local customNickColors (remote as base, local on top)

## [1.2.1] - 2026-01-13

### Fixed
- Bug where editor crashes if @username is typed

## [1.2.0] - 2026-01-13

### Added
- **User notes** - Add personal notes about users that display on hover (300ms delay)
- **Contrast toggle** - Enable/disable contrast auto-inversion from site settings
- **Font family** - Per-user custom font family support
- **Mobile long-press** - 500ms long-press on usernames opens settings (with visual feedback)

### Fixed
- Dialog close behavior - Dialogs no longer close when dragging sliders outside the dialog

## [1.1.0] - 2025-12-15

### Added
- **Settings engine** - Unified schema-based settings system for all dialogs
- **WCAG contrast** - Contrast calculations now use proper WCAG 2.1 luminance ratios
- **Help dialog** - Added help information accessible from settings
- **Test suite** - Comprehensive tests for color functions, contrast, and import/export
- **Inverted container support** - Proper color handling in inverted background containers

### Changed
- Refactored source into separate files with build script
- Styles moved to SCSS
- Improved site theme detection and integration
- Better preset theme defaults

### Fixed
- Contrast calculation accuracy
- Import/export v1 to v1.1 migration

## [1.0.0] - 2025-12-12

### Added
- **Hash-based coloring** - Consistent colors for usernames based on hash
- **@mention detection** - Colors @username mentions in chat
- **Hue/Saturation/Lightness ranges** - Configurable color ranges
- **Contrast threshold** - Auto-invert colors for readability
- **Preset themes** - Quick presets matching Cyberspace site themes
- **Site theme integration** - Match custom site theme colors
- **Style variations** - Vary font-weight, italic, small-caps by hash
- **Username icons** - Prepend/append hash-based icons
- **Per-user overrides** - Custom colors, icons, and styles per user
- **Import/Export** - Backup and restore settings
- **Remote overrides** - Site-wide nick color overrides from JSON
