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

		// Add hr after section
		const hr = document.createElement('hr');
		wrapper.appendChild(hr);

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
