// =====================================================
// COLOR GENERATION
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
		// Swap: color becomes background, use page foreground for text (ensures contrast)
		styles.backgroundColor = styles.color;
		styles.color = 'var(--color-fg, #fff)';
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
	const hash = hashString(username + '_style');
	return {
		fontWeight: (hash % 2 === 0) ? 'normal' : 'bold',
		fontStyle: (hash % 4 === 0) ? 'italic' : 'normal',
		fontVariant: (hash % 4 === 1) ? 'small-caps' : 'normal'
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
			styles.color = 'var(--color-fg, #fff)';
			styles.padding = '0 0.25rem';
		}
	}

	// Apply all styles to the element
	Object.assign(element.style, styles);
	element.dataset.nickColored = 'true';
	element.dataset.username = username;

	// Prepend/append icon if enabled
	const icons = getIconsForUsername(username);
	if (icons.prepend || icons.append) {
		if (!element.dataset.iconApplied) {
			// Store original text before first icon application
			element.dataset.originalText = element.textContent;
			element.dataset.iconApplied = 'true';
		}
		const originalText = element.dataset.originalText || element.textContent;
		let newText = originalText;
		if (icons.prepend) newText = icons.prepend + ' ' + newText;
		if (icons.append) newText = newText + ' ' + icons.append;
		element.textContent = newText;
	} else if (element.dataset.iconApplied) {
		// Icons were removed - restore original text
		if (element.dataset.originalText) {
			element.textContent = element.dataset.originalText;
		}
		delete element.dataset.iconApplied;
		delete element.dataset.originalText;
	}
}