

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
		return `<div class="${classStr}"${hiddenStyle}>${data}</div>`;
	}
	console.log(data);
	const lines = Object.entries(data)
		.map(([label, value]) => {
			if(typeof value === 'object' && (value.txt !== undefined || value.elem !== undefined))
				return `<span><strong>${label}:</strong><span>${value.txt ?? ' N/A'}${value.elem ? ' ' + value.elem : ''}</span></span>`;
			else if(typeof value === 'string')
				return `<span><strong>${label}:</strong><span>${value ?? 'N/A'}</span></span>`;
		})
		.filter(line => line && line.trim() !== '')
		.join('\n').trim();
	return `<div class="${classStr}"${hiddenStyle}>\n${lines}\n</div>`;
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
		debug = document.createElement('div');
		debug.className = `nc-dynamic-debug nc-dialog-debug${classes ? ' ' + classes : ''}`;
		parent.appendChild(debug);
	}
	debug.style.display = DEBUG ? '' : 'none';
	return debug;
}

function logDebug(id, data)
{
	DEBUG_LOG.push({
		timestamp: new Date().toISOString(),
		id, data
	})
}

function exportDebug()
{
	if(!DEBUG_LOG)
	{
		alert("An error has occurred, please try again later");
		return;
	}

	logDebug('Info', {
		browser: navigator.userAgent,
		url: window.location.href,
		version: VERSION,
	});

	logDebug('Site Theme', siteTheme);
	logDebug('Site Config', siteConfig);
	logDebug('Effective Site Config', getEffectiveSiteConfig());
	logDebug('Style Config', siteConfig);
	logDebug('Custom Nick Colors', customNickColors);
	logDebug('Manual Overrides', MANUAL_OVERRIDES);

	console.log("Exporting debug info...");
	console.log(DEBUG_LOG);
}

/**
 * Export debug logs for troubleshooting (returns plain text)
 */
function exportDebugLogs() {
	const eff = getEffectiveSiteConfig();
	const themeColors = getThemeColors(null, 'hsl');
	const lines = [];

	lines.push('='.repeat(60));
	lines.push('NICK COLORS DEBUG LOG');
	lines.push('='.repeat(60));
	lines.push('');
	lines.push(`Exported: ${new Date().toISOString()}`);
	lines.push(`Version: ${VERSION}`);
	lines.push(`Debug Mode: ${DEBUG}`);
	lines.push(`URL: ${window.location.href}`);
	lines.push(`User Agent: ${navigator.userAgent}`);
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('THEME INFO');
	lines.push('-'.repeat(60));
	lines.push(`Site Theme Name: ${siteThemeName || 'none'}`);
	lines.push(`Site Theme Object: ${siteTheme ? JSON.stringify(siteTheme) : 'none'}`);
	lines.push(`Site Custom Theme: ${siteCustomTheme ? JSON.stringify(siteCustomTheme) : 'none'}`);
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('THEME COLORS (resolved)');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(themeColors, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('EFFECTIVE CONFIG (after site theme integration)');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(eff, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('SAVED SITE CONFIG');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(siteConfig, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push(`CUSTOM NICK COLORS (${Object.keys(customNickColors).length} total)`);
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(customNickColors, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push(`MANUAL OVERRIDES (${Object.keys(MANUAL_OVERRIDES).length} total)`);
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(MANUAL_OVERRIDES, null, 2));
	lines.push('');

	// Collect all debug pre elements from the page
	const debugPres = document.querySelectorAll('.nc-dialog-debug, .nc-dynamic-debug');
	if (debugPres.length > 0) {
		lines.push('-'.repeat(60));
		lines.push(`DEBUG ELEMENTS (${debugPres.length} found)`);
		lines.push('-'.repeat(60));
		debugPres.forEach((pre, i) => {
			lines.push(`[${i + 1}] ${pre.textContent.trim()}`);
		});
		lines.push('');
	}

	lines.push('='.repeat(60));
	lines.push('END OF DEBUG LOG');
	lines.push('='.repeat(60));

	return lines.join('\n');
}

/**
 * Show a dialog for reporting issues with input fields
 */
function showReportIssueDialog() {
	const overlay = document.createElement('div');
	overlay.className = 'nc-dialog-overlay';
	overlay.innerHTML = `
		<div class="nc-dialog" style="min-width: 400px; max-width: 500px;">
			<div class="nc-dialog-header nc-flex nc-justify-between">
				<h3>Report Issue</h3>
				<div class="spacer"></div>
				<button class="nc-header-close link-brackets"><span class="inner">ESC</span></button>
			</div>
			<div class="nc-dialog-content">
				<div class="hint">Fill out the fields below to report an issue. All fields are required.</div>
				<div class="nc-input-row">
					<label for="report-issue">What issue are you experiencing?</label>
					<textarea id="report-issue" placeholder="Describe the problem..." style="width: 100%; min-height: 60px;"></textarea>
				</div>
				<div class="nc-input-row">
					<label for="report-steps">Steps to reproduce:</label>
					<textarea id="report-steps" placeholder="1. Go to...\n2. Click on...\n3. See error..." style="width: 100%; min-height: 60px;"></textarea>
				</div>
				<div class="nc-input-row">
					<label for="report-errors">Any error messages? (check browser console)</label>
					<input type="text" id="report-errors" placeholder="Optional - paste any errors" style="width: 100%;">
				</div>
				<div class="hint">Debug info will be automatically included.</div>
			</div>
			<div class="nc-dialog-footer">
				<div class="buttons nc-flex nc-items-center nc-gap-2">
					<button class="nc-submit-report-btn link-brackets"><span class="inner">SEND REPORT</span></button>
					<button class="nc-cancel-btn link-brackets"><span class="inner">CANCEL</span></button>
				</div>
			</div>
		</div>
	`;

	const close = () => overlay.remove();

	const issueInput = overlay.querySelector('#report-issue');
	const stepsInput = overlay.querySelector('#report-steps');
	const errorsInput = overlay.querySelector('#report-errors');

	overlay.querySelector('.nc-header-close').addEventListener('click', close);
	overlay.querySelector('.nc-cancel-btn').addEventListener('click', close);
	overlay.querySelector('.nc-submit-report-btn').addEventListener('click', () => {
		const issue = issueInput.value.trim();
		const steps = stepsInput.value.trim();
		const errors = errorsInput.value.trim();

		// Validate required fields
		if (!issue) {
			alert('Please describe the issue');
			issueInput.focus();
			return;
		}
		if (!steps) {
			alert('Please provide steps to reproduce');
			stepsInput.focus();
			return;
		}

		// Build condensed debug info
		const eff = getEffectiveSiteConfig();
		const debugInfo = `v${VERSION} | ${Object.keys(customNickColors).length} custom | H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`;

		// Build condensed settings object
		const settings = {
			siteConfig: siteConfig,
			style: siteConfig
		};

		// Build message
		let message = `[Nick Colors Issue Report]| Issue: ${issue} | Steps: ${steps}`;
		if (errors) {
			message += ` | Errors: ${errors}`;
		}
		message += ` | Debug: ${debugInfo} | Page: ${window.location.href} | Settings: ${JSON.stringify(minifyKeys(settings))}`;

		close();
		openMessageToUser('z0ylent', message);
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
	issueInput.focus();
}