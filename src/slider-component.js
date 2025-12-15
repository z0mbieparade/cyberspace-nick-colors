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