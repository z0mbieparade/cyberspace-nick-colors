// ==UserScript==
// @name         Cyberspace Nick Colors
// @author       https://z0m.bi/ (@z0ylent)
// @namespace    https://cyberspace.online/
// @version      1.0
// @description  Consistent bright colors for usernames across the site
// @match        https://cyberspace.online/*
// @updateURL    https://github.com/z0mbieparade/cyberspace-nick-colors/raw/refs/heads/main/cyberspace-nick-colors.user.js
// @downloadURL  https://github.com/z0mbieparade/cyberspace-nick-colors/raw/refs/heads/main/cyberspace-nick-colors.user.js
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
	const VERSION = '1.0';


// Inject compiled styles
const ncStyles = document.createElement('style');
ncStyles.id = 'nc-styles';
ncStyles.textContent = ".nc-dialog-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:999999}.nc-dialog{background:var(--nc-bg);border:1px solid var(--nc-border);color:var(--nc-fg);max-height:80vh;display:flex;flex-direction:column}.nc-dialog .spacer{flex:1}.nc-dialog .preview-row{display:flex;gap:.5rem;flex-wrap:wrap;justify-content:space-around}.nc-dialog .preview-nick{padding:.125rem .25rem !important}.nc-dialog h3{margin:0;color:var(--nc-fg);font-size:var(--font-size-base, 1rem);text-transform:uppercase;letter-spacing:.05em}.nc-dialog h4{margin:.5rem 0;color:var(--nc-fg);font-size:var(--font-size-base, 1rem);text-transform:uppercase;letter-spacing:.1em}.nc-dialog h4:first-child{margin-top:0;padding-top:0}.nc-dialog hr{border:1px dashed var(--nc-border);background:rgba(0,0,0,0);height:0;margin:1rem 0}.nc-dialog .nc-input-row,.nc-dialog .nc-input-row-stacked{padding:.5rem 0;display:flex;flex-direction:row;gap:.5rem}.nc-dialog .nc-input-row-stacked{flex-direction:column;gap:.25rem}.nc-dialog .nc-input-row.no-padding-bottom,.nc-dialog .nc-input-row-stacked.no-padding-bottom{padding-bottom:0}.nc-dialog .nc-input-row.no-padding-top,.nc-dialog .nc-input-row-stacked.no-padding-top{padding-top:0}.nc-dialog .nc-input-row label{font-size:calc(var(--font-size-base)*.875);color:var(--nc-fg)}.nc-dialog .hint{font-size:calc(var(--font-size-base, 1rem)*.875);color:var(--nc-fg-dim)}.nc-dialog .buttons{display:flex;gap:.5rem;justify-content:flex-end}.nc-dialog button{flex:1 0 auto;padding:.5rem}.nc-dialog button:hover{border-color:var(--nc-fg-dim)}.nc-dialog button.link-brackets{background:none;border:none;padding:0;color:var(--nc-fg-dim);flex:0 0 auto}.nc-dialog button.link-brackets:hover{border-color:var(--nc-fg)}.nc-dialog button.link-brackets .inner::before{content:\"[\"}.nc-dialog button.link-brackets .inner::after{content:\"]\"}.nc-dialog button.nc-inline-btn{flex:0 0 auto;padding:.25rem .75rem;font-size:var(--font-size-base);background:var(--nc-bg);border:1px solid var(--nc-border);color:var(--nc-fg-dim);cursor:pointer;transition:border-color .15s,color .15s}.nc-dialog button.nc-inline-btn:hover{border-color:var(--nc-fg);color:var(--nc-fg)}.nc-dialog input[type=text],.nc-dialog textarea,.nc-dialog select{width:100%;padding:.5rem;background:var(--nc-bg);border:1px solid var(--nc-border);color:var(--nc-fg);font-family:inherit;font-size:var(--font-size-base);box-sizing:border-box}.nc-dialog textarea{min-height:70px;resize:vertical}.nc-dialog .nc-toggle{display:flex;margin:.5rem 0}.nc-dialog .nc-toggle-label{display:inline-flex;align-items:center;gap:.75rem;cursor:pointer;flex-shrink:0}.nc-dialog .nc-toggle-value{font-size:var(--font-size-base);color:var(--nc-fg-dim);text-transform:uppercase;letter-spacing:.05em}.nc-dialog .nc-toggle-track{position:relative;width:2.5rem;height:1.25rem;border:1px solid var(--nc-border);border-radius:var(--radius-md);transition:background-color .15s}.nc-dialog .nc-toggle-track.active{background:var(--nc-fg)}.nc-dialog .nc-toggle-track:not(.active){background:var(--nc-fg-dim)}.nc-dialog .nc-toggle-thumb{position:absolute;top:2px;width:1rem;height:.875rem;background:var(--nc-bg);border-radius:var(--radius-md);transition:transform .15s}.nc-dialog .nc-toggle-thumb.pos-start{transform:translateX(2px)}.nc-dialog .nc-toggle-thumb.pos-middle{transform:translateX(10px)}.nc-dialog .nc-toggle-thumb.pos-end{transform:translateX(20px)}.nc-dialog .nc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}.nc-dialog .nc-text-dim{color:var(--nc-fg-dim)}.nc-dialog .nc-dialog-attribution{width:100%;display:flex;justify-content:flex-end;gap:.5rem;border-top:1px dotted var(--nc-border);margin-top:.3rem;font-size:calc(var(--font-size-base)*.875);color:var(--nc-fg-dim);padding-top:.3rem}.nc-dialog .nc-dialog-attribution a{color:var(--nc-fg-dim);text-decoration:none}.nc-dialog .nc-dialog-error{font-size:calc(var(--font-size-base)*.875);color:var(--nc-error);background-color:var(--nc-error-bg);border:1px dashed var(--nc-error)}.nc-dialog .nc-dialog-warning{font-size:calc(var(--font-size-base)*.875);color:var(--nc-warn);background-color:var(--nc-warn-bg);border:1px dashed var(--nc-warn)}.nc-dialog .nc-dialog-success{font-size:calc(var(--font-size-base)*.875);color:var(--nc-success);background-color:var(--nc-success-bg);border:1px dashed var(--nc-success)}.nc-dialog .nc-dialog-info{font-size:calc(var(--font-size-base)*.875);color:var(--nc-info);background-color:var(--nc-info-bg);border:1px dashed var(--nc-info)}.nc-dialog .nc-flex{display:flex}.nc-dialog .nc-flex-wrap{flex-wrap:wrap}.nc-dialog .nc-flex-shrink-0{flex-shrink:0}.nc-dialog .nc-items-center{align-items:center}.nc-dialog .nc-justify-between{justify-content:space-between}.nc-dialog .nc-gap-2{gap:.5rem}.nc-dialog .nc-gap-3{gap:.75rem}.nc-dialog .nc-gap-4{gap:1rem}.nc-dialog .nc-cursor-pointer{cursor:pointer}.nc-dialog pre,.nc-dialog div.nc-dialog-debug{max-width:100%;background-color:var(--nc-code-bg);color:var(--nc-fg);font-size:calc(var(--font-size-base)*.875);padding:.5rem;border:2px dashed var(--nc-border)}.nc-dialog pre{white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word}.nc-dialog div.nc-dialog-debug{display:flex;flex-direction:column;gap:.5rem}.nc-dialog div.nc-dialog-debug>span{display:flex;flex-direction:row;gap:.25rem;width:100%;max-width:100%;min-width:0}.nc-dialog div.nc-dialog-debug>span>*{flex:0 1 auto}.nc-dialog div.nc-dialog-debug>span>strong{flex:0 0 auto;font-weight:bold;min-width:7.5rem;text-align:right}.nc-dialog .nc-debug-color{display:inline-block;padding:0 .25em;font-size:.75em;border:1px solid var(--nc-border)}.nc-dialog-header{padding:1rem 1rem .5rem;border-bottom:1px solid var(--nc-border);flex-shrink:0;width:100%;box-sizing:border-box;gap:.5rem}.nc-dialog-content{padding:.5rem 1rem;overflow-y:auto;flex:1}.nc-dialog-preview{padding:.5rem 1rem;border-bottom:1px solid var(--nc-border);flex-shrink:0;background:var(--nc-code-bg)}.nc-dialog-preview .preview,.nc-dialog-preview .preview-row{margin:0;border:1px solid var(--nc-border);padding:.5rem;margin:.75rem 0;background:var(--nc-bg)}.nc-dialog-footer{padding:.5rem 1rem .5rem;border-top:1px solid var(--nc-border);flex-shrink:0}.nc-slider{position:relative;height:24px;margin:.5rem 0 .25rem}.nc-slider.nc-slider-simple{height:16px}.nc-slider.nc-slider-simple .nc-slider-track{inset:7px 0;height:2px;border:none;background:var(--nc-border)}.nc-slider.nc-slider-simple .nc-slider-thumb{top:3px;width:10px;height:10px;border-radius:50%}.nc-slider.nc-slider-simple .nc-slider-thumb::before{content:\"\";position:absolute;inset:-8px}.nc-slider.nc-slider-split{height:34px}.nc-slider.nc-slider-split .nc-slider-track{top:calc(50% + 1px);bottom:4px}.nc-slider.nc-slider-split .nc-slider-track-mapped{display:block !important}.nc-slider.nc-slider-split .nc-slider-thumb{height:32px}.nc-slider-track{position:absolute;inset:4px 0;border:1px solid var(--nc-border);background:var(--nc-code-bg);box-sizing:border-box}.nc-slider-track-mapped{display:none;position:absolute;top:4px;bottom:calc(50% + 1px);left:0;right:0;border:1px solid var(--nc-border);background:var(--nc-code-bg);box-sizing:border-box}.nc-slider-thumb{position:absolute;top:0;width:14px;height:22px;background:var(--nc-fg);border:2px solid var(--nc-bg);outline:1px solid var(--nc-border);cursor:ew-resize;transform:translateX(-50%);z-index:2;display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--nc-bg);user-select:none;box-sizing:border-box}.nc-slider-labels{display:flex;justify-content:space-between;font-size:calc(var(--font-size-base, 1rem)*.625);line-height:calc(var(--font-size-base, 1rem)*.625);margin-bottom:.5rem}.nc-slider-labels,.nc-slider-labels span{color:var(--nc-fg-dim)}html[data-theme=poetry] [data-mention-colored=true],html[data-theme=poetry] [data-nick-colored=true]{border-radius:var(--radius-md)}";
document.head.appendChild(ncStyles);


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
		hslMatch = color.match(/hsl\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?\)/);
		rgbMatch = color.match(/rgb\(([\d.]+),\s*([\d.]+),\s*([\d.]+)\)/);
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
			`hsl(${+hslMatch[1].toFixed(1)}, ${+hslMatch[2].toFixed(1)}%, ${+hslMatch[3].toFixed(1)}%)` : 
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
				`rgb(${+rgbMatch[1].toFixed(1)}, ${+rgbMatch[2].toFixed(1)}, ${+rgbMatch[3].toFixed(1)})` : 
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
function getThemeVariables(colorFormat = null)
{
	const root = document.documentElement;
	const style = getComputedStyle(root);

	// Get preset theme from data-theme attribute
	siteThemeName = root.dataset.theme || document.body?.dataset?.theme;
	const presetTheme = siteThemeName ? getPresetTheme(siteThemeName) : null;

	// Map custom_theme keys to our keys (custom_theme uses different property names)
	const customTheme = siteCustomTheme ? {
		bg: siteCustomTheme.bg,
		fg: siteCustomTheme.fg,
		fgDim: siteCustomTheme.fgDim || siteCustomTheme.dim,
		border: siteCustomTheme.border,
		codeBg: siteCustomTheme.codeBg || siteCustomTheme.code_bg
	} : null;

	// Default fallbacks (used if no theme or theme missing property)
	const defaults = {
		bg: '#0a0a0a',
		fg: '#e0e0e0',
		fgDim: '#888888',
		border: '#333333',
		codeBg: '#222222'
	};

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
		if (presetTheme && isValidColor(presetTheme[themeKey])) {
			return presetTheme[themeKey];
		}

		// 4. Fall back to defaults
		return defaults[themeKey];
	}

	const colors = {
		bg: getSafeColor('--color-bg', 'bg'),
		fg: getSafeColor('--color-fg', 'fg'),
		fgDim: getSafeColor('--color-fg-dim', 'fgDim'),
		border: getSafeColor('--color-border', 'border'),
		codeBg: getSafeColor('--color-code-bg', 'codeBg'),

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

// Convert camelCase to kebab-case
function toKebabCase(str) {
	return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

// Convert kebab-case to camelCase
function toCamelCase(str) {
	return str.replace(/-([a-z])/g, (match, p1) => p1.toUpperCase());
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
	const textLuminance = getRelativeLuminance(textRgb);

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

function pickBestContrastingColor(color, colorFormat = 'hsl', invertedContainer = false)
{
	let bgColor = siteTheme.bg;
	let fgColor = siteTheme.fg;

	const presetTheme = siteThemeName ? getPresetTheme(siteThemeName) : null;

	//check for background logic overrides, see: poetry
	if(invertedContainer && presetTheme.logic && presetTheme.logic.invertedContainerBg) {
		let invertedContainerBg = presetTheme.logic.invertedContainerBg;
		if(siteTheme[invertedContainerBg])
			invertedContainerBg = siteTheme[invertedContainerBg];

		bgColor = invertedContainerBg;
	}

	if(invertedContainer && presetTheme.logic && presetTheme.logic.invertedContainerFg) {
		let invertedContainerFg = presetTheme.logic.invertedContainerFg;
		if(siteTheme[invertedContainerFg])
			invertedContainerFg = siteTheme[invertedContainerFg];

		fgColor = invertedContainerFg;
	}

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
function applyRangeMappingToColor(color, config, colorFormat = 'hsl', mapHue = true, mapSat = true, mapLit = true)
{
	if(!color) return null;

	const hsl = parseColor(color, 'hsl');
	if(!hsl) return null;

	const h = mapHue ? mapHueToRange(hsl.h, config.minHue, config.maxHue) : hsl.h;
	const s = mapSat ? mapToRange(hsl.s, config.minSaturation, config.maxSaturation) : hsl.s;
	const l = mapLit ? mapToRange(hsl.l, config.minLightness, config.maxLightness) : hsl.l;

	return parseColor({ h, s, l }, colorFormat);
}

// Function to get effective color config (applies site theme overrides)
function getEffectiveColorConfig() {
	const config = { ...colorConfig };

	if (siteThemeFgHSL) {
		if (siteThemeConfig.useHueRange) {
			config.minHue = (siteThemeFgHSL.h - siteThemeConfig.hueSpread + 360) % 360;
			config.maxHue = (siteThemeFgHSL.h + siteThemeConfig.hueSpread) % 360;
		}
		if (siteThemeConfig.useSaturation) {
			const spread = siteThemeConfig.saturationSpread || 0;
			config.minSaturation = Math.max(0, siteThemeFgHSL.s - spread);
			config.maxSaturation = Math.min(100, siteThemeFgHSL.s + spread);
		}
		if (siteThemeConfig.useLightness) {
			const spread = siteThemeConfig.lightnessSpread || 0;
			config.minLightness = Math.max(0, siteThemeFgHSL.l - spread);
			config.maxLightness = Math.min(100, siteThemeFgHSL.l + spread);
		}
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
function initCssVariables() {
	
	const colors = getThemeVariables();
	const root = document.documentElement;

	root.style.setProperty('--nc-bg', colors.bg);
	root.style.setProperty('--nc-fg', colors.fg);
	root.style.setProperty('--nc-fg-dim', colors.fgDim);
	root.style.setProperty('--nc-border', colors.border);
	root.style.setProperty('--nc-code-bg', colors.codeBg);
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

		// Expand minified keys if present
		data = maxifyKeys(data);

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

// Key mappings for minification (full key -> short key)
const KEY_MAP = {
	// Color config
	minSaturation: 'mS',
	maxSaturation: 'xS',
	minLightness: 'mL',
	maxLightness: 'xL',
	minHue: 'mH',
	maxHue: 'xH',
	contrastThreshold: 'cT',
	// Site theme config
	useHueRange: 'uH',
	hueSpread: 'hS',
	useSaturation: 'uS',
	saturationSpread: 'sS',
	useLightness: 'uL',
	lightnessSpread: 'lS',
	// Style config
	varyWeight: 'vW',
	varyItalic: 'vI',
	varyCase: 'vC',
	prependIcon: 'pI',
	appendIcon: 'aI',
	iconSet: 'iS',
	// Per-user style properties
	color: 'c',
	backgroundColor: 'bg',
	fontWeight: 'fW',
	fontStyle: 'fS',
	fontVariant: 'fV',
	invert: 'inv',
	// Config sections
	colorConfig: 'cc',
	siteThemeConfig: 'stc',
	styleConfig: 'sc',
	customNickColors: 'cnc',
	version: 'v',
	exportedAt: 'at'
};

// Reverse mapping (short key -> full key)
const KEY_MAP_REVERSE = Object.fromEntries(
	Object.entries(KEY_MAP).map(([k, v]) => [v, k])
);

/**
 * Minify an object by replacing keys with short versions
 */
function minifyKeys(obj) {
	if (obj === null || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map(minifyKeys);

	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const shortKey = KEY_MAP[key] || key;
		result[shortKey] = minifyKeys(value);
	}
	return result;
}

/**
 * Maxify an object by replacing short keys with full versions
 */
function maxifyKeys(obj) {
	if (obj === null || typeof obj !== 'object') return obj;
	if (Array.isArray(obj)) return obj.map(maxifyKeys);

	const result = {};
	for (const [key, value] of Object.entries(obj)) {
		const fullKey = KEY_MAP_REVERSE[key] || key;
		result[fullKey] = maxifyKeys(value);
	}
	return result;
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

// =====================================================
// UNIFIED IMPORT/EXPORT HELPERS
// =====================================================

/**
 * Save data to a JSON file (minified keys)
 * @param {Object} data - The data to save
 * @param {string} filename - The filename to save as
 */
function saveToFile(data, filename) {
	downloadJson(minifyKeys(data), filename);
}

/**
 * Copy data to clipboard as JSON (minified keys)
 * @param {Object} data - The data to copy
 * @returns {Promise<boolean>} - Success status
 */
async function copyToClipboard(data) {
	try {
		await navigator.clipboard.writeText(JSON.stringify(minifyKeys(data)));
		return true;
	} catch (err) {
		throw new Error(`Failed to copy: ${err.message}`);
	}
}

/**
 * Load data from a JSON file (auto-expands minified keys)
 * @param {Function} callback - Called with parsed data on success
 */
function loadFromFile(callback) {
	const input = document.createElement('input');
	input.type = 'file';
	input.accept = '.json';
	input.onchange = (e) => {
		const file = e.target.files[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (event) => {
			try {
				const data = maxifyKeys(JSON.parse(event.target.result));
				callback(data, null);
			} catch (err) {
				callback(null, new Error(`Failed to parse file: ${err.message}`));
			}
		};
		reader.readAsText(file);
	};
	input.click();
}

/**
 * Show a paste dialog and call callback with parsed data
 * @param {Function} callback - Called with (data, error) when user submits
 */
function showPasteDialog(callback) {
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
				<div class="hint">Paste your settings JSON below (Ctrl+V or right-click → Paste)</div>
				<textarea id="paste-settings-input" style="min-height: 150px; width: 100%; font-size: var(--font-size-base);" placeholder="Paste settings JSON here..."></textarea>
			</div>
			<div class="nc-dialog-footer">
				<div class="buttons nc-flex nc-items-center nc-gap-2">
					<button class="nc-import-btn link-brackets"><span class="inner">IMPORT</span></button>
					<button class="nc-cancel-btn link-brackets"><span class="inner">CANCEL</span></button>
				</div>
			</div>
		</div>
	`;

	const close = () => overlay.remove();
	const textarea = overlay.querySelector('#paste-settings-input');

	overlay.querySelector('.nc-header-close').addEventListener('click', close);
	overlay.querySelector('.nc-cancel-btn').addEventListener('click', close);
	overlay.querySelector('.nc-import-btn').addEventListener('click', () => {
		const text = textarea.value.trim();
		if (!text) {
			alert('Please paste settings JSON first');
			return;
		}
		try {
			const data = maxifyKeys(JSON.parse(text));
			close();
			callback(data, null);
		} catch (err) {
			callback(null, new Error(`Failed to parse: ${err.message}`));
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

/**
 * Open a new message to a user on Cyberspace
 * Navigates to their profile and triggers the 'C' keyboard shortcut to compose
 * @param {string} username - The username to message (without @)
 * @param {string} [message] - Optional message to pre-fill in the compose box
 */
function openMessageToUser(username, message = null) {
	// Navigate to user's profile, then trigger compose shortcut
	const profileUrl = `https://cyberspace.online/${username}`;

	// If we're already on their profile, just trigger the shortcut
	if (window.location.pathname === `/${username}`) {
		console.log('navigated to user profile, triggering compose shortcut');
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', bubbles: true }));
		return;
	}

	// Otherwise navigate and trigger after page load
	// Store flag in sessionStorage to trigger compose after navigation
	sessionStorage.setItem('nickColors_openCompose', 'true');
	if (message) {
		sessionStorage.setItem('nickColors_composeMessage', message);
	}
	window.location.href = profileUrl;
}

// Check if we need to open compose after navigation
if (sessionStorage.getItem('nickColors_openCompose') === 'true') {
	sessionStorage.removeItem('nickColors_openCompose');
	console.log('[NickColors] Detected openCompose flag, will try to open compose');

	// Wait for the site to be ready by polling for the C-Mail button on profile
	function tryOpenCompose(attempts = 0) {
		console.log(`[NickColors] tryOpenCompose attempt ${attempts}, readyState: ${document.readyState}`);

		// Look for the C-Mail button - need to find the smallest element containing "[C] C-Mail"
		// Use TreeWalker to find text nodes, then get their parent
		let cmailButton = null;
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
		let node;
		while (node = walker.nextNode()) {
			const text = node.textContent?.trim() || '';
			if (text.includes('[C]') && text.includes('C-Mail')) {
				// Found the text node, get its parent element
				cmailButton = node.parentElement;
				console.log(`[NickColors] Found text node with C-Mail, parent: ${cmailButton?.tagName}, text: "${text}"`);
				break;
			}
		}

		if (cmailButton) {
			console.log('[NickColors] Found C-Mail button, clicking it:', cmailButton);
			cmailButton.click();

			// Check if we have a message to pre-fill
			const message = sessionStorage.getItem('nickColors_composeMessage');
			if (message) {
				sessionStorage.removeItem('nickColors_composeMessage');
				// Wait for the compose input to appear, then fill it
				setTimeout(() => tryFillMessage(message, 0), 300);
			}
		} else if (attempts > 30) {
			console.log('[NickColors] Max attempts reached, giving up');
		} else {
			// Retry after a delay
			console.log('[NickColors] C-Mail button not found, retrying in 500ms');
			setTimeout(() => tryOpenCompose(attempts + 1), 500);
		}
	}

	// Try to fill the message input
	function tryFillMessage(message, attempts) {
		console.log(`[NickColors] tryFillMessage attempt ${attempts}`);
		const input = document.querySelector('input[placeholder="Type a message..."], textarea[placeholder="Type a message..."]');
		if (input) {
			console.log('[NickColors] Found message input, filling it');
			input.focus();
			input.value = message;
			// Trigger input event so the site's JS knows the value changed
			input.dispatchEvent(new Event('input', { bubbles: true }));
		} else if (attempts < 20) {
			setTimeout(() => tryFillMessage(message, attempts + 1), 200);
		} else {
			console.log('[NickColors] Could not find message input, giving up');
		}
	}

	// Start trying after initial page load
	console.log('[NickColors] readyState:', document.readyState);
	if (document.readyState === 'complete') {
		console.log('[NickColors] Page already complete, starting in 1s');
		setTimeout(tryOpenCompose, 1000);
	} else {
		console.log('[NickColors] Waiting for load event');
		window.addEventListener('load', () => {
			console.log('[NickColors] Load event fired, starting in 1s');
			setTimeout(tryOpenCompose, 1000);
		});
	}
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
		return `<div class="${classStr}"${hiddenStyle}>${data}</div>`;
	}
	console.log(data);
	const lines = Object.entries(data)
		.map(([label, value]) => {
			if(typeof value === 'object' && (value.txt !== undefined || value.elem !== undefined))
				return `<span><strong>${label}:</strong><span>${value.txt ?? ' N/A'}${value.elem ? ' ' + value.elem : ''}</span></span>`;
			else if(typeof value === 'string')
				return `<span><strong>${label}:</strong><span>${value ?? 'N/A'}</span></span>`;
		})
		.filter(line => line && line.trim() !== '')
		.join('\n').trim();
	return `<div class="${classStr}"${hiddenStyle}>\n${lines}\n</div>`;
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
		debug = document.createElement('div');
		debug.className = `nc-dynamic-debug nc-dialog-debug${classes ? ' ' + classes : ''}`;
		parent.appendChild(debug);
	}
	debug.style.display = DEBUG ? '' : 'none';
	return debug;
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
	lines.push(`Site Theme Fg HSL: ${siteThemeFgHSL ? JSON.stringify(siteThemeFgHSL) : 'none'}`);
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
 * Show a dialog for reporting issues with input fields
 */
function showReportIssueDialog() {
	const overlay = document.createElement('div');
	overlay.className = 'nc-dialog-overlay';
	overlay.innerHTML = `
		<div class="nc-dialog" style="min-width: 400px; max-width: 500px;">
			<div class="nc-dialog-header nc-flex nc-justify-between">
				<h3>Report Issue</h3>
				<div class="spacer"></div>
				<button class="nc-header-close link-brackets"><span class="inner">ESC</span></button>
			</div>
			<div class="nc-dialog-content">
				<div class="hint">Fill out the fields below to report an issue. All fields are required.</div>
				<div class="nc-input-row">
					<label for="report-issue">What issue are you experiencing?</label>
					<textarea id="report-issue" placeholder="Describe the problem..." style="width: 100%; min-height: 60px;"></textarea>
				</div>
				<div class="nc-input-row">
					<label for="report-steps">Steps to reproduce:</label>
					<textarea id="report-steps" placeholder="1. Go to...\n2. Click on...\n3. See error..." style="width: 100%; min-height: 60px;"></textarea>
				</div>
				<div class="nc-input-row">
					<label for="report-errors">Any error messages? (check browser console)</label>
					<input type="text" id="report-errors" placeholder="Optional - paste any errors" style="width: 100%;">
				</div>
				<div class="hint">Debug info will be automatically included.</div>
			</div>
			<div class="nc-dialog-footer">
				<div class="buttons nc-flex nc-items-center nc-gap-2">
					<button class="nc-submit-report-btn link-brackets"><span class="inner">SEND REPORT</span></button>
					<button class="nc-cancel-btn link-brackets"><span class="inner">CANCEL</span></button>
				</div>
			</div>
		</div>
	`;

	const close = () => overlay.remove();

	const issueInput = overlay.querySelector('#report-issue');
	const stepsInput = overlay.querySelector('#report-steps');
	const errorsInput = overlay.querySelector('#report-errors');

	overlay.querySelector('.nc-header-close').addEventListener('click', close);
	overlay.querySelector('.nc-cancel-btn').addEventListener('click', close);
	overlay.querySelector('.nc-submit-report-btn').addEventListener('click', () => {
		const issue = issueInput.value.trim();
		const steps = stepsInput.value.trim();
		const errors = errorsInput.value.trim();

		// Validate required fields
		if (!issue) {
			alert('Please describe the issue');
			issueInput.focus();
			return;
		}
		if (!steps) {
			alert('Please provide steps to reproduce');
			stepsInput.focus();
			return;
		}

		// Build condensed debug info
		const eff = getEffectiveColorConfig();
		const debugInfo = `v${VERSION} | ${Object.keys(customNickColors).length} custom | H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`;

		// Build condensed settings object
		const settings = {
			color: colorConfig,
			siteTheme: siteThemeConfig,
			style: styleConfig
		};

		// Build message
		let message = `[Nick Colors Issue Report]| Issue: ${issue} | Steps: ${steps}`;
		if (errors) {
			message += ` | Errors: ${errors}`;
		}
		message += ` | Debug: ${debugInfo} | Page: ${window.location.href} | Settings: ${JSON.stringify(minifyKeys(settings))}`;

		close();
		openMessageToUser('z0ylent', message);
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
	usernameInput.focus();
}

// =====================================================
// COLOR GENERATION
// =====================================================
//
// Flow:
// 1. getNickBase(username) → raw HSL (0-360, 0-100, 0-100)
//    - From custom save, override, or hash generation
// 2. applyRangeMappingToColor(hsl, config) → mapped HSL (within site ranges)
//    - Proportionally maps base color to configured ranges
// 3. Display always shows mapped result
// 4. Picker shows raw values, preview shows mapped result
// =====================================================

/**
 * Strip config only values from style object and convert colors to HSL if necessary
 * @param {Object} styles - Style object with potential color properties
 * @returns {Object} - Cleaned style object with colors in HSL format
 */
function makeStylesObject(styles)
{
	delete styles.appendIcon;
	delete styles.prependIcon;
	delete styles.invert;

	for(const key in styles)
	{
		if(key.startsWith('color') && typeof styles[key] !== 'string')
		{
			const color = parseColor(styles[key], 'hsl');
			if(color)
				styles[key] = color;
			else 
				delete styles[key];
		}
		else if (key.startsWith('base'))
		{
			delete styles[key];
		}
	}

	return styles;
}

/**
 * Get the base color/styles for a username
 * First checks for user-saved custom color,
 * then checks for remote/manual overrides,
 * and finally generates from hash if none are set.
 * Returns { h, s, l } in full range (h: 0-360, s: 0-100, l: 0-100)
 */
function getNickBase(username, includeStyles = false, colorFormat = 'hsl') 
{
	let styles = {
		color: null
	};

	// Check user-saved custom color first
	if (customNickColors[username]) {
		const custom = customNickColors[username];
		const colorStr = typeof custom === 'string' ? custom : custom.color;
		if (colorStr) {
			const parsedColor = parseColor(colorStr, colorFormat);
			if (parsedColor) styles.color = parsedColor;
		}

		if(includeStyles && typeof custom === 'object')
			styles = { ...custom, ...styles };
	}

	// Check remote/manual overrides
	if (styles.color === null && MANUAL_OVERRIDES[username]) {
		const override = MANUAL_OVERRIDES[username];
		const colorStr = typeof override === 'string' ? override : override.color;
		if (colorStr) {
			const parsedColor = parseColor(colorStr, colorFormat);
			if (parsedColor) styles.color = parsedColor;
		}

		if(includeStyles && typeof override === 'object')
			styles = { ...override, ...styles };
	}

	if(styles.color === null)
	{
		// No user-saved, or overrides, Generate from hash
		const hash = hashString(username);
		const hash2 = hashString(username + '_sat');
		const hash3 = hashString(username + '_lit');

		const hsl = {
			h: hash % 360,
			s: hash2 % 101,  // 0-100 inclusive
			l: hash3 % 101   // 0-100 inclusive
		}

		styles = {
			...styles,
			color: parseColor(hsl, colorFormat)
		};
	}

	if(includeStyles)
	{
		// Apply style variations based on hash (unless already set by override)

		const hashStyles = getHashBasedStyleVariations(username);
		if (styleConfig.varyWeight && !styles.fontWeight)
			styles.fontWeight = hashStyles.fontWeight;
		if (styleConfig.varyItalic && !styles.fontStyle)
			styles.fontStyle = hashStyles.fontStyle;
		if (styleConfig.varyCase && !styles.fontVariant)
			styles.fontVariant = hashStyles.fontVariant;

		if(styleConfig.prependIcon || styleConfig.appendIcon)
		{
			const icon = getHashBasedIcon(username);
			if(styles.appendIcon !== false)
				styles.appendIcon = icon;
			if(styles.prependIcon !== false)
				styles.prependIcon = icon;
		}
	}

	return includeStyles ? styles : styles.color;
}


/**
 * Get hash-based icon for a username (ignores overrides, for display defaults)
 * Returns the same icon for both prepend and append by default
 */
function getHashBasedIcon(username, config = styleConfig) {
	if ((!config.prependIcon && !config.appendIcon) || !config.iconSet) return null;
	const icons = config.iconSet.split(/\s+/).filter(Boolean);
	if (icons.length === 0) return null;
	const hash = hashString(username + '_icon');
	return icons[hash % icons.length];
}

/**
 * Get hash-based style variations for a username
 */
function getHashBasedStyleVariations(username) {
	return {
		fontWeight: (hashString(username + '_fontWeight') % 2 === 0) ? 'normal' : 'bold',
		fontStyle: (hashString(username + '_fontStyle') % 4 === 0) ? 'italic' : 'normal',
		fontVariant: (hashString(username + '_fontVariant') % 4 === 1) ? 'small-caps' : 'normal'
	};
}


/**
 * Get raw styles for editing in color picker
 * Returns the base color values that user can edit
 */
function getRawStylesForPicker(username) 
{
	const base = getNickBase(username);

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

/**
 * Apply color color to a base color
 * Returns the mapped color in the requested format
 */
function getMappedNickColor(username, includeStyles = false, colorFormat = 'hsl')
{
	const base = getNickBase(username, includeStyles, colorFormat);
	const effectiveConfig = getEffectiveColorConfig();
	let mapped = null;

	if(includeStyles === true)
	{
		mapped = { ...base };
		for(const key in base)
		{
			if(key.startsWith('color'))
			{
				mapped[toCamelCase('base-' + key)] = base[key];
				mapped[key] = applyRangeMappingToColor(base[key], effectiveConfig, colorFormat);
			}
		}
	}
	else 
	{
		mapped = applyRangeMappingToColor(base, effectiveConfig, colorFormat)
	}
	
	return mapped;
}

function generateStyles(username, invertedContainer = false) 
{
	const effectiveConfig = getEffectiveColorConfig();
	const threshold = effectiveConfig.contrastThreshold || 4.5;
	const nickStyles = getMappedNickColor(username, true);
	const presetTheme = siteThemeName ? getPresetTheme(siteThemeName) : null;

	let nickColorRGB = parseColor(nickStyles.color, 'rgb');
	let elementBackgroundColor = invertedContainer ? siteTheme.fg : siteTheme.bg;
	if(invertedContainer && presetTheme.logic && presetTheme.logic.invertedContainerBg) {
		let invertedContainerBg = presetTheme.logic.invertedContainerBg;
		if(siteTheme[invertedContainerBg])
			invertedContainerBg = siteTheme[invertedContainerBg];

		elementBackgroundColor = invertedContainerBg;
	}

	let nickBgColorRGB = parseColor(nickStyles.backgroundColor ?? elementBackgroundColor, 'rgb');

	// Handle inversion based on per-user setting or auto contrast
	let contrastRatio = getContrastRatio(nickColorRGB, nickBgColorRGB);
	let shouldInvert = false;

	// User explicitly set inversion
	if (nickStyles.invert === true || nickStyles.invert === false)
		shouldInvert = nickStyles.invert;
	else if(threshold > 0)
		shouldInvert = contrastRatio < threshold;

	const nickFg = parseColor(nickStyles.color, 'hsl-string');
	const nickBg = nickStyles.backgroundColor ? parseColor(nickStyles.backgroundColor, 'hsl-string') : null;

	const styles = makeStylesObject(nickStyles);
	styles.padding = '0 0.25rem';
	styles.color = nickFg;

	// if we should invert, swap fg and bg
	if(shouldInvert)
	{
		let invertBg = nickFg;
		let invertFg = nickBg? nickBg : pickBestContrastingColor(nickFg, 'hsl-string', invertedContainer ? true : false);

		const adjustedColors = adjustContrastToThreshold(invertBg, invertFg, threshold, 'hsl-string');
		styles.color = adjustedColors.colorAdjust;
		styles.backgroundColor = adjustedColors.colorCompare;

		contrastRatio = getContrastRatio(adjustedColors.colorCompare, adjustedColors.colorAdjust);
	}
	else 
	{
		const adjustedColors = adjustContrastToThreshold(nickBgColorRGB, nickFg, threshold, 'hsl-string');
		styles.color = adjustedColors.colorAdjust;

		contrastRatio = getContrastRatio(adjustedColors.colorCompare, adjustedColors.colorAdjust);
	}

	return { 
		styles, 
		nickConfig: nickStyles,
		contrastRatio: contrastRatio.toFixed(2),
	};
}

/**
 * Get icons for a username
 * @returns {{ prepend: string|null, append: string|null }}
 */
function getIconsForUsername(username) {
	const saved = customNickColors[username] || {};
	const override = MANUAL_OVERRIDES[username] || {};

	// Check if user has custom icon settings
	const hasCustomIcons = 'prependIcon' in saved || 'appendIcon' in saved;
	const hasOverrideIcons = 'prependIcon' in override || 'appendIcon' in override;

	if (hasCustomIcons) {
		// User has explicit icon settings - use them (empty string means disabled)
		return {
			prepend: saved.prependIcon || null,
			append: saved.appendIcon || null
		};
	}

	if (hasOverrideIcons) {
		// Remote override has icon settings
		return {
			prepend: override.prependIcon || null,
			append: override.appendIcon || null
		};
	}

	// Fall back to hash-based icon if enabled globally
	const hashIcon = getHashBasedIcon(username);
	return {
		prepend: (styleConfig.prependIcon && hashIcon) ? hashIcon : null,
		append: (styleConfig.appendIcon && hashIcon) ? hashIcon : null
	};
}

function applyStyles(element, username, matchType = 'nick', invertedContainer = null, mergeStyles = {}) 
{
	// Check if element is in an inverted container
	const isInverted = invertedContainer !== null ? invertedContainer : (
		INVERTED_CONTAINERS.length > 0 &&
		INVERTED_CONTAINERS.some(sel => element.closest(sel))
	);

	let { styles, nickConfig, contrastRatio } = generateStyles(username, isInverted);

	styles = { ...styles, ...mergeStyles };

	if (styles.data) {
		for (const key in styles.data) {
			element.dataset[key] = styles.data[key];
		}
		delete styles.data;
	}

	// Apply all styles to the element
	for(const key in styles)
	{
		const styleKey = toKebabCase(key);
		element.style.setProperty(styleKey, styles[key], 'important');
	}

	element.dataset[`${matchType}Colored`] = 'true';
	element.dataset.username = username;
	element.dataset.contrastRatio = contrastRatio;

	const prependIcon = nickConfig.prependIcon;
	const appendIcon = nickConfig.appendIcon;

	// Prepend/append icon if enabled
	if (prependIcon || appendIcon) 
	{
		if (!element.dataset.iconApplied) {
			// Store original text before first icon application
			element.dataset.originalText = element.textContent;
			element.dataset.iconApplied = 'true';
		}

		const originalText = element.dataset.originalText || element.textContent;
		let newText = originalText;
		if (prependIcon) newText = prependIcon + ' ' + newText;
		if (appendIcon) newText = newText + ' ' + appendIcon;
		element.textContent = newText;
	} 
	else if (element.dataset.iconApplied) 
	{
		// Icons were removed - restore original text
		if (element.dataset.originalText) {
			element.textContent = element.dataset.originalText;
		}
		delete element.dataset.iconApplied;
		delete element.dataset.originalText;
	}

	return element;
}

// =====================================================
// USERNAME DETECTION
// =====================================================

function isValidUsername(username) {
	if (!username) return false;
	if (username.startsWith('@')) username = username.slice(1);
	username = username.trim().toLowerCase();

	if (EXCLUDE_VALUES.includes(username)) return false;
	if (username.includes(' ')) return false;

	return true;
}

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
			if (match && isValidUsername(match[1])) return match[1];
		}
	}

	// From data attribute
	if (element.dataset.username && isValidUsername(element.dataset.username)) {
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
		if(text.startsWith('@')) text = text.slice(1);
		if(isValidUsername(text)) return text;
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

	//strip slash from start for checking
	const hrefPath = href.startsWith('/') ? href.slice(1) : href;
	return isValidUsername(hrefPath);
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
			// Skip excluded usernames
			if (!isValidUsername(match[1])) {
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
			span.textContent = m.full;

			const isInverted = INVERTED_CONTAINERS.length > 0 &&
				textNode.parentElement?.closest(INVERTED_CONTAINERS.join(', '));

			applyStyles(span, m.username, 'mention', isInverted);

			//  Object.assign(span.style, styles);
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

// Styles are now in src/styles.scss and compiled during build

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
		${label ? `<label>${label}</label>` : ''}
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

// Styles are now in src/styles.scss and compiled during build

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
	* Creates a dialog with standard structure
	* @param {Object} opts - { title, content, buttons, width, onClose, onSettings, preview }
	* @returns {Object} - { el, close, querySelector, querySelectorAll }
	*/
function createDialog(opts) {
	// Refresh CSS variables in case theme changed
	initCssVariables();

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
				<div class="nc-dialog-warning hint">
					This is a custom userscript. Do NOT report issues to the creator of Cyberspace. Use the [SETTINGS] -> [REPORT ISSUE] button.
				</div>
				<div class="nc-dialog-attribution hint">
					<span>created by <a href="/z0ylent">@z0ylent</a></span>
					<span> | </span>
					<span><a href="https://z0m.bi" target="_blank">https://z0m.bi</a></span>
					<span> | </span>
					<span><a class="github-link" href="https://github.com/z0mbieparade/cyberspace-nick-colors" target="_blank" title="GitHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14px"> <path fill="currentColor" d="M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v2Zm0 0h2v4h-2v-4Z"/> </svg></a></span>
					<span> | </span>
					<span>v${VERSION}</span><br />
				</div>
				<hr />
				<div class="buttons nc-flex nc-flex-wrap nc-items-center nc-gap-2">
					${buttons.map(b => `<button class="${b.class || ''} link-brackets"><span class="inner">${b.label}</span></button>`).join('')}
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
// USER SETTINGS PANEL
// =====================================================

function createUserSettingsPanel(username, currentStyles) 
{
	// Filter out color, icon, and style variation properties from CSS string
	const styleVariationKeys = ['color', 'icon', 'fontWeight', 'fontStyle', 'fontVariant', 'invert'];
	const filteredStyles = Object.fromEntries(
		Object.entries(makeStylesObject(currentStyles)).filter(([key]) => !styleVariationKeys.includes(key))
	);
	const currentCssString = stylesToCssString(filteredStyles, ';\n');

	// Get current custom icon state
	const savedData = customNickColors[username] || {};
	const savedPrependIcon = savedData.prependIcon ?? '';
	const savedAppendIcon = savedData.appendIcon ?? '';
	// Determine icon states: null = auto (use global), false = disabled, true = custom
	const hasPrependIconProperty = 'prependIcon' in savedData;
	const hasAppendIconProperty = 'appendIcon' in savedData;
	const initialPrependIconState = !hasPrependIconProperty ? null : (savedPrependIcon ? true : false);
	const initialAppendIconState = !hasAppendIconProperty ? null : (savedAppendIcon ? true : false);

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
	const baseColor = getNickBase(username);
	const mappedColor = applyRangeMappingToColor(baseColor, eff);
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
		width: '350px',
		onSettings: () => createSettingsPanel(),
		preview: `<div class="preview">&lt;<span id="picker-preview">${username}</span>&gt; Example chat message in cIRC<br />Inline mention in plain text <span id="picker-preview-mention">@${username}</span> example</div>`,
		content: `
			${createDebugPre({
				'Color Source': colorSource,
				'Saved Data': colorSourceData,
				'Hash Values': `h:${hash} s:${hash2} l:${hash3} style:${hash4}`,
				'Base Color (raw)': { 
					txt: `H:${baseColor.h.toFixed(1)} S:${baseColor.s.toFixed(1)} L:${baseColor.l.toFixed(1)}`, 
					elem: `<span class="nc-debug-color" style="background-color: hsl(${baseColor.h}, ${baseColor.s}%, ${baseColor.l}%)">BASE</span>`
				},
				'Mapped Color': { 
					txt: `H:${mappedColor.h.toFixed(1)} S:${mappedColor.s.toFixed(1)} L:${mappedColor.l.toFixed(1)}`, 
					elem: `<span class="nc-debug-color" style="background-color: hsl(${mappedColor.h}, ${mappedColor.s}%, ${mappedColor.l}%)">MAPPED</span>`
				},
				'Effective Config': { 
					txt: `H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`, 
					elem: `<span class="nc-debug-color" style="background-color: hsl(${eff.minHue}, ${eff.minSaturation}%, ${eff.minLightness}%)">MIN</span>-<span class="nc-debug-color" style="background-color: hsl(${eff.maxHue}, ${eff.maxSaturation}%, ${eff.maxLightness}%)">MAX</span>`
				},
				'Style Variations': `weight:${hashWeight} italic:${hashItalic} case:${hashCase}`
			})}
			${hasRemoteOverride ? `<div class="hint">Site-wide override: <code style="background: var(--nc-code-bg); padding: 0.1em 0.3em;">${remoteOverrideText}</code><br>Your changes will override this locally.</div>` : ''}
			<h4>Nick Color</h4>
			<div id="picker-sliders"></div>
			${createInputRow({
				label: 'Custom color value:',
				id: 'picker-custom',
				placeholder: '#ff6b6b or hsl(280, 90%, 65%)',
				classes: 'no-padding-bottom'
			})}
			${isRestricted ? `<div class="hint">Color range is restricted. Preview shows mapped result. Click SETTINGS to adjust.</div>` : ''}
			<hr />
			<h4>Custom Icons</h4>
			<div class="hint">Prepend/Append a custom character or emoji to the nickname.</div>
			${createTriStateToggleRow({
				label: 'Prepend icon',
				id: 'picker-prepend-icon-enabled',
				state: initialPrependIconState,
				defaultLabel: hashIcon,
				classes: 'no-padding-top'
			})}
			<div class="nc-input-row-stacked no-padding-top" id="picker-prepend-icon-container" style="display: ${initialPrependIconState === true ? 'block' : 'none'}">
				${styleConfig.iconSet ? `<div class="picker-icon-options" data-target="picker-prepend-icon" style="display: flex; flex-wrap: wrap; gap: 0.25em; margin-bottom: 0.5rem;">${styleConfig.iconSet.split(/\s+/).filter(Boolean).map(icon => `<span class="nc-icon-option" style="cursor: pointer; padding: 0.2em 0.4em; border: 1px solid var(--nc-border); border-radius: var(--radius-md); transition: background 0.15s, border-color 0.15s;" title="Click to select">${icon}</span>`).join('')}</div>` : ''}
				${createInputRow({ id: 'picker-prepend-icon', value: savedPrependIcon, placeholder: 'custom icon before nickname', classes: 'no-padding-top' })}
			</div>
			${createTriStateToggleRow({
				label: 'Append icon',
				id: 'picker-append-icon-enabled',
				state: initialAppendIconState,
				defaultLabel: hashIcon,
				classes: 'no-padding-top'
			})}
			<div class="nc-input-row-stacked no-padding-top" id="picker-append-icon-container" style="display: ${initialAppendIconState === true ? 'block' : 'none'}">
				${styleConfig.iconSet ? `<div class="picker-icon-options" data-target="picker-append-icon" style="display: flex; flex-wrap: wrap; gap: 0.25em; margin-bottom: 0.5rem;">${styleConfig.iconSet.split(/\s+/).filter(Boolean).map(icon => `<span class="nc-icon-option" style="cursor: pointer; padding: 0.2em 0.4em; border: 1px solid var(--nc-border); border-radius: var(--radius-md); transition: background 0.15s, border-color 0.15s;" title="Click to select">${icon}</span>`).join('')}</div>` : ''}
				${createInputRow({ id: 'picker-append-icon', value: savedAppendIcon, placeholder: 'custom icon after nickname', classes: 'no-padding-top' })}
			</div>
			<hr />
			<h4>Style Variations</h4>
			<div class="hint">Override the global style settings for this user to add some visual flair.</div>
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
			<hr />
			<h4>Backup</h4>
			${createInputRow({ type: 'button', label: 'Export user settings to file', id: 'picker-export-file', buttonText: 'Save Settings File' })}
			${createInputRow({ type: 'button', label: 'Export user settings to clipboard', id: 'picker-export-copy', buttonText: 'Copy to Clipboard' })}
			${createInputRow({ type: 'button', label: 'Import user settings from file', id: 'picker-import-file', buttonText: 'Load Settings File' })}
			${createInputRow({ type: 'button', label: 'Import user settings from clipboard', id: 'picker-import-paste', buttonText: 'Paste from Clipboard' })}
			<hr />
			<h4>Request Override</h4>
			<div class="hint">If you want your nickname to show up the same for everyone using the Nick Colors script, you can request an override. If the button below doesn't work, you can click 'Copy to Clipboard' above, and send it manually to <a href="/z0ylent">@z0ylent</a>.</div>
			${createInputRow({ type: 'button', label: 'Message @z0ylent to request override', id: 'picker-request-override', buttonText: 'Request Override' })}
		`,
		buttons: [
			{ label: 'Save', class: 'save', onClick: (close) => {
				const styles = { color: getTextColor(), ...parseCssText(cssInput.value) };
				// Add prepend icon based on tri-state: null = auto (don't save), true = custom, false = disabled
				if (prependIconState === true) {
					styles.prependIcon = prependIconInput.value.trim();
				} else if (prependIconState === false) {
					styles.prependIcon = ''; // Explicitly disabled
				}
				// Add append icon based on tri-state
				if (appendIconState === true) {
					styles.appendIcon = appendIconInput.value.trim();
				} else if (appendIconState === false) {
					styles.appendIcon = ''; // Explicitly disabled
				}
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
	const prependIconEnabledInput = dialog.querySelector('#picker-prepend-icon-enabled');
	const prependIconContainer = dialog.querySelector('#picker-prepend-icon-container');
	const prependIconInput = dialog.querySelector('#picker-prepend-icon');
	const appendIconEnabledInput = dialog.querySelector('#picker-append-icon-enabled');
	const appendIconContainer = dialog.querySelector('#picker-append-icon-container');
	const appendIconInput = dialog.querySelector('#picker-append-icon');
	const weightInput = dialog.querySelector('#picker-weight');
	const italicInput = dialog.querySelector('#picker-italic');
	const caseInput = dialog.querySelector('#picker-case');
	const invertInput = dialog.querySelector('#picker-invert');
	const cssInput = dialog.querySelector('#picker-css');
	const slidersContainer = dialog.querySelector('#picker-sliders');

	// Track tri-state for toggles (null = auto/inherit, true = on, false = off)
	let prependIconState = initialPrependIconState;
	let appendIconState = initialAppendIconState;
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
		? `Hue <span class="nc-slider-values"></span> <span>→ mapped to ${eff.minHue}-${eff.maxHue}</span>`
		: `Hue <span class="nc-slider-values"></span>`;
	const satLabel = isSatRestricted
		? `Sat <span class="nc-slider-values"></span> <span>→ mapped to ${eff.minSaturation}-${eff.maxSaturation}</span>`
		: `Sat <span class="nc-slider-values"></span>`;
	const litLabel = isLitRestricted
		? `Lit <span class="nc-slider-values"></span> <span>→ mapped to ${eff.minLightness}-${eff.maxLightness}</span>`
		: `Lit <span class="nc-slider-values"></span>`;

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

		// Build temporary styles object from current dialog state
		const tempStyles = { color: getTextColor(), ...parseCssText(cssInput.value) };
		if (prependIconState === true) {
			tempStyles.prependIcon = prependIconInput.value.trim();
		} else if (prependIconState === false) {
			tempStyles.prependIcon = '';
		}
		if (appendIconState === true) {
			tempStyles.appendIcon = appendIconInput.value.trim();
		} else if (appendIconState === false) {
			tempStyles.appendIcon = '';
		}
		if (weightState !== null) {
			tempStyles.fontWeight = weightState ? 'bold' : 'normal';
		}
		if (italicState !== null) {
			tempStyles.fontStyle = italicState ? 'italic' : 'normal';
		}
		if (caseState !== null) {
			tempStyles.fontVariant = caseState ? 'small-caps' : 'normal';
		}
		if (invertState !== null) {
			tempStyles.invert = invertState;
		}

		// Temporarily apply dialog state to customNickColors for applyStyles
		const savedCustom = customNickColors[username];
		customNickColors[username] = tempStyles;

		// Match site-settings-panel behavior: set colorConfig to effective values
		// and disable siteThemeConfig to prevent double-application of site theme adjustments
		// The eff variable (computed at dialog open) already has site theme adjustments baked in
		const savedColorConfig = { ...colorConfig };
		const savedSiteThemeConfig = { ...siteThemeConfig };
		Object.assign(colorConfig, eff);
		siteThemeConfig.useHueRange = false;
		siteThemeConfig.useSaturation = false;
		siteThemeConfig.useLightness = false;

		// Determine icons for preview
		let prependValue = '';
		let appendValue = '';
		if (prependIconState === true) {
			prependValue = prependIconInput.value.trim();
		} else if (prependIconState === null && styleConfig.prependIcon) {
			prependValue = hashIcon;
		}
		if (appendIconState === true) {
			appendValue = appendIconInput.value.trim();
		} else if (appendIconState === null && styleConfig.appendIcon) {
			appendValue = hashIcon;
		}

		// Helper to apply styles to a preview element
		const applyPreviewStyles = (el, isMention) => {
			el.style.cssText = '';
			applyStyles(el, username, isMention ? 'mention' : 'nick', false, {
				prependIcon: prependValue,
				appendIcon: appendValue
			});
		};

		// Update both previews (false = not mention, true = mention)
		applyPreviewStyles(preview, false);
		if (previewMention) applyPreviewStyles(previewMention, true);

		// Restore original configs AFTER applying preview styles
		Object.assign(colorConfig, savedColorConfig);
		Object.assign(siteThemeConfig, savedSiteThemeConfig);

		// Restore original customNickColors
		if (savedCustom !== undefined) {
			customNickColors[username] = savedCustom;
		} else {
			delete customNickColors[username];
		}
	}

	// Parse initial color - load raw saved values directly to sliders
	if (currentStyles.color) {
		const hsl = parseColor(currentStyles.color, 'hsl');
		if (hsl) {
			hueSlider.setValue(hsl.h); satSlider.setValue(hsl.s); litSlider.setValue(hsl.l);
		} else {
			customInput.value = currentStyles.color;
		}
	}

	customInput.addEventListener('input', updatePreview);
	prependIconInput.addEventListener('input', updatePreview);
	appendIconInput.addEventListener('input', updatePreview);
	cssInput.addEventListener('input', updatePreview);

	// Prepend icon toggle handler (tri-state like style variations)
	if (prependIconEnabledInput) {
		prependIconEnabledInput.closest('label').addEventListener('click', (e) => {
			e.preventDefault();
			prependIconState = cycleTriState(prependIconState);
			updateTriStateToggle(prependIconEnabledInput, prependIconState);
			// Show/hide icon input (only show when state is true/custom)
			prependIconContainer.style.display = prependIconState === true ? 'block' : 'none';
			updatePreview();
		});
	}

	// Append icon toggle handler (tri-state like style variations)
	if (appendIconEnabledInput) {
		appendIconEnabledInput.closest('label').addEventListener('click', (e) => {
			e.preventDefault();
			appendIconState = cycleTriState(appendIconState);
			updateTriStateToggle(appendIconEnabledInput, appendIconState);
			// Show/hide icon input (only show when state is true/custom)
			appendIconContainer.style.display = appendIconState === true ? 'block' : 'none';
			updatePreview();
		});
	}

	// Icon option click handlers - each icon picker targets its specific input via data-target
	dialog.querySelectorAll('.picker-icon-options').forEach(iconOptions => {
		iconOptions.addEventListener('click', (e) => {
			const option = e.target.closest('.nc-icon-option');
			if (option) {
				const icon = option.textContent;
				const targetId = iconOptions.dataset.target;
				const targetInput = dialog.querySelector(`#${targetId}`);
				if (targetInput) {
					targetInput.value = icon;
					updatePreview();
				}
				// Brief visual feedback
				option.style.background = 'var(--nc-fg-dim)';
				setTimeout(() => { option.style.background = ''; }, 150);
			}
		});
	});

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

	// Helper to build current styles object
	function buildCurrentStyles() {
		const styles = { color: getTextColor(), ...parseCssText(cssInput.value) };
		if (prependIconState === true) {
			styles.prependIcon = prependIconInput.value.trim();
		} else if (prependIconState === false) {
			styles.prependIcon = '';
		}
		if (appendIconState === true) {
			styles.appendIcon = appendIconInput.value.trim();
		} else if (appendIconState === false) {
			styles.appendIcon = '';
		}
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
		return styles;
	}

	// Export to file button handler
	const exportFileBtn = dialog.querySelector('#picker-export-file');
	if (exportFileBtn) {
		exportFileBtn.addEventListener('click', () => {
			const exportData = { [username]: buildCurrentStyles() };
			const timestamp = new Date().toISOString().slice(0, 10);
			saveToFile(exportData, `nick-colors-${username}-${timestamp}.json`);
		});
	}

	// Export to clipboard button handler
	const exportCopyBtn = dialog.querySelector('#picker-export-copy');
	if (exportCopyBtn) {
		exportCopyBtn.addEventListener('click', async () => {
			const exportData = { [username]: buildCurrentStyles() };
			try {
				await copyToClipboard(exportData);
				alert('Copied to clipboard!');
			} catch (err) {
				alert(err.message);
			}
		});
	}

	// Import from file button handler
	const importFileBtn = dialog.querySelector('#picker-import-file');
	if (importFileBtn) {
		importFileBtn.addEventListener('click', () => {
			loadFromFile((data, err) => {
				if (err) {
					alert(err.message);
					return;
				}
				// Check if data has this username's settings
				const userSettings = data[username] || Object.values(data)[0];
				if (userSettings) {
					applyImportedUserSettings(userSettings);
					alert('Settings imported!');
				} else {
					alert('No valid user settings found in file');
				}
			});
		});
	}

	// Import from clipboard button handler
	const importPasteBtn = dialog.querySelector('#picker-import-paste');
	if (importPasteBtn) {
		importPasteBtn.addEventListener('click', () => {
			showPasteDialog((data, err) => {
				if (err) {
					alert(err.message);
					return;
				}
				// Check if data has this username's settings
				const userSettings = data[username] || Object.values(data)[0];
				if (userSettings) {
					applyImportedUserSettings(userSettings);
					alert('Settings imported!');
				} else {
					alert('No valid user settings found in clipboard');
				}
			});
		});
	}

	// Helper to apply imported user settings to the dialog
	function applyImportedUserSettings(settings) {
		// Apply color
		if (settings.color) {
			const hsl = hexToHsl(settings.color);
			if (hsl) {
				hueSlider.value = hsl.h;
				satSlider.value = hsl.s;
				litSlider.value = hsl.l;
				updateColorInputs();
			}
		}
		// Apply CSS (backgroundColor and other styles)
		const cssProps = [];
		if (settings.backgroundColor) cssProps.push(`background-color: ${settings.backgroundColor}`);
		if (settings.fontWeight) cssProps.push(`font-weight: ${settings.fontWeight}`);
		if (settings.fontStyle) cssProps.push(`font-style: ${settings.fontStyle}`);
		if (settings.fontVariant) cssProps.push(`font-variant: ${settings.fontVariant}`);
		if (cssProps.length > 0) {
			cssInput.value = cssProps.join('; ');
		}
		// Apply prepend icon
		if (settings.prependIcon !== undefined) {
			if (settings.prependIcon === '') {
				prependIconState = false;
			} else {
				prependIconState = true;
				prependIconInput.value = settings.prependIcon;
			}
			updatePrependIconToggle();
		}
		// Apply append icon
		if (settings.appendIcon !== undefined) {
			if (settings.appendIcon === '') {
				appendIconState = false;
			} else {
				appendIconState = true;
				appendIconInput.value = settings.appendIcon;
			}
			updateAppendIconToggle();
		}
		// Apply style overrides
		if (settings.fontWeight !== undefined) {
			weightState = settings.fontWeight === 'bold' ? true : settings.fontWeight === 'normal' ? false : null;
			updateWeightToggle();
		}
		if (settings.fontStyle !== undefined) {
			italicState = settings.fontStyle === 'italic' ? true : settings.fontStyle === 'normal' ? false : null;
			updateItalicToggle();
		}
		if (settings.fontVariant !== undefined) {
			caseState = settings.fontVariant === 'small-caps' ? true : settings.fontVariant === 'normal' ? false : null;
			updateCaseToggle();
		}
		updatePreview();
	}

	// Request override button handler
	const requestOverrideBtn = dialog.querySelector('#picker-request-override');
	if (requestOverrideBtn) {
		requestOverrideBtn.addEventListener('click', () => {
			const exportData = { [username]: buildCurrentStyles() };
			const message = `Hi! I'd like to request a site-wide nick color override: ${JSON.stringify(minifyKeys(exportData))}`;
			openMessageToUser('z0ylent', message);
		});
	}

	updatePreview();
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
					'Site Theme HSL': siteThemeFgHSL ? `H:${siteThemeFgHSL.h} S:${siteThemeFgHSL.s} L:${siteThemeFgHSL.l}` : 'N/A',
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
				<h4>Hue Range${siteThemeFgHSL ? '' : ' <span class="nc-text-dim">(no site theme)</span>'}</h4>
				${createToggleRow({
					label: `Use site theme foreground hue${siteThemeFgHSL ? ` <span style="color:hsl(${siteThemeFgHSL.h}, 100%, 50%)">(${siteThemeFgHSL.h}°)</span>` : ''}`,
					id: 'settings-site-hue',
					checked: siteThemeConfig.useHueRange,
					disabled: !siteThemeFgHSL
				})}
				<div id="hue-spread-container" style="display: ${siteThemeConfig.useHueRange ? 'block' : 'none'}"></div>
				<div id="hue-slider-container"></div>
				<hr />
				<h4>Saturation Range</h4>
				${createToggleRow({
					label: `Use site theme foreground saturation${siteTheme?.fg ? ` <span style="color:${siteTheme.fg}">(${siteThemeFgHSL.s}%)</span>` : ''}`,
					id: 'settings-site-saturation',
					checked: siteThemeConfig.useSaturation,
					disabled: !siteThemeFgHSL
				})}
				<div id="sat-spread-container" style="display: ${siteThemeConfig.useSaturation ? 'block' : 'none'}"></div>
				<div id="sat-slider-container"></div>
				<hr />
				<h4>Lightness Range</h4>
				${createToggleRow({
					label: `Use site theme foreground lightness${siteTheme?.fg ? ` <span style="color:${siteTheme.fg}">(${siteThemeFgHSL.l}%)</span>` : ''}`,
					id: 'settings-site-lightness',
					checked: siteThemeConfig.useLightness,
					disabled: !siteThemeFgHSL
				})}
				<div id="lit-spread-container" style="display: ${siteThemeConfig.useLightness ? 'block' : 'none'}"></div>
				<div id="lit-slider-container"></div>
				<hr />
				<h4>Contrast</h4>
				<div class="hint">
					Auto-invert colors when WCAG contrast ratio is below threshold (0 = disabled, 3 = large text, 4.5 = AA, 7 = AAA)
				</div>
				<div id="contrast-slider-container"></div>
				<hr />
				<h4>Style Variation</h4>
				<div class="hint">
					Add non-color variation to usernames (useful for limited color ranges)
				</div>
				${createToggleRow({ label: 'Vary font weight', id: 'settings-vary-weight', checked: styleConfig.varyWeight })}
				${createToggleRow({ label: 'Vary italic', id: 'settings-vary-italic', checked: styleConfig.varyItalic })}
				${createToggleRow({ label: 'Vary small-caps', id: 'settings-vary-case', checked: styleConfig.varyCase })}
				${createToggleRow({ label: 'Prepend icon', id: 'settings-prepend-icon', checked: styleConfig.prependIcon })}
				${createToggleRow({ label: 'Append icon', id: 'settings-append-icon', checked: styleConfig.appendIcon })}
				<div class="nc-input-row-stacked" id="icon-set-container" style="display: ${(styleConfig.prependIcon || styleConfig.appendIcon) ? 'block' : 'none'}">
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
					satSpreadSlider.setValue(DEFAULT_SITE_THEME_CONFIG.saturationSpread);
					litSpreadSlider.setValue(DEFAULT_SITE_THEME_CONFIG.lightnessSpread);
					if (siteHueInput) siteHueInput.checked = DEFAULT_SITE_THEME_CONFIG.useHueRange;
					if (siteSaturationInput) siteSaturationInput.checked = DEFAULT_SITE_THEME_CONFIG.useSaturation;
					if (siteLightnessInput) siteLightnessInput.checked = DEFAULT_SITE_THEME_CONFIG.useLightness;
					if (varyWeightInput) varyWeightInput.checked = DEFAULT_STYLE_CONFIG.varyWeight;
					if (varyItalicInput) varyItalicInput.checked = DEFAULT_STYLE_CONFIG.varyItalic;
					if (varyCaseInput) varyCaseInput.checked = DEFAULT_STYLE_CONFIG.varyCase;
					if (prependIconInput) prependIconInput.checked = DEFAULT_STYLE_CONFIG.prependIcon;
					if (appendIconInput) appendIconInput.checked = DEFAULT_STYLE_CONFIG.appendIcon;
					if (iconSetInput) iconSetInput.value = DEFAULT_STYLE_CONFIG.iconSet;
					if (iconSetContainer) iconSetContainer.style.display = (DEFAULT_STYLE_CONFIG.prependIcon || DEFAULT_STYLE_CONFIG.appendIcon) ? 'block' : 'none';
					presetSelect.value = '';
					updatePreview();
				}},
				{ label: 'Cancel', class: 'cancel', onClick: (close) => close() }
			]
		});

		const presetSelect = dialog.querySelector('#settings-preset');
		const previewRow = dialog.querySelector('#settings-preview');
		const previewNames = [
			'z0ylent', 'CyB3rPuNk', 'ZeR0C00L', 'an0nym0us',
			'Ph4nt0m_', 'enki', 'genghis_khan', 'ByteMe99', 'neo', 
			'l1sb3th', 'N3tRuNn3r', 'acidBurn', 'fr33Kevin', 'triNity'
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
			simple: true, min: 0, max: 21, step: 0.5, value: colorConfig.contrastThreshold || 4.5,
			label: 'Contrast Threshold (WCAG ratio)', onChange: updatePreview
		});
		const hueSpreadSlider = createSlider({
			simple: true, min: 5, max: 180, value: siteThemeConfig.hueSpread,
			label: 'Hue spread (±°)', onChange: () => onSpreadChange()
		});
		const satSpreadSlider = createSlider({
			simple: true, min: 0, max: 50, value: siteThemeConfig.saturationSpread || DEFAULT_SITE_THEME_CONFIG.saturationSpread,
			label: 'Saturation spread (±%)', onChange: () => onSpreadChange()
		});
		const litSpreadSlider = createSlider({
			simple: true, min: 0, max: 50, value: siteThemeConfig.lightnessSpread || DEFAULT_SITE_THEME_CONFIG.lightnessSpread,
			label: 'Lightness spread (±%)', onChange: () => onSpreadChange()
		});
		// Defined later, called via closure
		let onSpreadChange = () => {};

		dialog.querySelector('#hue-slider-container').appendChild(hueSlider.el);
		dialog.querySelector('#sat-slider-container').appendChild(satSlider.el);
		dialog.querySelector('#lit-slider-container').appendChild(litSlider.el);
		dialog.querySelector('#contrast-slider-container').appendChild(contrastSlider.el);
		dialog.querySelector('#hue-spread-container').appendChild(hueSpreadSlider.el);
		dialog.querySelector('#sat-spread-container').appendChild(satSpreadSlider.el);
		dialog.querySelector('#lit-spread-container').appendChild(litSpreadSlider.el);

		const siteHueInput = dialog.querySelector('#settings-site-hue');
		const siteSaturationInput = dialog.querySelector('#settings-site-saturation');
		const siteLightnessInput = dialog.querySelector('#settings-site-lightness');
		const varyWeightInput = dialog.querySelector('#settings-vary-weight');
		const varyItalicInput = dialog.querySelector('#settings-vary-italic');
		const varyCaseInput = dialog.querySelector('#settings-vary-case');
		const prependIconInput = dialog.querySelector('#settings-prepend-icon');
		const appendIconInput = dialog.querySelector('#settings-append-icon');
		const iconSetInput = dialog.querySelector('#settings-icon-set');
		const iconSetContainer = dialog.querySelector('#icon-set-container');

		function getSettings() {
			const [minHue, maxHue] = hueSlider.getValues();
			const [minSaturation, maxSaturation] = satSlider.getValues();
			const [minLightness, maxLightness] = litSlider.getValues();
			return {
				color: { minHue, maxHue, minSaturation, maxSaturation, minLightness, maxLightness, contrastThreshold: contrastSlider.getValue() },
				siteTheme: {
					useHueRange: siteHueInput?.checked || false,
					hueSpread: hueSpreadSlider.getValue(),
					useSaturation: siteSaturationInput?.checked || false,
					saturationSpread: satSpreadSlider.getValue(),
					useLightness: siteLightnessInput?.checked || false,
					lightnessSpread: litSpreadSlider.getValue()
				},
				style: { varyWeight: varyWeightInput?.checked || false, varyItalic: varyItalicInput?.checked || false, varyCase: varyCaseInput?.checked || false, prependIcon: prependIconInput?.checked || false, appendIcon: appendIconInput?.checked || false, iconSet: iconSetInput?.value || '' }
			};
		}

		function getEffective() {
			const s = getSettings();
			const eff = { ...s.color };
			if (siteThemeFgHSL) {
				if (s.siteTheme.useHueRange) {
					eff.minHue = (siteThemeFgHSL.h - s.siteTheme.hueSpread + 360) % 360;
					eff.maxHue = (siteThemeFgHSL.h + s.siteTheme.hueSpread) % 360;
				}
				if (s.siteTheme.useSaturation) {
					eff.minSaturation = Math.max(0, siteThemeFgHSL.s - s.siteTheme.saturationSpread);
					eff.maxSaturation = Math.min(100, siteThemeFgHSL.s + s.siteTheme.saturationSpread);
				}
				if (s.siteTheme.useLightness) {
					eff.minLightness = Math.max(0, siteThemeFgHSL.l - s.siteTheme.lightnessSpread);
					eff.maxLightness = Math.min(100, siteThemeFgHSL.l + s.siteTheme.lightnessSpread);
				}
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

			// Temporarily apply dialog settings to global config for applyStyles
			// Also disable siteThemeConfig since eff already has those adjustments applied
			const savedColorConfig = { ...colorConfig };
			const savedSiteThemeConfig = { ...siteThemeConfig };
			Object.assign(colorConfig, eff);
			siteThemeConfig.useHueRange = false;
			siteThemeConfig.useSaturation = false;
			siteThemeConfig.useLightness = false;

			previewRow.querySelectorAll('.preview-nick').forEach((el, i) => {
				const username = previewNames[i];
				const s = getSettings().style;
				applyStyles(el, username);
			});

			// Restore original configs
			Object.assign(colorConfig, savedColorConfig);
			Object.assign(siteThemeConfig, savedSiteThemeConfig);
		}

		presetSelect.addEventListener('change', () => {
			const p = PRESET_THEMES[presetSelect.value];
			if (p) {
				hueSlider.setValues([p.color.minHue, p.color.maxHue]);
				satSlider.setValues([p.color.minSaturation, p.color.maxSaturation]);
				litSlider.setValues([p.color.minLightness, p.color.maxLightness]);
				contrastSlider.setValue(p.color.contrastThreshold || 4.5);
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
		const satSpreadContainer = dialog.querySelector('#sat-spread-container');
		const litSliderContainer = dialog.querySelector('#lit-slider-container');
		const litSpreadContainer = dialog.querySelector('#lit-spread-container');

		// Update slider container enabled/disabled state
		function updateSliderState(container, disabled) {
			if (!container) return;
			container.style.pointerEvents = disabled ? 'none' : 'auto';
			// Grey out thumbs when disabled
			const thumbs = container.querySelectorAll('.nc-slider-thumb');
			thumbs.forEach(thumb => {
				thumb.style.background = disabled ? 'var(--nc-fg-dim)' : '';
				thumb.style.cursor = disabled ? 'default' : '';
			});
		}

		// Store original slider values for when toggles are disabled
		let savedHueValues = [colorConfig.minHue, colorConfig.maxHue];
		let savedSatValues = [colorConfig.minSaturation, colorConfig.maxSaturation];
		let savedLitValues = [colorConfig.minLightness, colorConfig.maxLightness];

		// Update sliders to show site theme values when toggled on
		function updateSlidersForSiteTheme() {
			if (siteThemeFgHSL) {
				if (siteHueInput?.checked) {
					const spread = hueSpreadSlider.getValue();
					const minHue = (siteThemeFgHSL.h - spread + 360) % 360;
					const maxHue = (siteThemeFgHSL.h + spread) % 360;
					hueSlider.setValues([minHue, maxHue]);
				}
				if (siteSaturationInput?.checked) {
					const spread = satSpreadSlider.getValue();
					const minSat = Math.max(0, siteThemeFgHSL.s - spread);
					const maxSat = Math.min(100, siteThemeFgHSL.s + spread);
					satSlider.setValues([minSat, maxSat]);
				}
				if (siteLightnessInput?.checked) {
					const spread = litSpreadSlider.getValue();
					const minLit = Math.max(0, siteThemeFgHSL.l - spread);
					const maxLit = Math.min(100, siteThemeFgHSL.l + spread);
					litSlider.setValues([minLit, maxLit]);
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
					const isChecked = el.checked;
					updateSliderState(satSliderContainer, isChecked);
					if (satSpreadContainer) {
						satSpreadContainer.style.display = isChecked ? 'block' : 'none';
					}
					if (isChecked) {
						savedSatValues = satSlider.getValues();
					} else {
						satSlider.setValues(savedSatValues);
					}
				} else if (el === siteLightnessInput) {
					const isChecked = el.checked;
					updateSliderState(litSliderContainer, isChecked);
					if (litSpreadContainer) {
						litSpreadContainer.style.display = isChecked ? 'block' : 'none';
					}
					if (isChecked) {
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
		[varyWeightInput, varyItalicInput, varyCaseInput, prependIconInput, appendIconInput].forEach(el => {
			if (!el) return;
			el.addEventListener('change', () => {
				updateToggle(el);
				updatePreview();
			});
		});

		// Show/hide icon set input when prepend or append icon is toggled
		const updateIconSetVisibility = () => {
			if (iconSetContainer) {
				iconSetContainer.style.display = (prependIconInput?.checked || appendIconInput?.checked) ? 'block' : 'none';
			}
		};
		if (prependIconInput) {
			prependIconInput.addEventListener('change', updateIconSetVisibility);
		}
		if (appendIconInput) {
			appendIconInput.addEventListener('change', updateIconSetVisibility);
		}

		// Update preview when icon set changes
		if (iconSetInput) {
			iconSetInput.addEventListener('input', updatePreview);
		}

		// Set up spread change handler (defined earlier as empty, now assigned)
		onSpreadChange = () => {
			updateSlidersForSiteTheme();
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
				saveToFile(data, `nick-colors-settings-${timestamp}.json`);
			});
		}

		if (exportCopyBtn) {
			exportCopyBtn.addEventListener('click', async () => {
				try {
					await copyToClipboard(exportSettings());
					alert('Settings copied to clipboard');
				} catch (err) {
					alert(err.message);
				}
			});
		}

		if (importFileBtn) {
			importFileBtn.addEventListener('click', () => {
				loadFromFile((data, err) => {
					if (err) {
						alert(err.message);
						return;
					}
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
				});
			});
		}

		if (importPasteBtn) {
			importPasteBtn.addEventListener('click', () => {
				showPasteDialog((data, err) => {
					if (err) {
						alert(err.message);
						return;
					}
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
				});
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
				showReportIssueDialog();
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
		createUserSettingsPanel(target.dataset.username, getRawStylesForPicker(target.dataset.username));
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

// Initialize our safe CSS variables (handles transparent values)
initCssVariables();

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

// Watch for theme changes on <html data-theme="...">
const themeObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		if (mutation.attributeName === 'data-theme') {
			console.log('[Nick Colors] Theme changed, refreshing colors', mutation);
			siteThemeName = mutation.target.getAttribute('data-theme') || null;
			loadSiteCustomTheme();
			loadSiteTheme();
			initCssVariables();
			refreshAllColors();
			break;
		}
	}
});

themeObserver.observe(document.documentElement, {
	attributes: true,
	attributeFilter: ['data-theme']
});

console.log('[Nick Colors] Loaded. Right-click any colored username to customize.');

})();