/**
 * Export debug logs for troubleshooting (returns plain text)
 */
function exportDebugLogs() {
	const eff = getEffectiveColorConfig();
	const lines = [];

	lines.push('='.repeat(60));
	lines.push('NICK COLORS DEBUG LOG');
	lines.push('='.repeat(60));
	lines.push('');
	lines.push(`Exported: ${new Date().toISOString()}`);
	lines.push(`URL: ${window.location.href}`);
	lines.push(`User Agent: ${navigator.userAgent}`);
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('SITE THEME');
	lines.push('-'.repeat(60));
	lines.push(`Site Theme: ${siteTheme ? JSON.stringify(siteTheme) : 'none'}`);
	lines.push(`Site Theme HSL: ${siteThemeHsl ? JSON.stringify(siteThemeHsl) : 'none'}`);
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('COLOR CONFIG');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(colorConfig, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('EFFECTIVE CONFIG (after site theme integration)');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(eff, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('SITE THEME CONFIG');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(siteThemeConfig, null, 2));
	lines.push('');

	lines.push('-'.repeat(60));
	lines.push('STYLE CONFIG');
	lines.push('-'.repeat(60));
	lines.push(JSON.stringify(styleConfig, null, 2));
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
				<div class="hint" style="margin-bottom: 0.75rem;">Fill out the fields below to report an issue. All fields are required.</div>
				<div class="nc-input-row" style="margin-bottom: 0.5rem;">
					<label for="report-issue">What issue are you experiencing?</label>
					<textarea id="report-issue" placeholder="Describe the problem..." style="width: 100%; min-height: 60px;"></textarea>
				</div>
				<div class="nc-input-row" style="margin-bottom: 0.5rem;">
					<label for="report-steps">Steps to reproduce:</label>
					<textarea id="report-steps" placeholder="1. Go to...\n2. Click on...\n3. See error..." style="width: 100%; min-height: 60px;"></textarea>
				</div>
				<div class="nc-input-row" style="margin-bottom: 0.5rem;">
					<label for="report-errors">Any error messages? (check browser console)</label>
					<input type="text" id="report-errors" placeholder="Optional - paste any errors" style="width: 100%;">
				</div>
				<div class="hint" style="margin-top: 0.5rem; font-size: 0.7rem;">Debug info will be automatically included.</div>
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
		const eff = getEffectiveColorConfig();
		const debugInfo = `v${VERSION} | ${Object.keys(customNickColors).length} custom | H:${eff.minHue}-${eff.maxHue} S:${eff.minSaturation}-${eff.maxSaturation} L:${eff.minLightness}-${eff.maxLightness}`;

		// Build condensed settings object
		const settings = {
			color: colorConfig,
			siteTheme: siteThemeConfig,
			style: styleConfig
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
	usernameInput.focus();
}