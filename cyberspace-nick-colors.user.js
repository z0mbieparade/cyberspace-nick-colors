// ==UserScript==
// @name         Cyberspace Nick Colors
// @author       https://z0m.bi/ (@z0ylent)
// @namespace    https://cyberspace.online/
// @version      1.1
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
	const VERSION = '1.1';


// Inject compiled styles
const ncStyles = document.createElement('style');
ncStyles.id = 'nc-styles';
ncStyles.textContent = ".nc-dialog-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.7);display:flex;align-items:center;justify-content:center;z-index:999999}.nc-dialog{background:var(--nc-bg);border:1px solid var(--nc-border);color:var(--nc-fg);max-height:80vh;display:flex;flex-direction:column}.nc-dialog ::-webkit-scrollbar-track{background:var(--nc-code-bg);border-radius:0px;border:none}.nc-dialog ::-webkit-scrollbar-thumb{background:var(--nc-bg);opacity:.5;border-radius:0px;border:none;box-shadow:none}.nc-dialog ::-webkit-scrollbar-thumb:hover{opacity:.75}.nc-dialog ::-webkit-scrollbar-thumb:active{opacity:1}.nc-dialog ::-webkit-scrollbar-corner{background:var(--nc-bg)}.nc-dialog ::-webkit-scrollbar-button{background:var(--nc-bg)}.nc-dialog *{scrollbar-width:auto;scrollbar-color:var(--nc-bg) var(--nc-code-bg)}.nc-dialog .spacer{flex:1}.nc-dialog h3{margin:0;color:var(--nc-fg);font-size:var(--font-size-base, 1rem);text-transform:uppercase;letter-spacing:.05em}.nc-dialog h4{margin:var(--spacing-xs) 0;color:var(--nc-fg);font-size:var(--font-size-base, 1rem);text-transform:uppercase;letter-spacing:.1em}.nc-dialog h4:first-child{margin-top:0;padding-top:0}.nc-dialog hr{border:1px dashed var(--nc-border);background:rgba(0,0,0,0);height:0;margin:1rem 0}.nc-dialog .nc-input-row,.nc-dialog .nc-input-row-stacked{padding:var(--spacing-xs) 0;display:flex;flex-direction:row;gap:var(--spacing-sm)}.nc-dialog .nc-input-row-stacked{flex-direction:column;gap:var(--spacing-xs)}.nc-dialog .nc-input-row.no-padding-bottom,.nc-dialog .nc-input-row-stacked.no-padding-bottom{padding-bottom:0}.nc-dialog .nc-input-row.no-padding-top,.nc-dialog .nc-input-row-stacked.no-padding-top{padding-top:0}.nc-dialog .nc-input-row label{font-size:calc(var(--font-size-base)*.875);color:var(--nc-fg)}.nc-dialog .hint{font-size:calc(var(--font-size-base, 1rem)*.875);color:var(--nc-fg-dim)}.nc-dialog .buttons{display:flex;gap:var(--spacing-sm);justify-content:flex-end}.nc-dialog button{flex:1 0 auto;padding:var(--spacing-sm)}.nc-dialog button:hover{border-color:var(--nc-fg-dim)}.nc-dialog button.link-brackets{background:none;border:none;padding:0;color:var(--nc-fg-dim);flex:0 0 auto;text-transform:uppercase}.nc-dialog button.link-brackets:hover{border-color:var(--nc-fg)}.nc-dialog button.link-brackets .inner::before{content:\"[\"}.nc-dialog button.link-brackets .inner::after{content:\"]\"}.nc-dialog button.nc-inline-btn{flex:0 0 auto;padding:.25rem .75rem;font-size:var(--font-size-base);background:var(--nc-bg);border:1px solid var(--nc-border);color:var(--nc-fg-dim);cursor:pointer;transition:border-color .15s,color .15s}.nc-dialog button.nc-inline-btn:hover{border-color:var(--nc-fg);color:var(--nc-fg)}.nc-dialog input[type=text],.nc-dialog textarea,.nc-dialog select{width:100%;padding:var(--spacing-xs) var(--spacing-sm);background:var(--nc-bg);border:1px solid var(--nc-border);color:var(--nc-fg);font-family:inherit;font-size:var(--font-size-base);box-sizing:border-box}.nc-dialog textarea{min-height:70px;resize:vertical}.nc-dialog .nc-toggle{display:flex;margin:var(--spacing-xs) 0}.nc-dialog .nc-toggle-label{display:inline-flex;align-items:center;gap:.75rem;cursor:pointer;flex-shrink:0}.nc-dialog .nc-toggle-value{font-size:var(--font-size-base);color:var(--nc-fg-dim);text-transform:uppercase;letter-spacing:.05em}.nc-dialog .nc-toggle-track{position:relative;width:2.5rem;height:1.25rem;border:1px solid var(--nc-border);border-radius:var(--radius-md);transition:background-color .15s}.nc-dialog .nc-toggle-track.active{background:var(--nc-fg)}.nc-dialog .nc-toggle-track:not(.active){background:var(--nc-fg-dim)}.nc-dialog .nc-toggle-thumb{position:absolute;top:2px;width:1rem;height:.875rem;background:var(--nc-bg);border-radius:var(--radius-md);transition:transform .15s}.nc-dialog .nc-toggle-thumb.pos-start{transform:translateX(2px)}.nc-dialog .nc-toggle-thumb.pos-middle{transform:translateX(10px)}.nc-dialog .nc-toggle-thumb.pos-end{transform:translateX(20px)}.nc-dialog .nc-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0, 0, 0, 0);border:0}.nc-dialog .nc-text-dim{color:var(--nc-fg-dim)}.nc-dialog .nc-dialog-attribution{width:100%;display:flex;justify-content:right;gap:var(--spacing-xs);border-top:1px dotted var(--nc-border);margin-top:var(--spacing-xs);padding-top:var(--spacing-xs);font-size:calc(var(--font-size-base)*.875);line-height:calc(var(--font-size-base)*.875);color:var(--nc-fg-dim)}.nc-dialog .nc-dialog-attribution>span{flex:0 0 auto;border-right:1px solid var(--nc-border);padding-right:var(--spacing-xs);margin-right:var(--spacing-xs)}.nc-dialog .nc-dialog-attribution>span:last-child{border-right:none;padding-right:0;margin-right:0}.nc-dialog .nc-dialog-attribution a{color:var(--nc-fg-dim);text-decoration:none}.nc-dialog .nc-dialog-attribution a.github-link{height:calc(var(--font-size-base)*.875)}.nc-dialog .nc-dialog-error,.nc-dialog .nc-dialog-warning,.nc-dialog .nc-dialog-success,.nc-dialog .nc-dialog-info{font-size:calc(var(--font-size-base)*.875);line-height:calc(var(--line-height-base)*.875);padding:var(--spacing-xs) var(--spacing-sm)}.nc-dialog .nc-dialog-error{color:var(--nc-error);background-color:var(--nc-error-bg);border:1px dashed var(--nc-error)}.nc-dialog .nc-dialog-warning{color:var(--nc-warn);background-color:var(--nc-warn-bg);border:1px dashed var(--nc-warn)}.nc-dialog .nc-dialog-success{color:var(--nc-success);background-color:var(--nc-success-bg);border:1px dashed var(--nc-success)}.nc-dialog .nc-dialog-info{color:var(--nc-info);background-color:var(--nc-info-bg);border:1px dashed var(--nc-info)}.nc-dialog .nc-flex{display:flex}.nc-dialog .nc-flex-wrap{flex-wrap:wrap}.nc-dialog .nc-flex-shrink-0{flex-shrink:0}.nc-dialog .nc-items-center{align-items:center}.nc-dialog .nc-justify-between{justify-content:space-between}.nc-dialog .nc-gap-2{gap:var(--spacing-sm)}.nc-dialog .nc-gap-3{gap:.75rem}.nc-dialog .nc-gap-4{gap:1rem}.nc-dialog .nc-cursor-pointer{cursor:pointer}.nc-dialog pre,.nc-dialog div.nc-dialog-debug{max-width:100%;background-color:var(--nc-code-bg);color:var(--nc-fg);font-size:calc(var(--font-size-base)*.875);padding:var(--spacing-xs) var(--spacing-sm);border:2px dashed var(--nc-border)}.nc-dialog pre{white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word}.nc-dialog div.nc-dialog-debug{display:flex;flex-direction:column;gap:var(--spacing-xs);margin-bottom:var(--spacing-xs)}.nc-dialog div.nc-dialog-debug>span{display:flex;flex-direction:row;gap:.25rem;width:100%;max-width:100%;min-width:0}.nc-dialog div.nc-dialog-debug>span>*{flex:0 1 auto}.nc-dialog div.nc-dialog-debug>span>strong{flex:0 0 auto;font-weight:bold;min-width:7.5rem;text-align:right}.nc-dialog .nc-debug-color{display:inline-block;padding:0 .25em;font-size:.75em;border:1px solid var(--nc-border)}.nc-dialog-header{padding:var(--spacing-sm);border-bottom:1px solid var(--nc-border);flex-shrink:0;width:100%;box-sizing:border-box;gap:var(--spacing-sm)}.nc-dialog-content{padding:var(--spacing-sm);overflow-y:auto;flex:1}.nc-dialog-preview{padding:var(--spacing-xs) var(--spacing-sm);border-bottom:1px solid var(--nc-border);flex-shrink:0;background:var(--nc-code-bg);display:flex;flex-direction:column;gap:var(--spacing-xs)}.nc-dialog-preview .preview,.nc-dialog-preview .preview-row{font-size:var(--font-size-base);line-height:var(--line-height-base);margin:0;border:1px solid var(--nc-border);padding:var(--spacing-xs) var(--spacing-sm);background:var(--nc-bg);max-height:calc(var(--font-size-h)*2*var(--line-height-base) + var(--spacing-xs)*3);overflow:hidden}.nc-dialog-preview .preview.preview-inverted,.nc-dialog-preview .preview-row.preview-inverted{background:var(--nc-inverted-bg);color:var(--nc-inverted-fg)}.nc-dialog-preview .preview-row{display:flex;gap:var(--spacing-xs);flex-wrap:wrap;justify-content:space-around}.nc-dialog-footer{padding:var(--spacing-sm);border-top:1px solid var(--nc-border);flex-shrink:0}.nc-slider{position:relative;height:24px;margin:.5rem 0 .25rem}.nc-slider.nc-slider-simple{height:16px}.nc-slider.nc-slider-simple .nc-slider-track{inset:7px 0;height:2px;border:none;background:var(--nc-border)}.nc-slider.nc-slider-simple .nc-slider-thumb{top:3px;width:10px;height:10px;border-radius:50%}.nc-slider.nc-slider-simple .nc-slider-thumb::before{content:\"\";position:absolute;inset:-8px}.nc-slider.nc-slider-split{height:34px}.nc-slider.nc-slider-split .nc-slider-track{top:calc(50% + 1px);bottom:4px}.nc-slider.nc-slider-split .nc-slider-track-mapped{display:block !important}.nc-slider.nc-slider-split .nc-slider-thumb{height:32px}.nc-slider-track{position:absolute;inset:4px 0;border:1px solid var(--nc-border);background:var(--nc-code-bg);box-sizing:border-box}.nc-slider-track-mapped{display:none;position:absolute;top:4px;bottom:calc(50% + 1px);left:0;right:0;border:1px solid var(--nc-border);background:var(--nc-code-bg);box-sizing:border-box}.nc-slider-thumb{position:absolute;top:0;width:14px;height:22px;background:var(--nc-fg);border:2px solid var(--nc-bg);outline:1px solid var(--nc-border);cursor:ew-resize;transform:translateX(-50%);z-index:2;display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--nc-bg);user-select:none;box-sizing:border-box}.nc-slider-labels{display:flex;justify-content:space-between;font-size:calc(var(--font-size-base, 1rem)*.625);line-height:calc(var(--font-size-base, 1rem)*.625);margin-bottom:var(--spacing-sm)}.nc-slider-labels,.nc-slider-labels span{color:var(--nc-fg-dim)}.nc-debug-tooltip{position:fixed;z-index:9999999;background:var(--nc-bg, #0a0a0a);border:1px solid var(--nc-border, #333);color:var(--nc-fg, #e0e0e0);padding:.25rem;font-size:11px;font-family:monospace;max-width:350px;opacity:0;pointer-events:none;transition:opacity .15s;box-shadow:0 2px 8px rgba(0,0,0,.5)}.nc-debug-tooltip.visible{opacity:1}.nc-debug-row{display:flex;gap:var(--spacing-sm);padding:.125rem 0;border-bottom:1px dotted var(--nc-border, #333)}.nc-debug-row:last-child{border-bottom:none}.nc-debug-label{color:var(--nc-fg-dim, #888);min-width:90px;flex-shrink:0}.nc-debug-value{color:var(--nc-fg, #e0e0e0);display:flex;align-items:center;gap:.25rem}.nc-debug-swatch{display:inline-block;width:12px;height:12px;border:1px solid var(--nc-border, #333);flex-shrink:0}.nc-has-debug{cursor:help}html[data-theme=poetry] [data-mention-colored=true],html[data-theme=poetry] [data-nick-colored=true],body[data-theme=poetry] [data-mention-colored=true],body[data-theme=poetry] [data-nick-colored=true]{border-radius:var(--radius-md)}";
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



// Note: GM_registerMenuCommand is not on window when granted, it's a direct global
// We check for it at registration time instead of defining a fallback

// =====================================================
// CONFIGURATION
// =====================================================

// Debug mode - shows detailed calculation info in dialogs
let DEBUG = GM_getValue('debugMode', 'false') === 'true';
const DEBUG_LOG = [];

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
const DEFAULT_SITE_CONFIG = {
	useSingleColor: false,  // When true, all nicks use the same color (no variation)

	useSiteThemeHue: false,      // Limit hue to site theme's color range
	useSiteThemeSat: false,      // Match site theme's saturation
	useSiteThemeLit: false,      // Match site theme's lightness

	singleColorHue: 180,    // Hue for single color mode (0-360)
	singleColorSat: 85,     // Saturation for single color mode (0-100)
	singleColorLit: 65,     // Lightness for single color mode (0-100)
	singleColorCustom: '',  // Custom color value (hex or hsl) - overrides H/S/L if set

	satSpread: 15,    // +/- percentage around site theme saturation
	hueSpread: 30,    // +/- degrees around site theme hue
	litSpread: 10,    // +/- percentage around site theme lightness

	minHue: 0,           // starting hue (0 = red)
	maxHue: 360,         // ending hue (360 = back to red)
	minSaturation: 70,   // 0-100, min saturation
	maxSaturation: 100,  // 0-100, max saturation
	minLightness: 55,    // 0-100, min lightness
	maxLightness: 75,    // 0-100, max lightness
	
	contrastThreshold: 4.5, // WCAG contrast ratio threshold (1-21). 0=disabled, 3=large text, 4.5=AA, 7=AAA

	varyWeight: false,    // randomly vary font-weight
	varyItalic: false,    // randomly apply italic
	varyCase: false,      // randomly apply small-caps
	prependIcon: false,   // prepend random icon from iconSet
	appendIcon: false,    // append random icon from iconSet
	iconSet: '● ○ ◆ ◇ ■ □ ▲ △ ★ ☆ ♦ ♠ ♣ ♥ ☢ ☣ ☠ ⚙ ⬡ ⬢ ♻ ⚛ ⚠ ⛒',  // space-separated icons
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
		colors: { fg: '#e0e0e0', bg: '#0a0a0a', fgDim: '#888888', border: '#333333', codeBg: '#222222' },
		settings: { minSaturation: 70, maxSaturation: 100, minLightness: 55, maxLightness: 75, minHue: 0, maxHue: 360, contrastThreshold: 4.5 }
	},
	'z0ylent': {
		colors: { fg: '#91ff00', bg: '#060f04', fgDim: '#12892d', border: '#12892d', codeBg: '#0c1c08' },
		settings: { minSaturation: 80, maxSaturation: 100, minLightness: 45, maxLightness: 65, minHue: 60, maxHue: 150, contrastThreshold: 4.5 }
	},
	'Dark': {
		colors: { fg: '#efe5c0', bg: '#000000', fgDim: '#a89984', border: '#3a3a3a', codeBg: 'hsla(0,0%,100%,.07)' },
		settings: { minSaturation: 12, maxSaturation: 60, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 70, contrastThreshold: 4.5 }
	},
	'Light': {
		colors: { fg: '#000000', bg: '#efe5c0', fgDim: '#3a3a3a', border: '#a89984', codeBg: 'rgba(0,0,0,.08)' },
		settings: { minSaturation: 12, maxSaturation: 60, minLightness: 30, maxLightness: 45, minHue: 344, maxHue: 44, contrastThreshold: 4.5 }
	},
	'C64': {
		colors: { fg: 'hsla(0,0%,100%,.75)', bg: '#2a2ab8', fgDim: 'hsla(0,0%,100%,.4)', border: 'hsla(0,0%,100%,.3)', codeBg: 'hsla(0,0%,100%,.08)' },
		settings: { minSaturation: 70, maxSaturation: 90, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 280, contrastThreshold: 4.5 }
	},
	'VT320': {
		colors: { fg: '#ff9a10', bg: '#170800', fgDim: '#ff9100', border: 'rgba(255,155,0,.27)', codeBg: 'rgba(255,155,0,.05)' },
		settings: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 15, maxHue: 55, contrastThreshold: 4.5 }
	},
	'Matrix': {
		colors: { fg: 'rgba(160,224,68,.9)', bg: '#000000', fgDim: 'rgba(160,224,68,.5)', border: 'rgba(160,224,68,.4)', codeBg: 'rgba(0,255,65,.08)' },
		settings: { minSaturation: 75, maxSaturation: 95, minLightness: 45, maxLightness: 60, minHue: 70, maxHue: 140, contrastThreshold: 4.5 }
	},
	'Poetry': {
		colors: { fg: '#222222', bg: '#fefaf8', fgDim: '#666666', border: '#cccccc', codeBg: '#f0e0dd' },
		settings: { minSaturation: 0, maxSaturation: 35, minLightness: 30, maxLightness: 45, minHue: 339, maxHue: 46, contrastThreshold: 4.5 },
		logic: { invertedContainerBg: 'codeBg', invertedContainerFg: 'fg' }
	},
	'Brutalist': {
		colors: { fg: '#c0d0e8', bg: '#080810', fgDim: '#99a9bf', border: 'rgba(160,180,220,.18)', codeBg: 'rgba(160,180,220,.06)' },
		settings: { minSaturation: 50, maxSaturation: 70, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 260, contrastThreshold: 4.5 }
	},
	'GRiD': {
		colors: { fg: '#fea813', bg: '#180f06', fgDim: '#d08c17', border: 'rgba(245,169,28,.22)', codeBg: 'rgba(245,169,28,.08)' },
		settings: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 20, maxHue: 60, contrastThreshold: 4.5 }
	},
	'System': {
		colors: { fg: '#efe5c0', bg: '#000000', fgDim: '#a89984', border: '#3a3a3a', codeBg: 'hsla(0,0%,100%,.07)' },
		settings: { minSaturation: 60, maxSaturation: 80, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 360, contrastThreshold: 4.5 }
	},
};

// Try to read site's theme
// Priority: 1. custom_theme from localStorage (user's custom colors)
//           2. data-theme from <body> -> lookup in PRESET_THEMES (done after PRESET_THEMES is defined)
let siteTheme = null;
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
	const themeColors = getThemeColors();
	console.log('[Nick Colors] Theme variables:', themeColors);
	if (themeColors && themeColors.fg && themeColors.bg) {
		siteThemeName = document.documentElement?.dataset?.theme || null;
		siteTheme = { ...themeColors };
	}
}
if (!siteTheme) loadSiteTheme();

// Load saved site theme integration config
let siteConfig = { ...DEFAULT_SITE_CONFIG };
function loadSiteConfig() {
	try {
		const savedSiteConfig = GM_getValue('siteConfig', null);
		if (savedSiteConfig) {
			siteConfig = { ...DEFAULT_SITE_CONFIG, ...JSON.parse(savedSiteConfig) };
		}
	} catch (e) {
		console.error('[Nick Colors] Failed to load site config:', e);
	}
}
loadSiteConfig();

function saveSiteConfig() {
	GM_setValue('siteConfig', JSON.stringify(siteConfig));
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
	const siteConfigDiff = getNonDefaultValues(siteConfig, DEFAULT_SITE_CONFIG);
	if (siteConfigDiff) data.siteConfig = siteConfigDiff;

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
		if (data.siteConfig) {
			siteConfig = { ...DEFAULT_SITE_CONFIG, ...data.siteConfig };
			saveSiteConfig();
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
	useSiteThemeHue: 'uH',
	hueSpread: 'hS',
	useSiteThemeSat: 'uS',
	satSpread: 'sS',
	useSiteThemeLit: 'uL',
	litSpread: 'lS',
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
	siteConfig: 'sc',
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

function logDebug(id, data)
{
	DEBUG_LOG.push({
		timestamp: new Date().toISOString(),
		id, data
	})
}

function exportDebug()
{
	if(!DEBUG_LOG)
	{
		alert("An error has occurred, please try again later");
		return;
	}

	logDebug('Info', {
		browser: navigator.userAgent,
		url: window.location.href,
		version: VERSION,
	});

	logDebug('Site Theme', siteTheme);
	logDebug('Site Config', siteConfig);
	logDebug('Effective Site Config', getEffectiveSiteConfig());
	logDebug('Style Config', siteConfig);
	logDebug('Custom Nick Colors', customNickColors);
	logDebug('Manual Overrides', MANUAL_OVERRIDES);

	console.log("Exporting debug info...");
	console.log(DEBUG_LOG);
}

/**
 * Export debug logs for troubleshooting (returns plain text)
 */
function exportDebugLogs() {
	const eff = getEffectiveSiteConfig();
	const themeColors = getThemeColors(null, 'hsl');
	const lines = [];

	lines.push('='.repeat(60));
	lines.push('NICK COLORS DEBUG LOG');
	lines.push('='.repeat(60));
	lines.push('');
	lines.push(`Exported: ${new Date().toISOString()}`);
	lines.push(`Version: ${VERSION}`);
	lines.push(`Debug Mode: ${DEBUG}`);
	lines.push(`URL: ${window.location.href}`);
	lines.push(`User Agent: ${navigator.userAgent}`);
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('THEME INFO');
	lines.push('-'.repeat(60));
	lines.push(`Site Theme Name: ${siteThemeName || 'none'}`);
	lines.push(`Site Theme Object: ${siteTheme ? JSON.stringify(siteTheme) : 'none'}`);
	lines.push(`Site Custom Theme: ${siteCustomTheme ? JSON.stringify(siteCustomTheme) : 'none'}`);
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('THEME COLORS (resolved)');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(themeColors, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('EFFECTIVE CONFIG (after site theme integration)');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(eff, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('SAVED SITE CONFIG');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(siteConfig, null, 2));
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
		const eff = getEffectiveSiteConfig();
		const debugInfo = `v${VERSION} | ${Object.keys(customNickColors).length} custom | H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`;

		// Build condensed settings object
		const settings = {
			siteConfig: siteConfig,
			style: siteConfig
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
	issueInput.focus();
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
function getNickBase(username, colorFormat = 'hsl', options = {}) 
{
	options = {
		includeStyles: false,
		effectiveConfig: getEffectiveSiteConfig(),
		debugData: false,
		...options
	};

	let styles = {
		color: null
	};

	let debugData = [];

	// Check user-saved custom color first
	if (customNickColors[username]) {
		const custom = customNickColors[username];
		const colorStr = typeof custom === 'string' ? custom : custom.color;
		if (colorStr) {
			const parsedColor = parseColor(colorStr, colorFormat);
			if (parsedColor) styles.color = parsedColor;

			debugData.push(['Source', 'Custom']);
		}

		if(options.includeStyles && typeof custom === 'object')
			styles = { ...custom, ...styles };
	}

	// Check remote/manual overrides
	if (styles.color === null && MANUAL_OVERRIDES[username]) {
		const override = MANUAL_OVERRIDES[username];
		const colorStr = typeof override === 'string' ? override : override.color;
		if (colorStr) {
			const parsedColor = parseColor(colorStr, colorFormat);
			if (parsedColor) styles.color = parsedColor;

			debugData.push(['Source', 'Override']);
		}

		if(options.includeStyles && typeof override === 'object')
			styles = { ...override, ...styles };
	}

	if (options.effectiveConfig.useSingleColor) 
	{
		// Single color mode - use configured single color
		let hsl;
		if (options.effectiveConfig.singleColorCustom) {
			// Use custom color value if set
			const parsed = parseColor(options.effectiveConfig.singleColorCustom, 'hsl');
			hsl = parsed || { h: options.effectiveConfig.singleColorHue, s: options.effectiveConfig.singleColorSat, l: options.effectiveConfig.singleColorLit };
		} else {
			// Use H/S/L sliders
			hsl = {
				h: options.effectiveConfig.singleColorHue,
				s: options.effectiveConfig.singleColorSat,
				l: options.effectiveConfig.singleColorLit
			};
		}
		styles = {
			...styles,
			color: parseColor(hsl, colorFormat),
		};

		delete styles.backgroundColor;
	}

	if(styles.color === null)
	{
		// Normal mode - generate from hash
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

		debugData.push(['Source', 'Hashed']);
	}

	if(options.includeStyles)
	{
		// Apply style variations based on hash (unless already set by override)
		const hashStyles = getHashBasedStyleVariations(username);
		if (options.effectiveConfig.varyWeight && !styles.fontWeight)
			styles.fontWeight = hashStyles.fontWeight;
		if (options.effectiveConfig.varyItalic && !styles.fontStyle)
			styles.fontStyle = hashStyles.fontStyle;
		if (options.effectiveConfig.varyCase && !styles.fontVariant)
			styles.fontVariant = hashStyles.fontVariant;

		if(options.effectiveConfig.prependIcon || options.effectiveConfig.appendIcon)
		{
			const icon = getHashBasedIcon(username, { effectiveConfig: options.effectiveConfig });
			if(styles.appendIcon !== false)
				styles.appendIcon = icon;
			if(styles.prependIcon !== false)
				styles.prependIcon = icon;
		}
	}

	if(options.debugData)
	{
		styles.debugData = debugData;
	}

	return options.includeStyles ? styles : styles.color;
}


/**
 * Get hash-based icon for a username (ignores overrides, for display defaults)
 * Returns the same icon for both prepend and append by default
 */
function getHashBasedIcon(username, options = {}) 
{
	options = {
		effectiveConfig: getEffectiveSiteConfig(),
		...options
	};

	if ((!options.effectiveConfig.prependIcon && !options.effectiveConfig.appendIcon) || !options.effectiveConfig.iconSet) return null;
	const icons = options.effectiveConfig.iconSet.split(/\s+/).filter(Boolean);
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
function getMappedNickColor(username, colorFormat = 'hsl', options = {})
{
	options = {
		includeStyles: false,
		effectiveConfig: getEffectiveSiteConfig(),
		debugData: false,
		...options
	};

	const base = getNickBase(username, colorFormat, options);
	let mapped = null;
	let debugData = [];

	// In single color mode, skip range mapping - user chose the exact color
	const skipMapping = options.effectiveConfig.useSingleColor;

	if(options.includeStyles === true)
	{
		if(options.debugData)
		{
			debugData = base.debugData || [];
			delete base.debugData;
		}

		mapped = { ...base };
		for(const key in base)
		{
			if(key.startsWith('color'))
			{
				mapped[toCamelCase('base-' + key)] = base[key];
				mapped[key] = skipMapping ? base[key] : applyRangeMappingToColor(base[key], colorFormat, {
					effectiveConfig: options.effectiveConfig,
				});
			}
		}


		if(options.debugData)
		{
			mapped.debugData = debugData;
		}
	}
	else
	{
		mapped = skipMapping ? base : applyRangeMappingToColor(base, colorFormat, {
			effectiveConfig: options.effectiveConfig,
		})
	}

	return mapped;
}

function generateStyles(username, options = {}) 
{
	options = {
		themeName: siteThemeName,
		effectiveConfig: getEffectiveSiteConfig(),
		isInverted: false,
		debugData: false,
		...options
	};

	let debugData = [];

	const threshold = options.effectiveConfig.contrastThreshold ?? 4.5;
	const nickStyles = getMappedNickColor(username, 'hsl', {
		includeStyles: true,
		effectiveConfig: options.effectiveConfig,
		debugData: options.debugData,
	});
	const themeColors = getThemeColors(options.themeName);

	if(options.debugData)
	{
		debugData = nickStyles.debugData || [];
		delete nickStyles.debugData;
	}

	let nickColorRGB = parseColor(nickStyles.color, 'rgb');
	let elementBackgroundColor = options.isInverted ? themeColors.invertedBg : themeColors.bg;
	const elementBgRGB = parseColor(elementBackgroundColor, 'rgb');

	debugData.push(['Element BG', elementBackgroundColor ? parseColor(elementBgRGB, 'hsl-string') : 'N/A']);

	let nickBgColorRGB = parseColor(nickStyles.backgroundColor ?? elementBackgroundColor, 'rgb');

	debugData.push(['Nick FG (raw)', nickColorRGB ? parseColor(nickColorRGB, 'hsl-string') : 'N/A']);
	debugData.push(['Nick BG (raw)', nickBgColorRGB ? parseColor(nickBgColorRGB, 'hsl-string') : 'N/A']);

	// Handle inversion based on per-user setting or auto contrast
	let contrastRatio = getContrastRatio(nickColorRGB, nickBgColorRGB);
	debugData.push(['Contrast (raw)', +contrastRatio.toFixed(2)]);

	let shouldInvert = false;

	// User explicitly set inversion
	if (nickStyles.invert === true || nickStyles.invert === false)
	{
		shouldInvert = nickStyles.invert;
		debugData.push(['User Invert', nickStyles.invert]);
	}
	else if(threshold > 0) {
		shouldInvert = contrastRatio < threshold;
		debugData.push(['Thresh Invert', shouldInvert]);
	}

	const nickFg = parseColor(nickStyles.color, 'hsl-string');
	const nickBg = nickStyles.backgroundColor ? parseColor(nickStyles.backgroundColor, 'hsl-string') : null;

	// Extract icon values before makeStylesObject deletes them
	const prependIcon = nickStyles.prependIcon;
	const appendIcon = nickStyles.appendIcon;

	const styles = makeStylesObject(nickStyles);
	styles.color = nickFg;

	// if we should invert, swap fg and bg
	if(shouldInvert)
	{
		let invertBg = nickFg;
		let invertFg = nickBg ? nickBg : pickBestContrastingColor(nickFg, 'hsl-string', {
			themeName: options.themeName,
			isInverted: true,
			effectiveConfig: options.effectiveConfig,
			debugData: options.debugData
		});

		if(!options.effectiveConfig.useSingleColor)
		{
			const adjustedColors = adjustContrastToThreshold(invertBg, invertFg, threshold, 'hsl-string');
			styles.color = adjustedColors.colorAdjust;
			styles.backgroundColor = adjustedColors.colorCompare;
		}
		else 
		{
			styles.color = invertFg;
			styles.backgroundColor = invertBg;
		}

		debugData.push(['Nick FG (adj)', styles.color || 'N/A']);
		debugData.push(['Nick BG (adj)', styles.backgroundColor || 'N/A']);

		contrastRatio = getContrastRatio(styles.color, styles.backgroundColor);
		styles.padding = '0 0.25em';
	}
	else
	{
		if(!options.effectiveConfig.useSingleColor)
		{
			const adjustedColors = adjustContrastToThreshold(nickBgColorRGB, nickFg, threshold, 'hsl-string');
			styles.color = adjustedColors.colorAdjust;
			debugData.push(['Nick FG (adj)', styles.color || 'N/A']);
		}

		contrastRatio = getContrastRatio(styles.color, nickBgColorRGB);
	}

	debugData.push(['Contrast (adj)', +contrastRatio.toFixed(2)]);

	return {
		styles,
		nickConfig: { ...nickStyles, prependIcon, appendIcon },
		debugData
	};
}

function applyStyles(element, username, options = {}) 
{
	options = {
		matchType: 'nick',
		mergeStyles: {},
		overridesStyles: null,
		themeName: siteThemeName,
		effectiveConfig: getEffectiveSiteConfig(),
		debugData: false,
		...options
	};

	let debugData = [];

	if(element.querySelector('.nc-nick-debug'))
		element.querySelector('.nc-nick-debug').remove();

	// Check if element is in an inverted container
	const isInverted = options.isInverted ?? (
		INVERTED_CONTAINERS.length > 0 &&
		INVERTED_CONTAINERS.some(sel => element.closest(sel))
	);

	let { styles, nickConfig, contrastRatio, debugData: debugDataGenStyles } = generateStyles(username, {
		themeName: options.themeName,
		effectiveConfig: options.effectiveConfig,
		debugData: options.debugData,
		isInverted
	});

	debugData = [...debugData, ...(debugDataGenStyles || [])];

	styles = { ...styles, ...options.mergeStyles };

	if(options.overrideStyles && typeof options.overrideStyles === 'object')
	{
		styles = { ...options.overrideStyles };
	}

	if (styles.data) {
		for (const key in styles.data) {
			element.dataset[key] = styles.data[key];
		}
		delete styles.data;
	}

	// Clear previous inline styles before applying new ones
	// This ensures old background-color/padding from inversion is removed when no longer needed
	element.style.cssText = '';

	// Apply all styles to the element
	for(const key in styles)
	{
		const styleKey = toKebabCase(key);
		element.style.setProperty(styleKey, styles[key], 'important');
	}

	element.dataset[`${options.matchType}Colored`] = 'true';
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
	
	if(options.debugData)
	{
		// Store debug data for tooltip
		element.dataset.ncDebug = JSON.stringify(debugData);
		element.classList.add('nc-has-debug');

		// Add tooltip on hover
		element.addEventListener('mouseenter', showDebugTooltip);
		element.addEventListener('mouseleave', hideDebugTooltip);
	}

	return element;
}

// Debug tooltip functions
let debugTooltip = null;

function showDebugTooltip(e) {
	const element = e.currentTarget;
	const debugData = JSON.parse(element.dataset.ncDebug || '[]');

	if (!debugTooltip) {
		debugTooltip = document.createElement('div');
		debugTooltip.className = 'nc-debug-tooltip';
		document.body.appendChild(debugTooltip);
	}

	// debugData is an array of [label, value] pairs
	debugTooltip.innerHTML = debugData
		.map(([label, value]) => {
			const displayValue = typeof value === 'string' && value.startsWith('hsl')
				? `<span class="nc-debug-swatch" style="background:${value}"></span>${value}`
				: value;
			return `<div class="nc-debug-row"><span class="nc-debug-label">${label}:</span> <span class="nc-debug-value">${displayValue}</span></div>`;
		})
		.join('');

	// Position tooltip
	const rect = element.getBoundingClientRect();
	debugTooltip.style.left = rect.left + 'px';
	debugTooltip.style.top = (rect.bottom + 4) + 'px';
	debugTooltip.classList.add('visible');
}

function hideDebugTooltip() {
	if (debugTooltip) {
		debugTooltip.classList.remove('visible');
	}
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
				!!textNode.parentElement?.closest(INVERTED_CONTAINERS.join(', '));

			applyStyles(span, m.username, {
				matchType: 'mention',
				isInverted
			});

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
			if (!labels[0].contains(document.activeElement)) labels[0].textContent = `${values[0]}`;
			if (!labels[1].contains(document.activeElement)) labels[1].textContent = `${values[1]}`;
		} else {
			if (!labels[0].contains(document.activeElement)) labels[0].textContent = `${values[0]}`;
		}
	}

	// Click on label to edit value directly
	function makeEditable(labelEl, index) {
		labelEl.style.cursor = 'pointer';
		labelEl.title = 'Click to edit';

		labelEl.addEventListener('click', (e) => {
			// Don't trigger if already editing
			if (labelEl.querySelector('input')) return;

			const currentValue = values[index];
			const input = document.createElement('input');
			input.type = 'number';
			input.min = min;
			input.max = max;
			input.value = currentValue;
			input.style.cssText = 'width: 4em; text-align: center; font-size: inherit; padding: 0 0.25em; background: var(--nc-bg); border: 1px solid var(--nc-border); color: var(--nc-fg);';

			labelEl.textContent = '';
			labelEl.appendChild(input);
			input.focus();
			input.select();

			const finishEdit = () => {
				let newValue = parseInt(input.value, 10);
				if (isNaN(newValue)) newValue = currentValue;
				newValue = Math.max(min, Math.min(max, newValue));
				values[index] = newValue;
				labelEl.textContent = `${newValue}`;
				update();
				onChange?.(isRange ? [...values] : values[0]);
			};

			input.addEventListener('blur', finishEdit);
			input.addEventListener('keydown', (e) => {
				if (e.key === 'Enter') {
					e.preventDefault();
					input.blur();
				} else if (e.key === 'Escape') {
					labelEl.textContent = `${currentValue}`;
				}
			});
		});
	}

	labels.forEach((label, i) => makeEditable(label, i));

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
					<span><a href="https://z0m.bi" target="_blank">https://z0m.bi</a></span>
					<span><a class="github-link" href="https://github.com/z0mbieparade/cyberspace-nick-colors" target="_blank" title="GitHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14px"> <path fill="currentColor" d="M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v2Zm0 0h2v4h-2v-4Z"/> </svg></a></span>
					<span>v${VERSION}</span>
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
// SETTINGS ENGINE
// =====================================================
// Declarative settings schema system that generates UI,
// handles events, manages state, and supports field dependencies.

/**
 * Creates a settings engine from a schema definition
 * @param {Object} opts - Configuration object
 * @param {Array} opts.schema - Array of field/section definitions
 * @param {Object} opts.values - Initial values object
 * @param {Object} opts.defaults - Default values (for reset)
 * @param {Function} opts.onChange - Global change callback
 * @param {HTMLElement} opts.container - Where to render
 * @returns {Object} - Engine API
 */
function createSettingsEngine(opts) {
	const { schema, values = {}, defaults = {}, onChange, container } = opts;

	// Internal state: field key -> { value, element, slider?, definition }
	const fields = {};

	// Track which fields control visibility of others
	const dependencyMap = {}; // fieldKey -> [dependentFieldKeys]

	/**
	 * Evaluate a showWhen condition
	 */
	function evaluateCondition(condition) {
		if (!condition) return true;

		// Simple condition: { field: 'key', is: value }
		if (condition.field !== undefined) {
			const fieldState = fields[condition.field];
			if (!fieldState) return true;
			return fieldState.value === condition.is;
		}

		// Any condition: { any: [conditions] }
		if (condition.any) {
			return condition.any.some(c => evaluateCondition(c));
		}

		// All condition: { all: [conditions] }
		if (condition.all) {
			return condition.all.every(c => evaluateCondition(c));
		}

		return true;
	}

	/**
	 * Update visibility of a field based on its showWhen condition
	 */
	function updateVisibility(key) {
		const fieldState = fields[key];
		if (!fieldState || !fieldState.definition.showWhen) return;

		const visible = evaluateCondition(fieldState.definition.showWhen);
		if (fieldState.wrapper) {
			fieldState.wrapper.style.display = visible ? '' : 'none';
		}
	}

	/**
	 * Update all dependent field visibilities when a field changes
	 */
	function updateDependencies(changedKey) {
		const dependents = dependencyMap[changedKey] || [];
		dependents.forEach(key => updateVisibility(key));
	}

	/**
	 * Register a dependency relationship
	 */
	function registerDependency(dependentKey, condition) {
		if (!condition) return;

		const addDep = (cond) => {
			if (cond.field) {
				if (!dependencyMap[cond.field]) dependencyMap[cond.field] = [];
				if (!dependencyMap[cond.field].includes(dependentKey)) {
					dependencyMap[cond.field].push(dependentKey);
				}
			}
			if (cond.any) cond.any.forEach(addDep);
			if (cond.all) cond.all.forEach(addDep);
		};
		addDep(condition);
	}

	/**
	 * Get the current value for a field
	 */
	function getFieldValue(key) {
		const fieldState = fields[key];
		if (!fieldState) return undefined;
		return fieldState.value;
	}

	/**
	 * Set the value for a field and update UI
	 */
	function setFieldValue(key, value, triggerChange = true) {
		const fieldState = fields[key];
		if (!fieldState) return;

		fieldState.value = value;
		updateFieldUI(key, value);

		if (triggerChange) {
			updateDependencies(key);
			fieldState.definition.onChange?.(value, api);
			onChange?.(key, value, api);
		}
	}

	/**
	 * Update the UI element to reflect a value
	 */
	function updateFieldUI(key, value) {
		const fieldState = fields[key];
		if (!fieldState) return;

		const { definition, element, slider } = fieldState;

		switch (definition.type) {
			case 'toggle':
				if (element) {
					element.checked = !!value;
					updateToggleVisual(element);
				}
				break;

			case 'tristate':
				if (element) {
					// Store actual tristate value in data attribute
					element.dataset.tristateValue = value === null ? 'null' : String(value);
					updateTristateVisual(element, value);
				}
				break;

			case 'slider':
				if (slider) slider.setValue(value);
				break;

			case 'range':
				if (slider) slider.setValues(value);
				break;

			case 'text':
			case 'textarea':
				if (element) element.value = value || '';
				break;

			case 'select':
				if (element) element.value = value || '';
				break;
		}
	}

	/**
	 * Update toggle visual state (matches existing updateToggle function)
	 */
	function updateToggleVisual(checkbox) {
		const label = checkbox.closest('.nc-toggle');
		if (!label) return;
		const isChecked = checkbox.checked;
		const valueEl = label.querySelector('.nc-toggle-value');
		const track = label.querySelector('.nc-toggle-track');
		const thumb = label.querySelector('.nc-toggle-thumb');
		if (valueEl) valueEl.textContent = isChecked ? 'true' : 'false';
		if (track) track.classList.toggle('active', isChecked);
		if (thumb) {
			thumb.classList.toggle('pos-end', isChecked);
			thumb.classList.toggle('pos-start', !isChecked);
		}
	}

	/**
	 * Update tristate visual state
	 */
	function updateTristateVisual(checkbox, state) {
		const label = checkbox.closest('.nc-tristate-toggle');
		if (!label) return;
		const stateText = state === true ? 'true' : state === false ? 'false' : 'auto';
		const valueEl = label.querySelector('.nc-toggle-value');
		const track = label.querySelector('.nc-toggle-track');
		const thumb = label.querySelector('.nc-toggle-thumb');
		if (valueEl) valueEl.textContent = stateText;
		if (track) track.classList.toggle('active', state === true);
		if (thumb) {
			thumb.classList.remove('pos-start', 'pos-middle', 'pos-end');
			thumb.classList.add(state === true ? 'pos-end' : state === false ? 'pos-start' : 'pos-middle');
		}
	}

	/**
	 * Render a single field definition
	 */
	function renderField(def, parentEl) {
		const { key, type, label, hint, showWhen } = def;

		// Create wrapper for the field
		const wrapper = document.createElement('div');
		wrapper.className = 'nc-settings-field';
		if (key) wrapper.dataset.fieldKey = key;

		// Get initial value
		const initialValue = key ? (values[key] !== undefined ? values[key] : def.default) : undefined;

		let element = null;
		let slider = null;

		switch (type) {
			case 'toggle': {
				wrapper.innerHTML = createInputRow({
					type: 'toggle',
					label: def.label,
					id: `settings-${key}`,
					checked: !!initialValue,
					disabled: typeof def.disabled === 'function' ? def.disabled(values) : def.disabled
				});
				element = wrapper.querySelector(`#settings-${key}`);
				if (element) {
					element.addEventListener('change', () => {
						setFieldValue(key, element.checked);
					});
				}
				break;
			}

			case 'tristate': {
				wrapper.innerHTML = createInputRow({
					type: 'tristate',
					label: def.label,
					id: `settings-${key}`,
					state: initialValue,
					defaultLabel: def.defaultLabel || ''
				});
				element = wrapper.querySelector(`#settings-${key}`);
				if (element) {
					element.dataset.tristateValue = initialValue === null ? 'null' : String(initialValue);
					element.addEventListener('click', (e) => {
						e.preventDefault();
						const current = fields[key].value;
						// Cycle: null -> true -> false -> null
						const next = current === null ? true : current === true ? false : null;
						setFieldValue(key, next);
					});
				}
				break;
			}

			case 'slider': {
				const sliderOpts = {
					type: 'single',
					simple: def.simple !== false,
					min: def.min ?? 0,
					max: def.max ?? 100,
					step: def.step ?? 1,
					value: initialValue ?? def.default ?? def.min ?? 0,
					label: def.label,
					onChange: (v) => setFieldValue(key, v)
				};
				slider = createSlider(sliderOpts);
				wrapper.appendChild(slider.el);
				break;
			}

			case 'range': {
				const rangeOpts = {
					type: 'range',
					min: def.min ?? 0,
					max: def.max ?? 100,
					values: initialValue ?? def.default ?? [def.min ?? 0, def.max ?? 100],
					label: def.label,
					onChange: (v) => setFieldValue(key, v)
				};
				slider = createSlider(rangeOpts);
				wrapper.appendChild(slider.el);
				break;
			}

			case 'text': {
				wrapper.innerHTML = createInputRow({
					type: 'text',
					label: def.label,
					id: `settings-${key}`,
					value: initialValue || '',
					placeholder: def.placeholder || ''
				});
				element = wrapper.querySelector(`#settings-${key}`);
				if (element) {
					element.addEventListener('input', () => {
						setFieldValue(key, element.value);
					});
				}
				break;
			}

			case 'textarea': {
				wrapper.innerHTML = createInputRow({
					type: 'textarea',
					label: def.label,
					id: `settings-${key}`,
					value: initialValue || '',
					placeholder: def.placeholder || ''
				});
				element = wrapper.querySelector(`#settings-${key}`);
				if (element) {
					element.addEventListener('input', () => {
						setFieldValue(key, element.value);
					});
				}
				break;
			}

			case 'select': {
				const optionsHtml = def.options.map(opt => {
					if (typeof opt === 'string') {
						return `<option value="${opt}">${opt}</option>`;
					}
					return `<option value="${opt.value}">${opt.label}</option>`;
				}).join('');
				wrapper.innerHTML = createInputRow({
					type: 'select',
					label: def.label,
					id: `settings-${key}`,
					options: optionsHtml
				});
				element = wrapper.querySelector(`#settings-${key}`);
				if (element) {
					element.value = initialValue || '';
					element.addEventListener('change', () => {
						setFieldValue(key, element.value);
					});
				}
				break;
			}

			case 'button': {
				wrapper.innerHTML = createInputRow({
					type: 'button',
					label: def.label,
					id: `settings-${key || def.id}`,
					buttonText: def.buttonText || def.label
				});
				element = wrapper.querySelector(`#settings-${key || def.id}`);
				if (element && def.onClick) {
					element.addEventListener('click', () => def.onClick(api));
				}
				break;
			}

			case 'custom': {
				if (def.render) {
					const customEl = def.render(initialValue, api);
					if (customEl) wrapper.appendChild(customEl);
				}
				break;
			}

			case 'hint': {
				wrapper.innerHTML = `<div class="hint">${def.text || def.label}</div>`;
				break;
			}

			case 'hr': {
				wrapper.innerHTML = '<hr />';
				break;
			}
		}

		// Add hint if provided (and not already a hint type)
		if (hint && type !== 'hint') {
			const hintEl = document.createElement('div');
			hintEl.className = 'hint';
			hintEl.innerHTML = hint;
			wrapper.appendChild(hintEl);
		}

		// Store field state
		if (key) {
			fields[key] = {
				value: initialValue,
				element,
				slider,
				wrapper,
				definition: def
			};

			// Register dependencies
			if (showWhen) {
				registerDependency(key, showWhen);
			}
		}

		parentEl.appendChild(wrapper);
		return wrapper;
	}

	/**
	 * Render a section with header and fields
	 */
	function renderSection(def, parentEl) {
		// Create wrapper for section + hr so we can hide both together
		const wrapper = document.createElement('div');
		wrapper.className = 'nc-settings-section-wrapper';

		const section = document.createElement('div');
		section.className = 'nc-settings-section';

		if (def.label) {
			const header = document.createElement('h4');
			header.innerHTML = def.label;
			section.appendChild(header);
		}

		if (def.hint) {
			const hint = document.createElement('div');
			hint.className = 'hint';
			hint.innerHTML = def.hint;
			section.appendChild(hint);
		}

		if (def.fields) {
			def.fields.forEach(fieldDef => {
				if (fieldDef.type === 'section') {
					renderSection(fieldDef, section);
				} else {
					renderField(fieldDef, section);
				}
			});
		}

		wrapper.appendChild(section);

		// Add hr after section (unless noHr is set)
		if (!def.noHr) {
			const hr = document.createElement('hr');
			wrapper.appendChild(hr);
		}

		parentEl.appendChild(wrapper);

		// Handle showWhen for sections
		if (def.showWhen) {
			const sectionKey = `_section_${def.label || Math.random()}`;
			fields[sectionKey] = {
				value: null,
				element: null,
				slider: null,
				wrapper: wrapper,
				definition: def
			};
			registerDependency(sectionKey, def.showWhen);
		}

		return wrapper;
	}

	/**
	 * Render the full schema
	 */
	function render() {
		if (!container) return;

		schema.forEach(def => {
			if (def.type === 'section') {
				renderSection(def, container);
			} else {
				renderField(def, container);
			}
		});

		// Apply initial visibility based on showWhen conditions
		Object.keys(fields).forEach(key => {
			updateVisibility(key);
		});
	}

	/**
	 * Get all current values as an object
	 */
	function getValues() {
		const result = {};
		Object.keys(fields).forEach(key => {
			const fieldState = fields[key];
			if (fieldState && fieldState.definition.type !== 'button') {
				result[key] = fieldState.value;
			}
		});
		return result;
	}

	/**
	 * Set multiple values at once
	 */
	function setValues(newValues, triggerChange = false) {
		Object.keys(newValues).forEach(key => {
			if (fields[key]) {
				setFieldValue(key, newValues[key], triggerChange);
			}
		});
		// Update all visibilities after bulk update
		Object.keys(fields).forEach(key => updateVisibility(key));
	}

	/**
	 * Reset all fields to defaults
	 */
	function reset() {
		// Collect all defaults from schema
		const defaultValues = { ...defaults };

		const collectDefaults = (items) => {
			items.forEach(def => {
				if (def.type === 'section' && def.fields) {
					collectDefaults(def.fields);
				} else if (def.key && def.default !== undefined) {
					if (defaultValues[def.key] === undefined) {
						defaultValues[def.key] = def.default;
					}
				}
			});
		};
		collectDefaults(schema);

		setValues(defaultValues, true);
	}

	/**
	 * Get a field's API (element, slider methods, etc.)
	 */
	function getField(key) {
		const fieldState = fields[key];
		if (!fieldState) return null;

		return {
			element: fieldState.element,
			wrapper: fieldState.wrapper,
			getValue: () => fieldState.value,
			setValue: (v) => setFieldValue(key, v),
			// Slider-specific methods
			setGradient: fieldState.slider?.setGradient,
			setSplitGradient: fieldState.slider?.setSplitGradient,
			setThumbColor: fieldState.slider?.setThumbColor,
			setValues: fieldState.slider?.setValues,
			getValues: fieldState.slider?.getValues
		};
	}

	/**
	 * Destroy the engine and clean up
	 */
	function destroy() {
		if (container) {
			container.innerHTML = '';
		}
		Object.keys(fields).forEach(key => delete fields[key]);
		Object.keys(dependencyMap).forEach(key => delete dependencyMap[key]);
	}

	// Public API
	const api = {
		render,
		getValues,
		setValues,
		reset,
		getField,
		destroy,
		// Direct access for advanced use cases
		fields,
		setFieldValue,
		getFieldValue,
		updateDependencies
	};

	return api;
}


// =====================================================
// USER SETTINGS PANEL
// =====================================================

function createUserSettingsPanel(username, currentStyles)
{
	// Check if color range is restricted
	const eff = getEffectiveSiteConfig();
	
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
	const hashIcon = getHashBasedIcon(username, { effectiveConfig: eff }) || '';
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

	const isHueRestricted = eff.minHue !== 0 || eff.maxHue !== 360;
	const isSatRestricted = eff.minSaturation !== 0 || eff.maxSaturation !== 100;
	const isLitRestricted = eff.minLightness !== 0 || eff.maxLightness !== 100;
	const isRestricted = isHueRestricted || isSatRestricted || isLitRestricted;

	// Determine source of color data for debug display
	const baseColor = getNickBase(username, 'hsl', {
		effectiveConfig: eff
	});
	const mappedColor = applyRangeMappingToColor(baseColor, 'hsl', {
		effectiveConfig: eff
	});
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

	// Build icon picker HTML helper
	const buildIconPicker = (targetId) => {
		if (!siteConfig.iconSet) return '';
		return `<div class="picker-icon-options" data-target="${targetId}" style="display: flex; flex-wrap: wrap; gap: 0.25em; margin-bottom: 0.5rem;">${siteConfig.iconSet.split(/\s+/).filter(Boolean).map(icon => `<span class="nc-icon-option" style="cursor: pointer; padding: 0.2em 0.4em; border: 1px solid var(--nc-border); border-radius: var(--radius-md); transition: background 0.15s, border-color 0.15s;" title="Click to select">${icon}</span>`).join('')}</div>`;
	};

	const dialog = createDialog({
		title: `Nick: ${username}`,
		width: '350px',
		onSettings: () => createSettingsPanel(),
		preview: `<div class="preview">&lt;<span id="picker-preview">${username}</span>&gt; Example chat message in cIRC<br />Inline mention <span id="picker-preview-mention">@${username}</span> example</div>
			<div class="preview preview-inverted" id="picker-preview-inverted">&lt;<span id="picker-preview-inverted-nick">${username}</span>&gt; Inverted container preview</div>`,
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
			${eff.useSingleColor ? `
			<div class="nc-dialog-info" style="padding: 0.5rem;">
				Per-user color customization is disabled. All nicks use a single color.<br>
				<button class="link-brackets" id="picker-open-settings" style="margin-top: 0.5rem;"><span class="inner">Change in Settings</span></button>
			</div>
			` : `
			<h4>Nick Color</h4>
			<div id="picker-sliders"></div>
			${createInputRow({
				label: 'Custom color value:',
				id: 'picker-custom',
				placeholder: '#ff6b6b or hsl(280, 90%, 65%)',
				classes: 'no-padding-bottom'
			})}
			${isRestricted ? `<div class="hint">Color range is restricted. Preview shows mapped result. Click SETTINGS to adjust.</div>` : ''}
			`}
			<div id="picker-engine-container"></div>
		`,
		buttons: [
			{ label: 'Save', class: 'save', onClick: (close) => {
				const textColor = getTextColor();
				const styles = { ...cssStringToStyles(engine.getFieldValue('customCss') || '') };
				if (textColor) styles.color = textColor;
				// Add prepend icon based on tri-state: null = auto (don't save), true = custom, false = disabled
				const prependIconState = engine.getFieldValue('prependIconEnabled');
				if (prependIconState === true) {
					styles.prependIcon = engine.getFieldValue('prependIcon')?.trim() || '';
				} else if (prependIconState === false) {
					styles.prependIcon = ''; // Explicitly disabled
				}
				// Add append icon based on tri-state
				const appendIconState = engine.getFieldValue('appendIconEnabled');
				if (appendIconState === true) {
					styles.appendIcon = engine.getFieldValue('appendIcon')?.trim() || '';
				} else if (appendIconState === false) {
					styles.appendIcon = ''; // Explicitly disabled
				}
				// Add style variations if explicitly set (not auto)
				const weightState = engine.getFieldValue('fontWeight');
				const italicState = engine.getFieldValue('fontStyle');
				const caseState = engine.getFieldValue('fontVariant');
				const invertState = engine.getFieldValue('invert');
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
	const previewInverted = dialog.querySelector('#picker-preview-inverted-nick');
	const customInput = dialog.querySelector('#picker-custom');
	const slidersContainer = dialog.querySelector('#picker-sliders');
	const engineContainer = dialog.querySelector('#picker-engine-container');

	// Build the schema for engine-managed fields
	const userSettingsSchema = [
		{ type: 'hr' },
		{ type: 'section', label: 'Custom Icons', hint: 'Prepend/Append a custom character or emoji to the nickname.', fields: [
			{ key: 'prependIconEnabled', type: 'tristate', label: 'Prepend icon', default: initialPrependIconState, defaultLabel: hashIcon },
			{ key: 'prependIconPicker', type: 'custom', showWhen: { field: 'prependIconEnabled', is: true }, render: () => {
				const div = document.createElement('div');
				div.innerHTML = buildIconPicker('settings-prependIcon');
				return div;
			}},
			{ key: 'prependIcon', type: 'text', label: '', default: savedPrependIcon, placeholder: 'custom icon before nickname', showWhen: { field: 'prependIconEnabled', is: true } },
			{ key: 'appendIconEnabled', type: 'tristate', label: 'Append icon', default: initialAppendIconState, defaultLabel: hashIcon },
			{ key: 'appendIconPicker', type: 'custom', showWhen: { field: 'appendIconEnabled', is: true }, render: () => {
				const div = document.createElement('div');
				div.innerHTML = buildIconPicker('settings-appendIcon');
				return div;
			}},
			{ key: 'appendIcon', type: 'text', label: '', default: savedAppendIcon, placeholder: 'custom icon after nickname', showWhen: { field: 'appendIconEnabled', is: true } },
		]},
		{ type: 'section', label: 'Style Variations', hint: 'Override the global style settings for this user to add some visual flair.', fields: [
			{ key: 'fontWeight', type: 'tristate', label: 'Bold', default: currentWeight === 'bold' ? true : currentWeight === 'normal' ? false : null, defaultLabel: hashWeight },
			{ key: 'fontStyle', type: 'tristate', label: 'Italic', default: currentItalic === 'italic' ? true : currentItalic === 'normal' ? false : null, defaultLabel: hashItalic },
			{ key: 'fontVariant', type: 'tristate', label: 'Small Caps', default: currentCase === 'small-caps' ? true : currentCase === 'normal' ? false : null, defaultLabel: hashCase },
			{ key: 'invert', type: 'tristate', label: 'Invert', default: currentInvert === true ? true : currentInvert === false ? false : null, defaultLabel: 'auto' },
		]},
		{ type: 'section', label: 'Additional CSS', fields: [
			{ key: 'customCss', type: 'textarea', label: '', default: currentCssString, placeholder: 'background-color: #1a1a2e;\ntext-decoration: underline;', hint: 'CSS properties, one per line' },
		]},
		{ type: 'section', label: 'Backup', fields: [
			{ key: 'exportFile', type: 'button', label: 'Export user settings to file', buttonText: 'Save Settings File', onClick: () => {
				const exportData = { [username]: buildCurrentStyles() };
				const timestamp = new Date().toISOString().slice(0, 10);
				saveToFile(exportData, `nick-colors-${username}-${timestamp}.json`);
			}},
			{ key: 'exportCopy', type: 'button', label: 'Export user settings to clipboard', buttonText: 'Copy to Clipboard', onClick: async () => {
				const exportData = { [username]: buildCurrentStyles() };
				try {
					await copyToClipboard(exportData);
					alert('Copied to clipboard!');
				} catch (err) {
					alert(err.message);
				}
			}},
			{ key: 'importFile', type: 'button', label: 'Import user settings from file', buttonText: 'Load Settings File', onClick: () => {
				loadFromFile((data, err) => {
					if (err) {
						alert(err.message);
						return;
					}
					const userSettings = data[username] || Object.values(data)[0];
					if (userSettings) {
						applyImportedUserSettings(userSettings);
						alert('Settings imported!');
					} else {
						alert('No valid user settings found in file');
					}
				});
			}},
			{ key: 'importPaste', type: 'button', label: 'Import user settings from clipboard', buttonText: 'Paste from Clipboard', onClick: () => {
				showPasteDialog((data, err) => {
					if (err) {
						alert(err.message);
						return;
					}
					const userSettings = data[username] || Object.values(data)[0];
					if (userSettings) {
						applyImportedUserSettings(userSettings);
						alert('Settings imported!');
					} else {
						alert('No valid user settings found in clipboard');
					}
				});
			}},
		]},
		{ type: 'section', label: 'Request Override', noHr: true, hint: 'If you want your nickname to show up the same for everyone using the Nick Colors script, you can request an override. If the button below doesn\'t work, you can click \'Copy to Clipboard\' above, and send it manually to <a href="/z0ylent">@z0ylent</a>.', fields: [
			{ key: 'requestOverride', type: 'button', label: 'Message @z0ylent to request override', buttonText: 'Request Override', onClick: () => {
				const exportData = { [username]: buildCurrentStyles() };
				const message = `Hi! I'd like to request a site-wide nick color override: ${JSON.stringify(minifyKeys(exportData))}`;
				openMessageToUser('z0ylent', message);
			}},
		]},
	];

	// Create the settings engine
	const engine = createSettingsEngine({
		schema: userSettingsSchema,
		values: {},
		onChange: () => updatePreview(),
		container: engineContainer
	});
	engine.render();

	

	// Create sliders with restricted range info and live value display in labels
	// Only create sliders when NOT in single color mode
	let hueSlider = null, satSlider = null, litSlider = null;
	if (slidersContainer && !eff.useSingleColor) {
		const hueLabel = isHueRestricted
			? `Hue <span class="nc-slider-values"></span> <span>→ mapped to ${eff.minHue}-${eff.maxHue}</span>`
			: `Hue <span class="nc-slider-values"></span>`;
		const satLabel = isSatRestricted
			? `Sat <span class="nc-slider-values"></span> <span>→ mapped to ${eff.minSaturation}-${eff.maxSaturation}</span>`
			: `Sat <span class="nc-slider-values"></span>`;
		const litLabel = isLitRestricted
			? `Lit <span class="nc-slider-values"></span> <span>→ mapped to ${eff.minLightness}-${eff.maxLightness}</span>`
			: `Lit <span class="nc-slider-values"></span>`;

		hueSlider = createSlider({ label: hueLabel, min: 0, max: 360, value: 180, onChange: () => { customInput.value = ''; updatePreview(); } });
		satSlider = createSlider({ label: satLabel, min: 0, max: 100, value: 85, onChange: () => { customInput.value = ''; updatePreview(); } });
		litSlider = createSlider({ label: litLabel, min: 0, max: 100, value: 65, onChange: () => { customInput.value = ''; updatePreview(); } });

		slidersContainer.append(hueSlider.el, satSlider.el, litSlider.el);
	}

	// Handler for "Open Settings" button when in single color mode
	const openSettingsBtn = dialog.querySelector('#picker-open-settings');
	if (openSettingsBtn) {
		openSettingsBtn.addEventListener('click', () => {
			dialog.close();
			createSettingsPanel();
		});
	}

	function getTextColor() {
		// In single color mode, return saved color or null (let getNickBase handle it)
		if (eff.useSingleColor || !hueSlider) {
			return customInput?.value?.trim() || null;
		}
		// Save raw slider values - mapping happens on display
		return customInput.value.trim() || `hsl(${hueSlider.getValue()}, ${satSlider.getValue()}%, ${litSlider.getValue()}%)`;
	}

	function updateGradients() {
		// Skip gradient updates if sliders don't exist (single color mode)
		if (!hueSlider || !satSlider || !litSlider) return;

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

		// Build temporary styles object from current dialog state (using engine values)
		const textColor = getTextColor();
		const prependIconState = engine.getFieldValue('prependIconEnabled');
		const appendIconState = engine.getFieldValue('appendIconEnabled');
		const weightState = engine.getFieldValue('fontWeight');
		const italicState = engine.getFieldValue('fontStyle');
		const caseState = engine.getFieldValue('fontVariant');
		const invertState = engine.getFieldValue('invert');

		const tempStyles = { ...cssStringToStyles(engine.getFieldValue('customCss') || '') };
		if (textColor) tempStyles.color = textColor;
		if (prependIconState === true) {
			tempStyles.prependIcon = (engine.getFieldValue('prependIcon') || '').trim();
		} else if (prependIconState === false) {
			tempStyles.prependIcon = '';
		}
		if (appendIconState === true) {
			tempStyles.appendIcon = (engine.getFieldValue('appendIcon') || '').trim();
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

		// Match site-settings-panel behavior: set siteConfig to effective values
		// and disable siteConfig to prevent double-application of site theme adjustments
		// The eff variable (computed at dialog open) already has site theme adjustments baked in
		const savedSiteConfig = { ...siteConfig };
		Object.assign(siteConfig, eff);
		siteConfig.useSiteThemeHue = false;
		siteConfig.useSiteThemeSat = false;
		siteConfig.useSiteThemeLit = false;

		// Determine icons for preview
		let prependValue = '';
		let appendValue = '';
		if (prependIconState === true) {
			prependValue = (engine.getFieldValue('prependIcon') || '').trim();
		} else if (prependIconState === null && siteConfig.prependIcon) {
			prependValue = hashIcon;
		}
		if (appendIconState === true) {
			appendValue = (engine.getFieldValue('appendIcon') || '').trim();
		} else if (appendIconState === null && siteConfig.appendIcon) {
			appendValue = hashIcon;
		}

		// Helper to apply styles to a preview element
		const applyPreviewStyles = (el, isMention, isInverted = false) => {
			el.style.cssText = '';
			applyStyles(el, username, {
				matchType: isMention ? 'mention' : 'nick',
				isInverted,
				debugData: DEBUG,
				mergeStyles: {
					prependIcon: prependValue,
					appendIcon: appendValue
				}
			});
		};

		// Update both previews (false = not mention, true = mention)
		applyPreviewStyles(preview, false, false);
		if (previewMention) applyPreviewStyles(previewMention, true, false);
		if (previewInverted) applyPreviewStyles(previewInverted, false, true);

		// Restore original configs AFTER applying preview styles
		Object.assign(siteConfig, savedSiteConfig);

		// Restore original customNickColors
		if (savedCustom !== undefined) {
			customNickColors[username] = savedCustom;
		} else {
			delete customNickColors[username];
		}
	}

	// Parse initial color - load raw saved values directly to sliders
	if (currentStyles.color && hueSlider && satSlider && litSlider) {
		const hsl = parseColor(currentStyles.color, 'hsl');
		if (hsl) {
			hueSlider.setValue(hsl.h); satSlider.setValue(hsl.s); litSlider.setValue(hsl.l);
		} else if (customInput) {
			customInput.value = currentStyles.color;
		}
	}

	// Color input handler (custom color text field)
	if (customInput) customInput.addEventListener('input', updatePreview);

	// Icon option click handlers - each icon picker targets its specific input via data-target
	engineContainer.addEventListener('click', (e) => {
		const option = e.target.closest('.nc-icon-option');
		if (option) {
			const icon = option.textContent;
			const iconOptions = option.closest('.picker-icon-options');
			const targetId = iconOptions?.dataset.target;
			if (targetId) {
				// Map the target ID to engine field key
				const fieldKey = targetId === 'settings-prependIcon' ? 'prependIcon' : 'appendIcon';
				engine.setFieldValue(fieldKey, icon);
				updatePreview();
			}
			// Brief visual feedback
			option.style.background = 'var(--nc-fg-dim)';
			setTimeout(() => { option.style.background = ''; }, 150);
		}
	});

	// Helper to build current styles object (uses engine values)
	function buildCurrentStyles() {
		const textColor = getTextColor();
		const prependIconState = engine.getFieldValue('prependIconEnabled');
		const appendIconState = engine.getFieldValue('appendIconEnabled');
		const weightState = engine.getFieldValue('fontWeight');
		const italicState = engine.getFieldValue('fontStyle');
		const caseState = engine.getFieldValue('fontVariant');
		const invertState = engine.getFieldValue('invert');

		const styles = { ...cssStringToStyles(engine.getFieldValue('customCss') || '') };
		if (textColor) styles.color = textColor;
		if (prependIconState === true) {
			styles.prependIcon = (engine.getFieldValue('prependIcon') || '').trim();
		} else if (prependIconState === false) {
			styles.prependIcon = '';
		}
		if (appendIconState === true) {
			styles.appendIcon = (engine.getFieldValue('appendIcon') || '').trim();
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

	// Helper to apply imported user settings to the dialog (uses engine)
	function applyImportedUserSettings(settings) {
		// Apply color
		if (settings.color && hueSlider && satSlider && litSlider) {
			const hsl = parseColor(settings.color, 'hsl');
			if (hsl) {
				hueSlider.setValue(hsl.h);
				satSlider.setValue(hsl.s);
				litSlider.setValue(hsl.l);
			} else if (customInput) {
				customInput.value = settings.color;
			}
		}
		// Apply CSS (backgroundColor and other styles)
		const cssProps = [];
		if (settings.backgroundColor) cssProps.push(`background-color: ${settings.backgroundColor}`);
		if (cssProps.length > 0) {
			engine.setFieldValue('customCss', cssProps.join(';\n'));
		}
		// Apply prepend icon
		if (settings.prependIcon !== undefined) {
			if (settings.prependIcon === '') {
				engine.setFieldValue('prependIconEnabled', false);
			} else {
				engine.setFieldValue('prependIconEnabled', true);
				engine.setFieldValue('prependIcon', settings.prependIcon);
			}
		}
		// Apply append icon
		if (settings.appendIcon !== undefined) {
			if (settings.appendIcon === '') {
				engine.setFieldValue('appendIconEnabled', false);
			} else {
				engine.setFieldValue('appendIconEnabled', true);
				engine.setFieldValue('appendIcon', settings.appendIcon);
			}
		}
		// Apply style overrides
		if (settings.fontWeight !== undefined) {
			const state = settings.fontWeight === 'bold' ? true : settings.fontWeight === 'normal' ? false : null;
			engine.setFieldValue('fontWeight', state);
		}
		if (settings.fontStyle !== undefined) {
			const state = settings.fontStyle === 'italic' ? true : settings.fontStyle === 'normal' ? false : null;
			engine.setFieldValue('fontStyle', state);
		}
		if (settings.fontVariant !== undefined) {
			const state = settings.fontVariant === 'small-caps' ? true : settings.fontVariant === 'normal' ? false : null;
			engine.setFieldValue('fontVariant', state);
		}
		if (settings.invert !== undefined) {
			engine.setFieldValue('invert', settings.invert);
		}
		updatePreview();
	}

	updatePreview();
}

// =====================================================
// SETTINGS PANEL
// =====================================================

function createSettingsPanel()
{
	const eff = getEffectiveSiteConfig();
	const theme = getThemeColors(null, 'hsl');
	const {
		settings: defaultSettings,
		colorVariables: defaultColors
	} = getThemeDefaultSettings();

	const dialog = createDialog({
		title: 'Nick Color Settings',
		width: '400px',
		preview: `<div class="preview-row" id="settings-preview"></div>
			<div class="preview-row preview-inverted" id="settings-preview-inverted"></div>`,
		content: `
			${createDebugPre({
				'Site Theme': Object.entries(theme).length ? 
					'<span>' + Object.entries(theme).filter(([key, value]) => key.match(/^info|error|warn|success/i) ? false : true).map(([key, value]) => `${key}: ${parseColor(value, 'hsl-string') + ` <span style="border: 1px solid var(--nc-border); color: ${parseColor(value, 'hsl-string')}">███</span>`}`).join('</span><br /><span>') + '</span>' : 
					'not detected',
				'Effective Config': `H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`,
				'Contrast Threshold': eff.contrastThreshold,
				'Custom Colors Saved': Object.keys(customNickColors).length
			})}
			${createInputRow({
				label: 'Preset Theme:',
				id: 'settings-preset',
				type: 'select',
				options: `<option value="">-- Select a preset --</option>${Object.keys(PRESET_THEMES).map(name => `<option value="${name.toLowerCase()}">${name}</option>`).join('')}`
			})}
			<hr />
			<div id="settings-engine-container"></div>
		`,
		buttons: [
			{ label: 'Save', class: 'save', onClick: (close) => {
				siteConfig = engine.getValues();
				saveSiteConfig();
				refreshAllColors();
				close();
			}},
			{ label: 'Reset', class: 'reset', onClick: () => {
				// Reset to currently selected preset theme (or site theme if none selected)
				const selectedTheme = presetSelect.value || siteThemeName || '';
				const themeDefaults = getThemeDefaultSettings(selectedTheme);
				const resetSettings = themeDefaults.settings;
				const resetColors = themeDefaults.colorVariables;
				engine.setValues({
					...resetSettings,
					hueRange: [resetSettings.minHue, resetSettings.maxHue],
					satRange: [resetSettings.minSaturation, resetSettings.maxSaturation],
					litRange: [resetSettings.minLightness, resetSettings.maxLightness],
					singleColorHue: resetColors.fg?.h ?? resetSettings.singleColorHue,
					singleColorSat: resetColors.fg?.s ?? resetSettings.singleColorSat,
					singleColorLit: resetColors.fg?.l ?? resetSettings.singleColorLit,
				}, true);
				presetSelect.value = selectedTheme.toLowerCase();
				updatePreview();
			}},
			{ label: 'Cancel', class: 'cancel', onClick: (close) => close() }
		]
	});

	const engineContainer = dialog.querySelector('#settings-engine-container');
	const presetSelect = dialog.querySelector('#settings-preset');
	const previewRow = dialog.querySelector('#settings-preview');
	const previewRowInverted = dialog.querySelector('#settings-preview-inverted');

	const previewNames = [
		'z0ylent', 'fr33Kevin', 'triNity', 'an0nym0us', 'ZeR0C00L',
		'l1sb3th', 'enki', 'genghis_khan', 'acidBurn', 'neo', 'N3tRuNn3r', 
		'ByteMe99', 'CyB3rPuNk'
	];

	previewNames.forEach(name => {
		const span = document.createElement('span');
		span.className = 'preview-nick';
		span.textContent = name;
		previewRow.appendChild(span);
	});
	// Also add to inverted row
	previewNames.forEach(name => {
		const span = document.createElement('span');
		span.className = 'preview-nick';
		span.textContent = name;
		previewRowInverted.appendChild(span);
	});

	// Define the settings schema
	const schema = [
		{ type: 'section', label: 'Color Mode', fields: [
			{ key: 'useSingleColor', type: 'toggle', label: 'Use single color for all nicks', default: false },
			{ type: 'hint', text: 'All usernames will use the same color. Per-user color customization is disabled.',
				showWhen: { field: 'useSingleColor', is: true } },
			{ key: 'singleColorHue', type: 'slider', label: 'Hue', min: 0, max: 360,
				default: defaultColors.fg?.h ?? 180, simple: false,
				showWhen: { field: 'useSingleColor', is: true } },
			{ key: 'singleColorSat', type: 'slider', label: 'Saturation', min: 0, max: 100,
				default: defaultColors.fg?.s ?? 85, simple: false,
				showWhen: { field: 'useSingleColor', is: true } },
			{ key: 'singleColorLit', type: 'slider', label: 'Lightness', min: 0, max: 100,
				default: defaultColors.fg?.l ?? 65, simple: false,
				showWhen: { field: 'useSingleColor', is: true } },
			{ key: 'singleColorCustom', type: 'text', label: 'Or use a custom color:',
				placeholder: '#ff6b6b or hsl(280, 90%, 65%)', default: '',
				showWhen: { field: 'useSingleColor', is: true } },
		]},

		{ type: 'section', label: `Hue Range${theme.fg ? '' : ' <span class="nc-text-dim">(no site theme)</span>'}`, showWhen: { field: 'useSingleColor', is: false }, fields: [
			{ key: 'useSiteThemeHue', type: 'toggle',
				label: `Use site theme foreground hue${theme.fg ? ` <span style="color:hsl(${theme.fg.h}, 100%, 50%)">(${theme.fg.h}°)</span>` : ''}`,
				default: false, disabled: !theme.fg,
				showWhen: { field: 'useSingleColor', is: false } },
			{ key: 'hueSpread', type: 'slider', label: 'Hue spread (±°)', min: 5, max: 180, default: 30,
				showWhen: { all: [{ field: 'useSingleColor', is: false }, { field: 'useSiteThemeHue', is: true }] } },
			{ key: 'hueRange', type: 'range', label: 'Hue Range', min: 0, max: 360, default: [0, 360],
				showWhen: { field: 'useSingleColor', is: false } },
		]},

		{ type: 'section', label: 'Saturation Range', showWhen: { field: 'useSingleColor', is: false }, fields: [
			{ key: 'useSiteThemeSat', type: 'toggle',
				label: `Use site theme foreground saturation${theme?.fg ? ` <span style="color:${theme.fg}">(${theme.fg.s}%)</span>` : ''}`,
				default: false, disabled: !theme.fg,
				showWhen: { field: 'useSingleColor', is: false } },
			{ key: 'satSpread', type: 'slider', label: 'Saturation spread (±%)', min: 0, max: 50, default: 15,
				showWhen: { all: [{ field: 'useSingleColor', is: false }, { field: 'useSiteThemeSat', is: true }] } },
			{ key: 'satRange', type: 'range', label: 'Saturation Range', min: 0, max: 100, default: [70, 100],
				showWhen: { field: 'useSingleColor', is: false } },
		]},

		{ type: 'section', label: 'Lightness Range', showWhen: { field: 'useSingleColor', is: false }, fields: [
			{ key: 'useSiteThemeLit', type: 'toggle',
				label: `Use site theme foreground lightness${theme?.fg ? ` <span style="color:${theme.fg}">(${theme.fg.l}%)</span>` : ''}`,
				default: false, disabled: !theme.fg,
				showWhen: { field: 'useSingleColor', is: false } },
			{ key: 'litSpread', type: 'slider', label: 'Lightness spread (±%)', min: 0, max: 50, default: 10,
				showWhen: { all: [{ field: 'useSingleColor', is: false }, { field: 'useSiteThemeLit', is: true }] } },
			{ key: 'litRange', type: 'range', label: 'Lightness Range', min: 0, max: 100, default: [55, 75],
				showWhen: { field: 'useSingleColor', is: false } },
		]},

		{ type: 'section', label: 'Contrast', fields: [
			{ type: 'hint', text: 'Auto-invert colors when WCAG contrast ratio is below threshold (0 = disabled, 3 = large text, 4.5 = AA, 7 = AAA)' },
			{ key: 'contrastThreshold', type: 'slider', label: 'Contrast Threshold (WCAG ratio)',
				min: 0, max: 21, step: 0.5, default: 4.5 },
		]},

		{ type: 'section', label: 'Style Variation', fields: [
			{ type: 'hint', text: 'Add non-color variation to usernames (useful for limited color ranges)' },
			{ key: 'varyWeight', type: 'toggle', label: 'Vary font weight', default: false },
			{ key: 'varyItalic', type: 'toggle', label: 'Vary italic', default: false },
			{ key: 'varyCase', type: 'toggle', label: 'Vary small-caps', default: false },
			{ key: 'prependIcon', type: 'toggle', label: 'Prepend icon', default: false },
			{ key: 'appendIcon', type: 'toggle', label: 'Append icon', default: false },
			{ key: 'iconSet', type: 'text', label: 'Icon set (space-separated)',
				placeholder: '● ○ ◆ ◇ ■ □ ▲ △ ★ ☆',
				default: '● ○ ◆ ◇ ■ □ ▲ △ ★ ☆ ♦ ♠ ♣ ♥ ☢ ☣ ☠ ⚙ ⬡ ⬢ ♻ ⚛ ⚠ ⛒',
				showWhen: { any: [{ field: 'prependIcon', is: true }, { field: 'appendIcon', is: true }] } },
		]},

		{ type: 'section', label: 'Backup', fields: [
			{ type: 'button', label: 'Export settings to file', id: 'settings-export-file', buttonText: 'Save Settings File',
				onClick: () => {
					const data = exportSettings();
					const timestamp = new Date().toISOString().slice(0, 10);
					saveToFile(data, `nick-colors-settings-${timestamp}.json`);
				}},
			{ type: 'button', label: 'Export settings to clipboard', id: 'settings-export-copy', buttonText: 'Copy to Clipboard',
				onClick: async () => {
					try {
						await copyToClipboard(exportSettings());
						alert('Settings copied to clipboard');
					} catch (err) {
						alert(err.message);
					}
				}},
			{ type: 'button', label: 'Import settings from file', id: 'settings-import-file', buttonText: 'Load Settings File',
				onClick: () => {
					loadFromFile((data, err) => {
						if (err) { alert(err.message); return; }
						const result = importSettings(data);
						alert(result.message);
						if (result.success) {
							const settingsOverlay = document.querySelector('.nc-dialog-overlay');
							if (settingsOverlay) {
								settingsOverlay.remove();
								createSettingsPanel();
							}
						}
					});
				}},
			{ type: 'button', label: 'Import settings from clipboard', id: 'settings-import-paste', buttonText: 'Paste from Clipboard',
				onClick: () => {
					showPasteDialog((data, err) => {
						if (err) { alert(err.message); return; }
						const result = importSettings(data);
						alert(result.message);
						if (result.success) {
							const settingsOverlay = document.querySelector('.nc-dialog-overlay');
							if (settingsOverlay) {
								settingsOverlay.remove();
								createSettingsPanel();
							}
						}
					});
				}},
		]},

		{ type: 'section', label: 'Debug', noHr: true, fields: [
			{ key: 'debugMode', type: 'toggle', label: 'Enable debug mode', default: DEBUG,
				onChange: (value) => {
					DEBUG = value;
					saveDebugMode();
				}},
			{ type: 'button', label: 'Export debug log to file', id: 'settings-debug-export-file', buttonText: 'Save Debug File',
				onClick: () => {
					const text = exportDebugLogs();
					const timestamp = new Date().toISOString().slice(0, 10);
					downloadText(text, `nick-colors-debug-${timestamp}.txt`);
				}},
			{ type: 'button', label: 'Export debug log to clipboard', id: 'settings-debug-export-copy', buttonText: 'Copy to Clipboard',
				onClick: async () => {
					try {
						await navigator.clipboard.writeText(exportDebugLogs());
						alert('Debug log copied to clipboard');
					} catch (err) {
						alert(`Failed to copy: ${err.message}`);
					}
				}},
			{ type: 'button', label: 'Report an issue', id: 'settings-report-issue', buttonText: 'Report Issue',
				onClick: () => showReportIssueDialog() },
		]},
	];

	// Create the settings engine with initial values
	const initialValues = {
		...eff,
		// Map the min/max values to range arrays
		hueRange: [eff.minHue, eff.maxHue],
		satRange: [eff.minSaturation, eff.maxSaturation],
		litRange: [eff.minLightness, eff.maxLightness],
		debugMode: DEBUG,
	};

	const engine = createSettingsEngine({
		schema,
		values: initialValues,
		defaults: defaultSettings,
		onChange: (key, value) => {
			// Handle special cases
			if (key === 'useSiteThemeHue' || key === 'hueSpread') {
				updateRangeFromSpread('hue');
			}
			if (key === 'useSiteThemeSat' || key === 'satSpread') {
				updateRangeFromSpread('sat');
			}
			if (key === 'useSiteThemeLit' || key === 'litSpread') {
				updateRangeFromSpread('lit');
			}
			updateGradients();
			updatePreview();
		},
		container: engineContainer
	});

	engine.render();

	// Update range slider from spread value (when using site theme)
	function updateRangeFromSpread(type) {
		if (!theme.fg) return;

		const useTheme = engine.getFieldValue(`useSiteTheme${type.charAt(0).toUpperCase() + type.slice(1)}`);
		if (!useTheme) return;

		const spread = engine.getFieldValue(`${type}Spread`);
		const rangeField = engine.getField(`${type}Range`);

		if (type === 'hue') {
			const minHue = (theme.fg.h - spread + 360) % 360;
			const maxHue = (theme.fg.h + spread) % 360;
			rangeField?.setValues([minHue, maxHue]);
		} else if (type === 'sat') {
			const minSat = Math.max(0, theme.fg.s - spread);
			const maxSat = Math.min(100, theme.fg.s + spread);
			rangeField?.setValues([minSat, maxSat]);
		} else if (type === 'lit') {
			const minLit = Math.max(0, theme.fg.l - spread);
			const maxLit = Math.min(100, theme.fg.l + spread);
			rangeField?.setValues([minLit, maxLit]);
		}
	}

	// Grey out range sliders when using site theme
	function updateSliderState(fieldKey, disabled) {
		const field = engine.getField(fieldKey);
		if (!field?.wrapper) return;
		field.wrapper.style.pointerEvents = disabled ? 'none' : 'auto';
		const thumbs = field.wrapper.querySelectorAll('.nc-slider-thumb');
		thumbs.forEach(thumb => {
			thumb.style.background = disabled ? 'var(--nc-fg-dim)' : '';
			thumb.style.cursor = disabled ? 'default' : '';
		});
	}

	// Update gradients on all sliders
	function updateGradients() {
		const hueRange = engine.getField('hueRange');
		const satRange = engine.getField('satRange');
		const litRange = engine.getField('litRange');
		const hueSingle = engine.getField('singleColorHue');
		const satSingle = engine.getField('singleColorSat');
		const litSingle = engine.getField('singleColorLit');

		if (!hueRange || !satRange || !litRange) return;

		const [minH, maxH] = hueRange.getValues?.() || [0, 360];
		const [minS, maxS] = satRange.getValues?.() || [70, 100];
		const [minL, maxL] = litRange.getValues?.() || [55, 75];
		const midH = (minH + maxH) / 2, midS = (minS + maxS) / 2, midL = (minL + maxL) / 2;

		// Hue gradient
		const hueStops = Array.from({ length: 13 }, (_, i) => {
			const hue = i * 30;
			return [hue, midS, midL, 1, (i * 30 / 360) * 100];
		});
		hueRange.setGradient?.(hueStops);
		satRange.setGradient?.([[midH, 0, midL, 1, 0], [midH, 100, midL, 1, 100]]);
		litRange.setGradient?.([[midH, midS, 0, 1, 0], [midH, midS, 50, 1, 50], [midH, midS, 100, 1, 100]]);

		// Range thumb colors
		hueRange.setThumbColor?.([
			`hsl(${minH}, ${midS}%, ${midL}%)`,
			`hsl(${maxH}, ${midS}%, ${midL}%)`
		]);
		satRange.setThumbColor?.([
			`hsl(${midH}, ${minS}%, ${midL}%)`,
			`hsl(${midH}, ${maxS}%, ${midL}%)`
		]);
		litRange.setThumbColor?.([
			`hsl(${midH}, ${midS}%, ${minL}%)`,
			`hsl(${midH}, ${midS}%, ${maxL}%)`
		]);

		// Single color sliders
		if (hueSingle && satSingle && litSingle) {
			const h = hueSingle.getValue?.() ?? 180;
			const s = satSingle.getValue?.() ?? 85;
			const l = litSingle.getValue?.() ?? 65;

			const fullHueStops = Array.from({ length: 13 }, (_, i) => {
				const hue = i * 30;
				return [hue, s, l, 1, (hue / 360) * 100];
			});
			hueSingle.setGradient?.(fullHueStops);
			satSingle.setGradient?.([[h, 0, l, 1, 0], [h, 100, l, 1, 100]]);
			litSingle.setGradient?.([[h, s, 0, 1, 0], [h, s, 50, 1, 50], [h, s, 100, 1, 100]]);

			// Single slider thumb colors
			hueSingle.setThumbColor?.(`hsl(${h}, ${s}%, ${l}%)`);
			satSingle.setThumbColor?.(`hsl(${h}, ${s}%, ${l}%)`);
			litSingle.setThumbColor?.(`hsl(${h}, ${s}%, ${l}%)`);
		}

		// Update slider disabled states
		updateSliderState('hueRange', engine.getFieldValue('useSiteThemeHue'));
		updateSliderState('satRange', engine.getFieldValue('useSiteThemeSat'));
		updateSliderState('litRange', engine.getFieldValue('useSiteThemeLit'));
	}

	// Build effective config from engine values
	function getEffective() {
		const s = engine.getValues();
		const result = { ...s };

		// Map range arrays back to min/max
		if (s.hueRange) {
			result.minHue = s.hueRange[0];
			result.maxHue = s.hueRange[1];
		}
		if (s.satRange) {
			result.minSaturation = s.satRange[0];
			result.maxSaturation = s.satRange[1];
		}
		if (s.litRange) {
			result.minLightness = s.litRange[0];
			result.maxLightness = s.litRange[1];
		}

		return result;
	}

	// Update preview nicks
	function updatePreview() {
		updateGradients();
		const effConfig = getEffective();
		// Use selected preset theme for preview, or fall back to site theme
		const previewTheme = presetSelect.value || siteThemeName || '';

		previewRow.querySelectorAll('.preview-nick').forEach((el, i) => {
			const username = previewNames[i];
			applyStyles(el, username, {
				effectiveConfig: effConfig,
				themeName: previewTheme,
				isInverted: false,
				debugData: DEBUG
			});
		});

		// Update inverted preview
		previewRowInverted.querySelectorAll('.preview-nick').forEach((el, i) => {
			const username = previewNames[i];
			applyStyles(el, username, {
				effectiveConfig: effConfig,
				themeName: previewTheme,
				isInverted: true,
				debugData: DEBUG
			});
		});
	}

	// Preset theme selection
	presetSelect.addEventListener('change', () => {
		const switchTheme = presetSelect.value;
		const themeSettings = getThemeDefaultSettings(switchTheme);
		if (themeSettings?.settings) {
			const p = themeSettings.settings;
			engine.setValues({
				hueRange: [p.minHue, p.maxHue],
				satRange: [p.minSaturation, p.maxSaturation],
				litRange: [p.minLightness, p.maxLightness],
				contrastThreshold: p.contrastThreshold || 4.5,
			}, true);
			updatePreview();
		}
	});

	// Override engine.getValues to return the right format for saving
	const originalGetValues = engine.getValues.bind(engine);
	engine.getValues = () => {
		const vals = originalGetValues();
		// Convert range arrays to min/max properties
		const result = { ...vals };
		if (vals.hueRange) {
			result.minHue = vals.hueRange[0];
			result.maxHue = vals.hueRange[1];
			delete result.hueRange;
		}
		if (vals.satRange) {
			result.minSaturation = vals.satRange[0];
			result.maxSaturation = vals.satRange[1];
			delete result.satRange;
		}
		if (vals.litRange) {
			result.minLightness = vals.litRange[0];
			result.maxLightness = vals.litRange[1];
			delete result.litRange;
		}
		// Don't save debugMode in siteConfig
		delete result.debugMode;
		return result;
	};

	// Initial setup
	updateRangeFromSpread('hue');
	updateRangeFromSpread('sat');
	updateRangeFromSpread('lit');
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