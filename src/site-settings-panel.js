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

		{ type: 'section', label: 'Debug', fields: [
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

		previewRow.querySelectorAll('.preview-nick').forEach((el, i) => {
			const username = previewNames[i];
			applyStyles(el, username, {
				effectiveConfig: effConfig,
				isInverted: false,
				debugData: DEBUG
			});
		});

		// Update inverted preview
		previewRowInverted.querySelectorAll('.preview-nick').forEach((el, i) => {
			const username = previewNames[i];
			applyStyles(el, username, {
				effectiveConfig: effConfig,
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
