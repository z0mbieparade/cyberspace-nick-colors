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