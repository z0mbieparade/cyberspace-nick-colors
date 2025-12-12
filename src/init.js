
// =====================================================
// INITIALIZATION
// =====================================================

// Add right-click context menu to colored usernames and mentions
document.addEventListener('contextmenu', (e) => {
	const target = e.target.closest('[data-nick-colored], [data-mention-colored]');
	if (target && target.dataset.username) {
		e.preventDefault();
		// Use raw styles for picker so sliders show raw saved values
		createUserSettingsPanel(target.dataset.username, getRawStylesForPicker(target.dataset.username));
	}
});

// Greasemonkey/Tampermonkey menu commands
// Support both GM_registerMenuCommand (Tampermonkey) and GM.registerMenuCommand (Greasemonkey 4.x)
const registerMenuCommand = (typeof GM_registerMenuCommand === 'function')
	? GM_registerMenuCommand
	: (typeof GM !== 'undefined' && typeof GM.registerMenuCommand === 'function')
		? GM.registerMenuCommand
		: null;

if (registerMenuCommand) {
	registerMenuCommand('Nick Colors Settings', createSettingsPanel);
	registerMenuCommand('Refresh Nick Colors', refreshAllColors);
	registerMenuCommand('Clear All Custom Colors', () => {
		if (confirm('Clear all custom color overrides?')) {
			customNickColors = {};
			saveCustomNickColors();
			refreshAllColors();
		}
	});
}

// Fetch remote overrides if configured
function fetchOverrides() {
	if (!OVERRIDES_URL) return Promise.resolve();

	return new Promise((resolve) => {
		// Use GM_xmlhttpRequest if available (bypasses CORS)
		if (typeof GM_xmlhttpRequest !== 'undefined') {
			GM_xmlhttpRequest({
				method: 'GET',
				url: OVERRIDES_URL,
				onload: (response) => {
					try {
						const remoteOverrides = JSON.parse(response.responseText);
						// Merge remote overrides (local MANUAL_OVERRIDES takes precedence)
						MANUAL_OVERRIDES = { ...remoteOverrides, ...MANUAL_OVERRIDES };
						console.log('[Nick Colors] Loaded remote overrides:', Object.keys(remoteOverrides).length);
					} catch (e) {
						console.error('[Nick Colors] Failed to parse remote overrides:', e);
					}
					resolve();
				},
				onerror: (e) => {
					console.error('[Nick Colors] Failed to fetch remote overrides:', e);
					resolve();
				}
			});
		} else {
			// Fallback to fetch (may fail due to CORS)
			fetch(OVERRIDES_URL)
				.then(r => r.json())
				.then(remoteOverrides => {
					MANUAL_OVERRIDES = { ...remoteOverrides, ...MANUAL_OVERRIDES };
					console.log('[Nick Colors] Loaded remote overrides:', Object.keys(remoteOverrides).length);
				})
				.catch(e => console.error('[Nick Colors] Failed to fetch remote overrides:', e))
				.finally(resolve);
		}
	});
}

// Initial colorization (after fetching overrides)
fetchOverrides().then(() => {
	colorizeAll();
});

// Watch for new content
const observer = new MutationObserver((mutations) => {
	let shouldColorize = false;
	for (const mutation of mutations) {
		if (mutation.addedNodes.length > 0) {
			shouldColorize = true;
			break;
		}
	}
	if (shouldColorize) {
		colorizeAll();
	}
});

observer.observe(document.body, {
	childList: true,
	subtree: true
});

console.log('[Nick Colors] Loaded. Right-click any colored username to customize.');