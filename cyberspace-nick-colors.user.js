// ==UserScript==
// @name         Cyberspace Nick Colors
// @namespace    https://cyberspace.online/
// @version      1.0
// @description  Consistent bright colors for usernames across the site
// @match        https://cyberspace.online/*
// @grant        GM_registerMenuCommand
// @grant        GM.registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
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

	// Manual color overrides - set specific users to specific styles
	// Format: 'username': { ...CSS style properties }
	// Or simple format: 'username': 'css-color' (text color only)
	const MANUAL_OVERRIDES = {
	  'z0ylent': { color: '#00FF00' },
	  'frexxx': { color: '#5a8a55', backgroundColor: '#000000' }
	};

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
		contrastThreshold: 0, // 0-50, add outline if lightness contrast below this (0 = disabled)
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
			color: { minSaturation: 60, maxSaturation: 80, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 0 }
		},
		// Light: fg #000 (black text on light bg - needs high contrast colors)
		'Light': {
			color: { minSaturation: 70, maxSaturation: 90, minLightness: 30, maxLightness: 45, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 0 }
		},
		// C64: fg white on blue bg #2a2ab8 - retro blue theme
		'C64': {
			color: { minSaturation: 70, maxSaturation: 90, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 280, excludeRanges: [], contrastThreshold: 0 }
		},
		// VT320: fg #ff9a10 (orange, ~35° hue) - amber terminal
		'VT320': {
			color: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 15, maxHue: 55, excludeRanges: [], contrastThreshold: 0 }
		},
		// Matrix: fg rgba(160,224,68,.9) (green, ~85° hue) - green terminal
		'Matrix': {
			color: { minSaturation: 75, maxSaturation: 95, minLightness: 45, maxLightness: 60, minHue: 70, maxHue: 140, excludeRanges: [], contrastThreshold: 0 }
		},
		// Poetry: fg #222 (dark text on light bg) - elegant minimal
		'Poetry': {
			color: { minSaturation: 40, maxSaturation: 60, minLightness: 30, maxLightness: 45, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 0 }
		},
		// Brutalist: fg #c0d0e8 (cool blue-gray, ~220° hue)
		'Brutalist': {
			color: { minSaturation: 50, maxSaturation: 70, minLightness: 60, maxLightness: 75, minHue: 180, maxHue: 260, excludeRanges: [], contrastThreshold: 0 }
		},
		// GRiD: fg #fea813 (orange, ~40° hue) - warm amber
		'GRiD': {
			color: { minSaturation: 90, maxSaturation: 100, minLightness: 50, maxLightness: 65, minHue: 20, maxHue: 60, excludeRanges: [], contrastThreshold: 0 }
		},
		// System: fg #efe5c0 (same as Dark)
		'System': {
			color: { minSaturation: 60, maxSaturation: 80, minLightness: 65, maxLightness: 80, minHue: 0, maxHue: 360, excludeRanges: [], contrastThreshold: 0 }
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

	function generateStyles(username) {
		// Check user-saved overrides first (takes precedence over manual)
		if (customNickColors[username]) {
			const custom = customNickColors[username];
			if (typeof custom === 'string') {
				return { color: custom };
			}
			return { ...custom };
		}
		// Then check hardcoded manual overrides
		if (MANUAL_OVERRIDES[username]) {
			const override = MANUAL_OVERRIDES[username];
			if (typeof override === 'string') {
				return { color: override };
			}
			return { ...override };
		}

		// Get effective config (with site theme overrides applied)
		const effectiveConfig = getEffectiveColorConfig();

		// Generate from hash - use different parts of the hash for each property
		const hash = hashString(username);
		const hash2 = hashString(username + '_sat');
		const hash3 = hashString(username + '_lit');

		// Hue range (with wrap-around support)
		let hueRange = effectiveConfig.maxHue - effectiveConfig.minHue;
		if (hueRange <= 0) hueRange += 360;
		let hue = effectiveConfig.minHue + (hash % hueRange);
		if (hue >= 360) hue -= 360;

		// Avoid excluded ranges by shifting
		let attempts = 0;
		while (isHueExcluded(hue, effectiveConfig) && attempts < 36) {
			hue = (hue + 10) % 360;
			attempts++;
		}

		// Saturation range
		const satRange = effectiveConfig.maxSaturation - effectiveConfig.minSaturation;
		const saturation = effectiveConfig.minSaturation + (hash2 % Math.max(1, satRange + 1));

		// Lightness range
		const litRange = effectiveConfig.maxLightness - effectiveConfig.minLightness;
		const lightness = effectiveConfig.minLightness + (hash3 % Math.max(1, litRange + 1));

		const styles = {
			color: `hsl(${hue}, ${saturation}%, ${lightness}%)`
		};

		// Invert colors if contrast is below threshold
		const threshold = effectiveConfig.contrastThreshold || 0;
		if (threshold > 0) {
			const bgLightness = getBackgroundLightness();
			const contrast = Math.abs(lightness - bgLightness);
			if (contrast < threshold) {
				// Swap: color becomes background, use page background as text
				styles.backgroundColor = styles.color;
				styles.color = 'var(--color-bg, #000)';
				styles.padding = '0 0.25em';
			}
		}

		return styles;
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
		const text = element.textContent.trim();
		if (text && text.length < 30 && !text.includes(' ')) {
		  	//if starts with @ remove
		  	if(text.startsWith('@')) return text.slice(1);
			return text;
		}

		return null;
	}

	function isLikelyUsername(element) {
		// Skip already processed
		if (element.dataset.nickColored) return false;

		// Skip if text content contains spaces (not a username)
		const text = element.textContent.trim();
		if (text.includes(' ')) return false;

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
				span.textContent = m.full;
				span.dataset.mentionColored = 'true';
				span.dataset.username = m.username;

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
		.nc-slider-thumb {
			position: absolute; top: 0; width: 14px; height: 22px;
			background: var(--color-fg, #fff); 
			border: 1px solid var(--color-border, #333);
			cursor: ew-resize; transform: translateX(-50%); z-index: 2;
			display: flex; align-items: center; justify-content: center;
			font-size: 8px; 
			color: var(--color-bg, #000); user-select: none;
		}
		.nc-slider-thumb:hover { background: var(--color-fg-dim, #ccc); }
		.nc-slider-labels {
			display: flex; justify-content: space-between; margin-top: 2px;
			font-size: 0.625rem; color: var(--color-fg-dim, #888);
		}
	`;
	document.head.appendChild(sliderStyles);

	/**
	 * Creates a slider (single or range type)
	 * @param {Object} opts - { type: 'single'|'range', min, max, value/values, gradient, onChange, label }
	 * @returns {Object} - { el, getValue/getValues, setValue/setValues, setGradient }
	 */
	function createSlider(opts) {
		const { type = 'single', min = 0, max = 100, onChange, label } = opts;
		const isRange = type === 'range';

		const container = document.createElement('div');
		container.innerHTML = `
			${label ? `<label style="display:block;margin:0.5rem 0 0.25rem;font-size:0.75rem;color:var(--color-fg-dim,#888)">${label}</label>` : ''}
			<div class="nc-slider">
				<div class="nc-slider-track"></div>
				${isRange ? '<div class="nc-slider-thumb" data-i="0">▶</div><div class="nc-slider-thumb" data-i="1">◀</div>'
						 : '<div class="nc-slider-thumb" data-i="0"></div>'}
			</div>
			<div class="nc-slider-labels"><span></span>${isRange ? '<span></span>' : ''}</div>
		`;

		const track = container.querySelector('.nc-slider-track');
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

		if (opts.gradient) setGradient(opts.gradient);
		update();

		return {
			el: container,
			getValue: () => values[0],
			getValues: () => [...values],
			setValue: (v) => { values[0] = v; update(); },
			setValues: (vs) => { values = [...vs]; update(); },
			setGradient
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
			background: var(--color-bg, #0a0a0a); border: 1px solid var(--color-border, #333);
			color: var(--color-fg, #eee); max-height: 80vh; display: flex; flex-direction: column;
		}
		.nc-dialog-header {
			padding: 1rem 1rem 0.5rem; border-bottom: 1px solid var(--color-border, #333);
			flex-shrink: 0;
		}
		.nc-dialog-content {
			padding: 0.5rem 1rem; overflow-y: auto; flex: 1;
		}
		.nc-dialog-footer {
			padding: 0.5rem 1rem 1rem; border-top: 1px solid var(--color-border, #333);
			flex-shrink: 0;
		}
		.nc-dialog h3 {
			margin: 0; color: var(--color-fg, #fff); font-size: 0.875rem;
			text-transform: uppercase; letter-spacing: 0.05em;
		}
		.nc-dialog h4 {
			margin: 1rem 0 0.5rem 0; color: var(--color-fg-dim, #888); font-size: 0.75rem;
			text-transform: uppercase; letter-spacing: 0.1em;
			border-top: 1px solid var(--color-border, #333); padding-top: 1rem;
		}
		.nc-dialog h4:first-child { margin-top: 0; border-top: none; padding-top: 0; }
		.nc-dialog .buttons { display: flex; gap: 0.5rem; }
		.nc-dialog button {
			flex: 1; padding: 0.5rem;
		}
		.nc-dialog button:hover { border-color: var(--color-fg-dim, #666); }
		.nc-dialog button.link-brackets {
			background: none; border: none; padding: 0;
			color: var(--color-fg-dim, #888);
		}
		.nc-dialog button.link-brackets:hover { border-color: var(--color-fg, #FFF); }
		.nc-dialog button.link-brackets .inner::before {
			content: "[";
		}
		.nc-dialog button.link-brackets .inner::after {
			content: "]";
		}
		.nc-dialog input[type="text"], .nc-dialog textarea, .nc-dialog select {
			width: 100%; padding: 0.5rem; background: var(--color-bg, #0a0a0a);
			border: 1px solid var(--color-border, #333); color: var(--color-fg, #fff);
			font-family: inherit; font-size: 0.75rem; box-sizing: border-box;
		}
		.nc-dialog textarea { min-height: 70px; resize: vertical; }
		.nc-dialog input[type="checkbox"] { margin-right: 0.5rem; }
		.nc-dialog .checkbox-label {
			display: flex; align-items: center; cursor: pointer;
			color: var(--color-fg, #ccc); margin: 0.5rem 0; font-size: 0.75rem;
		}
		.nc-dialog .hint { font-size: 0.625rem; color: var(--color-fg-dim, #666); margin-top: 0.25rem; }
		.nc-dialog .preview {
			font-size: 0.875rem; margin: 0.75rem 0; padding: 0.5rem;
			border: 1px solid var(--color-border, #333);
		}
		.nc-dialog .preview-row {
			display: flex; gap: 0.5rem; flex-wrap: wrap; margin: 0.75rem 0;
			padding: 0.5rem; border: 1px solid var(--color-border, #333);
		}
		.nc-dialog .preview-nick { padding: 0.125rem 0.25rem; }
	`;
	document.head.appendChild(dialogStyles);

	/**
	 * Creates a dialog with standard structure
	 * @param {Object} opts - { title, content, buttons, width, onClose }
	 * @returns {Object} - { el, close, querySelector, querySelectorAll }
	 */
	function createDialog(opts) {
		const { title, content, buttons = [], width = '400px', onClose } = opts;

		const overlay = document.createElement('div');
		overlay.className = 'nc-dialog-overlay';
		overlay.innerHTML = `
			<div class="nc-dialog" style="min-width: ${width}; max-width: calc(${width} + 100px);">
				<div class="nc-dialog-header">
					<h3>${title}</h3>
				</div>
				<div class="nc-dialog-content">
					${content}
				</div>
				${buttons.length > 0 ? `
				<div class="nc-dialog-footer">
					<div class="buttons">
						${buttons.map(b => `<button class="${b.class || ''} link-brackets"><span class="inner">${b.label}</span></button>`).join('')}
					</div>
				</div>
				` : ''}
			</div>
		`;

		const close = () => {
			overlay.remove();
			onClose?.();
		};

		// Bind button handlers
		buttons.forEach(b => {
			const btn = overlay.querySelector(`button.${b.class}`);
			if (btn && b.onClick) {
				btn.addEventListener('click', () => b.onClick(close));
			}
		});

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
		const currentCssString = Object.entries(currentStyles)
			.filter(([key]) => key !== 'color')
			.map(([key, value]) => {
				const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
				return `${cssKey}: ${value};`;
			})
			.join('\n');

		const dialog = createDialog({
			title: `Color: ${username}`,
			width: '320px',
			content: `
				<div class="preview">&lt;<span id="picker-preview">${username}</span>&gt; Sample message</div>
				<h4>Text Color</h4>
				<div id="picker-sliders"></div>
				<label>Custom color value:</label>
				<input type="text" id="picker-custom" placeholder="#ff6b6b or hsl(280, 90%, 65%)">
				<h4>Additional CSS</h4>
				<textarea id="picker-css" placeholder="background-color: #1a1a2e;&#10;font-weight: bold;">${currentCssString}</textarea>
				<div class="hint">CSS properties, one per line</div>
			`,
			buttons: [
				{ label: 'Save', class: 'save', onClick: (close) => {
					const styles = { color: getTextColor(), ...parseCssText(cssInput.value) };
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
				{ label: 'Settings', class: 'settings' },
				{ label: 'Cancel', class: 'cancel', onClick: (close) => close() }
			]
		});

		// Bind settings button separately to avoid hoisting issues
		dialog.querySelector('.settings').addEventListener('click', () => {
			dialog.close();
			createSettingsPanel();
		});

		const preview = dialog.querySelector('#picker-preview');
		const customInput = dialog.querySelector('#picker-custom');
		const cssInput = dialog.querySelector('#picker-css');
		const slidersContainer = dialog.querySelector('#picker-sliders');

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

		// Create sliders
		const hueSlider = createSlider({ label: 'Hue (0-360)', min: 0, max: 360, value: 180, onChange: () => { customInput.value = ''; updatePreview(); } });
		const satSlider = createSlider({ label: 'Saturation (0-100)', min: 0, max: 100, value: 85, onChange: () => { customInput.value = ''; updatePreview(); } });
		const litSlider = createSlider({ label: 'Lightness (0-100)', min: 0, max: 100, value: 65, onChange: () => { customInput.value = ''; updatePreview(); } });

		slidersContainer.append(hueSlider.el, satSlider.el, litSlider.el);

		function getTextColor() {
			return customInput.value.trim() || `hsl(${hueSlider.getValue()}, ${satSlider.getValue()}%, ${litSlider.getValue()}%)`;
		}

		function updateGradients() {
			const h = hueSlider.getValue(), s = satSlider.getValue(), l = litSlider.getValue();
			const hueStops = Array.from({ length: 13 }, (_, i) => {
				const hue = i * 30;
				return [hue, s, l, 1, (hue / 360) * 100];
				//return `hsl(${hue}, ${s}%, ${l}%) ${(hue / 360) * 100}%`;
			});
			hueSlider.setGradient(hueStops); //`linear-gradient(to right, ${hueStops})`);
			satSlider.setGradient([[h, 0, l, 1, 0], [h, 100, l, 1, 100]]); //`linear-gradient(to right, hsl(${h}, 0%, ${l}%), hsl(${h}, 100%, ${l}%))`);
			litSlider.setGradient([[h, s, 0, 1, 0], [h, s, 50, 1, 50], [h, s, 100, 1, 100]]); //`linear-gradient(to right, hsl(${h}, ${s}%, 0%), hsl(${h}, ${s}%, 50%), hsl(${h}, ${s}%, 100%))`);
		}

		function updatePreview() {
			updateGradients();
			const color = getTextColor();
			preview.style.cssText = '';
			preview.style.color = color;
			Object.assign(preview.style, parseCssText(cssInput.value));
		}

		// Parse initial color
		if (currentStyles.color) {
			const m = currentStyles.color.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
			if (m) {
				hueSlider.setValue(+m[1]); satSlider.setValue(+m[2]); litSlider.setValue(+m[3]);
			} else {
				customInput.value = currentStyles.color;
			}
		}

		customInput.addEventListener('input', updatePreview);
		cssInput.addEventListener('input', updatePreview);
		updatePreview();
	}

	function refreshAllColors() {
		document.querySelectorAll('[data-nick-colored]').forEach(el => {
			delete el.dataset.nickColored;
			el.style.cssText = ''; // Clear applied styles
		});
		// Remove mention spans and restore original text
		document.querySelectorAll('[data-mention-colored]').forEach(el => {
			const text = el.textContent;
			el.replaceWith(document.createTextNode(text));
		});
		colorizeAll();
	}

	// =====================================================
	// SETTINGS PANEL
	// =====================================================

	function createSettingsPanel() {
		const dialog = createDialog({
			title: 'Nick Color Settings',
			width: '400px',
			content: `
				<h4>Preset Themes</h4>
				<select id="settings-preset">
					<option value="">-- Select a preset --</option>
					${Object.keys(PRESET_THEMES).map(name => `<option value="${name}">${name}</option>`).join('')}
				</select>
				<h4>Preview</h4>
				<div class="preview-row" id="settings-preview"></div>
				<h4>Hue Range</h4>
				<div id="hue-slider-container"></div>
				<h4>Color Properties</h4>
				<div id="sat-slider-container"></div>
				<div id="lit-slider-container"></div>
				<h4>Contrast</h4>
				<div class="hint" style="margin-top: -0.25rem; margin-bottom: 0.25rem;">
					Reverse foreground and background when lightness contrast is below threshold (0 = disabled)
				</div>
				<div id="contrast-slider-container"></div>
				<h4>Site Theme Integration${siteTheme ? '' : ' (no custom_theme found)'}</h4>
				${siteThemeHsl ? `<div class="hint" style="margin-bottom: 0.5rem;">
					Detected: <span style="color: ${siteTheme.fg}">${siteTheme.fg}</span>
					(H:${siteThemeHsl.h} S:${siteThemeHsl.s}% L:${siteThemeHsl.l}%)
				</div>` : ''}
				<label class="checkbox-label">
					<input type="checkbox" id="settings-site-hue" ${siteThemeConfig.useHueRange ? 'checked' : ''} ${siteThemeHsl ? '' : 'disabled'}>
					Use site theme hue range
				</label>
				<div id="hue-spread-container" style="margin-left: 24px; opacity: ${siteThemeHsl ? '1' : '0.5'}"></div>
				<label class="checkbox-label">
					<input type="checkbox" id="settings-site-saturation" ${siteThemeConfig.useSaturation ? 'checked' : ''} ${siteThemeHsl ? '' : 'disabled'}>
					Use site theme saturation
				</label>
				<label class="checkbox-label">
					<input type="checkbox" id="settings-site-lightness" ${siteThemeConfig.useLightness ? 'checked' : ''} ${siteThemeHsl ? '' : 'disabled'}>
					Use site theme lightness
				</label>
			`,
			buttons: [
				{ label: 'Save', class: 'save', onClick: (close) => {
					const s = getSettings();
					colorConfig = s.color;
					siteThemeConfig = s.siteTheme;
					saveColorConfig();
					saveSiteThemeConfig();
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
					presetSelect.value = '';
					updatePreview();
				}},
				{ label: 'Cancel', class: 'cancel', onClick: (close) => close() }
			]
		});

		const presetSelect = dialog.querySelector('#settings-preset');
		const previewRow = dialog.querySelector('#settings-preview');
		const previewNames = [
			'z0ylent', 'CyB3rPuNk_42', 'n30n_gh0st', 'ZeR0C00L', 'h4x0r_elite',
			'Ph4nt0m_', 'gl1tch_w1z', 'genghis_khan', 'ByteMe99', 'ShadowR00t',
			'v01d_w4lk3r', 'N3tRuNn3r', 'D34TH.exe', 'l33t_hax', 'CrYpT0_K1D'
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
			min: 0, max: 50, value: colorConfig.contrastThreshold || 0,
			label: 'Contrast Threshold', onChange: updatePreview
		});
		const hueSpreadSlider = createSlider({
			min: 5, max: 180, value: siteThemeConfig.hueSpread,
			label: 'Hue spread', onChange: updatePreview
		});

		dialog.querySelector('#hue-slider-container').appendChild(hueSlider.el);
		dialog.querySelector('#sat-slider-container').appendChild(satSlider.el);
		dialog.querySelector('#lit-slider-container').appendChild(litSlider.el);
		dialog.querySelector('#contrast-slider-container').appendChild(contrastSlider.el);
		dialog.querySelector('#hue-spread-container').appendChild(hueSpreadSlider.el);

		const siteHueInput = dialog.querySelector('#settings-site-hue');
		const siteSaturationInput = dialog.querySelector('#settings-site-saturation');
		const siteLightnessInput = dialog.querySelector('#settings-site-lightness');

		function getSettings() {
			const [minHue, maxHue] = hueSlider.getValues();
			const [minSaturation, maxSaturation] = satSlider.getValues();
			const [minLightness, maxLightness] = litSlider.getValues();
			return {
				color: { minHue, maxHue, minSaturation, maxSaturation, minLightness, maxLightness, excludeRanges: colorConfig.excludeRanges, contrastThreshold: contrastSlider.getValue() },
				siteTheme: { useHueRange: siteHueInput?.checked || false, hueSpread: hueSpreadSlider.getValue(), useSaturation: siteSaturationInput?.checked || false, useLightness: siteLightnessInput?.checked || false }
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
				//return `hsl(${i * 30}, ${midS}%, ${midL}%) ${(i * 30 / 360) * 100}%`;
			});
			hueSlider.setGradient(hueStops); //`linear-gradient(to right, ${hueStops})`);
			satSlider.setGradient([[midH, 0, midL, 1, 0], [midH, 100, midL, 1, 100]]); //`linear-gradient(to right, hsl(${midH}, 0%, ${midL}%), hsl(${midH}, 100%, ${midL}%))`);
			litSlider.setGradient([[midH, midS, 0, 1, 0], [midH, midS, 50, 1, 50], [midH, midS, 100, 1, 100]]); //`linear-gradient(to right, hsl(${midH}, ${midS}%, 0%), hsl(${midH}, ${midS}%, 50%), hsl(${midH}, ${midS}%, 100%))`);
		}

		function updatePreview() {
			updateGradients();
			const eff = getEffective();
			const bgLightness = getBackgroundLightness();
			previewRow.querySelectorAll('.preview-nick').forEach((el, i) => {
				const hash = hashString(previewNames[i]);
				const hash2 = hashString(previewNames[i] + '_sat');
				const hash3 = hashString(previewNames[i] + '_lit');
				let range = eff.maxHue - eff.minHue; if (range <= 0) range += 360;
				let hue = eff.minHue + (hash % Math.max(1, range)); if (hue >= 360) hue -= 360;
				const satRange = eff.maxSaturation - eff.minSaturation;
				const sat = eff.minSaturation + (hash2 % Math.max(1, satRange + 1));
				const litRange = eff.maxLightness - eff.minLightness;
				const lit = eff.minLightness + (hash3 % Math.max(1, litRange + 1));
				const color = `hsl(${hue}, ${sat}%, ${lit}%)`;
				// Invert colors if contrast is below threshold
				const threshold = eff.contrastThreshold || 0;
				if (threshold > 0 && Math.abs(lit - bgLightness) < threshold) {
					el.style.backgroundColor = color;
					el.style.color = 'var(--color-bg, #000)';
					el.style.padding = '0 0.25em';
				} else {
					el.style.color = color;
					el.style.backgroundColor = '';
					el.style.padding = '';
				}
			});
		}

		presetSelect.addEventListener('change', () => {
			const p = PRESET_THEMES[presetSelect.value];
			if (p) {
				hueSlider.setValues([p.color.minHue, p.color.maxHue]);
				satSlider.setValues([p.color.minSaturation, p.color.maxSaturation]);
				litSlider.setValues([p.color.minLightness, p.color.maxLightness]);
				contrastSlider.setValue(p.color.contrastThreshold || 0);
				updatePreview();
			}
		});
		[siteHueInput, siteSaturationInput, siteLightnessInput].forEach(el => el?.addEventListener('change', updatePreview));
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
			createColorPicker(target.dataset.username, generateStyles(target.dataset.username));
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

	// Initial colorization
	colorizeAll();

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
