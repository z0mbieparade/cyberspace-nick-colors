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
	/* Mapped track hidden by default */
	.nc-slider .nc-slider-track-mapped {
		display: none;
		position: absolute;
		top: 4px;
		bottom: calc(50% + 1px);
		left: 0;
		right: 0;
		border: 1px solid var(--color-border, #333);
		background: var(--color-code-bg, #444);
		box-sizing: border-box;
	}
	/* Split track for showing mapped vs full range - taller with gap */
	.nc-slider.nc-slider-split { height: 34px; }
	.nc-slider.nc-slider-split .nc-slider-track {
		top: calc(50% + 1px);
		bottom: 4px;
	}
	.nc-slider.nc-slider-split .nc-slider-track-mapped {
		display: block !important;
	}
	.nc-slider-thumb {
		position: absolute; top: 0; width: 14px; height: 22px;
		background: var(--color-fg, #fff);
		border: 2px solid var(--color-bg, #000);
		outline: 1px solid var(--color-border, #333);
		cursor: ew-resize; transform: translateX(-50%); z-index: 2;
		display: flex; align-items: center; justify-content: center;
		font-size: 8px;
		color: var(--color-bg, #000); user-select: none;
		box-sizing: border-box;
	}
	.nc-slider.nc-slider-split .nc-slider-thumb { height: 32px; }
	.nc-slider-labels {
		display: flex; justify-content: space-between; margin-top: 2px;
		font-size: 0.625rem; color: var(--color-fg-dim, #888);
	}
	/* Simple single-value slider style */
	.nc-slider.nc-slider-simple { height: 16px; }
	.nc-slider-simple .nc-slider-track {
		inset: 7px 0; height: 2px;
		border: none;
		background: var(--color-border, #333);
	}
	.nc-slider-simple .nc-slider-thumb {
		top: 3px; width: 10px; height: 10px;
		border-radius: 50%;
	}
	.nc-slider-simple .nc-slider-thumb::before {
		content: '';
		position: absolute;
		inset: -8px;
	}
`;
document.head.appendChild(sliderStyles);

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
		${label ? `<label style="display:block;margin:0.5rem 0 0.25rem;font-size:0.75rem;color:var(--color-fg-dim,#888)">${label}</label>` : ''}
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