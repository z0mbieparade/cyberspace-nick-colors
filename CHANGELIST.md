# Changelog

All notable changes to this project will be documented in this file.

## [1.3.3] - 2026-09-02

### Fixed
- **Settings failed to load on managers with an async `GM_*` API** - detection assumed the `GM_*` names meant synchronous functions, so a manager implementing them async handed callers a Promise and every read blew up with `Unexpected token 'o', "[object Promise]" is not valid JSON`. Which API is in use is now decided by probing what `GM_getValue` actually returns, so async `GM_*` routes through the same value cache as `GM.*`
- **Remote overrides never loaded without `GM_xmlhttpRequest`** - `OVERRIDES_URL` pointed at `github.com/.../raw/...`, which 302-redirects with an empty `Access-Control-Allow-Origin` and kills the plain `fetch` fallback used when a manager doesn't grant `GM_xmlhttpRequest`. It now points at `raw.githubusercontent.com` directly
- Async storage writes are fire-and-forget but no longer uncaught, so a rejecting manager can't surface as an unhandled rejection

### Changed
- **Debug tracing is now behind debug mode** - theme variable dumps, remote override counts, theme change records, the nick picker's color calculation dump, and the C-Mail compose traces all logged to the console unconditionally. `[Nick Colors] Loaded.` and genuine errors still always log
- `_hasOldGM`/`_hasNewGM` renamed to `_hasSyncGM`/`_hasAsyncGM` - whether the names exist was never the real question, how they behave is
- The persisted storage key list is now `GM_STORAGE_KEYS` instead of being repeated in three places

### Added
- Tests for the GM storage shim covering sync `GM_*`, async `GM.*`, async `GM_*`, the no-manager localStorage fallback, and a `GM_getValue` that throws

## [1.3.2]

### Added
- **Host exclusion list** - `HOST_EXCLUDE` skips whole subdomains, matching the host and any of its subdomains; `page.cyberspace.online` and `terminal.cyberspace.online` are excluded
- `/pages` added to `PATH_EXCLUDE`
- Excluded hosts and paths now live in `src/exclusions.json`, the single source for both the userscript `@exclude` header lines (generated at build time) and the `HOST_EXCLUDE`/`PATH_EXCLUDE` constants in the bundle

## [1.3.1] - 2026-08-08

### Added
- **Page exclusion list** - `PATH_EXCLUDE` skips coloring entirely on pages that render their own content; `/terminal` (the canvas terminal emulator) is the first entry
- Path matching now compares whole segments, so `/terminal` matches `/terminal` and `/terminal/x` but not `/terminals`

### Changed
- Permissive-path hint for chat now also covers the bare `/chat` index page, not just `/chat/<room>`
- LOGIC.md updated to match the code - theme detection reads `<html data-theme>` and resolves colors per-key through CSS variable → `custom_theme` → preset → default; corrected the preset theme table (4 hue ranges were wrong); documented the contrast lightness adjustment and how inverted containers actually work

### Fixed
- `data-contrast-ratio` on colored nicks was always the string `"undefined"` - it now holds the final ratio after inversion and contrast adjustment

## [1.3.0] - 2026-02-10

### Added
- **Beta site support** - Script now works on beta.cyberspace.online in addition to the main site
- Added selector for beta site's username spans (`span.cursor-pointer.hover:underline`)
- Site-specific container hints (beta uses `#main-content-area` and `.space-y-1`)
- Path-based hints - more permissive coloring on `/chat/` pages

### Fixed
- Username detection now works for elements without href attributes (beta site compatibility)
- User list usernames on beta site now get colored
- GM storage now supports both old (`GM_*`) and new (`GM.*`) APIs - settings/notes sync across both domains

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
