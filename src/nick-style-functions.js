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