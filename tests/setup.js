/**
 * Test setup - loads source files and exposes functions for testing
 *
 * Since the userscript is designed to run in a browser with GM APIs,
 * we need to mock those and load the source files in order.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { JSDOM } from 'jsdom';

// Create a jsdom instance with a basic HTML structure
const dom = new JSDOM(`
<!DOCTYPE html>
<html>
<head>
	<style>
		:root {
			--color-bg: #0a0a0a;
			--color-fg: #e0e0e0;
		}
	</style>
</head>
<body>
	<div id="chat"></div>
</body>
</html>
`, { url: 'https://cyberspace.online/' });

// Set up global browser APIs
global.window = dom.window;
global.document = dom.window.document;
global.localStorage = dom.window.localStorage;
global.getComputedStyle = dom.window.getComputedStyle;
global.MutationObserver = dom.window.MutationObserver;
global.navigator = dom.window.navigator;

// Mock GM APIs
global.GM_setValue = (key, value) => localStorage.setItem('nickColors_' + key, value);
global.GM_getValue = (key, defaultValue) => {
	const val = localStorage.getItem('nickColors_' + key);
	return val !== null ? val : defaultValue;
};
global.GM_registerMenuCommand = () => {};
global.GM_xmlhttpRequest = () => {};

// Load source files in order and execute them
const SRC_DIR = join(process.cwd(), 'src');

const sourceFiles = [
	'helper-functions.js',
	'header.js',
	'import-export.js',
	'send-message.js',
	'debug.js',
	'nick-style-functions.js',
	'nick-functions.js',
	'slider-component.js',
	'dialog-component.js',
	'settings-engine.js',
	'user-settings-panel.js',
	'site-settings-panel.js',
	// Note: init.js is excluded as it has side effects
];

// Concatenate all source files
let code = '';
for (const file of sourceFiles) {
	const filePath = join(SRC_DIR, file);
	try {
		code += readFileSync(filePath, 'utf8') + '\n\n';
	} catch (e) {
		console.warn(`Warning: Could not load ${file}`);
	}
}

// Execute the code in global context to define all functions
const script = new Function(code + `
	// Export functions to global scope for testing
	Object.assign(this, {
		// Helper functions
		hexToRgb,
		hexToHsl,
		rgbToHsl,
		hslToRgb,
		getRelativeLuminance,
		getContrastRatio,
		toKebabCase,
		toCamelCase,
		stylesToCssString,
		parseColor,
		getColorFormat,
		mapHueToRange,
		mapToRange,
		mapColorToRange,
		adjustContrastToThreshold,
		pickBestContrastingColor,
		applyRangeMappingToColor,
		getEffectiveSiteConfig,
		saveSiteConfig,
		hashString,
		getThemeColors,
		getThemeDefaultSettings,

		// Import/Export
		getNonDefaultValues,
		exportSettings,
		importSettings,
		minifyKeys,
		maxifyKeys,

		// Nick style functions
		getNickBase,
		getMappedNickColor,
		getRawStylesForPicker,
		generateStyles,
		getHashBasedIcon,
		getHashBasedStyleVariations,
		applyStyles,

		// Nick functions
		isValidUsername,
		extractUsername,
		isLikelyUsername,
		colorizeAll,
		colorizeMentions,
		refreshAllColors,

		// Settings engine
		createSettingsEngine,

		// Config objects
		siteConfig,
		customNickColors,
		DEFAULT_SITE_CONFIG,
		MANUAL_OVERRIDES,
	});
`);

script.call(global);

// Export for use in tests
export { dom };
