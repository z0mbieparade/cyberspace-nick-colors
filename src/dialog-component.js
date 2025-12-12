// =====================================================
// DIALOG UI COMPONENT
// =====================================================

// Shared dialog styles (injected once)
const dialogStyles = document.createElement('style');
dialogStyles.textContent = `
	.nc-dialog-overlay {
		position: fixed; top: 0; left: 0; right: 0; bottom: 0;
		background: rgba(0,0,0,0.7); display: flex;
		align-items: center; justify-content: center; z-index: 999999;
	}
	.nc-dialog {
		background: var(--color-bg, #0a0a0a); 
		border: 1px solid var(--color-border, #333);
		color: var(--color-fg, #eee); 
		max-height: 80vh; display: flex; flex-direction: column;
	}
	.nc-dialog .spacer {
		flex: 1;
	}
	.nc-dialog-header {
		padding: 1rem 1rem 0.5rem; 
		border-bottom: 1px solid var(--color-border, #333);
		flex-shrink: 0;
		width: 100%; 
		box-sizing: border-box;
		gap: 0.5rem;
	}
	.nc-dialog-content {
		padding: 0.5rem 1rem; overflow-y: auto; flex: 1;
	}
	.nc-dialog-preview {
		padding: 0.5rem 1rem;
		border-bottom: 1px solid var(--color-border, #333);
		flex-shrink: 0;
		background: var(--color-bg, #0a0a0a);
	}
	.nc-dialog-preview .preview,
	.nc-dialog-preview .preview-row {
		margin: 0;
		background-color: var(--color-code-bg, #222);
		border: 1px solid var(--color-border, #333);
		padding: 0.5rem; 
		margin: 0.75rem 0;
		font-size: 0.875rem; 
	}
	.nc-dialog .preview-row {
		display: flex; 
		gap: 0.5rem; 
		flex-wrap: wrap; 
		justify-content: space-around;
	}
	.nc-dialog .preview-nick { padding: 0.125rem 0.25rem !important; }
	.nc-dialog-footer {
		padding: 0.5rem 1rem .5rem; 
		border-top: 1px solid var(--color-border, #333);
		flex-shrink: 0;
	}
	.nc-dialog h3 {
		margin: 0; color: var(--color-fg, #fff); font-size: 0.875rem;
		text-transform: uppercase; letter-spacing: 0.05em;
	}
	.nc-dialog h4 {
		margin: 0.5rem 0; color: var(--color-fg, #FFF); 
		font-size: 0.75rem;
		text-transform: uppercase; letter-spacing: 0.1em;
	}
	.nc-dialog h4:first-child { margin-top: 0; padding-top: 0; }
	.nc-dialog hr {
		border: 1px dashed var(--color-border, #333); 
		background: transparent;
		height: 0;
		margin: 1rem 0;
	}
	.nc-dialog .nc-input-row, .nc-dialog .nc-input-row-stacked
	{
		padding: 0.5rem 0;
		display: flex;
		flex-direction: row;
		gap: 0.5rem;
	}
	.nc-dialog .nc-input-row-stacked
	{
		flex-direction: column;
		gap: 0.25rem;
	}
	.nc-dialog .nc-input-row.no-padding-bottom, 
	.nc-dialog .nc-input-row-stacked.no-padding-bottom
	{
		padding-bottom: 0;
	}
	.nc-dialog .nc-input-row.no-padding-top, 
	.nc-dialog .nc-input-row-stacked.no-padding-top
	{
		padding-top: 0;
	}
	.nc-dialog .nc-input-row label
	{
		font-size: 0.75rem;
		color: var(--color-fg, #fff);
	}
	.nc-dialog .nc-input-row .hint
	{
		font-size: 0.6rem;
		color: var(--color-fg-dim, #fff);
	}
	.nc-dialog .buttons { 
		display: flex; 
		gap: 0.5rem; 
		justify-content: flex-end;
	}
	.nc-dialog button {
		flex: 1 0 auto;
		padding: 0.5rem;
	}
	.nc-dialog button:hover { border-color: var(--color-fg-dim, #666); }
	.nc-dialog button.link-brackets {
		background: none; 
		border: none; 
		padding: 0;
		color: var(--color-fg-dim, #888);
		flex: 0 0 auto;
	}
	.nc-dialog button.link-brackets:hover { border-color: var(--color-fg, #FFF); }
	.nc-dialog button.link-brackets .inner::before {
		content: "[";
	}
	.nc-dialog button.link-brackets .inner::after {
		content: "]";
	}
	.nc-dialog button.nc-inline-btn {
		flex: 0 0 auto;
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		background: var(--color-bg, #0a0a0a);
		border: 1px solid var(--color-border, #333);
		color: var(--color-fg-dim, #888);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s;
	}
	.nc-dialog button.nc-inline-btn:hover {
		border-color: var(--color-fg, #fff);
		color: var(--color-fg, #fff);
	}
	.nc-dialog input[type="text"], .nc-dialog textarea, .nc-dialog select {
		width: 100%; padding: 0.5rem; background: var(--color-bg, #0a0a0a);
		border: 1px solid var(--color-border, #333); color: var(--color-fg, #fff);
		font-family: inherit; font-size: 0.75rem; box-sizing: border-box;
	}
	.nc-dialog textarea { min-height: 70px; resize: vertical; }
	.nc-dialog .nc-toggle { display: flex; margin: 0.5rem 0; }
	.nc-dialog .hint { font-size: 0.625rem; color: var(--color-fg-dim, #666); margin-top: 0.25rem; }

	/* Toggle component styles */
	.nc-dialog .nc-toggle-label {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		cursor: pointer;
		flex-shrink: 0;
	}
	.nc-dialog .nc-toggle-value {
		font-size: 0.75rem;
		color: var(--color-fg-dim, #888);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	.nc-dialog .nc-toggle-track {
		position: relative;
		width: 2.5rem;
		height: 1.25rem;
		border: 1px solid var(--color-border, #333);
		border-radius: var(--radius-md);
		transition: background-color 0.15s;
	}
	.nc-dialog .nc-toggle-track.active {
		background: var(--color-fg, #fff);
	}
	.nc-dialog .nc-toggle-track:not(.active) {
		background: var(--color-fg-dim, #666);
	}
	.nc-dialog .nc-toggle-thumb {
		position: absolute;
		top: 2px;
		width: 1rem;
		height: 0.875rem;
		background: var(--color-bg, #0a0a0a);
		border-radius: var(--radius-md);
		transition: transform 0.15s;
	}
	.nc-dialog .nc-toggle-thumb.pos-start { transform: translateX(2px); }
	.nc-dialog .nc-toggle-thumb.pos-middle { transform: translateX(10px); }
	.nc-dialog .nc-toggle-thumb.pos-end { transform: translateX(20px); }
	.nc-dialog .nc-sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		border: 0;
	}
	.nc-dialog .nc-text-dim {
		color: var(--color-fg-dim, #888);
	}

	.nc-dialog .nc-dialog-attribution {
		width: 100%;
		display: flex;
		justify-content: flex-end;
		gap: 0.5rem;
		border-top: 1px dotted var(--color-border, #333);
		margin-top: 0.3rem; font-size: 0.625rem; color: var(--color-fg-dim, #666);
		padding-top: 0.3rem;
	}
	
	.nc-dialog .nc-dialog-warning {
		color: rgba(255, 183, 0, 0.7);
	}

	/* Layout utility classes */
	.nc-dialog .nc-flex { display: flex; }
	.nc-dialog .nc-flex-wrap { flex-wrap: wrap; }
	.nc-dialog .nc-flex-shrink-0 { flex-shrink: 0; }
	.nc-dialog .nc-items-center { align-items: center; }
	.nc-dialog .nc-justify-between { justify-content: space-between; }
	.nc-dialog .nc-gap-2 { gap: 0.5rem; }
	.nc-dialog .nc-gap-3 { gap: 0.75rem; }
	.nc-dialog .nc-gap-4 { gap: 1rem; }
	.nc-dialog .nc-cursor-pointer { cursor: pointer; }
	.nc-dialog .nc-dialog-attribution a {
		color: var(--color-fg-dim, #666); text-decoration: none;
	}
	.nc-dialog pre 
	{
		white-space: pre-wrap;
		word-wrap: break-word;
		overflow-wrap: break-word;
		max-width: 100%;
		background-color: var(--color-code-bg, #222);
		color: var(--color-fg, #fff);
		padding: 0.5rem;
	}
	.nc-dialog pre.nc-dialog-debug 
	{
		border: 2px dashed var(--color-border, #333);
	}
`;
document.head.appendChild(dialogStyles);

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
	* Creates a debug pre element (hidden when DEBUG is false, but still in DOM for export)
	* @param {Object|string} data - Object with label/value pairs, or plain string for unlabeled content
	* @param {string} [classes] - Additional CSS classes
	* @returns {string} HTML string
	*/
function createDebugPre(data, classes = '') {
	const hiddenStyle = DEBUG ? '' : ' style="display: none;"';
	const classStr = `nc-dialog-debug${classes ? ' ' + classes : ''}`;
	if (typeof data === 'string') {
		return `<pre class="${classStr}"${hiddenStyle}>${data}</pre>`;
	}
	const lines = Object.entries(data)
		.map(([label, value]) => `<strong>${label}:</strong> ${value ?? 'N/A'}`)
		.join('\n');
	return `<pre class="${classStr}"${hiddenStyle}>\n${lines}\n</pre>`;
}

/**
	* Gets or creates a debug pre element under a parent (for dynamic updates)
	* @param {HTMLElement} parent - Parent element to append to
	* @param {string} [classes] - Additional CSS classes
	* @returns {HTMLElement} The debug element (hidden if DEBUG is false)
	*/
function getOrCreateDebugPre(parent, classes = '') {
	let debug = parent.querySelector('.nc-dynamic-debug');
	if (!debug) {
		debug = document.createElement('pre');
		debug.className = `nc-dynamic-debug nc-dialog-debug${classes ? ' ' + classes : ''}`;
		parent.appendChild(debug);
	}
	debug.style.display = DEBUG ? '' : 'none';
	return debug;
}

/**
	* Creates a dialog with standard structure
	* @param {Object} opts - { title, content, buttons, width, onClose, onSettings, preview }
	* @returns {Object} - { el, close, querySelector, querySelectorAll }
	*/
function createDialog(opts) {
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