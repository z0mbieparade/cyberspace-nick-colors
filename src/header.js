

// Note: GM_registerMenuCommand is not on window when granted, it's a direct global
// We check for it at registration time instead of defining a fallback

// =====================================================
// CONFIGURATION
// =====================================================

// Debug mode - shows detailed calculation info in dialogs
let DEBUG = GM_getValue('debugMode', 'false') === 'true';

function saveDebugMode() {
	GM_setValue('debugMode', DEBUG ? 'true' : 'false');
}

// URL to fetch manual overrides from (set to null to disable)
// Host your overrides.json on GitHub, Gist, or any CORS-friendly location
const OVERRIDES_URL = 'https://github.com/z0mbieparade/cyberspace-nick-colors/raw/refs/heads/main/overrides.json';

// Manual color overrides - set specific users to specific styles
// Format: 'username': { ...CSS style properties }
// Or simple format: 'username': 'css-color' (text color only)
// These are merged with fetched overrides (local takes precedence)
// Add local overrides here for testing, or they will be fetched from OVERRIDES_URL
let MANUAL_OVERRIDES = {};

// Try to read site's custom theme from localStorage
let siteTheme = null;
try {
	const customThemeStr = localStorage.getItem('custom_theme');
	if (customThemeStr) {
		siteTheme = JSON.parse(customThemeStr);
	}
} catch (e) {
	console.log('[Nick Colors] Could not parse site custom_theme:', e);
}

// Default color generation settings
const DEFAULT_COLOR_CONFIG = {
	minSaturation: 70,   // 0-100, min saturation
	maxSaturation: 100,  // 0-100, max saturation
	minLightness: 55,    // 0-100, min lightness
	maxLightness: 75,    // 0-100, max lightness
	minHue: 0,           // starting hue (0 = red)
	maxHue: 360,         // ending hue (360 = back to red)
	excludeRanges: [],   // exclude hue ranges, e.g., [[40,70]] to skip muddy yellows
	contrastThreshold: 50, // 0-50, add outline if lightness contrast below this (0 = disabled)
};

// Default style variation settings
const DEFAULT_STYLE_CONFIG = {
	varyWeight: false,    // randomly vary font-weight
	varyItalic: false,    // randomly apply italic
	varyCase: false,      // randomly apply small-caps
	prependIcon: false,   // prepend random icon from iconSet
	appendIcon: false,    // append random icon from iconSet
	iconSet: '● ○ ◆ ◇ ■ □ ▲ △ ★ ☆ ♦ ♠ ♣ ♥ ☢ ☣ ☠ ⚙ ⬡ ⬢ ♻ ⚛ ⚠ ⛒',  // space-separated icons
};

// Default site theme integration settings
const DEFAULT_SITE_THEME_CONFIG = {
	useHueRange: false,      // Limit hue to site theme's color range
	useSaturation: false,    // Match site theme's saturation
	useLightness: false,     // Match site theme's lightness
	hueSpread: 30,           // +/- degrees around site theme hue
	saturationSpread: 15,    // +/- percentage around site theme saturation
	lightnessSpread: 10,     // +/- percentage around site theme lightness
};

// CSS selectors for finding username links
// Add more selectors as needed for different parts of the site
const USERNAME_SELECTORS = [
	'a[href^="/"]',      // links starting with / (common for user profiles)
	// Add more patterns as you find them:
	// '.username',
	// '.author-link',
	// '[data-username]',
];

// Containers to search within for USERNAME LINKS ONLY (not @mentions)
// This helps avoid coloring non-username links that don't have @ prefix
// @mentions are searched across the whole page since they're explicit
const CONTAINER_HINTS = [
	'.chat-main-content',           // chat messages
	'.profile-box-inverted',        // profile header
];

// Containers to EXCLUDE from coloring (applies to both links and @mentions)
const CONTAINER_HINTS_EXCLUDE = [
	'.sidebar',
	'footer',
	'.nc-dialog-attribution'
];

const EXCLUDE_VALUES = [
	'feed', 'topics', 'jukebox', 'notes', 'write',
	'chat', 'messages', 'bookmarks', 'notifications',
	'me', 'guilds', 'support', 'wiki', 'changelog',
	'netiquette',  'faq', 'loading', 'error'
];

// Containers where we should invert backgroundColor/Color for nicks
const INVERTED_CONTAINERS = [
	'.profile-box-inverted'
];

// Preset themes matching cyberspace.online site themes
const PRESET_THEMES = {
	'Full Spectrum': {
		color: { ...DEFAULT_COLOR_CONFIG }
	},
	// Dark: fg #efe5c0 (warm cream, ~45° hue)
	'Dark': {
		color: { minSaturation: 60, maxSaturation: 80, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 50 }
	},
	// Light: fg #000 (black text on light bg - needs high contrast colors)
	'Light': {
		color: { minSaturation: 70, maxSaturation: 90, minLightness: 30, maxLightness: 45, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 50 }
	},
	// C64: fg white on blue bg #2a2ab8 - retro blue theme
	'C64': {
		color: { minSaturation: 70, maxSaturation: 90, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 280, excludeRanges: [], contrastThreshold: 50 }
	},
	// VT320: fg #ff9a10 (orange, ~35° hue) - amber terminal
	'VT320': {
		color: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 15, maxHue: 55, excludeRanges: [], contrastThreshold: 50 }
	},
	// Matrix: fg rgba(160,224,68,.9) (green, ~85° hue) - green terminal
	'Matrix': {
		color: { minSaturation: 75, maxSaturation: 95, minLightness: 45, maxLightness: 60, minHue: 70, maxHue: 140, excludeRanges: [], contrastThreshold: 50 }
	},
	// Poetry: fg #222 (dark text on light bg) - elegant minimal
	'Poetry': {
		color: { minSaturation: 40, maxSaturation: 60, minLightness: 30, maxLightness: 45, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 50 }
	},
	// Brutalist: fg #c0d0e8 (cool blue-gray, ~220° hue)
	'Brutalist': {
		color: { minSaturation: 50, maxSaturation: 70, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 260, excludeRanges: [], contrastThreshold: 50 }
	},
	// GRiD: fg #fea813 (orange, ~40° hue) - warm amber
	'GRiD': {
		color: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 20, maxHue: 60, excludeRanges: [], contrastThreshold: 50 }
	},
	// System: fg #efe5c0 (same as Dark)
	'System': {
		color: { minSaturation: 60, maxSaturation: 80, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 50 }
	},
};

// Parse site theme HSL values if available
let siteThemeHsl = null;
if (siteTheme && siteTheme.fg) {
	siteThemeHsl = hexToHsl(siteTheme.fg);
}

// Load saved site theme integration config
let siteThemeConfig = { ...DEFAULT_SITE_THEME_CONFIG };
try {
	const savedSiteThemeConfig = GM_getValue('siteThemeConfig', null);
	if (savedSiteThemeConfig) {
		siteThemeConfig = { ...DEFAULT_SITE_THEME_CONFIG, ...JSON.parse(savedSiteThemeConfig) };
	}
} catch (e) {
	console.error('[Nick Colors] Failed to load site theme config:', e);
}

// Load saved color config or use defaults
let colorConfig = { ...DEFAULT_COLOR_CONFIG };
try {
	const savedColorConfig = GM_getValue('colorConfig', null);
	if (savedColorConfig) {
		colorConfig = { ...DEFAULT_COLOR_CONFIG, ...JSON.parse(savedColorConfig) };
	}
} catch (e) {
	console.error('[Nick Colors] Failed to load config:', e);
}

// Load saved style config or use defaults
let styleConfig = { ...DEFAULT_STYLE_CONFIG };
try {
	const savedStyleConfig = GM_getValue('styleConfig', null);
	if (savedStyleConfig) {
		styleConfig = { ...DEFAULT_STYLE_CONFIG, ...JSON.parse(savedStyleConfig) };
	}
} catch (e) {
	console.error('[Nick Colors] Failed to load style config:', e);
}

function saveStyleConfig() {
	GM_setValue('styleConfig', JSON.stringify(styleConfig));
}

// =====================================================
// COLOR ENGINE
// =====================================================

// Load saved custom colors from storage
let customNickColors = {};
try {
	const saved = GM_getValue('customNickColors', '{}');
	customNickColors = JSON.parse(saved);
} catch (e) {
	customNickColors = {};
}

function saveCustomNickColors() {
	GM_setValue('customNickColors', JSON.stringify(customNickColors));
}