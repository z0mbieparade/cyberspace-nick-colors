// =====================================================
// GM API FALLBACKS (for testing outside userscript manager)
// =====================================================

// Detect which GM API is available:
// 1. Old style: GM_setValue/GM_getValue (synchronous)
// 2. New style: GM.setValue/GM.getValue (async/Promise-based)
// 3. Fallback: localStorage
const _hasOldGM = typeof GM_setValue === 'function';
const _hasNewGM = typeof GM !== 'undefined' && typeof GM.setValue === 'function';

// Wrapper functions that handle both sync and async APIs uniformly
// For setValue: fire-and-forget (don't need to wait), also update cache
const _GM_setValue = _hasOldGM ? GM_setValue :
	_hasNewGM ? (key, value) => { _gmCache[key] = value; GM.setValue(key, value); } :
	(key, value) => localStorage.setItem('nickColors_' + key, value);

// For getValue: need async handling for new API
// We'll use a sync wrapper that returns cached values, with async refresh
let _gmCache = {};
const _GM_getValue = _hasOldGM ? GM_getValue :
	_hasNewGM ? (key, defaultValue) => {
		// Return cached value if available, otherwise default
		// Cache is populated by _initGMCache()
		return (key in _gmCache) ? _gmCache[key] : defaultValue;
	} :
	(key, defaultValue) => {
		const val = localStorage.getItem('nickColors_' + key);
		return val !== null ? val : defaultValue;
	};

// Async initialization for new GM API - loads all values into cache
async function _initGMCache() {
	if (!_hasNewGM) return;
	try {
		const keys = ['debugMode', 'siteConfig', 'customNickColors'];
		for (const key of keys) {
			const val = await GM.getValue(key);
			if (val !== undefined) _gmCache[key] = val;
		}
	} catch (e) {
		console.error('[Nick Colors] Failed to load GM cache:', e);
	}
}

// Migrate data from localStorage to GM storage (one-time migration)
async function _migrateFromLocalStorage() {
	const keys = ['debugMode', 'siteConfig', 'customNickColors'];

	for (const key of keys) {
		const lsKey = 'nickColors_' + key;
		const lsVal = localStorage.getItem(lsKey);

		if (lsVal !== null) {
			// Check if GM storage already has this key
			const gmVal = _hasNewGM ? await GM.getValue(key) : _GM_getValue(key, null);

			if (gmVal === undefined || gmVal === null) {
				// Migrate from localStorage to GM
				if (_hasNewGM) {
					await GM.setValue(key, lsVal);
					_gmCache[key] = lsVal;
				} else if (_hasOldGM) {
					GM_setValue(key, lsVal);
				}
			}
		}
	}
}

// Initialize cache and run migration if using new GM API
if (_hasNewGM) {
	_initGMCache().then(async () => {
		// Try to migrate from localStorage
		await _migrateFromLocalStorage();

		// Reload config after cache is populated (and possibly migrated)
		if (typeof loadSiteConfig === 'function') loadSiteConfig();
		if (typeof loadCustomNickColors === 'function') loadCustomNickColors();
		if (typeof colorizeAll === 'function') colorizeAll();
	});
} else if (_hasOldGM) {
	// Also migrate for old GM API
	_migrateFromLocalStorage();
}

// Helper to convert hex to RGB (0-255)
function hexToRgb(hex) {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) return null;
	return {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	};
}

// Helper to convert hex to HSL
function hexToHsl(hex) {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;

	let r = rgb.r / 255;
	let g = rgb.g / 255;
	let b = rgb.b / 255;

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

// Convert RGB to HSL
function rgbToHsl(r, g, b) {
	r /= 255; g /= 255; b /= 255;
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
	return { h: h * 360, s: s * 100, l: l * 100 };
}

// Convert HSL to RGB (0-255)
function hslToRgb(h, s, l) {
	h = h / 360;
	s = s / 100;
	l = l / 100;

	let r, g, b;
	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p, q, t) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1/6) return p + (q - p) * 6 * t;
			if (t < 1/2) return q;
			if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
			return p;
		};
		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;
		r = hue2rgb(p, q, h + 1/3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1/3);
	}
	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	};
}

// Figure out what format a color is in
function getColorFormat(color){
	if(typeof color === 'string') {
		if(color.match(/hsl\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?\)/))
			return 'hsl-string';
		else if(color.match(/rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/))
			return 'rgb-string';
		else if(color.match(/^#([a-f\d]{6}|[a-f\d]{3})$/i))
			return 'hex-string';
	} else if(typeof color === 'object') {
		if (color.h !== undefined && color.s !== undefined && color.l !== undefined)
			return 'hsl-object';
		else if (color.r !== undefined && color.g !== undefined && color.b !== undefined)
			return 'rgb-object';
	}
	return null;
}

// Parse any color string or object to color object (HSL by default)
function parseColor(color, colorFormat = 'hsl') 
{
	if (!color) return null;

	let hslMatch, rgbMatch, hexMatch;
	if(typeof color === 'string') {
		// Support both hsl/hsla and rgb/rgba formats (ignore alpha channel)
		hslMatch = color.match(/hsla?\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?(?:,\s*[\d.]+)?\)/);
		rgbMatch = color.match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*[\d.]+)?\)/);
		hexMatch = color.match(/^#([a-f\d]{6}|[a-f\d]{3})$/i);
	} else if(typeof color === 'object') {
		if (color.h !== undefined && color.s !== undefined && color.l !== undefined)
			hslMatch = [null, color.h, color.s, color.l];
		else if (color.r !== undefined && color.g !== undefined && color.b !== undefined)
			rgbMatch = [null, color.r, color.g, color.b];
	}

	const formatType = colorFormat.match('-string') ? 'string' : 'object';
	colorFormat = colorFormat.replace(/-string|-object$/, '');

	if(colorFormat === 'hsl') {
		if (hslMatch)
			return formatType === 'string' ?
			`hsl(${(+hslMatch[1]).toFixed(1)}, ${(+hslMatch[2]).toFixed(1)}%, ${(+hslMatch[3]).toFixed(1)}%)` :
			{ h: +hslMatch[1], s: +hslMatch[2], l: +hslMatch[3] };
		else if (rgbMatch){
			const hsl = rgbToHsl(+rgbMatch[1], +rgbMatch[2], +rgbMatch[3]);
			return formatType === 'string' ?
				`hsl(${hsl.h.toFixed(1)}, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%)` :
				{ h: hsl.h, s: hsl.s, l: hsl.l };
		}
		else if (hexMatch)
			return hexToHsl(color);
	} else if(colorFormat === 'rgb') {
		if (rgbMatch)
			return formatType === 'string' ?
				`rgb(${(+rgbMatch[1]).toFixed(1)}, ${(+rgbMatch[2]).toFixed(1)}, ${(+rgbMatch[3]).toFixed(1)})` :
				{ r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] };
		else if (hslMatch) {
			const rgb = hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]);
			return formatType === 'string' ?
				`rgb(${rgb.r.toFixed(1)}, ${rgb.g.toFixed(1)}, ${rgb.b.toFixed(1)})` :
				{ r: rgb.r, g: rgb.g, b: rgb.b };
		}
		else if (hexMatch)
			return hexToRgb(color);
	} else if(colorFormat === 'hex') {
		if (hexMatch)
			return color;
		else if (hslMatch)
			return rgbToHex(hslToRgb(+hslMatch[1], +hslMatch[2], +hslMatch[3]));
		else if (rgbMatch)
			return rgbToHex({ r: +rgbMatch[1], g: +rgbMatch[2], b: +rgbMatch[3] });
	}

	return null;
}

// Calculate relative luminance per WCAG 2.1
// https://www.w3.org/WAI/GL/wiki/Relative_luminance
// black = 0, white = 1
function getRelativeLuminance(color) {

	const rgb = parseColor(color, 'rgb');

	if (!rgb) return 0;
	const { r, g, b } = rgb;

	// Convert 0-255 to 0-1
	const rsRGB = r / 255;
	const gsRGB = g / 255;
	const bsRGB = b / 255;

	// Apply gamma correction
	const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
	const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
	const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

	// Weighted sum (human eye is most sensitive to green)
	return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

// Calculate WCAG contrast ratio between two colors
// Returns a value from 1 (no contrast) to 21 (max contrast)
// https://www.w3.org/WAI/GL/wiki/Contrast_ratio
function getContrastRatio(color1, color2) {
	const L1 = getRelativeLuminance(color1);
	const L2 = getRelativeLuminance(color2);

	const lighter = Math.max(L1, L2);
	const darker = Math.min(L1, L2);

	return (lighter + 0.05) / (darker + 0.05);
}

// Helper to get theme colors from preset by name
function getPresetTheme(themeName) {
	if (!themeName) themeName = siteThemeName;
	if (!themeName) return null;

	// Try exact match first, then case-insensitive
	if (PRESET_THEMES[themeName]) return PRESET_THEMES[themeName];
	const lowerName = themeName.toLowerCase();
	for (const [name, preset] of Object.entries(PRESET_THEMES)) {
		if (name.toLowerCase() === lowerName) return preset;
	}
	return null;
}

// Get theme variables from 1. custom_theme 2. preset_theme 3. default
// if colorFormat is specified, return colors in that format
function getThemeColors(themeName = null, colorFormat = null)
{
	const root = document.documentElement;
	const style = getComputedStyle(root);

	// Get preset theme from data-theme attribute
	themeName = themeName ?? root.dataset.theme ?? document.body?.dataset?.theme;
	const presetTheme = themeName ? getPresetTheme(themeName) : null;

	// Map custom_theme keys to our keys (custom_theme uses different property names)
	const customTheme = siteCustomTheme ? {
		bg: siteCustomTheme.bg,
		fg: siteCustomTheme.fg,
		fgDim: siteCustomTheme.fgDim || siteCustomTheme.dim,
		border: siteCustomTheme.border,
		codeBg: siteCustomTheme.codeBg || siteCustomTheme.code_bg,
	} : null;

	// Default fallbacks (used if no theme or theme missing property)
	const defaults = PRESET_THEMES['Full Spectrum'].colors;

	// Helper to check if a color value is valid (not transparent, not empty)
	function isValidColor(value) {
		if (!value || value === 'transparent' || value === 'none') {
			return false;
		}
		// Accept hex, rgb(), hsl(), rgba(), hsla()
		if (hexToRgb(value)) return true;
		if (value.startsWith('rgb') || value.startsWith('hsl')) return true;
		return false;
	}

	// Get safe color with fallback chain: CSS var > custom_theme > preset > default
	function getSafeColor(varName, themeKey) {
		// 1. Try CSS variable
		const cssValue = style.getPropertyValue(varName).trim();
		if (isValidColor(cssValue)) {
			return cssValue;
		}

		// 2. Try custom_theme (user's custom colors from localStorage)
		if (customTheme && isValidColor(customTheme[themeKey])) {
			return customTheme[themeKey];
		}

		// 3. Try preset theme
		if (presetTheme && presetTheme.colors && isValidColor(presetTheme.colors[themeKey])) {
			return presetTheme.colors[themeKey];
		}

		// 4. Fall back to defaults
		return defaults[themeKey];
	}

	let invertedBg = getSafeColor('--color-fg', 'fg');
	let invertedFg = getSafeColor('--color-bg', 'bg');

	if(presetTheme?.logic)
	{
		const invertedContainerBg = presetTheme.logic.invertedContainerBg ?? 'fg';
		const invertedContainerFg = presetTheme.logic.invertedContainerFg ?? 'bg';

		const invertedContainerBgCss = '--color-' + toKebabCase(invertedContainerBg);
		const invertedContainerFgCss = '--color-' + toKebabCase(invertedContainerFg);

		invertedBg = getSafeColor(invertedContainerBgCss, invertedContainerBg);
		invertedFg = getSafeColor(invertedContainerFgCss, invertedContainerFg);
	}

	const colors = {
		bg: getSafeColor('--color-bg', 'bg'),
		fg: getSafeColor('--color-fg', 'fg'),
		fgDim: getSafeColor('--color-fg-dim', 'fgDim'),
		border: getSafeColor('--color-border', 'border'),
		codeBg: getSafeColor('--color-code-bg', 'codeBg'),

		invertedBg, invertedFg,

		error: '#ff6b6b',
		warn: '#ffd93d',
		success: '#6bcb77',
		info: '#4d96ff',
		errorBg: '#1a0d0d',
		warnBg: '#1a250d',
		successBg: '#152a15',
		infoBg: '#15152a'
	}
	
	// Generate semantic colors based on fg color's saturation/lightness
	// Shift hue to standard values: error=0, warn=45, success=120, info=210
	const fgHsl = hexToHsl(colors.fg) || parseColor(colors.fg, 'hsl');
	const bgHsl = hexToHsl(colors.bg) || parseColor(colors.bg, 'hsl');

	// Helper to adjust lightness until we get good contrast against bg
	function getContrastSafeColor(hue, sat, lit, bgRgb, minContrast = 4.5) {
		// Try the initial lightness
		let testLit = lit;
		let rgb = hslToRgb(hue, sat, testLit);
		let contrast = getContrastRatio(rgb, bgRgb);

		// If contrast is good, return as-is
		if (contrast >= minContrast) {
			return `hsl(${hue}, ${sat}%, ${testLit}%)`;
		}

		// Determine if we need to go lighter or darker based on bg luminance
		const bgLum = getRelativeLuminance(bgRgb);
		const direction = bgLum > 0.5 ? -5 : 5; // Dark bg = go lighter, light bg = go darker

		// Adjust lightness until contrast is good (max 15 iterations)
		for (let i = 0; i < 15; i++) {
			testLit = Math.max(5, Math.min(95, testLit + direction));
			rgb = hslToRgb(hue, sat, testLit);
			contrast = getContrastRatio(rgb, bgRgb);
			if (contrast >= minContrast) {
				break;
			}
		}

		return `hsl(${hue}, ${sat}%, ${testLit}%)`;
	}

	if (fgHsl && bgHsl) {
		// Use fg's saturation and lightness as starting point
		let sat = Math.max(fgHsl.s, 50);
		let lit = fgHsl.l;

		// If fg is too dark or too light, start from a middle ground
		if (lit < 20 || lit > 80) {
			lit = 50;
			sat = Math.max(sat, 70);
		}

		// Get bg as RGB for contrast checking
		const bgRgb = hslToRgb(bgHsl.h, bgHsl.s, bgHsl.l);

		colors.error = getContrastSafeColor(0, sat, lit, bgRgb);
		colors.warn = getContrastSafeColor(45, sat, lit, bgRgb);
		colors.success = getContrastSafeColor(120, sat, lit, bgRgb);
		colors.info = getContrastSafeColor(210, sat, lit, bgRgb);
	}

	if (bgHsl) {
		// Use bg's saturation and lightness for background variants
		let sat = Math.max(bgHsl.s, 20);
		let lit = bgHsl.l;

		// If bg is pure black, add a subtle tint
		if (lit < 5) {
			lit = 10;
			sat = Math.max(sat, 30);
		}
		// If bg is pure white, darken slightly for visibility
		else if (lit > 95) {
			lit = 90;
			sat = Math.max(sat, 30);
		}

		colors.errorBg = `hsl(0, ${sat}%, ${lit}%)`;
		colors.warnBg = `hsl(45, ${sat}%, ${lit}%)`;
		colors.successBg = `hsl(120, ${sat}%, ${lit}%)`;
		colors.infoBg = `hsl(210, ${sat}%, ${lit}%)`;

		// Ensure alert fg/bg pairs have good contrast
		if (colors.error && colors.errorBg) {
			const adjusted = adjustContrastToThreshold(colors.errorBg, colors.error, 4.5, 'hsl-string');
			colors.error = adjusted.colorAdjust;
			colors.errorBg = adjusted.colorCompare;
		}
		if (colors.warn && colors.warnBg) {
			const adjusted = adjustContrastToThreshold(colors.warnBg, colors.warn, 4.5, 'hsl-string');
			colors.warn = adjusted.colorAdjust;
			colors.warnBg = adjusted.colorCompare;
		}
		if (colors.success && colors.successBg) {
			const adjusted = adjustContrastToThreshold(colors.successBg, colors.success, 4.5, 'hsl-string');
			colors.success = adjusted.colorAdjust;
			colors.successBg = adjusted.colorCompare;
		}
		if (colors.info && colors.infoBg) {
			const adjusted = adjustContrastToThreshold(colors.infoBg, colors.info, 4.5, 'hsl-string');
			colors.info = adjusted.colorAdjust;
			colors.infoBg = adjusted.colorCompare;
		}
	}

	if(colorFormat)
	{
		for(const key in colors)
		{
			const color = colors[key];
			const parsed = parseColor(color, colorFormat);
			if(parsed) colors[key] = parsed;
		}
	}
	
	return colors;
}

function getThemeDefaultSettings(themeName) 
{
	themeName = themeName ?? siteThemeName ?? 'Full Spectrum';
	const presetTheme = getPresetTheme(themeName);
	const themeColors = getThemeColors(themeName);
	const themeColorVariables = getThemeColors(themeName, 'hsl');

	return {
		theme: themeName,
		colors: themeColors,
		colorVariables: themeColorVariables,
		settings: {
			...DEFAULT_SITE_CONFIG,
			...presetTheme?.settings || {},
		}
	};
}

// Convert camelCase to kebab-case
function toKebabCase(str) {
	return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Convert kebab-case to camelCase
function toCamelCase(str) {
	return str.replace(/-([a-z])/g, (_, p1) => p1.toUpperCase());
}

// Parse CSS text into style object
function cssStringToStyles(cssText) {
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

// Convert style object to CSS string
function stylesToCssString(styles, separator = '; ') {
	return Object.entries(styles)
		.map(([k, v]) => `${toKebabCase(k)}: ${v}`)
		.join(separator);
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
	const hsl = parseColor(color, 'hsl');
	if (!hsl) return color; // Can't parse, return as-is

	const mappedHue = mapHueToRange(hsl.h, effectiveConfig.minHue, effectiveConfig.maxHue);
	const mappedSat = mapToRange(hsl.s, effectiveConfig.minSaturation, effectiveConfig.maxSaturation);
	const mappedLit = mapToRange(hsl.l, effectiveConfig.minLightness, effectiveConfig.maxLightness);

	return `hsl(${mappedHue}, ${mappedSat}%, ${mappedLit}%)`;
}

function pickBestContrastingColor(color, colorFormat = 'hsl', options = {})
{
	options = {
		themeName: siteThemeName,
		isInverted: false,
		...options
	};

	const themeVariables = getThemeColors(options.themeName, 'hsl');
	let bgColor = options.isInverted ? themeVariables.invertedBg : themeVariables.bg;
	let fgColor = options.isInverted ? themeVariables.invertedFg : themeVariables.fg;

	let bgContrast = getContrastRatio(bgColor, color);
	let fgContrast = getContrastRatio(fgColor, color);

	const useBgColor = bgContrast > fgContrast;
	const contrastColor = useBgColor ? parseColor(bgColor, colorFormat) : parseColor(fgColor, colorFormat);

	return contrastColor;
}

function adjustContrastToThreshold(colorCompare, colorAdjust, threshold = 4.5, colorFormat = 'hsl')
{
	let contrast = getContrastRatio(colorCompare, colorAdjust);
	const colors = { adjusted: false };

	const hslCompare = parseColor(colorCompare, 'hsl');
	const hslAdjust = parseColor(colorAdjust, 'hsl');

	// If either color can't be parsed, return early with original colors
	if (!hslCompare || !hslAdjust) {
		colors.colorAdjust = colorAdjust;
		colors.colorCompare = colorCompare;
		colors.contrast = contrast;
		colors.loopCount = 0;
		return colors;
	}

	let loopCount = 0;

	while(contrast < threshold && loopCount < 20)
	{
		const luminanceCompare = getRelativeLuminance(hslCompare);
		const luminanceAdjust = getRelativeLuminance(hslAdjust);

		// if the adjust color is already black or white, adjust the compare color
		if(hslAdjust.l === 0 || hslAdjust.l === 100)
		{
			// if compare color is lighter than adjust color, we need to lighten the compare color
			if(luminanceCompare > luminanceAdjust)
				hslCompare.l += 5;
			else
				hslCompare.l -= 5;
		}
		else 
		{
			// if adjust color is lighter than compare color, we need to lighten the adjust color
			if(luminanceAdjust > luminanceCompare)
				hslAdjust.l += 5;
			else
				hslAdjust.l -= 5;
		}

		contrast = getContrastRatio(hslCompare, hslAdjust);
		loopCount++;

		colors.adjusted = true;
	}

	colors.colorAdjust = parseColor(hslAdjust, colorFormat);
	colors.colorCompare = parseColor(hslCompare, colorFormat);
	colors.contrast = contrast;
	colors.loopCount = loopCount;

	return colors;
}

// Apply range mapping to a color based on config
function applyRangeMappingToColor(color, colorFormat = 'hsl', options = {})
{
	options = {
		mapHue: true,
		mapSat: true,
		mapLit: true,
		effectiveConfig: getEffectiveSiteConfig(),
		...options
	}

	if(!color) return null;

	const hsl = parseColor(color, 'hsl');
	if(!hsl) return null;

	const h = options.mapHue ? mapHueToRange(hsl.h, options.effectiveConfig.minHue ?? 0, options.effectiveConfig.maxHue ?? 360) : hsl.h;
	const s = options.mapSat ? mapToRange(hsl.s, options.effectiveConfig.minSaturation ?? 0, options.effectiveConfig.maxSaturation ?? 100) : hsl.s;
	const l = options.mapLit ? mapToRange(hsl.l, options.effectiveConfig.minLightness ?? 0, options.effectiveConfig.maxLightness ?? 100) : hsl.l;

	return parseColor({ h, s, l }, colorFormat);
}

// Function to get effective site config (applies site theme overrides)
function getEffectiveSiteConfig() {
	const config = { ...siteConfig };
	const themeColors = getThemeColors(null, 'hsl');
	const siteThemeFgHSL = parseColor(themeColors?.fg, 'hsl') || { h: 0, s: 0, l: 0 };

	if (siteConfig.useSiteThemeHue) {
		config.minHue = (siteThemeFgHSL.h - siteConfig.hueSpread + 360) % 360;
		config.maxHue = (siteThemeFgHSL.h + siteConfig.hueSpread) % 360;
	}
	if (siteConfig.useSiteThemeSat) {
		const spread = siteConfig.satSpread || 0;
		config.minSaturation = Math.max(0, siteThemeFgHSL.s - spread);
		config.maxSaturation = Math.min(100, siteThemeFgHSL.s + spread);
	}
	if (siteConfig.useSiteThemeLit) {
		const spread = siteConfig.litSpread || 0;
		config.minLightness = Math.max(0, siteThemeFgHSL.l - spread);
		config.maxLightness = Math.min(100, siteThemeFgHSL.l + spread);
	}

	return config;
}

// Hash a string to a number (for consistent color generation)
function hashString(str) {
	let hash = 0;
	const normalized = str.toLowerCase().trim();
	for (let i = 0; i < normalized.length; i++) {
		hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash);
}

// Initialize our safe CSS variables that handle transparent values
// Sets --nc-* variables on :root with safe fallbacks from current theme
// Priority: CSS var (if valid) > custom_theme (siteTheme) > PRESET_THEMES > defaults
function initCssVariables(themeName = null) {
	
	const colors = getThemeColors(themeName);
	const root = document.documentElement;

	root.style.setProperty('--nc-bg', colors.bg);
	root.style.setProperty('--nc-fg', colors.fg);
	root.style.setProperty('--nc-fg-dim', colors.fgDim);
	root.style.setProperty('--nc-border', colors.border);
	root.style.setProperty('--nc-code-bg', colors.codeBg);
	root.style.setProperty('--nc-inverted-bg', colors.invertedBg);
	root.style.setProperty('--nc-inverted-fg', colors.invertedFg);
	root.style.setProperty('--nc-error', colors.error);
	root.style.setProperty('--nc-warn', colors.warn);
	root.style.setProperty('--nc-success', colors.success);
	root.style.setProperty('--nc-info', colors.info);
	root.style.setProperty('--nc-error-bg', colors.errorBg);
	root.style.setProperty('--nc-warn-bg', colors.warnBg);
	root.style.setProperty('--nc-success-bg', colors.successBg);
	root.style.setProperty('--nc-info-bg', colors.infoBg);
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