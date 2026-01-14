
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

// Mobile long-press support (500ms hold with visual feedback)
let longPressTimer = null;
let longPressTarget = null;
let longPressStartPos = null;
const LONG_PRESS_DURATION = 500;
const LONG_PRESS_MOVE_THRESHOLD = 10;

document.addEventListener('touchstart', (e) => {
	const target = e.target.closest('[data-nick-colored], [data-mention-colored]');
	if (!target || !target.dataset.username) return;

	const touch = e.touches[0];
	longPressStartPos = { x: touch.clientX, y: touch.clientY };
	longPressTarget = target;

	// Visual feedback - subtle dim
	target.style.transition = 'opacity 0.15s, transform 0.15s';
	target.style.opacity = '0.7';
	target.style.transform = 'scale(0.97)';

	longPressTimer = setTimeout(() => {
		if (longPressTarget) {
			// Reset visual feedback
			longPressTarget.style.opacity = '';
			longPressTarget.style.transform = '';
			// Open the settings panel
			createUserSettingsPanel(longPressTarget.dataset.username, getRawStylesForPicker(longPressTarget.dataset.username));
			longPressTarget = null;
		}
	}, LONG_PRESS_DURATION);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
	if (!longPressTimer || !longPressStartPos) return;

	const touch = e.touches[0];
	const dx = Math.abs(touch.clientX - longPressStartPos.x);
	const dy = Math.abs(touch.clientY - longPressStartPos.y);

	// Cancel if moved too far (user is scrolling)
	if (dx > LONG_PRESS_MOVE_THRESHOLD || dy > LONG_PRESS_MOVE_THRESHOLD) {
		clearTimeout(longPressTimer);
		longPressTimer = null;
		if (longPressTarget) {
			longPressTarget.style.opacity = '';
			longPressTarget.style.transform = '';
			longPressTarget = null;
		}
	}
}, { passive: true });

document.addEventListener('touchend', () => {
	if (longPressTimer) {
		clearTimeout(longPressTimer);
		longPressTimer = null;
	}
	if (longPressTarget) {
		longPressTarget.style.opacity = '';
		longPressTarget.style.transform = '';
		longPressTarget = null;
	}
});

document.addEventListener('touchcancel', () => {
	if (longPressTimer) {
		clearTimeout(longPressTimer);
		longPressTimer = null;
	}
	if (longPressTarget) {
		longPressTarget.style.opacity = '';
		longPressTarget.style.transform = '';
		longPressTarget = null;
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

// Initialize our safe CSS variables (handles transparent values)
initCssVariables();

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

// Watch for theme changes on <html data-theme="...">
const themeObserver = new MutationObserver((mutations) => {
	for (const mutation of mutations) {
		if (mutation.attributeName === 'data-theme') {
			console.log('[Nick Colors] Theme changed, refreshing colors', mutation);
			siteThemeName = mutation.target.getAttribute('data-theme') || null;
			loadSiteCustomTheme();
			loadSiteTheme();
			initCssVariables();
			refreshAllColors();
			break;
		}
	}
});

themeObserver.observe(document.documentElement, {
	attributes: true,
	attributeFilter: ['data-theme']
});

console.log('[Nick Colors] Loaded. Right-click or long-press any colored username to customize.');