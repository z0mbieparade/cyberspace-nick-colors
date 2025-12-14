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