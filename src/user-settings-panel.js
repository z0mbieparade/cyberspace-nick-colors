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