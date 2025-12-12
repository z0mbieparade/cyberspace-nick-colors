// ==UserScript==
// @name         Cyberspace Nick Colors
// @author       https://z0m.bi/ (@z0ylent)
// @namespace    https://cyberspace.online/
// @version      1.0
// @description  Consistent bright colors for usernames across the site
// @match        https://cyberspace.online/*
// @grant        GM_registerMenuCommand
// @grant        GM.registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      gist.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==

(function() {
	'use strict';

	// =====================================================
	// GM API FALLBACKS (for testing outside userscript manager)
	// =====================================================

	const GM_setValue = (typeof window.GM_setValue === 'function')
		? window.GM_setValue
		: (key, value) => localStorage.setItem('nickColors_' + key, value);

	const GM_getValue = (typeof window.GM_getValue === 'function')
		? window.GM_getValue
		: (key, defaultValue) => {
			const val = localStorage.getItem('nickColors_' + key);
			return val !== null ? val : defaultValue;
		};

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
		iconSet: '● ○ ◆ ◇ ■ □ ▲ △ ★ ☆ ♦ ♠ ♣ ♥ ☢ ☣ ☠ ⚙ ⬡ ⬢ ♻ ⚛ ⚠ ⛒',  // space-separated icons
	};

	// Helper to convert hex to HSL
	function hexToHsl(hex) {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		if (!result) return null;

		let r = parseInt(result[1], 16) / 255;
		let g = parseInt(result[2], 16) / 255;
		let b = parseInt(result[3], 16) / 255;

		const max = Math.max(r, g, b), min = Math.min(r, g, b);
		let h, s, l = (max + min) / 2;

		if (max === min) {
			h = s = 0;
		} else {
			const d = max - min;
			s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
			switch (max) {
				case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
				case g: h = ((b - r) / d + 2) / 6; break;
				case b: h = ((r - g) / d + 4) / 6; break;
			}
		}

		return {
			h: Math.round(h * 360),
			s: Math.round(s * 100),
			l: Math.round(l * 100)
		};
	}

	// Convert camelCase to kebab-case
	function toKebabCase(str) {
		return str.replace(/([A-Z])/g, '-$1').toLowerCase();
	}

	// Convert style object to CSS string
	function stylesToCssString(styles, separator = '; ') {
		return Object.entries(styles)
			.map(([k, v]) => `${toKebabCase(k)}: ${v}`)
			.join(separator);
	}

	// Parse any color string to HSL object
	function parseColorToHsl(color) {
		if (!color) return null;
		// Try HSL format
		const hslMatch = color.match(/hsl\((\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
		if (hslMatch) {
			return { h: +hslMatch[1], s: +hslMatch[2], l: +hslMatch[3] };
		}
		// Try hex format
		if (color.startsWith('#')) {
			return hexToHsl(color);
		}
		return null;
	}

	// Map a hue value (0-360) to the effective range
	// Scales input proportionally: 0 -> minHue, 360 -> maxHue
	function mapHueToRange(hue, minHue, maxHue) {
		// If full range, no mapping needed
		if (minHue === 0 && maxHue === 360) return hue;

		// Normalize input to 0-1
		const t = hue / 360;

		if (minHue <= maxHue) {
			// Normal range: linearly map 0-360 to minHue-maxHue
			return minHue + t * (maxHue - minHue);
		} else {
			// Wrap-around range (e.g., 300-60 means 300->360->0->60)
			// Total range spans: (360 - minHue) + maxHue
			const range = (360 - minHue) + maxHue;
			const mapped = minHue + t * range;
			// Wrap around if we go past 360
			return mapped >= 360 ? mapped - 360 : mapped;
		}
	}

	// Map a value from 0-100 range proportionally to min-max range
	function mapToRange(value, min, max) {
		if (min === 0 && max === 100) return value;
		const t = value / 100; // Normalize to 0-1
		return min + t * (max - min);
	}

	// Map a color to the effective config range
	// Uses proportional mapping: 0-360/0-100 input maps to the configured range
	function mapColorToRange(color, effectiveConfig) {
		const hsl = parseColorToHsl(color);
		if (!hsl) return color; // Can't parse, return as-is

		const mappedHue = mapHueToRange(hsl.h, effectiveConfig.minHue, effectiveConfig.maxHue);
		const mappedSat = mapToRange(hsl.s, effectiveConfig.minSaturation, effectiveConfig.maxSaturation);
		const mappedLit = mapToRange(hsl.l, effectiveConfig.minLightness, effectiveConfig.maxLightness);

		return `hsl(${mappedHue}, ${mappedSat}%, ${mappedLit}%)`;
	}

	// Get background lightness from site theme or CSS variable
	function getBackgroundLightness() {
		// Try site theme first
		if (siteTheme && siteTheme.bg) {
			const bgHsl = hexToHsl(siteTheme.bg);
			if (bgHsl) return bgHsl.l;
		}
		// Try to get from CSS variable
		const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
		if (bgColor) {
			const bgHsl = hexToHsl(bgColor);
			if (bgHsl) return bgHsl.l;
		}
		// Default assumption: dark background
		return 10;
	}

	// Parse site theme HSL values if available
	let siteThemeHsl = null;
	if (siteTheme && siteTheme.fg) {
		siteThemeHsl = hexToHsl(siteTheme.fg);
	}

	// Default site theme integration settings
	const DEFAULT_SITE_THEME_CONFIG = {
		useHueRange: false,      // Limit hue to site theme's color range
		useSaturation: false,    // Match site theme's saturation
		useLightness: false,     // Match site theme's lightness
		hueSpread: 30,           // +/- degrees around site theme hue
	};

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

	function saveSiteThemeConfig() {
		GM_setValue('siteThemeConfig', JSON.stringify(siteThemeConfig));
	}

	// Function to get effective color config (applies site theme overrides)
	function getEffectiveColorConfig() {
		const config = { ...colorConfig };

		if (siteThemeHsl) {
			if (siteThemeConfig.useHueRange) {
				config.minHue = (siteThemeHsl.h - siteThemeConfig.hueSpread + 360) % 360;
				config.maxHue = (siteThemeHsl.h + siteThemeConfig.hueSpread) % 360;
			}
			if (siteThemeConfig.useSaturation) {
				config.minSaturation = config.maxSaturation = siteThemeHsl.s;
			}
			if (siteThemeConfig.useLightness) {
				config.minLightness = config.maxLightness = siteThemeHsl.l;
			}
		}

		return config;
	}

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

	function saveColorConfig() {
		GM_setValue('colorConfig', JSON.stringify(colorConfig));
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

	// Containers where we should invert backgroundColor/Color for nicks
	const INVERTED_CONTAINERS = [
		'.profile-box-inverted'
	];

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

	// =====================================================
	// EXPORT / IMPORT SETTINGS
	// =====================================================

	const EXPORT_VERSION = 1;

	/**
	 * Get only non-default values from an object by comparing to defaults
	 */
	function getNonDefaultValues(current, defaults) {
		const result = {};
		for (const key of Object.keys(current)) {
			if (JSON.stringify(current[key]) !== JSON.stringify(defaults[key])) {
				result[key] = current[key];
			}
		}
		return Object.keys(result).length > 0 ? result : null;
	}

	/**
	 * Export all settings to a JSON object (only non-default values)
	 */
	function exportSettings() {
		const data = {
			version: EXPORT_VERSION,
			exportedAt: new Date().toISOString()
		};

		// Only include configs that have non-default values
		const colorDiff = getNonDefaultValues(colorConfig, DEFAULT_COLOR_CONFIG);
		if (colorDiff) data.colorConfig = colorDiff;

		const siteThemeDiff = getNonDefaultValues(siteThemeConfig, DEFAULT_SITE_THEME_CONFIG);
		if (siteThemeDiff) data.siteThemeConfig = siteThemeDiff;

		const styleDiff = getNonDefaultValues(styleConfig, DEFAULT_STYLE_CONFIG);
		if (styleDiff) data.styleConfig = styleDiff;

		// Always include custom nick colors if any exist
		if (Object.keys(customNickColors).length > 0) {
			data.customNickColors = customNickColors;
		}

		return data;
	}

	/**
	 * Import settings from a JSON object
	 * @param {Object} data - The imported data
	 * @returns {{ success: boolean, message: string }}
	 */
	function importSettings(data) {
		try {
			if (!data || typeof data !== 'object') {
				return { success: false, message: 'Invalid data format' };
			}

			// Validate version (for future compatibility)
			if (data.version && data.version > EXPORT_VERSION) {
				return { success: false, message: `Export version ${data.version} is newer than supported version ${EXPORT_VERSION}` };
			}

			// Import color config
			if (data.colorConfig) {
				colorConfig = { ...DEFAULT_COLOR_CONFIG, ...data.colorConfig };
				saveColorConfig();
			}

			// Import site theme config
			if (data.siteThemeConfig) {
				siteThemeConfig = { ...DEFAULT_SITE_THEME_CONFIG, ...data.siteThemeConfig };
				saveSiteThemeConfig();
			}

			// Import style config
			if (data.styleConfig) {
				styleConfig = { ...DEFAULT_STYLE_CONFIG, ...data.styleConfig };
				saveStyleConfig();
			}

			// Import custom nick colors
			if (data.customNickColors) {
				customNickColors = { ...data.customNickColors };
				saveCustomNickColors();
			}

			refreshAllColors();
			return { success: true, message: 'Settings imported successfully' };
		} catch (e) {
			return { success: false, message: `Import failed: ${e.message}` };
		}
	}

	/**
	 * Download data as a JSON file
	 */
	function downloadJson(data, filename) {
		const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Download text as a file
	 */
	function downloadText(text, filename) {
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}

	/**
	 * Export debug logs for troubleshooting (returns plain text)
	 */
	function exportDebugLogs() {
		const eff = getEffectiveColorConfig();
		const lines = [];

		lines.push('='.repeat(60));
		lines.push('NICK COLORS DEBUG LOG');
		lines.push('='.repeat(60));
		lines.push('');
		lines.push(`Exported: ${new Date().toISOString()}`);
		lines.push(`URL: ${window.location.href}`);
		lines.push(`User Agent: ${navigator.userAgent}`);
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push('SITE THEME');
		lines.push('-'.repeat(60));
		lines.push(`Site Theme: ${siteTheme ? JSON.stringify(siteTheme) : 'none'}`);
		lines.push(`Site Theme HSL: ${siteThemeHsl ? JSON.stringify(siteThemeHsl) : 'none'}`);
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push('COLOR CONFIG');
		lines.push('-'.repeat(60));
		lines.push(JSON.stringify(colorConfig, null, 2));
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push('EFFECTIVE CONFIG (after site theme integration)');
		lines.push('-'.repeat(60));
		lines.push(JSON.stringify(eff, null, 2));
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push('SITE THEME CONFIG');
		lines.push('-'.repeat(60));
		lines.push(JSON.stringify(siteThemeConfig, null, 2));
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push('STYLE CONFIG');
		lines.push('-'.repeat(60));
		lines.push(JSON.stringify(styleConfig, null, 2));
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push(`CUSTOM NICK COLORS (${Object.keys(customNickColors).length} total)`);
		lines.push('-'.repeat(60));
		lines.push(JSON.stringify(customNickColors, null, 2));
		lines.push('');

		lines.push('-'.repeat(60));
		lines.push(`MANUAL OVERRIDES (${Object.keys(MANUAL_OVERRIDES).length} total)`);
		lines.push('-'.repeat(60));
		lines.push(JSON.stringify(MANUAL_OVERRIDES, null, 2));
		lines.push('');

		// Collect all debug pre elements from the page
		const debugPres = document.querySelectorAll('.nc-dialog-debug, .nc-dynamic-debug');
		if (debugPres.length > 0) {
			lines.push('-'.repeat(60));
			lines.push(`DEBUG ELEMENTS (${debugPres.length} found)`);
			lines.push('-'.repeat(60));
			debugPres.forEach((pre, i) => {
				lines.push(`[${i + 1}] ${pre.textContent.trim()}`);
			});
			lines.push('');
		}

		lines.push('='.repeat(60));
		lines.push('END OF DEBUG LOG');
		lines.push('='.repeat(60));

		return lines.join('\n');
	}

	/**
	 * Prompt user to select a JSON file and import it
	 */
	function promptImportFile() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';
		input.onchange = (e) => {
			const file = e.target.files[0];
			if (!file) return;

			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const data = JSON.parse(event.target.result);
					const result = importSettings(data);
					alert(result.message);
					if (result.success) {
						// Close and reopen settings dialog to refresh UI
						const settingsOverlay = document.querySelector('.nc-dialog-overlay');
						if (settingsOverlay) {
							settingsOverlay.remove();
							createSettingsPanel();
						}
					}
				} catch (err) {
					alert(`Failed to parse file: ${err.message}`);
				}
			};
			reader.readAsText(file);
		};
		input.click();
	}

	/**
	 * Copy settings JSON to clipboard
	 */
	async function copySettingsToClipboard() {
		const data = exportSettings();
		try {
			await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
			alert('Settings copied to clipboard');
		} catch (err) {
			alert(`Failed to copy: ${err.message}`);
		}
	}

	/**
	 * Show a paste dialog for importing settings
	 */
	function showPasteDialog() {
		const overlay = document.createElement('div');
		overlay.className = 'nc-dialog-overlay';
		overlay.innerHTML = `
			<div class="nc-dialog" style="min-width: 400px; max-width: 500px;">
				<div class="nc-dialog-header nc-flex nc-justify-between">
					<h3>Paste Settings</h3>
					<div class="spacer"></div>
					<button class="nc-header-close link-brackets"><span class="inner">ESC</span></button>
				</div>
				<div class="nc-dialog-content">
					<div class="hint" style="margin-bottom: 0.5rem;">Paste your settings JSON below (Ctrl+V or right-click → Paste)</div>
					<textarea id="paste-settings-input" style="min-height: 150px; width: 100%; font-family: monospace; font-size: 0.75rem;" placeholder="Paste settings JSON here..."></textarea>
				</div>
				<div class="nc-dialog-footer">
					<div class="buttons nc-flex nc-items-center nc-gap-2">
						<button class="nc-import-paste-btn link-brackets"><span class="inner">IMPORT</span></button>
						<button class="nc-cancel-btn link-brackets"><span class="inner">CANCEL</span></button>
					</div>
				</div>
			</div>
		`;

		const close = () => overlay.remove();
		const textarea = overlay.querySelector('#paste-settings-input');

		overlay.querySelector('.nc-header-close').addEventListener('click', close);
		overlay.querySelector('.nc-cancel-btn').addEventListener('click', close);
		overlay.querySelector('.nc-import-paste-btn').addEventListener('click', () => {
			const text = textarea.value.trim();
			if (!text) {
				alert('Please paste settings JSON first');
				return;
			}
			try {
				const data = JSON.parse(text);
				const result = importSettings(data);
				alert(result.message);
				if (result.success) {
					close();
					// Close and reopen settings dialog to refresh UI
					const settingsOverlay = document.querySelector('.nc-dialog-overlay');
					if (settingsOverlay) {
						settingsOverlay.remove();
						createSettingsPanel();
					}
				}
			} catch (err) {
				alert(`Failed to parse settings: ${err.message}`);
			}
		});

		// Close on backdrop click
		overlay.addEventListener('click', (e) => {
			if (e.target === overlay) close();
		});

		// Close on Escape
		overlay.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') close();
		});

		document.body.appendChild(overlay);
		textarea.focus();
	}

	function hashString(str) {
		let hash = 0;
		const normalized = str.toLowerCase().trim();
		for (let i = 0; i < normalized.length; i++) {
			hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	function isHueExcluded(hue, config) {
		return config.excludeRanges.some(([min, max]) => hue >= min && hue <= max);
	}

	// =====================================================
	// COLOR GENERATION - CLEAN LOGIC
	// =====================================================
	//
	// Flow:
	// 1. getBaseColor(username) → raw HSL (0-360, 0-100, 0-100)
	//    - From custom save, override, or hash generation
	// 2. applyRangeMapping(hsl, config) → mapped HSL (within site ranges)
	//    - Proportionally maps base color to configured ranges
	// 3. Display always shows mapped result
	// 4. Picker shows raw values, preview shows mapped result
	// =====================================================

	/**
	 * Generate base (raw) HSL color for a username
	 * Returns { h, s, l } in full range (h: 0-360, s: 0-100, l: 0-100)
	 */
	function getBaseColor(username) {
		// Check user-saved custom color first
		if (customNickColors[username]) {
			const custom = customNickColors[username];
			const colorStr = typeof custom === 'string' ? custom : custom.color;
			if (colorStr) {
				const hsl = parseColorToHsl(colorStr);
				if (hsl) return hsl;
			}
		}

		// Check remote/manual overrides
		if (MANUAL_OVERRIDES[username]) {
			const override = MANUAL_OVERRIDES[username];
			const colorStr = typeof override === 'string' ? override : override.color;
			if (colorStr) {
				const hsl = parseColorToHsl(colorStr);
				if (hsl) return hsl;
			}
		}

		// Generate from hash - full range
		const hash = hashString(username);
		const hash2 = hashString(username + '_sat');
		const hash3 = hashString(username + '_lit');

		return {
			h: hash % 360,
			s: hash2 % 101,  // 0-100 inclusive
			l: hash3 % 101   // 0-100 inclusive
		};
	}

	/**
	 * Apply site-wide range mapping to a base color
	 * Maps proportionally: input 0-360/0-100 → configured min-max range
	 */
	function applyRangeMapping(hsl, config) {
		return {
			h: mapHueToRange(hsl.h, config.minHue, config.maxHue),
			s: mapToRange(hsl.s, config.minSaturation, config.maxSaturation),
			l: mapToRange(hsl.l, config.minLightness, config.maxLightness)
		};
	}

	/**
	 * Get raw styles for editing in color picker
	 * Returns the base color values that user can edit
	 */
	function getRawStylesForPicker(username) {
		const base = getBaseColor(username);

		// Build styles object with base color
		let styles = { color: `hsl(${base.h}, ${base.s}%, ${base.l}%)` };

		// Copy non-color properties from custom save
		if (customNickColors[username] && typeof customNickColors[username] === 'object') {
			const custom = { ...customNickColors[username] };
			delete custom.color;
			delete custom.invert;
			styles = { ...styles, ...custom };
		} else if (MANUAL_OVERRIDES[username] && typeof MANUAL_OVERRIDES[username] === 'object') {
			const override = { ...MANUAL_OVERRIDES[username] };
			delete override.color;
			styles = { ...styles, ...override };
		}

		return styles;
	}

	function generateStyles(username) {
		let styles = {};
		const effectiveConfig = getEffectiveColorConfig();

		// Get per-user invert setting (true, false, or undefined for auto)
		const userInvertSetting = customNickColors[username]?.invert;

		// Get base color and apply site-wide range mapping
		const baseColor = getBaseColor(username);
		const mappedColor = applyRangeMapping(baseColor, effectiveConfig);

		// Handle hue exclusion by shifting
		let finalHue = mappedColor.h;
		let attempts = 0;
		while (isHueExcluded(finalHue, effectiveConfig) && attempts < 36) {
			finalHue = (finalHue + 10) % 360;
			attempts++;
		}

		// Set the display color
		styles.color = `hsl(${finalHue}, ${mappedColor.s}%, ${mappedColor.l}%)`;

		// Copy non-color properties from custom save or override
		if (customNickColors[username] && typeof customNickColors[username] === 'object') {
			const custom = { ...customNickColors[username] };
			delete custom.color;
			delete custom.invert;
			styles = { ...styles, ...custom };
		} else if (MANUAL_OVERRIDES[username] && typeof MANUAL_OVERRIDES[username] === 'object') {
			const override = { ...MANUAL_OVERRIDES[username] };
			delete override.color;
			styles = { ...styles, ...override };
		}

		// Handle inversion based on per-user setting or auto contrast
		let shouldInvert = false;
		if (userInvertSetting === true) {
			// User explicitly enabled inversion
			shouldInvert = true;
		} else if (userInvertSetting === false) {
			// User explicitly disabled inversion
			shouldInvert = false;
		} else {
			// Auto: check contrast threshold
			const threshold = effectiveConfig.contrastThreshold || 0;
			if (threshold > 0 && styles.color && !styles.backgroundColor) {
				const hsl = parseColorToHsl(styles.color);
				if (hsl) {
					const bgLightness = getBackgroundLightness();
					const contrast = Math.abs(hsl.l - bgLightness);
					shouldInvert = contrast < threshold;
				}
			}
		}

		if (shouldInvert && styles.color && !styles.backgroundColor) {
			// Swap: color becomes background, use page background as text
			styles.backgroundColor = styles.color;
			styles.color = 'var(--color-bg, #000)';
			styles.padding = '0 0.25em';
		}

		// Apply style variations based on hash (unless already set by override)
		const hash4 = hashString(username + '_style');
		if (styleConfig.varyWeight && !styles.fontWeight) {
			styles.fontWeight = (hash4 % 2 === 0) ? 'normal' : 'bold';
		}
		if (styleConfig.varyItalic && !styles.fontStyle) {
			styles.fontStyle = (hash4 % 4 === 0) ? 'italic' : 'normal';
		}
		if (styleConfig.varyCase && !styles.fontVariant) {
			styles.fontVariant = (hash4 % 4 === 1) ? 'small-caps' : 'normal';
		}

		return styles;
	}

	/**
	 * Get hash-based icon for a username (ignores overrides, for display defaults)
	 */
	function getHashBasedIcon(username, config = styleConfig) {
		if (!config.prependIcon || !config.iconSet) return null;
		const icons = config.iconSet.split(/\s+/).filter(Boolean);
		if (icons.length === 0) return null;
		const hash = hashString(username + '_icon');
		return icons[hash % icons.length];
	}

	/**
	 * Get hash-based style variations for a username
	 */
	function getHashBasedStyleVariations(username) {
		const hash = hashString(username + '_style');
		return {
			fontWeight: (hash % 2 === 0) ? 'normal' : 'bold',
			fontStyle: (hash % 4 === 0) ? 'italic' : 'normal',
			fontVariant: (hash % 4 === 1) ? 'small-caps' : 'normal'
		};
	}

	/**
	 * Get a consistent icon for a username based on hash or custom override
	 * Returns: string (icon) or null (no icon)
	 */
	function getIconForUsername(username) {
		// Check for user-specific custom icon first (including explicitly disabled with '')
		if (customNickColors[username] && 'icon' in customNickColors[username]) {
			const icon = customNickColors[username].icon;
			// Empty string means explicitly disabled - return null to show no icon
			return icon || null;
		}
		if (MANUAL_OVERRIDES[username]?.icon) {
			return MANUAL_OVERRIDES[username].icon;
		}
		// Fall back to hash-based icon if enabled
		return getHashBasedIcon(username);
	}

	function applyStyles(element, username) {
		const styles = generateStyles(username);

		// Check if element is in an inverted container
		const isInverted = INVERTED_CONTAINERS.length > 0 &&
			INVERTED_CONTAINERS.some(sel => element.closest(sel));

		if (isInverted) {
			// In inverted containers, check if we already have contrast-based inversion
			if (styles.backgroundColor) {
				// Already inverted by contrast threshold - reverse it back to normal
				styles.color = styles.backgroundColor;
				delete styles.backgroundColor;
				delete styles.padding;
			} else if (styles.color) {
				// Normal color - invert it for the container
				styles.backgroundColor = styles.color;
				styles.color = 'var(--color-bg, #000)';
				styles.padding = '0 0.25rem';
			}
		}

		// Apply all styles to the element
		Object.assign(element.style, styles);
		element.dataset.nickColored = 'true';
		element.dataset.username = username;

		// Prepend icon if enabled
		const icon = getIconForUsername(username);
		if (icon) {
			if (!element.dataset.iconApplied) {
				// Store original text before first icon application
				element.dataset.originalText = element.textContent;
				element.dataset.iconApplied = 'true';
				element.textContent = icon + ' ' + element.textContent;
			} else {
				// Icon already applied - update it in case it changed
				const originalText = element.dataset.originalText || element.textContent;
				element.textContent = icon + ' ' + originalText;
			}
		} else if (element.dataset.iconApplied) {
			// Icon was removed - restore original text
			if (element.dataset.originalText) {
				element.textContent = element.dataset.originalText;
			}
			delete element.dataset.iconApplied;
			delete element.dataset.originalText;
		}
	}

	// =====================================================
	// USERNAME DETECTION
	// =====================================================

	function extractUsername(element) {
		// Try to get username from the element
		// Customize this based on how the site structures usernames

		// From href like "/username" (but not "/chat/room" or "/static/file.js" or "/guilds/x")
		const href = element.getAttribute('href');
		if (href && href.startsWith('/')) {
			const pathAfterSlash = href.slice(1);
			// Only match simple single-segment paths like "/username"
			// Skip paths that start with known non-user routes
			if (!pathAfterSlash.includes('/') && !pathAfterSlash.includes('.')) {
				const match = href.match(/^\/([^\/\?#]+)/);
				if (match) return match[1];
			}
		}

		// From data attribute
		if (element.dataset.username) {
			return element.dataset.username;
		}

		// From text content (fallback)
		let text = element.textContent.trim();
		// If text has a space (possibly from icon prefix), try the last part
		if (text.includes(' ')) {
			const parts = text.split(' ');
			text = parts[parts.length - 1]; // Take the last part (username after icon)
		}
		if (text && text.length < 30) {
		  	//if starts with @ remove
		  	if(text.startsWith('@')) return text.slice(1);
			return text;
		}

		return null;
	}

	function isLikelyUsername(element) {
		// Skip already processed
		if (element.dataset.nickColored) return false;

		// Check text content - if it has a space, only allow if it looks like "icon username"
		const text = element.textContent.trim();
		if (text.includes(' ')) {
			// Only accept if it's exactly 2 parts and second part looks like username
			const parts = text.split(' ');
			if (parts.length !== 2 || parts[1].includes(' ') || parts[1].length === 0) {
				return false;
			}
			// If we get here, it might be "icon username" format - allow it
		}

		// Skip obvious non-usernames
		const href = element.getAttribute('href') || '';

		// Skip links with more than one slash (e.g., /guilds/name, /chat/room)
		const slashCount = (href.match(/\//g) || []).length;
		if (slashCount > 1) {
			return false;
		}

		//strip slash from start for checking
		const hrefPath = href.startsWith('/') ? href.slice(1) : href;
		if([
			'feed',
			'topics',
			'jukebox',
			'notes',
			'write',
			'chat',
			'messages',
			'bookmarks',
			'notifications',
			'me',
			'guilds',
			'support',
			'wiki',
			'changelog',
			'netiquette', 
			'faq',
		].includes(hrefPath.toLowerCase())) {
			return false;
		}

		if (href.includes('/static/') ||
			href.includes('/assets/') ||
			href.includes('.js') ||
			href.includes('.css') ||
			href.endsWith('/')) {
			return false;
		}

		// If container hints are specified, ONLY color within those containers
		if (CONTAINER_HINTS.length > 0) {
			const inContainer = CONTAINER_HINTS.some(sel => element.closest(sel));
			if (!inContainer) {
				return false;
			}
		}

		// Skip if inside an excluded container
		if (CONTAINER_HINTS_EXCLUDE.length > 0) {
			const inExcluded = CONTAINER_HINTS_EXCLUDE.some(sel => element.closest(sel));
			if (inExcluded) {
				return false;
			}
		}

		return true;
	}

	function colorizeAll() {
		const selector = USERNAME_SELECTORS.join(', ');
		document.querySelectorAll(selector).forEach(el => {
			if (!isLikelyUsername(el)) return;

			const username = extractUsername(el);
			if (username) {
				applyStyles(el, username);
			}
		});

		// Also colorize @mentions in text
		colorizeMentions();
	}

	function colorizeMentions() {
		// Search entire page for @mentions (they're explicit, so no risk of false positives)
		// Walk through text nodes looking for @username patterns
		const walker = document.createTreeWalker(
			document.body,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: (node) => {
					// Skip if already inside a colored mention or if no @ symbol
					if (!node.textContent.includes('@')) return NodeFilter.FILTER_REJECT;
					if (node.parentElement?.closest('[data-mention-colored]')) return NodeFilter.FILTER_REJECT;
					if (node.parentElement?.closest('[data-nick-colored]')) return NodeFilter.FILTER_REJECT;
					// Skip dialog previews (they manage their own styling)
					if (node.parentElement?.closest('.nc-dialog-preview')) return NodeFilter.FILTER_REJECT;
					// Skip script/style tags
					const tagName = node.parentElement?.tagName;
					if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'TEXTAREA' || tagName === 'INPUT') {
						return NodeFilter.FILTER_REJECT;
					}
					// Skip excluded containers
					if (CONTAINER_HINTS_EXCLUDE.length > 0) {
						const inExcluded = CONTAINER_HINTS_EXCLUDE.some(sel => node.parentElement?.closest(sel));
						if (inExcluded) return NodeFilter.FILTER_REJECT;
					}
					return NodeFilter.FILTER_ACCEPT;
				}
			}
		);

		const textNodes = [];
		let node;
		while ((node = walker.nextNode())) {
			textNodes.push(node);
		}

		// Process each text node
		textNodes.forEach(textNode => {
			const text = textNode.textContent;
			// Match @username (alphanumeric, underscore, hyphen)
			const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
			let match;
			const matches = [];

			while ((match = mentionRegex.exec(text)) !== null) {
				// Skip if this looks like an email address (has word chars before the @)
				if (match.index > 0 && /[a-zA-Z0-9._-]/.test(text[match.index - 1])) {
					continue;
				}
				// Skip if followed by a dot and more text (like @site.com)
				const afterMatch = text.slice(match.index + match[0].length);
				if (/^\.[a-zA-Z]/.test(afterMatch)) {
					continue;
				}
				matches.push({
					full: match[0],
					username: match[1],
					index: match.index
				});
			}

			if (matches.length === 0) return;

			// Build new content with colored spans
			const fragment = document.createDocumentFragment();
			let lastIndex = 0;

			matches.forEach(m => {
				// Add text before the mention
				if (m.index > lastIndex) {
					fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
				}

				// Create colored span for the mention
				const span = document.createElement('span');
				// Prepend icon if enabled
				const icon = getIconForUsername(m.username);
				span.textContent = icon ? icon + ' ' + m.full : m.full;
				span.dataset.mentionColored = 'true';
				span.dataset.username = m.username;
				if (icon) span.dataset.iconApplied = 'true';

				// Apply styles
				const styles = generateStyles(m.username);

				// Check if in inverted container
				const isInverted = INVERTED_CONTAINERS.length > 0 &&
					textNode.parentElement?.closest(INVERTED_CONTAINERS.join(', '));

				if (isInverted) {
					if (styles.backgroundColor) {
						// Already inverted by contrast threshold - reverse it back
						styles.color = styles.backgroundColor;
						delete styles.backgroundColor;
						delete styles.padding;
					} else if (styles.color) {
						// Normal color - invert for container
						styles.backgroundColor = styles.color;
						styles.color = 'var(--color-bg, #000)';
						styles.padding = '0 0.25rem';
					}
				}

				Object.assign(span.style, styles);
				fragment.appendChild(span);

				lastIndex = m.index + m.full.length;
			});

			// Add remaining text
			if (lastIndex < text.length) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
			}

			// Replace the text node with the fragment
			textNode.parentNode.replaceChild(fragment, textNode);
		});
	}

	// =====================================================
	// SLIDER UI COMPONENT
	// =====================================================

	// Shared slider styles (injected once)
	const sliderStyles = document.createElement('style');
	sliderStyles.textContent = `
		.nc-slider { position: relative; height: 24px; margin: 0.5rem 0; }
		.nc-slider-track {
			position: absolute;
			inset: 4px 0;
			border: 1px solid var(--color-border, #333);
			background: var(--color-code-bg, #444);
			box-sizing: border-box;
		}
		/* Mapped track hidden by default */
		.nc-slider-track-mapped {
			display: none;
		}
		/* Split track for showing mapped vs full range - taller with gap */
		.nc-slider.nc-slider-split { height: 34px; }
		.nc-slider.nc-slider-split .nc-slider-track {
			top: calc(50% + 1px);
			bottom: 4px;
		}
		.nc-slider.nc-slider-split .nc-slider-track-mapped {
			display: block;
			position: absolute;
			top: 4px;
			bottom: calc(50% + 1px);
			left: 0;
			right: 0;
			border: 1px solid var(--color-border, #333);
			background: var(--color-code-bg, #444);
			box-sizing: border-box;
		}
		.nc-slider-thumb {
			position: absolute; top: 0; width: 14px; height: 22px;
			background: var(--color-fg, #fff);
			border: 2px solid var(--color-bg, #000);
			outline: 1px solid var(--color-border, #333);
			cursor: ew-resize; transform: translateX(-50%); z-index: 2;
			display: flex; align-items: center; justify-content: center;
			font-size: 8px;
			color: var(--color-bg, #000); user-select: none;
			box-sizing: border-box;
		}
		.nc-slider.nc-slider-split .nc-slider-thumb { height: 32px; }
		.nc-slider-labels {
			display: flex; justify-content: space-between; margin-top: 2px;
			font-size: 0.625rem; color: var(--color-fg-dim, #888);
		}
		/* Simple single-value slider style */
		.nc-slider.nc-slider-simple { height: 16px; }
		.nc-slider-simple .nc-slider-track {
			inset: 7px 0; height: 2px;
			border: none;
			background: var(--color-border, #333);
		}
		.nc-slider-simple .nc-slider-thumb {
			top: 3px; width: 10px; height: 10px;
			border-radius: 50%;
		}
		.nc-slider-simple .nc-slider-thumb::before {
			content: '';
			position: absolute;
			inset: -8px;
		}
	`;
	document.head.appendChild(sliderStyles);

	/**
	 * Creates a slider (single or range type)
	 * @param {Object} opts - { type: 'single'|'range', simple, min, max, value/values, gradient, onChange, label }
	 * @returns {Object} - { el, getValue/getValues, setValue/setValues, setGradient }
	 */
	function createSlider(opts) {
		const { type = 'single', simple = false, min = 0, max = 100, onChange, label } = opts;
		const isRange = type === 'range';

		const container = document.createElement('div');
		container.innerHTML = `
			${label ? `<label style="display:block;margin:0.5rem 0 0.25rem;font-size:0.75rem;color:var(--color-fg-dim,#888)">${label}</label>` : ''}
			<div class="nc-slider${simple ? ' nc-slider-simple' : ''}">
				<div class="nc-slider-track-mapped"></div>
				<div class="nc-slider-track"></div>
				${isRange ? '<div class="nc-slider-thumb" data-i="0">▶</div><div class="nc-slider-thumb" data-i="1">◀</div>'
						 : '<div class="nc-slider-thumb" data-i="0"></div>'}
			</div>
			<div class="nc-slider-labels"><span></span>${isRange ? '<span></span>' : ''}</div>
		`;

		const track = container.querySelector('.nc-slider-track');
		const trackMapped = container.querySelector('.nc-slider-track-mapped');
		const thumbs = container.querySelectorAll('.nc-slider-thumb');
		const labels = container.querySelectorAll('.nc-slider-labels span');
		const slider = container.querySelector('.nc-slider');

		let values = isRange ? [...(opts.values || [min, max])] : [opts.value ?? min];

		function toPercent(v) { return ((v - min) / (max - min)) * 100; }
		function fromPercent(p) { return Math.round(min + (p / 100) * (max - min)); }

		function update() {
			thumbs.forEach((t, i) => t.style.left = toPercent(values[i]) + '%');
			if (isRange) {
				labels[0].textContent = `${values[0]}`;
				labels[1].textContent = `${values[1]}`;
			} else {
				labels[0].textContent = `${values[0]}`;
			}
		}

		function setGradient(hueStops) {
			if (isRange) {
				const p0 = toPercent(values[0]), p1 = toPercent(values[1]);
				const isWrapAround = p0 > p1;

				// Helper to interpolate between two stops
				const interpolate = (stop1, stop2, targetP) => {
					const [h1, s1, l1, a1, pos1] = stop1;
					const [h2, s2, l2, a2, pos2] = stop2;
					const t = pos2 === pos1 ? 0 : (targetP - pos1) / (pos2 - pos1);
					return [
						Math.round(h1 + t * (h2 - h1)),
						Math.round(s1 + t * (s2 - s1)),
						Math.round(l1 + t * (l2 - l1)),
						a1 + t * (a2 - a1),
						targetP
					];
				};

				// Find the segment a position falls in
				const findSegment = (pos) => {
					for (let i = 0; i < hueStops.length - 1; i++) {
						if (pos >= hueStops[i][4] && pos <= hueStops[i + 1][4]) {
							return [hueStops[i], hueStops[i + 1]];
						}
					}
					return [hueStops[0], hueStops[hueStops.length - 1]];
				};

				// Build stops with hard edges at boundaries using duplicate stops
				const adjustedStops = [];

				// Get all original positions plus boundaries
				const origPositions = hueStops.map(s => s[4]);
				const allPositions = [...new Set([...origPositions, p0, p1])].sort((a, b) => a - b);

				allPositions.forEach(pos => {
					const [stop1, stop2] = findSegment(pos);
					const color = interpolate(stop1, stop2, pos);

					// At boundary points, add two stops for hard edge
					if (pos === p0 || pos === p1) {
						if (isWrapAround) {
							// Wrap-around: in-range is >= p0 OR <= p1
							// At p0: before is out (0.5), after is in (1)
							// At p1: before is in (1), after is out (0.5)
							if (pos === p0) {
								adjustedStops.push([...color.slice(0, 3), 0.5, pos]);
								adjustedStops.push([...color.slice(0, 3), 1, pos]);
							} else {
								adjustedStops.push([...color.slice(0, 3), 1, pos]);
								adjustedStops.push([...color.slice(0, 3), 0.5, pos]);
							}
						} else {
							// Normal: in-range is >= p0 AND <= p1
							// At p0: before is out (0.5), after is in (1)
							// At p1: before is in (1), after is out (0.5)
							if (pos === p0) {
								adjustedStops.push([...color.slice(0, 3), 0.5, pos]);
								adjustedStops.push([...color.slice(0, 3), 1, pos]);
							} else {
								adjustedStops.push([...color.slice(0, 3), 1, pos]);
								adjustedStops.push([...color.slice(0, 3), 0.5, pos]);
							}
						}
					} else {
						// Regular stop - apply alpha based on range
						const inRange = isWrapAround ? (pos >= p0 || pos <= p1) : (pos >= p0 && pos <= p1);
						adjustedStops.push([...color.slice(0, 3), inRange ? color[3] : 0.5, pos]);
					}
				});

				hueStops = adjustedStops;
			}

			track.style.background = `linear-gradient(to right, ${hueStops.map(stop => {
				const [hue, s, l, a = 1, p = null] = stop;
				let colorString = `hsla(${hue}, ${s}%, ${l}%, ${a})`;
				if (p !== null) {
					colorString += ` ${p}%`;
				}
				return colorString;
			}).join(', ')})`; 
		}

		// Drag handling
		let activeThumb = null;
		function getVal(e) {
			const rect = slider.getBoundingClientRect();
			const x = (e.clientX ?? e.touches?.[0]?.clientX) - rect.left;
			return fromPercent(Math.max(0, Math.min(100, (x / rect.width) * 100)));
		}
		function onDown(e) {
			const t = e.target.closest('.nc-slider-thumb');
			if (t) { activeThumb = +t.dataset.i; e.preventDefault(); }
		}
		function onMove(e) {
			if (activeThumb === null) return;
			values[activeThumb] = getVal(e);
			update();
			onChange?.(isRange ? [...values] : values[0]);
		}
		function onUp() { activeThumb = null; }

		slider.addEventListener('mousedown', onDown);
		document.addEventListener('mousemove', onMove);
		document.addEventListener('mouseup', onUp);
		slider.addEventListener('touchstart', onDown, { passive: false });
		document.addEventListener('touchmove', onMove, { passive: false });
		document.addEventListener('touchend', onUp);

		// Click track to move nearest thumb
		track.addEventListener('click', (e) => {
			const v = getVal(e);
			if (isRange) {
				const d0 = Math.abs(v - values[0]), d1 = Math.abs(v - values[1]);
				values[d0 <= d1 ? 0 : 1] = v;
			} else {
				values[0] = v;
			}
			update();
			onChange?.(isRange ? [...values] : values[0]);
		});

		// Helper to build gradient string from stops
		function buildGradientString(stops) {
			return `linear-gradient(to right, ${stops.map(stop => {
				const [hue, s, l, a = 1, p = null] = stop;
				let colorString = `hsla(${hue}, ${s}%, ${l}%, ${a})`;
				if (p !== null) colorString += ` ${p}%`;
				return colorString;
			}).join(', ')})`;
		}

		// Set split gradient: top track shows mapped range, bottom shows full range
		function setSplitGradient(mappedStops, fullStops) {
			if (!mappedStops) {
				// Disable split mode
				slider.classList.remove('nc-slider-split');
				trackMapped.style.background = '';
				return;
			}
			// Enable split mode
			slider.classList.add('nc-slider-split');
			trackMapped.style.background = buildGradientString(mappedStops);
			track.style.background = buildGradientString(fullStops);
		}

		// Set thumb color(s) - accepts single color or array for range sliders
		function setThumbColor(colors) {
			const colorArray = Array.isArray(colors) ? colors : [colors];
			thumbs.forEach((t, i) => {
				if (colorArray[i]) {
					t.style.background = colorArray[i];
				}
			});
		}

		if (opts.gradient) setGradient(opts.gradient);
		update();

		return {
			el: container,
			getValue: () => values[0],
			getValues: () => [...values],
			setValue: (v) => { values[0] = v; update(); },
			setValues: (vs) => { values = [...vs]; update(); },
			setGradient,
			setSplitGradient,
			setThumbColor
		};
	}

	// =====================================================
	// DIALOG UI COMPONENT
	// =====================================================

	// Shared dialog styles (injected once)
	const dialogStyles = document.createElement('style');
	dialogStyles.textContent = `
		.nc-dialog-overlay {
			position: fixed; top: 0; left: 0; right: 0; bottom: 0;
			background: rgba(0,0,0,0.7); display: flex;
			align-items: center; justify-content: center; z-index: 999999;
		}
		.nc-dialog {
			background: var(--color-bg, #0a0a0a); 
			border: 1px solid var(--color-border, #333);
			color: var(--color-fg, #eee); 
			max-height: 80vh; display: flex; flex-direction: column;
		}
		.nc-dialog .spacer {
			flex: 1;
		}
		.nc-dialog-header {
			padding: 1rem 1rem 0.5rem; 
			border-bottom: 1px solid var(--color-border, #333);
			flex-shrink: 0;
			width: 100%; 
			box-sizing: border-box;
			gap: 0.5rem;
		}
		.nc-dialog-content {
			padding: 0.5rem 1rem; overflow-y: auto; flex: 1;
		}
		.nc-dialog-preview {
			padding: 0.5rem 1rem;
			border-bottom: 1px solid var(--color-border, #333);
			flex-shrink: 0;
			background: var(--color-bg, #0a0a0a);
		}
		.nc-dialog-preview .preview,
		.nc-dialog-preview .preview-row {
			margin: 0;
			background-color: var(--color-code-bg, #222);
			border: 1px solid var(--color-border, #333);
			padding: 0.5rem; 
			margin: 0.75rem 0;
			font-size: 0.875rem; 
		}
		.nc-dialog .preview-row {
			display: flex; 
			gap: 0.5rem; 
			flex-wrap: wrap; 
			justify-content: space-around;
		}
		.nc-dialog .preview-nick { padding: 0.125rem 0.25rem !important; }
		.nc-dialog-footer {
			padding: 0.5rem 1rem .5rem; 
			border-top: 1px solid var(--color-border, #333);
			flex-shrink: 0;
		}
		.nc-dialog h3 {
			margin: 0; color: var(--color-fg, #fff); font-size: 0.875rem;
			text-transform: uppercase; letter-spacing: 0.05em;
		}
		.nc-dialog h4 {
			margin: 0.5rem 0; color: var(--color-fg, #FFF); 
			font-size: 0.75rem;
			text-transform: uppercase; letter-spacing: 0.1em;
		}
		.nc-dialog h4:first-child { margin-top: 0; padding-top: 0; }
		.nc-dialog hr {
			border: 1px dashed var(--color-border, #333); 
			background: transparent;
			height: 0;
			margin: 1rem 0;
		}
		.nc-dialog .nc-input-row, .nc-dialog .nc-input-row-stacked
		{
			padding: 0.5rem 0;
			display: flex;
			flex-direction: row;
			gap: 0.5rem;
		}
		.nc-dialog .nc-input-row-stacked
		{
			flex-direction: column;
			gap: 0.25rem;
		}
		.nc-dialog .nc-input-row.no-padding-bottom, 
		.nc-dialog .nc-input-row-stacked.no-padding-bottom
		{
			padding-bottom: 0;
		}
		.nc-dialog .nc-input-row.no-padding-top, 
		.nc-dialog .nc-input-row-stacked.no-padding-top
		{
			padding-top: 0;
		}
		.nc-dialog .nc-input-row label
		{
			font-size: 0.75rem;
			color: var(--color-fg, #fff);
		}
		.nc-dialog .nc-input-row .hint
		{
			font-size: 0.6rem;
			color: var(--color-fg-dim, #fff);
		}
		.nc-dialog .buttons { 
			display: flex; 
			gap: 0.5rem; 
			justify-content: flex-end;
		}
		.nc-dialog button {
			flex: 1 0 auto;
			padding: 0.5rem;
		}
		.nc-dialog button:hover { border-color: var(--color-fg-dim, #666); }
		.nc-dialog button.link-brackets {
			background: none; 
			border: none; 
			padding: 0;
			color: var(--color-fg-dim, #888);
			flex: 0;
		}
		.nc-dialog button.link-brackets:hover { border-color: var(--color-fg, #FFF); }
		.nc-dialog button.link-brackets .inner::before {
			content: "[";
		}
		.nc-dialog button.link-brackets .inner::after {
			content: "]";
		}
		.nc-dialog button.nc-inline-btn {
			flex: 0 0 auto;
			padding: 0.25rem 0.75rem;
			font-size: 0.75rem;
			background: var(--color-bg, #0a0a0a);
			border: 1px solid var(--color-border, #333);
			color: var(--color-fg-dim, #888);
			cursor: pointer;
			transition: border-color 0.15s, color 0.15s;
		}
		.nc-dialog button.nc-inline-btn:hover {
			border-color: var(--color-fg, #fff);
			color: var(--color-fg, #fff);
		}
		.nc-dialog input[type="text"], .nc-dialog textarea, .nc-dialog select {
			width: 100%; padding: 0.5rem; background: var(--color-bg, #0a0a0a);
			border: 1px solid var(--color-border, #333); color: var(--color-fg, #fff);
			font-family: inherit; font-size: 0.75rem; box-sizing: border-box;
		}
		.nc-dialog textarea { min-height: 70px; resize: vertical; }
		.nc-dialog .nc-toggle { display: flex; margin: 0.5rem 0; }
		.nc-dialog .hint { font-size: 0.625rem; color: var(--color-fg-dim, #666); margin-top: 0.25rem; }

		/* Toggle component styles */
		.nc-dialog .nc-toggle-label {
			display: inline-flex;
			align-items: center;
			gap: 0.75rem;
			cursor: pointer;
			flex-shrink: 0;
		}
		.nc-dialog .nc-toggle-value {
			font-size: 0.75rem;
			color: var(--color-fg-dim, #888);
			text-transform: uppercase;
			letter-spacing: 0.05em;
		}
		.nc-dialog .nc-toggle-track {
			position: relative;
			width: 2.5rem;
			height: 1.25rem;
			border: 1px solid var(--color-border, #333);
			border-radius: var(--radius-md);
			transition: background-color 0.15s;
		}
		.nc-dialog .nc-toggle-track.active {
			background: var(--color-fg, #fff);
		}
		.nc-dialog .nc-toggle-track:not(.active) {
			background: var(--color-fg-dim, #666);
		}
		.nc-dialog .nc-toggle-thumb {
			position: absolute;
			top: 2px;
			width: 1rem;
			height: 0.875rem;
			background: var(--color-bg, #0a0a0a);
			border-radius: var(--radius-md);
			transition: transform 0.15s;
		}
		.nc-dialog .nc-toggle-thumb.pos-start { transform: translateX(2px); }
		.nc-dialog .nc-toggle-thumb.pos-middle { transform: translateX(10px); }
		.nc-dialog .nc-toggle-thumb.pos-end { transform: translateX(20px); }
		.nc-dialog .nc-sr-only {
			position: absolute;
			width: 1px;
			height: 1px;
			padding: 0;
			margin: -1px;
			overflow: hidden;
			clip: rect(0, 0, 0, 0);
			border: 0;
		}
		.nc-dialog .nc-text-dim {
			color: var(--color-fg-dim, #888);
		}

		.nc-dialog .nc-dialog-attribution {
			width: 100%;
			display: flex;
			justify-content: flex-end;
			gap: 0.5rem;
			border-top: 1px dotted var(--color-border, #333);
			margin-top: 0.3rem; font-size: 0.625rem; color: var(--color-fg-dim, #666);
			padding-top: 0.3rem;
		}

		/* Layout utility classes */
		.nc-dialog .nc-flex { display: flex; }
		.nc-dialog .nc-flex-wrap { flex-wrap: wrap; }
		.nc-dialog .nc-flex-shrink-0 { flex-shrink: 0; }
		.nc-dialog .nc-items-center { align-items: center; }
		.nc-dialog .nc-justify-between { justify-content: space-between; }
		.nc-dialog .nc-gap-2 { gap: 0.5rem; }
		.nc-dialog .nc-gap-3 { gap: 0.75rem; }
		.nc-dialog .nc-gap-4 { gap: 1rem; }
		.nc-dialog .nc-cursor-pointer { cursor: pointer; }
		.nc-dialog .nc-dialog-attribution a {
			color: var(--color-fg-dim, #666); text-decoration: none;
		}
		.nc-dialog pre 
		{
			white-space: pre-wrap;
			word-wrap: break-word;
			overflow-wrap: break-word;
			max-width: 100%;
			background-color: var(--color-code-bg, #222);
			color: var(--color-fg, #fff);
			padding: 0.5rem;
		}
		.nc-dialog pre.nc-dialog-debug 
		{
			border: 2px dashed var(--color-border, #333);
		}
	`;
	document.head.appendChild(dialogStyles);

	// =====================================================
	// INPUT ROW HELPER FUNCTIONS
	// =====================================================

	/**
	 * Creates an input row with various input types
	 * @param {Object} opts - Configuration object
	 * @param {string} opts.label - Label text
	 * @param {string} opts.id - Input element ID
	 * @param {string} [opts.type='text'] - Input type: text, textarea, select, toggle, tristate, button
	 * @param {string} [opts.value=''] - Input value (for text/textarea)
	 * @param {string} [opts.placeholder=''] - Placeholder text
	 * @param {string} [opts.hint=''] - Hint text below input
	 * @param {string} [opts.classes=''] - Additional CSS classes
	 * @param {string} [opts.options] - Options HTML for select type
	 * @param {boolean} [opts.checked=false] - Checked state for toggle type
	 * @param {boolean} [opts.disabled=false] - Disabled state for toggle type
	 * @param {boolean|null} [opts.state=null] - State for tristate (null=auto, true, false)
	 * @param {string} [opts.defaultLabel=''] - Default label shown for tristate
	 * @param {string} [opts.buttonText=''] - Button text for button type
	 * @param {boolean} [opts.stacked=false] - Force stacked layout (label on top)
	 * @returns {string} HTML string
	 */
	function createInputRow(opts) {
		const {
			label, id, type = 'text', value = '', placeholder = '', hint = '', classes = '',
			options, checked = false, disabled = false, state = null, defaultLabel = '', buttonText = '',
			stacked = false
		} = opts;

		// Stacked layout types: text, textarea, select (or forced with stacked=true)
		const isStackedType = stacked || ['text', 'textarea', 'select'].includes(type);

		if (isStackedType) {
			const classStr = `nc-input-row-stacked${classes ? ' ' + classes : ''}`;
			let inputHtml;
			if (type === 'textarea') {
				inputHtml = `<textarea id="${id}" placeholder="${placeholder}">${value}</textarea>`;
			} else if (type === 'select' && options) {
				inputHtml = `<select id="${id}">${options}</select>`;
			} else {
				inputHtml = `<input type="${type}" id="${id}" value="${value}" placeholder="${placeholder}">`;
			}
			return `
				<div class="${classStr}">
					${label ? `<label for="${id}">${label}</label>` : ''}
					${inputHtml}
					${hint ? `<div class="hint">${hint}</div>` : ''}
				</div>
			`;
		}

		// Inline layout types: toggle, tristate, button
		if (type === 'toggle') {
			const classStr = `nc-input-row nc-flex nc-items-center nc-justify-between nc-gap-4 nc-toggle${classes ? ' ' + classes : ''}`;
			return `
				<div class="${classStr}">
					<label>${label}</label>
					<label class="nc-toggle-label">
						<div class="nc-toggle-value">${checked ? 'true' : 'false'}</div>
						<input type="checkbox" id="${id}" class="nc-sr-only" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
						<div class="nc-toggle-track${checked ? ' active' : ''}">
							<div class="nc-toggle-thumb ${checked ? 'pos-end' : 'pos-start'}"></div>
						</div>
					</label>
				</div>
			`;
		}

		if (type === 'tristate') {
			const classStr = `nc-input-row nc-flex nc-items-center nc-justify-between nc-gap-4 nc-toggle nc-tristate-toggle${classes ? ' ' + classes : ''}`;
			const stateText = state === true ? 'true' : state === false ? 'false' : 'auto';
			const isChecked = state === true;
			const thumbPosClass = state === true ? 'pos-end' : state === false ? 'pos-start' : 'pos-middle';
			return `
				<div class="${classStr}">
					<label>${label}${defaultLabel ? ` <span class="nc-text-dim">(default: ${defaultLabel})</span>` : ''}</label>
					<label class="nc-toggle-label">
						<div class="nc-toggle-value">${stateText}</div>
						<input type="checkbox" id="${id}" class="nc-sr-only" ${isChecked ? 'checked' : ''}>
						<div class="nc-toggle-track${isChecked ? ' active' : ''}">
							<div class="nc-toggle-thumb ${thumbPosClass}"></div>
						</div>
					</label>
				</div>
			`;
		}

		if (type === 'button') {
			const classStr = `nc-input-row nc-flex nc-items-center nc-justify-between nc-gap-4${classes ? ' ' + classes : ''}`;
			return `
				<div class="${classStr}">
					<label>${label}</label>
					<button id="${id}" class="nc-inline-btn nc-flex-shrink-0">${buttonText}</button>
				</div>
			`;
		}

		// Fallback for unknown types
		return '';
	}

	// Legacy helper functions that delegate to createInputRow
	function createToggleRow(opts) {
		return createInputRow({ ...opts, type: 'toggle' });
	}

	function createTriStateToggleRow(opts) {
		return createInputRow({ ...opts, type: 'tristate' });
	}

	/**
	 * Creates a debug pre element (hidden when DEBUG is false, but still in DOM for export)
	 * @param {Object|string} data - Object with label/value pairs, or plain string for unlabeled content
	 * @param {string} [classes] - Additional CSS classes
	 * @returns {string} HTML string
	 */
	function createDebugPre(data, classes = '') {
		const hiddenStyle = DEBUG ? '' : ' style="display: none;"';
		const classStr = `nc-dialog-debug${classes ? ' ' + classes : ''}`;
		if (typeof data === 'string') {
			return `<pre class="${classStr}"${hiddenStyle}>${data}</pre>`;
		}
		const lines = Object.entries(data)
			.map(([label, value]) => `<strong>${label}:</strong> ${value ?? 'N/A'}`)
			.join('\n');
		return `<pre class="${classStr}"${hiddenStyle}>\n${lines}\n</pre>`;
	}

	/**
	 * Gets or creates a debug pre element under a parent (for dynamic updates)
	 * @param {HTMLElement} parent - Parent element to append to
	 * @param {string} [classes] - Additional CSS classes
	 * @returns {HTMLElement} The debug element (hidden if DEBUG is false)
	 */
	function getOrCreateDebugPre(parent, classes = '') {
		let debug = parent.querySelector('.nc-dynamic-debug');
		if (!debug) {
			debug = document.createElement('pre');
			debug.className = `nc-dynamic-debug nc-dialog-debug${classes ? ' ' + classes : ''}`;
			parent.appendChild(debug);
		}
		debug.style.display = DEBUG ? '' : 'none';
		return debug;
	}

	/**
	 * Creates a dialog with standard structure
	 * @param {Object} opts - { title, content, buttons, width, onClose, onSettings, preview }
	 * @returns {Object} - { el, close, querySelector, querySelectorAll }
	 */
	function createDialog(opts) {
		const { title, content, buttons = [], width = '400px', onClose, onSettings, preview = '' } = opts;

		const overlay = document.createElement('div');
		overlay.className = 'nc-dialog-overlay';
		overlay.innerHTML = `
			<div class="nc-dialog" style="min-width: ${width}; max-width: calc(${width} + 100px);">
				<div class="nc-dialog-header nc-flex nc-justify-between">
					<h3>${title}</h3>
					<div class="spacer"></div>
					${onSettings ? '<button class="nc-header-settings link-brackets"><span class="inner">SETTINGS</span></button>' : ''}
					<button class="nc-header-close link-brackets"><span class="inner">ESC</span></button>
				</div>
				${preview ? `<div class="nc-dialog-preview">${preview}</div>` : ''}
				<div class="nc-dialog-content">
					${content}
				</div>
				<div class="nc-dialog-footer">
					<div class="buttons nc-flex nc-flex-wrap nc-items-center nc-gap-2">
						${buttons.map(b => `<button class="${b.class || ''} link-brackets"><span class="inner">${b.label}</span></button>`).join('')}
					</div>
					<div class="nc-dialog-attribution hint">
						<span>created by <a href="/z0ylent">@z0ylent</a></span>
						<span> | </span>
						<span><a href="https://z0m.bi" target="_blank">https://z0m.bi</a></span>
						<span> | </span>
						<span><a class="github-link" href="https://github.com/z0mbieparade/cyberspace-nick-colors" target="_blank" title="GitHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14px"> <path fill="currentColor" d="M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v2Zm0 0h2v4h-2v-4Z"/> </svg></a></span>
					</div>
				</div>
			</div>
		`;

		const close = () => {
			overlay.remove();
			onClose?.();
		};

		// Bind footer button handlers
		buttons.forEach(b => {
			const btn = overlay.querySelector(`.nc-dialog-footer button.${b.class}`);
			if (btn && b.onClick) {
				btn.addEventListener('click', () => b.onClick(close));
			}
		});

		// Bind header button handlers
		const closeBtn = overlay.querySelector('.nc-header-close');
		if (closeBtn) closeBtn.addEventListener('click', close);

		const settingsBtn = overlay.querySelector('.nc-header-settings');
		if (settingsBtn && onSettings) {
			settingsBtn.addEventListener('click', () => {
				close();
				onSettings();
			});
		}

		// Close on overlay click or Escape
		overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
		overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
		overlay.setAttribute('tabindex', '-1');

		document.body.appendChild(overlay);
		overlay.focus();

		return {
			el: overlay,
			close,
			querySelector: (sel) => overlay.querySelector(sel),
			querySelectorAll: (sel) => overlay.querySelectorAll(sel)
		};
	}

	// =====================================================
	// INTERACTIVE COLOR PICKER
	// =====================================================

	function createColorPicker(username, currentStyles) {
		// Filter out color, icon, and style variation properties from CSS string
		const styleVariationKeys = ['color', 'icon', 'fontWeight', 'fontStyle', 'fontVariant', 'invert'];
		const filteredStyles = Object.fromEntries(
			Object.entries(currentStyles).filter(([key]) => !styleVariationKeys.includes(key))
		);
		const currentCssString = stylesToCssString(filteredStyles, ';\n');

		// Get current custom icon state: undefined = auto, '' = disabled, string = custom
		const savedIcon = customNickColors[username]?.icon;
		const currentIcon = savedIcon || '';
		// Determine icon state: null = auto (use global), false = disabled, true = custom
		const hasIconProperty = customNickColors[username] && 'icon' in customNickColors[username];
		const initialIconState = !hasIconProperty ? null : (savedIcon ? true : false);

		// Calculate hash-based defaults for display
		const hashIcon = getHashBasedIcon(username) || '';
		const hashStyles = getHashBasedStyleVariations(username);
		const hashWeight = hashStyles.fontWeight;
		const hashItalic = hashStyles.fontStyle;
		const hashCase = hashStyles.fontVariant;

		// Get current per-user style overrides (null means use global/hash)
		const savedStyles = customNickColors[username] || {};
		const currentWeight = savedStyles.fontWeight;
		const currentItalic = savedStyles.fontStyle;
		const currentCase = savedStyles.fontVariant;
		const currentInvert = savedStyles.invert; // true, false, or undefined (auto)

		// Check if user has remote overrides
		const hasRemoteOverride = MANUAL_OVERRIDES[username];
		let remoteOverrideText = '';
		if (hasRemoteOverride) {
			const override = MANUAL_OVERRIDES[username];
			if (typeof override === 'string') {
				remoteOverrideText = `color: ${override}`;
			} else {
				remoteOverrideText = stylesToCssString(override);
			}
		}

		// Check if color range is restricted
		const eff = getEffectiveColorConfig();
		const isHueRestricted = eff.minHue !== 0 || eff.maxHue !== 360;
		const isSatRestricted = eff.minSaturation !== 0 || eff.maxSaturation !== 100;
		const isLitRestricted = eff.minLightness !== 0 || eff.maxLightness !== 100;
		const isRestricted = isHueRestricted || isSatRestricted || isLitRestricted;

		// Determine source of color data for debug display
		const baseColor = getBaseColor(username);
		const mappedColor = applyRangeMapping(baseColor, eff);
		let colorSource = 'hash-generated';
		let colorSourceData = '';
		if (customNickColors[username]) {
			colorSource = 'customNickColors (local save)';
			colorSourceData = JSON.stringify(customNickColors[username]);
		} else if (MANUAL_OVERRIDES[username]) {
			colorSource = 'MANUAL_OVERRIDES (remote)';
			colorSourceData = JSON.stringify(MANUAL_OVERRIDES[username]);
		}

		// Get hash values for debug
		const hash = hashString(username);
		const hash2 = hashString(username + '_sat');
		const hash3 = hashString(username + '_lit');
		const hash4 = hashString(username + '_style');

		const dialog = createDialog({
			title: `Nick: ${username}`,
			width: '320px',
			onSettings: () => createSettingsPanel(),
			preview: `<div class="preview">&lt;<span id="picker-preview">${username}</span>&gt; Example chat message<br />Inline mention <span id="picker-preview-mention">@${username}</span> example</div>`,
			content: `
				${createDebugPre({
					'Color Source': colorSource,
					'Saved Data': colorSourceData,
					'Hash Values': `h:${hash} s:${hash2} l:${hash3} style:${hash4}`,
					'Base Color (raw)': `H:${baseColor.h.toFixed(1)} S:${baseColor.s.toFixed(1)} L:${baseColor.l.toFixed(1)}`,
					'Mapped Color': `H:${mappedColor.h.toFixed(1)} S:${mappedColor.s.toFixed(1)} L:${mappedColor.l.toFixed(1)}`,
					'Effective Config': `H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`,
					'Style Variations': `weight:${hashWeight} italic:${hashItalic} case:${hashCase}`
				})}
				${hasRemoteOverride ? `<div class="hint" style="margin-bottom: 0.5rem;">Site-wide override: <code style="background: var(--color-code-bg, #222); padding: 0.1em 0.3em;">${remoteOverrideText}</code><br>Your changes will override this locally.</div>` : ''}
				<h4>Nick Color</h4>
				<div id="picker-sliders"></div>
				${createInputRow({
					label: 'Custom color value:',
					id: 'picker-custom',
					placeholder: '#ff6b6b or hsl(280, 90%, 65%)',
					classes: 'no-padding-bottom'
				})}
				${isRestricted ? `<div class="hint" style="margin-top: 0.5rem;">Color range is restricted. Preview shows mapped result. Click SETTINGS to adjust.</div>` : ''}
				<hr />
				<h4>Custom Icon</h4>
				${createTriStateToggleRow({
					label: 'Custom icon',
					id: 'picker-icon-enabled',
					state: initialIconState,
					defaultLabel: hashIcon,
					classes: 'no-padding-top'
				})}
				<div class="nc-input-row-stacked no-padding-top" id="picker-icon-container" style="display: ${initialIconState === true ? 'block' : 'none'}">
					${styleConfig.iconSet ? `<div id="picker-icon-options" style="display: flex; flex-wrap: wrap; gap: 0.25em; margin-bottom: 0.5rem;">${styleConfig.iconSet.split(/\s+/).filter(Boolean).map(icon => `<span class="nc-icon-option" style="cursor: pointer; padding: 0.2em 0.4em; border: 1px solid var(--color-border, #333); border-radius: var(--radius-md); transition: background 0.15s, border-color 0.15s;" title="Click to copy">${icon}</span>`).join('')}</div>` : ''}
					<input type="text" id="picker-icon" value="${currentIcon}" placeholder="click above or enter your own">
					<div class="hint">Single character/emoji prepended to this user's name</div>
				</div>
				<hr />
				<h4>Style Variations</h4>
				<div class="hint" style="margin-bottom: 0.5rem;">Override the global style settings for this user</div>
				${createTriStateToggleRow({
					label: 'Bold',
					id: 'picker-weight',
					state: currentWeight === 'bold' ? true : currentWeight === 'normal' ? false : null,
					defaultLabel: hashWeight,
					classes: 'no-padding-top'
				})}
				${createTriStateToggleRow({
					label: 'Italic',
					id: 'picker-italic',
					state: currentItalic === 'italic' ? true : currentItalic === 'normal' ? false : null,
					defaultLabel: hashItalic,
					classes: 'no-padding-top'
				})}
				${createTriStateToggleRow({
					label: 'Small Caps',
					id: 'picker-case',
					state: currentCase === 'small-caps' ? true : currentCase === 'normal' ? false : null,
					defaultLabel: hashCase,
					classes: 'no-padding-top'
				})}
				${createTriStateToggleRow({
					label: 'Invert',
					id: 'picker-invert',
					state: currentInvert,
					defaultLabel: 'auto',
					classes: 'no-padding-top'
				})}
				<hr />
				<h4>Additional CSS</h4>
				${createInputRow({
					label: '',
					id: 'picker-css',
					type: 'textarea',
					value: currentCssString,
					placeholder: 'background-color: #1a1a2e;&#10;text-decoration: underline;',
					hint: 'CSS properties, one per line',
					classes: 'no-padding-top'
				})}
			`,
			buttons: [
				{ label: 'Save', class: 'save', onClick: (close) => {
					const styles = { color: getTextColor(), ...parseCssText(cssInput.value) };
					// Add custom icon based on tri-state: null = auto (don't save), true = custom, false = disabled
					if (iconState === true) {
						const iconValue = iconInput.value.trim();
						if (iconValue) {
							styles.icon = iconValue;
						} else {
							styles.icon = ''; // Explicitly set but empty - will be treated as disabled
						}
					} else if (iconState === false) {
						styles.icon = ''; // Explicitly disabled
					}
					// iconState === null means auto, so we don't save the icon property
					// Add style variations if explicitly set (not auto)
					if (weightState !== null) {
						styles.fontWeight = weightState ? 'bold' : 'normal';
					}
					if (italicState !== null) {
						styles.fontStyle = italicState ? 'italic' : 'normal';
					}
					if (caseState !== null) {
						styles.fontVariant = caseState ? 'small-caps' : 'normal';
					}
					if (invertState !== null) {
						styles.invert = invertState;
					}
					customNickColors[username] = styles;
					saveCustomNickColors();
					refreshAllColors();
					close();
				}},
				{ label: 'Reset', class: 'reset', onClick: (close) => {
					delete customNickColors[username];
					saveCustomNickColors();
					refreshAllColors();
					close();
				}},
				{ label: 'Cancel', class: 'cancel', onClick: (close) => close() }
			]
		});

		const preview = dialog.querySelector('#picker-preview');
		const previewMention = dialog.querySelector('#picker-preview-mention');
		const customInput = dialog.querySelector('#picker-custom');
		const iconEnabledInput = dialog.querySelector('#picker-icon-enabled');
		const iconContainer = dialog.querySelector('#picker-icon-container');
		const iconInput = dialog.querySelector('#picker-icon');
		const weightInput = dialog.querySelector('#picker-weight');
		const italicInput = dialog.querySelector('#picker-italic');
		const caseInput = dialog.querySelector('#picker-case');
		const invertInput = dialog.querySelector('#picker-invert');
		const cssInput = dialog.querySelector('#picker-css');
		const slidersContainer = dialog.querySelector('#picker-sliders');

		// Track tri-state for toggles (null = auto/inherit, true = on, false = off)
		let iconState = initialIconState;
		let weightState = currentWeight === 'bold' ? true : currentWeight === 'normal' ? false : null;
		let italicState = currentItalic === 'italic' ? true : currentItalic === 'normal' ? false : null;
		let caseState = currentCase === 'small-caps' ? true : currentCase === 'normal' ? false : null;
		let invertState = currentInvert === true ? true : currentInvert === false ? false : null;

		// Parse CSS text into style object
		function parseCssText(cssText) {
			const styles = {};
			cssText.split(/[;\n]/).forEach(line => {
				const trimmed = line.trim();
				if (!trimmed) return;
				const idx = trimmed.indexOf(':');
				if (idx === -1) return;
				const prop = trimmed.slice(0, idx).trim();
				const value = trimmed.slice(idx + 1).trim();
				if (prop && value) {
					const camelProp = prop.replace(/-([a-z])/g, (_, l) => l.toUpperCase());
					styles[camelProp] = value;
				}
			});
			return styles;
		}

		// Create sliders with restricted range info and live value display in labels
		const hueLabel = isHueRestricted
			? `Hue <span class="nc-slider-values" style="color:var(--color-fg-dim,#888);font-size:0.75rem;font-family:monospace"></span> <span style="color:var(--color-fg-dim,#888);font-size:0.65rem">→ mapped to ${eff.minHue}-${eff.maxHue}</span>`
			: `Hue <span class="nc-slider-values" style="color:var(--color-fg-dim,#888);font-size:0.75rem;font-family:monospace"></span>`;
		const satLabel = isSatRestricted
			? `Sat <span class="nc-slider-values" style="color:var(--color-fg-dim,#888);font-size:0.75rem;font-family:monospace"></span> <span style="color:var(--color-fg-dim,#888);font-size:0.65rem">→ mapped to ${eff.minSaturation}-${eff.maxSaturation}</span>`
			: `Sat <span class="nc-slider-values" style="color:var(--color-fg-dim,#888);font-size:0.75rem;font-family:monospace"></span>`;
		const litLabel = isLitRestricted
			? `Lit <span class="nc-slider-values" style="color:var(--color-fg-dim,#888);font-size:0.75rem;font-family:monospace"></span> <span style="color:var(--color-fg-dim,#888);font-size:0.65rem">→ mapped to ${eff.minLightness}-${eff.maxLightness}</span>`
			: `Lit <span class="nc-slider-values" style="color:var(--color-fg-dim,#888);font-size:0.75rem;font-family:monospace"></span>`;

		const hueSlider = createSlider({ label: hueLabel, min: 0, max: 360, value: 180, onChange: () => { customInput.value = ''; updatePreview(); } });
		const satSlider = createSlider({ label: satLabel, min: 0, max: 100, value: 85, onChange: () => { customInput.value = ''; updatePreview(); } });
		const litSlider = createSlider({ label: litLabel, min: 0, max: 100, value: 65, onChange: () => { customInput.value = ''; updatePreview(); } });

		slidersContainer.append(hueSlider.el, satSlider.el, litSlider.el);

		function getTextColor() {
			// Save raw slider values - mapping happens on display
			return customInput.value.trim() || `hsl(${hueSlider.getValue()}, ${satSlider.getValue()}%, ${litSlider.getValue()}%)`;
		}

		function updateGradients() {
			// Raw slider values (base values)
			const h = hueSlider.getValue(), s = satSlider.getValue(), l = litSlider.getValue();

			// Apply site-wide range mapping (proportional)
			const mappedH = mapHueToRange(h, eff.minHue, eff.maxHue);
			const mappedS = mapToRange(s, eff.minSaturation, eff.maxSaturation);
			const mappedL = mapToRange(l, eff.minLightness, eff.maxLightness);

			// HUE SLIDER
			// Full track: shows raw hue values with raw sat/lit (what you'd get without mapping)
			const fullHueStops = Array.from({ length: 13 }, (_, i) => {
				const hue = i * 30;
				return [hue, s, l, 1, (hue / 360) * 100];
			});

			if (isHueRestricted) {
				// Mapped track: shows what color you GET at each position (mapped hue, mapped sat/lit)
				const mappedHueStops = [];
				for (let i = 0; i <= 36; i++) {
					const inputHue = i * 10;
					const outputHue = mapHueToRange(inputHue, eff.minHue, eff.maxHue);
					const pos = (inputHue / 360) * 100;
					mappedHueStops.push([outputHue, mappedS, mappedL, 1, pos]);
				}
				hueSlider.setSplitGradient(mappedHueStops, fullHueStops);
			} else {
				hueSlider.setSplitGradient(null);
				hueSlider.setGradient(fullHueStops);
			}

			// SATURATION SLIDER
			// Full track: shows raw sat values with raw hue/lit
			const fullSatStops = [[h, 0, l, 1, 0], [h, 100, l, 1, 100]];

			if (isSatRestricted) {
				// Mapped track: shows actual output (mapped hue, mapped sat, mapped lit)
				// Map 0-100 to minSat-maxSat
				const mappedSatStops = [[mappedH, eff.minSaturation, mappedL, 1, 0], [mappedH, eff.maxSaturation, mappedL, 1, 100]];
				satSlider.setSplitGradient(mappedSatStops, fullSatStops);
			} else {
				satSlider.setSplitGradient(null);
				satSlider.setGradient(fullSatStops);
			}

			// LIGHTNESS SLIDER
			// Full track: shows raw lit values with raw hue/sat
			const fullLitStops = [[h, s, 0, 1, 0], [h, s, 50, 1, 50], [h, s, 100, 1, 100]];

			if (isLitRestricted) {
				// Mapped track: shows actual output (mapped hue/sat, mapped lit)
				// Map 0-100 to minLit-maxLit
				const mappedLitStops = [[mappedH, mappedS, eff.minLightness, 1, 0], [mappedH, mappedS, eff.maxLightness, 1, 100]];
				litSlider.setSplitGradient(mappedLitStops, fullLitStops);
			} else {
				litSlider.setSplitGradient(null);
				litSlider.setGradient(fullLitStops);
			}

			// All thumbs show the final resulting color
			const thumbColor = `hsl(${mappedH}, ${mappedS}%, ${mappedL}%)`;
			hueSlider.setThumbColor(thumbColor);
			satSlider.setThumbColor(thumbColor);
			litSlider.setThumbColor(thumbColor);

			// Update live value displays: raw → mapped
			const hueValuesEl = hueSlider.el.querySelector('.nc-slider-values');
			const satValuesEl = satSlider.el.querySelector('.nc-slider-values');
			const litValuesEl = litSlider.el.querySelector('.nc-slider-values');
			if (hueValuesEl) hueValuesEl.textContent = `[${Math.round(h)} → ${Math.round(mappedH)}]`;
			if (satValuesEl) satValuesEl.textContent = `[${Math.round(s)} → ${Math.round(mappedS)}]`;
			if (litValuesEl) litValuesEl.textContent = `[${Math.round(l)} → ${Math.round(mappedL)}]`;

			// Debug info under each slider (hidden if DEBUG is false)
			const hueDebug = getOrCreateDebugPre(hueSlider.el);
			const satDebug = getOrCreateDebugPre(satSlider.el);
			const litDebug = getOrCreateDebugPre(litSlider.el);

			const hueRange = eff.maxHue - eff.minHue;
			const hueT = h / 360;
			hueDebug.textContent = `t=${hueT.toFixed(3)} | ${eff.minHue} + ${hueT.toFixed(3)} * (${eff.maxHue} - ${eff.minHue}) = ${eff.minHue} + ${hueT.toFixed(3)} * ${hueRange} = ${(eff.minHue + hueT * hueRange).toFixed(1)}`;

			const satRange = eff.maxSaturation - eff.minSaturation;
			const satT = s / 100;
			satDebug.textContent = `t=${satT.toFixed(3)} | ${eff.minSaturation} + ${satT.toFixed(3)} * (${eff.maxSaturation} - ${eff.minSaturation}) = ${(eff.minSaturation + satT * satRange).toFixed(1)}`;

			const litRange = eff.maxLightness - eff.minLightness;
			const litT = l / 100;
			litDebug.textContent = `t=${litT.toFixed(3)} | ${eff.minLightness} + ${litT.toFixed(3)} * (${eff.maxLightness} - ${eff.minLightness}) = ${(eff.minLightness + litT * litRange).toFixed(1)}`;
		}

		function updatePreview() {
			updateGradients();
			const color = getTextColor();
			// Show mapped color in preview (what it will actually look like)
			const effectiveConfig = getEffectiveColorConfig();
			// Always apply mapping - slider values are raw base values
			const mappedColor = mapColorToRange(color, effectiveConfig);

			// Apply style variations based on state (null = use global/hash default)
			const effectiveWeight = weightState !== null ? (weightState ? 'bold' : 'normal') :
				(styleConfig.varyWeight ? hashWeight : 'normal');
			const effectiveItalic = italicState !== null ? (italicState ? 'italic' : 'normal') :
				(styleConfig.varyItalic ? hashItalic : 'normal');
			const effectiveCase = caseState !== null ? (caseState ? 'small-caps' : 'normal') :
				(styleConfig.varyCase ? hashCase : 'normal');

			// Determine if we should invert (swap fg/bg)
			let shouldInvert = false;
			if (invertState === true) {
				shouldInvert = true;
			} else if (invertState === null) {
				// Auto - check contrast threshold
				const hsl = parseColorToHsl(mappedColor);
				if (hsl) {
					const bgLightness = getBackgroundLightness();
					const threshold = effectiveConfig.contrastThreshold || 0;
					const contrast = Math.abs(hsl.l - bgLightness);
					shouldInvert = threshold > 0 && contrast < threshold;
				}
			}
			// invertState === false means explicitly disabled

			// Show icon in preview based on tri-state: true = custom, false = disabled, null = auto (global)
			let iconValue = '';
			if (iconState === true) {
				iconValue = iconInput.value.trim();
			} else if (iconState === null) {
				// Auto - use global hash-based icon if enabled
				iconValue = hashIcon;
			}
			// iconState === false means explicitly disabled, so iconValue stays empty

			// Helper to apply styles to a preview element
			const applyPreviewStyles = (el, isMention) => {
				el.style.cssText = '';
				if (shouldInvert) {
					el.style.backgroundColor = mappedColor;
					el.style.color = 'var(--color-bg, #0a0a0a)';
				} else {
					el.style.color = mappedColor;
				}
				Object.assign(el.style, parseCssText(cssInput.value));
				el.style.fontWeight = effectiveWeight;
				el.style.fontStyle = effectiveItalic;
				el.style.fontVariant = effectiveCase;
				const prefix = isMention ? '@' : '';
				el.textContent = iconValue ? iconValue + ' ' + prefix + username : prefix + username;
			};

			// Update both previews (false = not mention, true = mention)
			applyPreviewStyles(preview, false);
			if (previewMention) applyPreviewStyles(previewMention, true);
		}

		// Parse initial color - load raw saved values directly to sliders
		if (currentStyles.color) {
			const hsl = parseColorToHsl(currentStyles.color);
			if (hsl) {
				hueSlider.setValue(hsl.h); satSlider.setValue(hsl.s); litSlider.setValue(hsl.l);
			} else {
				customInput.value = currentStyles.color;
			}
		}

		customInput.addEventListener('input', updatePreview);
		iconInput.addEventListener('input', updatePreview);
		cssInput.addEventListener('input', updatePreview);

		// Icon toggle handler (tri-state like style variations)
		iconEnabledInput.closest('label').addEventListener('click', (e) => {
			e.preventDefault();
			iconState = cycleTriState(iconState);
			updateTriStateToggle(iconEnabledInput, iconState);
			// Show/hide icon input (only show when state is true/custom)
			iconContainer.style.display = iconState === true ? 'block' : 'none';
			updatePreview();
		});

		// Icon option click handlers - click to select
		const iconOptions = dialog.querySelector('#picker-icon-options');
		if (iconOptions) {
			iconOptions.addEventListener('click', (e) => {
				const option = e.target.closest('.nc-icon-option');
				if (option) {
					const icon = option.textContent;
					iconInput.value = icon;
					updatePreview();
					// Brief visual feedback
					option.style.background = 'var(--color-fg-dim, #666)';
					setTimeout(() => { option.style.background = ''; }, 150);
				}
			});
		}

		// Tri-state toggle helper: null (auto) → true → false → null (auto)
		function cycleTriState(currentState) {
			if (currentState === null) return true;
			if (currentState === true) return false;
			return null;
		}

		function updateTriStateToggle(input, state) {
			const label = input.closest('.nc-toggle');
			const valueEl = label.querySelector('.nc-toggle-value');
			const track = label.querySelector('.nc-toggle-track');
			const thumb = label.querySelector('.nc-toggle-thumb');

			// Update value text
			if (valueEl) valueEl.textContent = state === true ? 'true' : state === false ? 'false' : 'auto';

			// Update track color
			if (track) {
				track.classList.toggle('active', state === true);
			}

			// Update thumb position
			if (thumb) {
				thumb.classList.remove('pos-start', 'pos-middle', 'pos-end');
				thumb.classList.add(state === true ? 'pos-end' : state === false ? 'pos-start' : 'pos-middle');
			}
		}

		// Style variation toggle handlers (tri-state)
		if (weightInput) {
			weightInput.closest('label').addEventListener('click', (e) => {
				e.preventDefault();
				weightState = cycleTriState(weightState);
				updateTriStateToggle(weightInput, weightState);
				updatePreview();
			});
		}
		if (italicInput) {
			italicInput.closest('label').addEventListener('click', (e) => {
				e.preventDefault();
				italicState = cycleTriState(italicState);
				updateTriStateToggle(italicInput, italicState);
				updatePreview();
			});
		}
		if (caseInput) {
			caseInput.closest('label').addEventListener('click', (e) => {
				e.preventDefault();
				caseState = cycleTriState(caseState);
				updateTriStateToggle(caseInput, caseState);
				updatePreview();
			});
		}
		if (invertInput) {
			invertInput.closest('label').addEventListener('click', (e) => {
				e.preventDefault();
				invertState = cycleTriState(invertState);
				updateTriStateToggle(invertInput, invertState);
				updatePreview();
			});
		}

		updatePreview();
	}

	function refreshAllColors() {
		document.querySelectorAll('[data-nick-colored]').forEach(el => {
			// Restore original text if we have it stored
			if (el.dataset.originalText) {
				el.textContent = el.dataset.originalText;
			}
			// Clear all our data attributes
			delete el.dataset.nickColored;
			delete el.dataset.iconApplied;
			delete el.dataset.originalText;
			delete el.dataset.username;
			el.style.cssText = ''; // Clear applied styles
		});
		// Remove mention spans and restore original text
		document.querySelectorAll('[data-mention-colored]').forEach(el => {
			// Reconstruct original mention from stored username (avoids including icon)
			const username = el.dataset.username;
			const originalText = username ? `@${username}` : el.textContent;
			el.replaceWith(document.createTextNode(originalText));
		});
		colorizeAll();
	}

	// =====================================================
	// SETTINGS PANEL
	// =====================================================

	function createSettingsPanel() {
		const eff = getEffectiveColorConfig();
		const dialog = createDialog({
			title: 'Nick Color Settings',
			width: '400px',
			preview: `<div class="preview-row" id="settings-preview"></div>`,
			content: `
				${createDebugPre({
					'Site Theme': siteTheme ? `fg:${siteTheme.fg} bg:${siteTheme.bg}` : 'not detected',
					'Site Theme HSL': siteThemeHsl ? `H:${siteThemeHsl.h} S:${siteThemeHsl.s} L:${siteThemeHsl.l}` : 'N/A',
					'Effective Config': `H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`,
					'Contrast Threshold': eff.contrastThreshold,
					'Custom Colors Saved': Object.keys(customNickColors).length
				})}
				${createInputRow({
					label: 'Preset Theme:',
					id: 'settings-preset',
					type: 'select',
					options: `<option value="">-- Select a preset --</option>${Object.keys(PRESET_THEMES).map(name => `<option value="${name}">${name}</option>`).join('')}`
				})}
				<hr />
				<h4>Hue Range${siteThemeHsl ? '' : ' <span class="nc-text-dim">(no site theme)</span>'}</h4>
				${createToggleRow({
					label: `Use site theme foreground hue${siteThemeHsl ? ` <span style="color:hsl(${siteThemeHsl.h}, 100%, 50%)">(${siteThemeHsl.h}°)</span>` : ''}`,
					id: 'settings-site-hue',
					checked: siteThemeConfig.useHueRange,
					disabled: !siteThemeHsl
				})}
				<div id="hue-spread-container" style="display: ${siteThemeConfig.useHueRange ? 'block' : 'none'}"></div>
				<div id="hue-slider-container"></div>
				<hr />
				<h4>Saturation Range</h4>
				${createToggleRow({
					label: `Use site theme foreground saturation${siteTheme?.fg ? ` <span style="color:${siteTheme.fg}">(${siteThemeHsl.s}%)</span>` : ''}`,
					id: 'settings-site-saturation',
					checked: siteThemeConfig.useSaturation,
					disabled: !siteThemeHsl
				})}
				<div id="sat-slider-container"></div>
				<hr />
				<h4>Lightness Range</h4>
				${createToggleRow({
					label: `Use site theme foreground lightness${siteTheme?.fg ? ` <span style="color:${siteTheme.fg}">(${siteThemeHsl.l}%)</span>` : ''}`,
					id: 'settings-site-lightness',
					checked: siteThemeConfig.useLightness,
					disabled: !siteThemeHsl
				})}
				<div id="lit-slider-container"></div>
				<hr />
				<h4>Contrast</h4>
				<div class="hint" style="margin-top: -0.25rem; margin-bottom: 0.25rem;">
					Reverse foreground and background when lightness contrast is below threshold (0 = disabled)
				</div>
				<div id="contrast-slider-container"></div>
				<hr />
				<h4>Style Variation</h4>
				<div class="hint" style="margin-top: -0.25rem; margin-bottom: 0.25rem;">
					Add non-color variation to usernames (useful for limited color ranges)
				</div>
				${createToggleRow({ label: 'Vary font weight', id: 'settings-vary-weight', checked: styleConfig.varyWeight })}
				${createToggleRow({ label: 'Vary italic', id: 'settings-vary-italic', checked: styleConfig.varyItalic })}
				${createToggleRow({ label: 'Vary small-caps', id: 'settings-vary-case', checked: styleConfig.varyCase })}
				${createToggleRow({ label: 'Prepend icon', id: 'settings-prepend-icon', checked: styleConfig.prependIcon })}
				<div class="nc-input-row-stacked" id="icon-set-container" style="display: ${styleConfig.prependIcon ? 'block' : 'none'}">
					<label for="settings-icon-set">Icon set (space-separated)</label>
					<input type="text" id="settings-icon-set" value="${styleConfig.iconSet}" placeholder="● ○ ◆ ◇ ■ □ ▲ △ ★ ☆">
				</div>
				<hr />
				<h4>Backup</h4>
				${createInputRow({ type: 'button', label: 'Export settings to file', id: 'settings-export-file', buttonText: 'Save Settings File' })}
				${createInputRow({ type: 'button', label: 'Export settings to clipboard', id: 'settings-export-copy', buttonText: 'Copy to Clipboard' })}
				${createInputRow({ type: 'button', label: 'Import settings from file', id: 'settings-import-file', buttonText: 'Load Settings File' })}
				${createInputRow({ type: 'button', label: 'Import settings from clipboard', id: 'settings-import-paste', buttonText: 'Paste from Clipboard' })}
				<hr />
				<h4>Debug</h4>
				${createInputRow({ type: 'toggle', label: 'Enable debug mode', id: 'settings-debug-mode', checked: DEBUG })}
				${createInputRow({ type: 'button', label: 'Export debug log to file', id: 'settings-debug-export-file', buttonText: 'Save Debug File' })}
				${createInputRow({ type: 'button', label: 'Export debug log to clipboard', id: 'settings-debug-export-copy', buttonText: 'Copy to Clipboard' })}
				${createInputRow({ type: 'button', label: 'Report an issue', id: 'settings-report-issue', buttonText: 'Report Issue' })}
			`,
			buttons: [
				{ label: 'Save', class: 'save', onClick: (close) => {
					const s = getSettings();
					colorConfig = s.color;
					siteThemeConfig = s.siteTheme;
					styleConfig = s.style;
					saveColorConfig();
					saveSiteThemeConfig();
					saveStyleConfig();
					refreshAllColors();
					close();
				}},
				{ label: 'Reset', class: 'reset', onClick: () => {
					hueSlider.setValues([DEFAULT_COLOR_CONFIG.minHue, DEFAULT_COLOR_CONFIG.maxHue]);
					satSlider.setValues([DEFAULT_COLOR_CONFIG.minSaturation, DEFAULT_COLOR_CONFIG.maxSaturation]);
					litSlider.setValues([DEFAULT_COLOR_CONFIG.minLightness, DEFAULT_COLOR_CONFIG.maxLightness]);
					contrastSlider.setValue(DEFAULT_COLOR_CONFIG.contrastThreshold);
					hueSpreadSlider.setValue(DEFAULT_SITE_THEME_CONFIG.hueSpread);
					if (siteHueInput) siteHueInput.checked = DEFAULT_SITE_THEME_CONFIG.useHueRange;
					if (siteSaturationInput) siteSaturationInput.checked = DEFAULT_SITE_THEME_CONFIG.useSaturation;
					if (siteLightnessInput) siteLightnessInput.checked = DEFAULT_SITE_THEME_CONFIG.useLightness;
					if (varyWeightInput) varyWeightInput.checked = DEFAULT_STYLE_CONFIG.varyWeight;
					if (varyItalicInput) varyItalicInput.checked = DEFAULT_STYLE_CONFIG.varyItalic;
					if (varyCaseInput) varyCaseInput.checked = DEFAULT_STYLE_CONFIG.varyCase;
					if (prependIconInput) prependIconInput.checked = DEFAULT_STYLE_CONFIG.prependIcon;
					if (iconSetInput) iconSetInput.value = DEFAULT_STYLE_CONFIG.iconSet;
					if (iconSetContainer) iconSetContainer.style.display = DEFAULT_STYLE_CONFIG.prependIcon ? 'block' : 'none';
					presetSelect.value = '';
					updatePreview();
				}},
				{ label: 'Cancel', class: 'cancel', onClick: (close) => close() }
			]
		});

		const presetSelect = dialog.querySelector('#settings-preset');
		const previewRow = dialog.querySelector('#settings-preview');
		const previewNames = [
			'z0ylent', 'CyB3rPuNk', 'n30n_gh0st', 'ZeR0C00L', 'an0nym0us',
			'Ph4nt0m_', 'enki', 'genghis_khan', 'ByteMe99', 'neo', 'l1sb3th',
			'Da5idMeier', 'N3tRuNn3r', 'acidBurn', 'fr33Kevin', 'triNity'
		];
		previewNames.forEach(name => {
			const span = document.createElement('span');
			span.className = 'preview-nick';
			span.textContent = name;
			previewRow.appendChild(span);
		});

		// Create sliders using the reusable component
		const hueSlider = createSlider({
			type: 'range', min: 0, max: 360, values: [colorConfig.minHue, colorConfig.maxHue],
			label: 'Hue Range', onChange: updatePreview
		});
		const satSlider = createSlider({
			type: 'range', min: 0, max: 100, values: [colorConfig.minSaturation, colorConfig.maxSaturation],
			label: 'Saturation Range', onChange: updatePreview
		});
		const litSlider = createSlider({
			type: 'range', min: 0, max: 100, values: [colorConfig.minLightness, colorConfig.maxLightness],
			label: 'Lightness Range', onChange: updatePreview
		});
		const contrastSlider = createSlider({
			simple: true, min: 0, max: 50, value: colorConfig.contrastThreshold || 50,
			label: 'Contrast Threshold', onChange: updatePreview
		});
		const hueSpreadSlider = createSlider({
			simple: true, min: 5, max: 180, value: siteThemeConfig.hueSpread,
			label: 'Hue spread', onChange: () => onHueSpreadChange()
		});
		// Defined later, called via closure
		let onHueSpreadChange = () => {};

		dialog.querySelector('#hue-slider-container').appendChild(hueSlider.el);
		dialog.querySelector('#sat-slider-container').appendChild(satSlider.el);
		dialog.querySelector('#lit-slider-container').appendChild(litSlider.el);
		dialog.querySelector('#contrast-slider-container').appendChild(contrastSlider.el);
		dialog.querySelector('#hue-spread-container').appendChild(hueSpreadSlider.el);

		const siteHueInput = dialog.querySelector('#settings-site-hue');
		const siteSaturationInput = dialog.querySelector('#settings-site-saturation');
		const siteLightnessInput = dialog.querySelector('#settings-site-lightness');
		const varyWeightInput = dialog.querySelector('#settings-vary-weight');
		const varyItalicInput = dialog.querySelector('#settings-vary-italic');
		const varyCaseInput = dialog.querySelector('#settings-vary-case');
		const prependIconInput = dialog.querySelector('#settings-prepend-icon');
		const iconSetInput = dialog.querySelector('#settings-icon-set');
		const iconSetContainer = dialog.querySelector('#icon-set-container');

		function getSettings() {
			const [minHue, maxHue] = hueSlider.getValues();
			const [minSaturation, maxSaturation] = satSlider.getValues();
			const [minLightness, maxLightness] = litSlider.getValues();
			return {
				color: { minHue, maxHue, minSaturation, maxSaturation, minLightness, maxLightness, excludeRanges: colorConfig.excludeRanges, contrastThreshold: contrastSlider.getValue() },
				siteTheme: { useHueRange: siteHueInput?.checked || false, hueSpread: hueSpreadSlider.getValue(), useSaturation: siteSaturationInput?.checked || false, useLightness: siteLightnessInput?.checked || false },
				style: { varyWeight: varyWeightInput?.checked || false, varyItalic: varyItalicInput?.checked || false, varyCase: varyCaseInput?.checked || false, prependIcon: prependIconInput?.checked || false, iconSet: iconSetInput?.value || '' }
			};
		}

		function getEffective() {
			const s = getSettings();
			const eff = { ...s.color };
			if (siteThemeHsl) {
				if (s.siteTheme.useHueRange) { eff.minHue = (siteThemeHsl.h - s.siteTheme.hueSpread + 360) % 360; eff.maxHue = (siteThemeHsl.h + s.siteTheme.hueSpread) % 360; }
				if (s.siteTheme.useSaturation) { eff.minSaturation = eff.maxSaturation = siteThemeHsl.s; }
				if (s.siteTheme.useLightness) { eff.minLightness = eff.maxLightness = siteThemeHsl.l; }
			}
			return eff;
		}

		function updateGradients() {
			const [minH, maxH] = hueSlider.getValues();
			const [minS, maxS] = satSlider.getValues();
			const [minL, maxL] = litSlider.getValues();
			const midH = (minH + maxH) / 2, midS = (minS + maxS) / 2, midL = (minL + maxL) / 2;
			const hueStops = Array.from({ length: 13 }, (_, i) => {
				const hue = i * 30;
				return [hue, midS, midL, 1, (i * 30 / 360) * 100];
			});
			hueSlider.setGradient(hueStops);
			satSlider.setGradient([[midH, 0, midL, 1, 0], [midH, 100, midL, 1, 100]]);
			litSlider.setGradient([[midH, midS, 0, 1, 0], [midH, midS, 50, 1, 50], [midH, midS, 100, 1, 100]]);

			// Update range thumb colors to show their values
			hueSlider.setThumbColor([
				`hsl(${minH}, ${midS}%, ${midL}%)`,
				`hsl(${maxH}, ${midS}%, ${midL}%)`
			]);
			satSlider.setThumbColor([
				`hsl(${midH}, ${minS}%, ${midL}%)`,
				`hsl(${midH}, ${maxS}%, ${midL}%)`
			]);
			litSlider.setThumbColor([
				`hsl(${midH}, ${midS}%, ${minL}%)`,
				`hsl(${midH}, ${midS}%, ${maxL}%)`
			]);
		}

		function updatePreview() {
			updateGradients();
			const eff = getEffective();
			const bgLightness = getBackgroundLightness();
			previewRow.querySelectorAll('.preview-nick').forEach((el, i) => {
				const username = previewNames[i];

				// Check for overrides first (same logic as generateStyles)
				const s = getSettings().style;
				const hashStyles = getHashBasedStyleVariations(username);

				if (customNickColors[username] || MANUAL_OVERRIDES[username]) {
					const styles = generateStyles(username);
					el.style.cssText = '';
					Object.assign(el.style, styles);
				} else {
					// Generate from hash using current settings
					const hash = hashString(username);
					const hash2 = hashString(username + '_sat');
					const hash3 = hashString(username + '_lit');
					let range = eff.maxHue - eff.minHue; if (range <= 0) range += 360;
					let hue = eff.minHue + (hash % Math.max(1, range)); if (hue >= 360) hue -= 360;
					const satRange = eff.maxSaturation - eff.minSaturation;
					const sat = eff.minSaturation + (hash2 % Math.max(1, satRange + 1));
					const litRange = eff.maxLightness - eff.minLightness;
					const lit = eff.minLightness + (hash3 % Math.max(1, litRange + 1));
					const color = `hsl(${hue}, ${sat}%, ${lit}%)`;
					// Invert colors if contrast is below threshold
					const threshold = eff.contrastThreshold || 50;
					if (threshold > 0 && Math.abs(lit - bgLightness) < threshold) {
						el.style.backgroundColor = color;
						el.style.color = 'var(--color-bg, #000)';
						el.style.padding = '0 0.25em';
					} else {
						el.style.color = color;
						el.style.backgroundColor = '';
						el.style.padding = '';
					}

					// Apply style variations based on current toggle states
					el.style.fontWeight = s.varyWeight ? hashStyles.fontWeight : '';
					el.style.fontStyle = s.varyItalic ? hashStyles.fontStyle : '';
					el.style.fontVariant = s.varyCase ? hashStyles.fontVariant : '';
				}

				// Apply icon using helper
				const icon = getHashBasedIcon(username, s);
				el.textContent = icon ? icon + ' ' + username : username;
			});
		}

		presetSelect.addEventListener('change', () => {
			const p = PRESET_THEMES[presetSelect.value];
			if (p) {
				hueSlider.setValues([p.color.minHue, p.color.maxHue]);
				satSlider.setValues([p.color.minSaturation, p.color.maxSaturation]);
				litSlider.setValues([p.color.minLightness, p.color.maxLightness]);
				contrastSlider.setValue(p.color.contrastThreshold || 50);
				updatePreview();
			}
		});

		// Update toggle visual state
		function updateToggle(checkbox) {
			const label = checkbox.closest('.nc-toggle');
			if (!label) return;
			const isChecked = checkbox.checked;
			const valueEl = label.querySelector('.nc-toggle-value');
			const track = label.querySelector('.nc-toggle-track');
			const thumb = label.querySelector('.nc-toggle-thumb');
			if (valueEl) valueEl.textContent = isChecked ? 'true' : 'false';
			if (track) {
				track.classList.toggle('active', isChecked);
			}
			if (thumb) {
				thumb.classList.toggle('pos-end', isChecked);
				thumb.classList.toggle('pos-start', !isChecked);
			}
		}

		// Get slider container references for enabling/disabling
		const hueSliderContainer = dialog.querySelector('#hue-slider-container');
		const hueSpreadContainer = dialog.querySelector('#hue-spread-container');
		const satSliderContainer = dialog.querySelector('#sat-slider-container');
		const litSliderContainer = dialog.querySelector('#lit-slider-container');

		// Update slider container enabled/disabled state
		function updateSliderState(container, disabled) {
			if (!container) return;
			container.style.pointerEvents = disabled ? 'none' : 'auto';
			// Grey out thumbs when disabled
			const thumbs = container.querySelectorAll('.nc-slider-thumb');
			thumbs.forEach(thumb => {
				thumb.style.background = disabled ? 'var(--color-fg-dim, #666)' : '';
				thumb.style.cursor = disabled ? 'default' : '';
			});
		}

		// Store original slider values for when toggles are disabled
		let savedHueValues = [colorConfig.minHue, colorConfig.maxHue];
		let savedSatValues = [colorConfig.minSaturation, colorConfig.maxSaturation];
		let savedLitValues = [colorConfig.minLightness, colorConfig.maxLightness];

		// Update sliders to show site theme values when toggled on
		function updateSlidersForSiteTheme() {
			if (siteThemeHsl) {
				if (siteHueInput?.checked) {
					const spread = hueSpreadSlider.getValue();
					const minHue = (siteThemeHsl.h - spread + 360) % 360;
					const maxHue = (siteThemeHsl.h + spread) % 360;
					hueSlider.setValues([minHue, maxHue]);
				}
				if (siteSaturationInput?.checked) {
					satSlider.setValues([siteThemeHsl.s, siteThemeHsl.s]);
				}
				if (siteLightnessInput?.checked) {
					litSlider.setValues([siteThemeHsl.l, siteThemeHsl.l]);
				}
			}
			updateGradients();
		}

		[siteHueInput, siteSaturationInput, siteLightnessInput].forEach(el => {
			if (!el) return;
			el.addEventListener('change', () => {
				updateToggle(el);

				// Update slider states based on which toggle changed
				if (el === siteHueInput) {
					const isChecked = el.checked;
					updateSliderState(hueSliderContainer, isChecked);
					if (hueSpreadContainer) {
						hueSpreadContainer.style.display = isChecked ? 'block' : 'none';
					}
					if (isChecked) {
						// Save current values and show site theme hue range
						savedHueValues = hueSlider.getValues();
					} else {
						// Restore saved values
						hueSlider.setValues(savedHueValues);
					}
				} else if (el === siteSaturationInput) {
					updateSliderState(satSliderContainer, el.checked);
					if (el.checked) {
						savedSatValues = satSlider.getValues();
					} else {
						satSlider.setValues(savedSatValues);
					}
				} else if (el === siteLightnessInput) {
					updateSliderState(litSliderContainer, el.checked);
					if (el.checked) {
						savedLitValues = litSlider.getValues();
					} else {
						litSlider.setValues(savedLitValues);
					}
				}

				updateSlidersForSiteTheme();
				updatePreview();
			});
		});

		// Style variation toggles
		[varyWeightInput, varyItalicInput, varyCaseInput, prependIconInput].forEach(el => {
			if (!el) return;
			el.addEventListener('change', () => {
				updateToggle(el);
				updatePreview();
			});
		});

		// Show/hide icon set input when prepend icon is toggled
		if (prependIconInput) {
			prependIconInput.addEventListener('change', () => {
				if (iconSetContainer) iconSetContainer.style.display = prependIconInput.checked ? 'block' : 'none';
			});
		}

		// Update preview when icon set changes
		if (iconSetInput) {
			iconSetInput.addEventListener('input', updatePreview);
		}

		// Set up hue spread change handler (defined earlier as empty, now assigned)
		onHueSpreadChange = () => {
			if (siteHueInput?.checked) {
				updateSlidersForSiteTheme();
			}
			updatePreview();
		};

		// Initialize slider states if toggles are already on
		if (siteHueInput?.checked) updateSliderState(hueSliderContainer, true);
		if (siteSaturationInput?.checked) updateSliderState(satSliderContainer, true);
		if (siteLightnessInput?.checked) updateSliderState(litSliderContainer, true);

		// Export/Import buttons
		const exportFileBtn = dialog.querySelector('#settings-export-file');
		const exportCopyBtn = dialog.querySelector('#settings-export-copy');
		const importFileBtn = dialog.querySelector('#settings-import-file');
		const importPasteBtn = dialog.querySelector('#settings-import-paste');
		const debugModeInput = dialog.querySelector('#settings-debug-mode');
		const debugExportFileBtn = dialog.querySelector('#settings-debug-export-file');
		const debugExportCopyBtn = dialog.querySelector('#settings-debug-export-copy');
		const reportIssueBtn = dialog.querySelector('#settings-report-issue');

		if (exportFileBtn) {
			exportFileBtn.addEventListener('click', () => {
				const data = exportSettings();
				const timestamp = new Date().toISOString().slice(0, 10);
				downloadJson(data, `nick-colors-settings-${timestamp}.json`);
			});
		}

		if (exportCopyBtn) {
			exportCopyBtn.addEventListener('click', () => {
				copySettingsToClipboard();
			});
		}

		if (importFileBtn) {
			importFileBtn.addEventListener('click', () => {
				promptImportFile();
			});
		}

		if (importPasteBtn) {
			importPasteBtn.addEventListener('click', () => {
				showPasteDialog();
			});
		}

		if (debugModeInput) {
			debugModeInput.addEventListener('change', () => {
				updateToggle(debugModeInput);
				DEBUG = debugModeInput.checked;
				saveDebugMode();
			});
		}

		if (debugExportFileBtn) {
			debugExportFileBtn.addEventListener('click', () => {
				const text = exportDebugLogs();
				const timestamp = new Date().toISOString().slice(0, 10);
				downloadText(text, `nick-colors-debug-${timestamp}.txt`);
			});
		}

		if (debugExportCopyBtn) {
			debugExportCopyBtn.addEventListener('click', async () => {
				const text = exportDebugLogs();
				try {
					await navigator.clipboard.writeText(text);
					alert('Debug log copied to clipboard');
				} catch (err) {
					alert(`Failed to copy: ${err.message}`);
				}
			});
		}

		if (reportIssueBtn) {
			reportIssueBtn.addEventListener('click', () => {
				const debugLog = exportDebugLogs();
				const subject = encodeURIComponent('Nick Colors Issue Report');
				const body = encodeURIComponent(`
== ISSUE REPORT ==

**What is your username on cyberspace.online?**


**What issue are you experiencing?**
(Describe the problem you're seeing)


**What page did you see this on?**
${window.location.href}

**Steps to reproduce:**
(What were you doing when the issue occurred?)
1.
2.
3.

**Any error messages?**
(Paste any errors from the browser console, or attach screenshots)



== DEBUG LOG ==

${debugLog}
`.trim());
				window.open(`mailto:hey@z0m.bi?subject=${subject}&body=${body}`, '_blank');
			});
		}

		// Initialize sliders to show site theme values if toggles are already on
		updateSlidersForSiteTheme();
		updatePreview();
	}

	// =====================================================
	// INITIALIZATION
	// =====================================================

	// Add right-click context menu to colored usernames and mentions
	document.addEventListener('contextmenu', (e) => {
		const target = e.target.closest('[data-nick-colored], [data-mention-colored]');
		if (target && target.dataset.username) {
			e.preventDefault();
			// Use raw styles for picker so sliders show raw saved values
			createColorPicker(target.dataset.username, getRawStylesForPicker(target.dataset.username));
		}
	});

	// Greasemonkey/Tampermonkey menu commands
	// Support both GM_registerMenuCommand (Tampermonkey) and GM.registerMenuCommand (Greasemonkey 4.x)
	const registerMenuCommand = (typeof GM_registerMenuCommand === 'function')
		? GM_registerMenuCommand
		: (typeof GM !== 'undefined' && typeof GM.registerMenuCommand === 'function')
			? GM.registerMenuCommand
			: null;

	if (registerMenuCommand) {
		registerMenuCommand('Nick Colors Settings', createSettingsPanel);
		registerMenuCommand('Refresh Nick Colors', refreshAllColors);
		registerMenuCommand('Clear All Custom Colors', () => {
			if (confirm('Clear all custom color overrides?')) {
				customNickColors = {};
				saveCustomNickColors();
				refreshAllColors();
			}
		});
	}

	// Fetch remote overrides if configured
	function fetchOverrides() {
		if (!OVERRIDES_URL) return Promise.resolve();

		return new Promise((resolve) => {
			// Use GM_xmlhttpRequest if available (bypasses CORS)
			if (typeof GM_xmlhttpRequest !== 'undefined') {
				GM_xmlhttpRequest({
					method: 'GET',
					url: OVERRIDES_URL,
					onload: (response) => {
						try {
							const remoteOverrides = JSON.parse(response.responseText);
							// Merge remote overrides (local MANUAL_OVERRIDES takes precedence)
							MANUAL_OVERRIDES = { ...remoteOverrides, ...MANUAL_OVERRIDES };
							console.log('[Nick Colors] Loaded remote overrides:', Object.keys(remoteOverrides).length);
						} catch (e) {
							console.error('[Nick Colors] Failed to parse remote overrides:', e);
						}
						resolve();
					},
					onerror: (e) => {
						console.error('[Nick Colors] Failed to fetch remote overrides:', e);
						resolve();
					}
				});
			} else {
				// Fallback to fetch (may fail due to CORS)
				fetch(OVERRIDES_URL)
					.then(r => r.json())
					.then(remoteOverrides => {
						MANUAL_OVERRIDES = { ...remoteOverrides, ...MANUAL_OVERRIDES };
						console.log('[Nick Colors] Loaded remote overrides:', Object.keys(remoteOverrides).length);
					})
					.catch(e => console.error('[Nick Colors] Failed to fetch remote overrides:', e))
					.finally(resolve);
			}
		});
	}

	// Initial colorization (after fetching overrides)
	fetchOverrides().then(() => {
		colorizeAll();
	});

	// Watch for new content
	const observer = new MutationObserver((mutations) => {
		let shouldColorize = false;
		for (const mutation of mutations) {
			if (mutation.addedNodes.length > 0) {
				shouldColorize = true;
				break;
			}
		}
		if (shouldColorize) {
			colorizeAll();
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

	console.log('[Nick Colors] Loaded. Right-click any colored username to customize.');

})();
