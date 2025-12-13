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
	const threshold = effectiveConfig.contrastThreshold || 0;

	// Get per-user invert setting (true, false, or undefined for auto)
	const userInvertSetting = customNickColors[username]?.invert;

	// Check for override with backgroundColor (special handling)
	const override = MANUAL_OVERRIDES[username];
	if (override && override.backgroundColor) {
		// Apply full range mapping to both fg and bg colors
		const mappedBg = applyRangeMappingToHex(override.backgroundColor, effectiveConfig);
		const mappedFg = override.color ? applyRangeMappingToHex(override.color, effectiveConfig) : null;
		styles.backgroundColor = mappedBg ? mappedBg.color : override.backgroundColor;
		styles.color = mappedFg ? mappedFg.color : (override.color || 'var(--color-fg, #fff)');
		styles.padding = '0 0.25em';

		// Copy non-color properties
		const overrideCopy = { ...override };
		delete overrideCopy.color;
		delete overrideCopy.backgroundColor;
		styles = { ...styles, ...overrideCopy };

		return styles;
	}

	// Get base color and apply site-wide range mapping
	const baseColor = getBaseColor(username);
	const mappedColor = applyRangeMapping(baseColor, effectiveConfig);
	const colorRgb = hslToRgb(mappedColor.h, mappedColor.s, mappedColor.l);

	// Set the display color
	styles.color = `hsl(${mappedColor.h}, ${mappedColor.s}%, ${mappedColor.l}%)`;

	// Copy non-color properties from custom save or override
	if (customNickColors[username] && typeof customNickColors[username] === 'object') {
		const custom = { ...customNickColors[username] };
		delete custom.color;
		delete custom.invert;
		styles = { ...styles, ...custom };
	} else if (override && typeof override === 'object') {
		const overrideCopy = { ...override };
		delete overrideCopy.color;
		styles = { ...styles, ...overrideCopy };
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
		// Auto: check WCAG contrast ratio threshold
		if (threshold > 0 && !styles.backgroundColor) {
			const bgRgb = getBackgroundRgb();
			const contrastRatio = getContrastRatio(colorRgb, bgRgb);
			shouldInvert = contrastRatio < threshold;
		}
	}

	if (shouldInvert && !styles.backgroundColor) {
		// Get best text color and potentially adjusted background
		const inverted = getInvertedColors(colorRgb, styles.color, threshold);
		styles.backgroundColor = inverted.backgroundColor;
		styles.color = inverted.textColor;
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
	const effectiveConfig = getEffectiveColorConfig();
	const threshold = effectiveConfig.contrastThreshold || 0;

	// Check if element is in an inverted container
	const isInverted = INVERTED_CONTAINERS.length > 0 &&
		INVERTED_CONTAINERS.some(sel => element.closest(sel));

	if (isInverted) {
		// Inverted container has theme.fg as background, theme.bg as text
		// We need to recalculate contrast against theme.fg (the container's bg)
		const containerBgRgb = getForegroundRgb(); // theme.fg is the container's bg
		const pageBgRgb = getBackgroundRgb();

		if (styles.backgroundColor) {
			// Already has a background - check contrast against container bg
			const bgHsl = parseColorToHsl(styles.backgroundColor);
			if (bgHsl) {
				const bgRgb = hslToRgb(bgHsl.h, bgHsl.s, bgHsl.l);
				const contrastWithContainer = getContrastRatio(bgRgb, containerBgRgb);

				if (threshold > 0 && contrastWithContainer < threshold) {
					// Nick bg has poor contrast with container bg - adjust it
					const adjusted = adjustBgForContrast(bgRgb, containerBgRgb, threshold);
					if (adjusted) {
						styles.backgroundColor = adjusted;
						// Recalculate text color for new background
						const adjustedHsl = parseColorToHsl(adjusted);
						if (adjustedHsl) {
							const adjustedRgb = hslToRgb(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l);
							const fgContrast = getContrastRatio(containerBgRgb, adjustedRgb);
							const bgContrast = getContrastRatio(pageBgRgb, adjustedRgb);
							styles.color = bgContrast > fgContrast ? 'var(--color-bg, #000)' : 'var(--color-fg, #fff)';
						}
					}
				} else {
					// Good contrast with container - pick best text color
					const fgContrast = getContrastRatio(containerBgRgb, bgRgb);
					const bgContrast = getContrastRatio(pageBgRgb, bgRgb);
					styles.color = bgContrast > fgContrast ? 'var(--color-bg, #000)' : 'var(--color-fg, #fff)';
				}
			}
		} else if (styles.color) {
			// Normal color - check if it needs inversion for the inverted container
			const colorHsl = parseColorToHsl(styles.color);
			if (colorHsl) {
				const colorRgb = hslToRgb(colorHsl.h, colorHsl.s, colorHsl.l);
				const contrastRatio = getContrastRatio(colorRgb, containerBgRgb);

				if (threshold > 0 && contrastRatio < threshold) {
					// Need to invert for the container
					// Use the nick color as background, but adjust if needed for container contrast
					let bgRgb = colorRgb;
					let bgColor = styles.color;
					const bgContrastWithContainer = getContrastRatio(colorRgb, containerBgRgb);

					if (bgContrastWithContainer < threshold) {
						// Nick color also has poor contrast as a bg - adjust it
						const adjusted = adjustBgForContrast(colorRgb, containerBgRgb, threshold);
						if (adjusted) {
							bgColor = adjusted;
							const adjustedHsl = parseColorToHsl(adjusted);
							if (adjustedHsl) {
								bgRgb = hslToRgb(adjustedHsl.h, adjustedHsl.s, adjustedHsl.l);
							}
						}
					}

					// Pick text color based on contrast with the (possibly adjusted) background
					const fgContrast = getContrastRatio(containerBgRgb, bgRgb);
					const bgContrast = getContrastRatio(pageBgRgb, bgRgb);
					const textColor = bgContrast > fgContrast ? 'var(--color-bg, #000)' : 'var(--color-fg, #fff)';

					styles.backgroundColor = bgColor;
					styles.color = textColor;
					styles.padding = '0 0.25rem';
				}
			}
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