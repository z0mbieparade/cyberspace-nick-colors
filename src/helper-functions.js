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

function isHueExcluded(hue, config) {
	return config.excludeRanges.some(([min, max]) => hue >= min && hue <= max);
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
			const spread = siteThemeConfig.saturationSpread || 0;
			config.minSaturation = Math.max(0, siteThemeHsl.s - spread);
			config.maxSaturation = Math.min(100, siteThemeHsl.s + spread);
		}
		if (siteThemeConfig.useLightness) {
			const spread = siteThemeConfig.lightnessSpread || 0;
			config.minLightness = Math.max(0, siteThemeHsl.l - spread);
			config.maxLightness = Math.min(100, siteThemeHsl.l + spread);
		}
	}

	return config;
}

function saveColorConfig() {
	GM_setValue('colorConfig', JSON.stringify(colorConfig));
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