// =====================================================
// DIALOG UI COMPONENT
// =====================================================

// Styles are now in src/styles.scss and compiled during build

// =====================================================
// INPUT ROW HELPER FUNCTIONS
// =====================================================

/**
	* Creates an input row with various input types
	* @param {Object} opts - Configuration object
	* @param {string} opts.label - Label text
	* @param {string} opts.id - Input element ID
	* @param {string} [opts.type='text'] - Input type: text, textarea, select, toggle, tristate, button
	* @param {string} [opts.value=''] - Input value (for text/textarea)
	* @param {string} [opts.placeholder=''] - Placeholder text
	* @param {string} [opts.hint=''] - Hint text below input
	* @param {string} [opts.classes=''] - Additional CSS classes
	* @param {string} [opts.options] - Options HTML for select type
	* @param {boolean} [opts.checked=false] - Checked state for toggle type
	* @param {boolean} [opts.disabled=false] - Disabled state for toggle type
	* @param {boolean|null} [opts.state=null] - State for tristate (null=auto, true, false)
	* @param {string} [opts.defaultLabel=''] - Default label shown for tristate
	* @param {string} [opts.buttonText=''] - Button text for button type
	* @param {boolean} [opts.stacked=false] - Force stacked layout (label on top)
	* @returns {string} HTML string
	*/
function createInputRow(opts) {
	const {
		label, id, type = 'text', value = '', placeholder = '', hint = '', classes = '',
		options, checked = false, disabled = false, state = null, defaultLabel = '', buttonText = '',
		stacked = false
	} = opts;

	// Stacked layout types: text, textarea, select (or forced with stacked=true)
	const isStackedType = stacked || ['text', 'textarea', 'select'].includes(type);

	if (isStackedType) {
		const classStr = `nc-input-row-stacked${classes ? ' ' + classes : ''}`;
		let inputHtml;
		if (type === 'textarea') {
			inputHtml = `<textarea id="${id}" placeholder="${placeholder}">${value}</textarea>`;
		} else if (type === 'select' && options) {
			inputHtml = `<select id="${id}">${options}</select>`;
		} else {
			inputHtml = `<input type="${type}" id="${id}" value="${value}" placeholder="${placeholder}">`;
		}
		return `
			<div class="${classStr}">
				${label ? `<label for="${id}">${label}</label>` : ''}
				${inputHtml}
				${hint ? `<div class="hint">${hint}</div>` : ''}
			</div>
		`;
	}

	// Inline layout types: toggle, tristate, button
	if (type === 'toggle') {
		const classStr = `nc-input-row nc-flex nc-items-center nc-justify-between nc-gap-4 nc-toggle${classes ? ' ' + classes : ''}`;
		return `
			<div class="${classStr}">
				<label>${label}</label>
				<label class="nc-toggle-label">
					<div class="nc-toggle-value">${checked ? 'true' : 'false'}</div>
					<input type="checkbox" id="${id}" class="nc-sr-only" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
					<div class="nc-toggle-track${checked ? ' active' : ''}">
						<div class="nc-toggle-thumb ${checked ? 'pos-end' : 'pos-start'}"></div>
					</div>
				</label>
			</div>
		`;
	}

	if (type === 'tristate') {
		const classStr = `nc-input-row nc-flex nc-items-center nc-justify-between nc-gap-4 nc-toggle nc-tristate-toggle${classes ? ' ' + classes : ''}`;
		const stateText = state === true ? 'true' : state === false ? 'false' : 'auto';
		const isChecked = state === true;
		const thumbPosClass = state === true ? 'pos-end' : state === false ? 'pos-start' : 'pos-middle';
		return `
			<div class="${classStr}">
				<label>${label}${defaultLabel ? ` <span class="nc-text-dim">(default: ${defaultLabel})</span>` : ''}</label>
				<label class="nc-toggle-label">
					<div class="nc-toggle-value">${stateText}</div>
					<input type="checkbox" id="${id}" class="nc-sr-only" ${isChecked ? 'checked' : ''}>
					<div class="nc-toggle-track${isChecked ? ' active' : ''}">
						<div class="nc-toggle-thumb ${thumbPosClass}"></div>
					</div>
				</label>
			</div>
		`;
	}

	if (type === 'button') {
		const classStr = `nc-input-row nc-flex nc-items-center nc-justify-between nc-gap-4${classes ? ' ' + classes : ''}`;
		return `
			<div class="${classStr}">
				<label>${label}</label>
				<button id="${id}" class="nc-inline-btn nc-flex-shrink-0">${buttonText}</button>
			</div>
		`;
	}

	// Fallback for unknown types
	return '';
}

// Legacy helper functions that delegate to createInputRow
function createToggleRow(opts) {
	return createInputRow({ ...opts, type: 'toggle' });
}

function createTriStateToggleRow(opts) {
	return createInputRow({ ...opts, type: 'tristate' });
}

/**
	* Creates a dialog with standard structure
	* @param {Object} opts - { title, content, buttons, width, onClose, onSettings, preview }
	* @returns {Object} - { el, close, querySelector, querySelectorAll }
	*/
function createDialog(opts) {
	// Refresh CSS variables in case theme changed
	initCssVariables();

	const { title, content, buttons = [], width = '400px', onClose, onSettings, preview = '' } = opts;

	const overlay = document.createElement('div');
	overlay.className = 'nc-dialog-overlay';
	overlay.innerHTML = `
		<div class="nc-dialog" style="min-width: ${width}; max-width: calc(${width} + 100px);">
			<div class="nc-dialog-header nc-flex nc-justify-between">
				<h3>${title}</h3>
				<div class="spacer"></div>
				${onSettings ? '<button class="nc-header-settings link-brackets"><span class="inner">SETTINGS</span></button>' : ''}
				<button class="nc-header-close link-brackets"><span class="inner">ESC</span></button>
			</div>
			${preview ? `<div class="nc-dialog-preview">${preview}</div>` : ''}
			<div class="nc-dialog-content">
				${content}
			</div>
			<div class="nc-dialog-footer">
				<div class="nc-dialog-warning hint">
					This is a custom userscript. Do NOT report issues to the creator of Cyberspace. Use the [SETTINGS] -> [REPORT ISSUE] button.
				</div>
				<div class="nc-dialog-attribution hint">
					<span>created by <a href="/z0ylent">@z0ylent</a></span>
					<span> | </span>
					<span><a href="https://z0m.bi" target="_blank">https://z0m.bi</a></span>
					<span> | </span>
					<span><a class="github-link" href="https://github.com/z0mbieparade/cyberspace-nick-colors" target="_blank" title="GitHub"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" height="14px"> <path fill="currentColor" d="M5 2h4v2H7v2H5V2Zm0 10H3V6h2v6Zm2 2H5v-2h2v2Zm2 2v-2H7v2H3v-2H1v2h2v2h4v4h2v-4h2v-2H9Zm0 0v2H7v-2h2Zm6-12v2H9V4h6Zm4 2h-2V4h-2V2h4v4Zm0 6V6h2v6h-2Zm-2 2v-2h2v2h-2Zm-2 2v-2h2v2h-2Zm0 2h-2v-2h2v2Zm0 0h2v4h-2v-4Z"/> </svg></a></span>
					<span> | </span>
					<span>v${VERSION}</span><br />
				</div>
				<hr />
				<div class="buttons nc-flex nc-flex-wrap nc-items-center nc-gap-2">
					${buttons.map(b => `<button class="${b.class || ''} link-brackets"><span class="inner">${b.label}</span></button>`).join('')}
				</div>
			</div>
		</div>
	`;

	const close = () => {
		overlay.remove();
		onClose?.();
	};

	// Bind footer button handlers
	buttons.forEach(b => {
		const btn = overlay.querySelector(`.nc-dialog-footer button.${b.class}`);
		if (btn && b.onClick) {
			btn.addEventListener('click', () => b.onClick(close));
		}
	});

	// Bind header button handlers
	const closeBtn = overlay.querySelector('.nc-header-close');
	if (closeBtn) closeBtn.addEventListener('click', close);

	const settingsBtn = overlay.querySelector('.nc-header-settings');
	if (settingsBtn && onSettings) {
		settingsBtn.addEventListener('click', () => {
			close();
			onSettings();
		});
	}

	// Close on overlay click or Escape
	overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
	overlay.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
	overlay.setAttribute('tabindex', '-1');

	document.body.appendChild(overlay);
	overlay.focus();

	return {
		el: overlay,
		close,
		querySelector: (sel) => overlay.querySelector(sel),
		querySelectorAll: (sel) => overlay.querySelectorAll(sel)
	};
}