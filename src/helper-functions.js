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

// Calculate relative luminance per WCAG 2.1
// https://www.w3.org/WAI/GL/wiki/Relative_luminance
function getRelativeLuminance(r, g, b) {
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
function getContrastRatio(rgb1, rgb2) {
	const L1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
	const L2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

	const lighter = Math.max(L1, L2);
	const darker = Math.min(L1, L2);

	return (lighter + 0.05) / (darker + 0.05);
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
	// Try HSL format (handles both integers and decimals)
	const hslMatch = color.match(/hsl\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?\)/);
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

// Get background RGB from site theme or CSS variable
function getBackgroundRgb() {
	// Try site theme first
	if (siteTheme && siteTheme.bg) {
		const rgb = hexToRgb(siteTheme.bg);
		if (rgb) return rgb;
	}
	// Try to get from CSS variable
	const bgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim();
	if (bgColor) {
		const rgb = hexToRgb(bgColor);
		if (rgb) return rgb;
	}
	// Default assumption: dark background (near black)
	return { r: 10, g: 10, b: 10 };
}

// Get foreground RGB from site theme or CSS variable
function getForegroundRgb() {
	// Try site theme first
	if (siteTheme && siteTheme.fg) {
		const rgb = hexToRgb(siteTheme.fg);
		if (rgb) return rgb;
	}
	// Try to get from CSS variable
	const fgColor = getComputedStyle(document.documentElement).getPropertyValue('--color-fg').trim();
	if (fgColor) {
		const rgb = hexToRgb(fgColor);
		if (rgb) return rgb;
	}
	// Default assumption: light foreground
	return { r: 224, g: 224, b: 224 };
}

// Adjust background lightness to meet contrast threshold with text color
function adjustBgForContrast(bgRgb, textRgb, threshold = 4.5) {
	let contrast = getContrastRatio(bgRgb, textRgb);
	if (contrast >= threshold) {
		return null; // No adjustment needed
	}

	const bgHsl = rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
	const textLuminance = getRelativeLuminance(textRgb.r, textRgb.g, textRgb.b);

	// Determine direction: darken if text is light, lighten if text is dark
	const step = textLuminance > 0.5 ? -5 : 5;
	let newL = bgHsl.l;

	// Adjust lightness until we meet threshold or hit limits
	for (let i = 0; i < 20; i++) {
		newL += step;
		if (newL < 5 || newL > 95) break;

		const adjusted = hslToRgb(bgHsl.h, bgHsl.s, newL);
		contrast = getContrastRatio(adjusted, textRgb);
		if (contrast >= threshold) {
			return `hsl(${bgHsl.h.toFixed(0)}, ${bgHsl.s.toFixed(0)}%, ${newL.toFixed(0)}%)`;
		}
	}

	// If we couldn't meet threshold, return the most extreme adjustment
	return `hsl(${bgHsl.h.toFixed(0)}, ${bgHsl.s.toFixed(0)}%, ${newL.toFixed(0)}%)`;
}

// Pick best text color (fg or bg) for inverted nick and adjust bg if needed
function getInvertedColors(invertedBgRgb, invertedBgColor, threshold) {
	const fgRgb = getForegroundRgb();
	const bgRgb = getBackgroundRgb();
	const fgContrast = getContrastRatio(fgRgb, invertedBgRgb);
	const bgContrast = getContrastRatio(bgRgb, invertedBgRgb);

	const useThemeBg = bgContrast > fgContrast;
	const textColor = useThemeBg ? 'var(--color-bg, #000)' : 'var(--color-fg, #fff)';
	const textRgb = useThemeBg ? bgRgb : fgRgb;
	const bestContrast = Math.max(fgContrast, bgContrast);

	// If contrast is still too low, adjust the background
	if (threshold > 0 && bestContrast < threshold) {
		const adjustedBg = adjustBgForContrast(invertedBgRgb, textRgb, threshold);
		if (adjustedBg) {
			return { textColor, backgroundColor: adjustedBg, adjusted: true };
		}
	}

	return { textColor, backgroundColor: invertedBgColor, adjusted: false };
}

// Apply only hue range mapping to a hex color (preserve saturation/lightness)
function applyHueRangeMappingToHex(hex, config) {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	const mappedHue = mapHueToRange(hsl.h, config.minHue, config.maxHue);
	return {
		color: `hsl(${mappedHue.toFixed(1)}, ${hsl.s.toFixed(1)}%, ${hsl.l.toFixed(1)}%)`,
		rgb: hslToRgb(mappedHue, hsl.s, hsl.l)
	};
}

// Apply full range mapping to a hex color
function applyRangeMappingToHex(hex, config) {
	const rgb = hexToRgb(hex);
	if (!rgb) return null;
	const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
	const mappedHue = mapHueToRange(hsl.h, config.minHue, config.maxHue);
	const mappedSat = mapToRange(hsl.s, config.minSaturation, config.maxSaturation);
	const mappedLit = mapToRange(hsl.l, config.minLightness, config.maxLightness);
	return {
		color: `hsl(${mappedHue.toFixed(1)}, ${mappedSat.toFixed(1)}%, ${mappedLit.toFixed(1)}%)`,
		rgb: hslToRgb(mappedHue, mappedSat, mappedLit)
	};
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