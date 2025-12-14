

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

// Default color generation settings
const DEFAULT_COLOR_CONFIG = {
	minSaturation: 70,   // 0-100, min saturation
	maxSaturation: 100,  // 0-100, max saturation
	minLightness: 55,    // 0-100, min lightness
	maxLightness: 75,    // 0-100, max lightness
	minHue: 0,           // starting hue (0 = red)
	maxHue: 360,         // ending hue (360 = back to red)
	contrastThreshold: 4.5, // WCAG contrast ratio threshold (1-21). 0=disabled, 3=large text, 4.5=AA, 7=AAA
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
	'.nc-dialog-attribution',
	'code', 'pre', 'script'
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
// Each theme has: fg, bg, fgDim, border, codeBg, and color config for nick generation
const PRESET_THEMES = {
	'Full Spectrum': {
		fg: '#e0e0e0', bg: '#0a0a0a', fgDim: '#888888', border: '#333333', codeBg: '#222222',
		color: { minSaturation: 70, maxSaturation: 100, minLightness: 55, maxLightness: 75, minHue: 0, maxHue: 360, contrastThreshold: 4.5 }
	},
	'z0ylent': {
		fg: '#91ff00', bg: '#060f04', fgDim: '#12892d', border: '#12892d', codeBg: '#0c1c08',
		color: { minSaturation: 80, maxSaturation: 100, minLightness: 45, maxLightness: 65, minHue: 60, maxHue: 150, contrastThreshold: 4.5 }
	},
	'Dark': {
		fg: '#efe5c0', bg: '#000000', fgDim: '#a89984', border: '#3a3a3a', codeBg: 'hsla(0,0%,100%,.07)',
		color: { minSaturation: 12, maxSaturation: 60, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 70, contrastThreshold: 4.5 }
	},
	'Light': {
		fg: '#000000', bg: '#efe5c0', fgDim: '#3a3a3a', border: '#a89984', codeBg: 'rgba(0,0,0,.08)',
		color: { minSaturation: 12, maxSaturation: 60, minLightness: 30, maxLightness: 45, minHue: 344, maxHue: 44, contrastThreshold: 4.5 }
	},
	'C64': {
		fg: 'hsla(0,0%,100%,.75)', bg: '#2a2ab8', fgDim: 'hsla(0,0%,100%,.4)', border: 'hsla(0,0%,100%,.3)', codeBg: 'hsla(0,0%,100%,.08)',
		color: { minSaturation: 70, maxSaturation: 90, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 280, contrastThreshold: 4.5 }
	},
	'VT320': {
		fg: '#ff9a10', bg: '#170800', fgDim: '#ff9100', border: 'rgba(255,155,0,.27)', codeBg: 'rgba(255,155,0,.05)',
		color: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 15, maxHue: 55, contrastThreshold: 4.5 }
	},
	'Matrix': {
		fg: 'rgba(160,224,68,.9)', bg: '#000000', fgDim: 'rgba(160,224,68,.5)', border: 'rgba(160,224,68,.4)', codeBg: 'rgba(0,255,65,.08)',
		color: { minSaturation: 75, maxSaturation: 95, minLightness: 45, maxLightness: 60, minHue: 70, maxHue: 140, contrastThreshold: 4.5 }
	},
	'Poetry': {
		fg: '#222222', bg: '#fefaf8', fgDim: '#666666', border: '#cccccc', codeBg: '#f0e0dd',
		color: { minSaturation: 0, maxSaturation: 35, minLightness: 30, maxLightness: 45, minHue: 339, maxHue: 46, contrastThreshold: 4.5 },
		logic: { invertedContainerBg: 'codeBg' }
	},
	'Brutalist': {
		fg: '#c0d0e8', bg: '#080810', fgDim: '#99a9bf', border: 'rgba(160,180,220,.18)', codeBg: 'rgba(160,180,220,.06)',
		color: { minSaturation: 50, maxSaturation: 70, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 260, contrastThreshold: 4.5 }
	},
	'GRiD': {
		fg: '#fea813', bg: '#180f06', fgDim: '#d08c17', border: 'rgba(245,169,28,.22)', codeBg: 'rgba(245,169,28,.08)',
		color: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 20, maxHue: 60, contrastThreshold: 4.5 }
	},
	'System': {
		fg: '#efe5c0', bg: '#000000', fgDim: '#a89984', border: '#3a3a3a', codeBg: 'hsla(0,0%,100%,.07)',
		color: { minSaturation: 60, maxSaturation: 80, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 360, contrastThreshold: 4.5 }
	},
};

// Try to read site's theme
// Priority: 1. custom_theme from localStorage (user's custom colors)
//           2. data-theme from <body> -> lookup in PRESET_THEMES (done after PRESET_THEMES is defined)
let siteTheme = null;
let siteThemeFgHSL = null;
let siteThemeName = null;
let siteCustomTheme = null;

// Get theme name from body data attribute
try {
	siteThemeName = document.documentElement?.dataset?.theme || null;
} catch (e) {
	// Body might not be ready yet
}

function loadSiteCustomTheme() {
	try {
		// First try custom_theme (full color customization)
		const customThemeStr = localStorage.getItem('custom_theme');
		if (customThemeStr) {
			siteCustomTheme = JSON.parse(customThemeStr);
		}
	} catch (e) {
		console.log('[Nick Colors] Could not parse site custom_theme:', e);
	}
}
loadSiteCustomTheme();

function loadSiteTheme() {
	const themeVariables = getThemeVariables();
	console.log('[Nick Colors] Theme variables:', themeVariables);
	if (themeVariables && themeVariables.fg && themeVariables.bg) {
		siteTheme = { ...themeVariables };
		siteThemeFgHSL = parseColor(siteTheme.fg, 'hsl');
	}
}
if (!siteTheme) loadSiteTheme();

// Load saved site theme integration config
let siteThemeConfig = { ...DEFAULT_SITE_THEME_CONFIG };
function loadSiteThemeConfig() {
	try {
		const savedSiteThemeConfig = GM_getValue('siteThemeConfig', null);
		if (savedSiteThemeConfig) {
			siteThemeConfig = { ...DEFAULT_SITE_THEME_CONFIG, ...JSON.parse(savedSiteThemeConfig) };
		}
	} catch (e) {
		console.error('[Nick Colors] Failed to load site theme config:', e);
	}
}
loadSiteThemeConfig();

function saveSiteThemeConfig() {
	GM_setValue('siteThemeConfig', JSON.stringify(siteThemeConfig));
}

// Load saved color config or use defaults
let colorConfig = { ...DEFAULT_COLOR_CONFIG };
function loadColorConfig() {
	try {
		const savedColorConfig = GM_getValue('colorConfig', null);
		if (savedColorConfig) {
			colorConfig = { ...DEFAULT_COLOR_CONFIG, ...JSON.parse(savedColorConfig) };
		}
	} catch (e) {
		console.error('[Nick Colors] Failed to load config:', e);
	}
}
loadColorConfig();

function saveColorConfig() {
	GM_setValue('colorConfig', JSON.stringify(colorConfig));
}

// Load saved style config or use defaults
let styleConfig = { ...DEFAULT_STYLE_CONFIG };
function loadStyleConfig() {
	try {
		const savedStyleConfig = GM_getValue('styleConfig', null);
		if (savedStyleConfig) {
			styleConfig = { ...DEFAULT_STYLE_CONFIG, ...JSON.parse(savedStyleConfig) };
		}
	} catch (e) {
		console.error('[Nick Colors] Failed to load style config:', e);
	}
}
loadStyleConfig();

function saveStyleConfig() {
	GM_setValue('styleConfig', JSON.stringify(styleConfig));
}

// =====================================================
// COLOR ENGINE
// =====================================================

// Load saved custom colors from storage
let customNickColors = {};
function loadCustomNickColors() {
	try {
		const saved = GM_getValue('customNickColors', '{}');
		customNickColors = JSON.parse(saved);
	} catch (e) {
		customNickColors = {};
	}
}
loadCustomNickColors();

function saveCustomNickColors() {
	GM_setValue('customNickColors', JSON.stringify(customNickColors));
}