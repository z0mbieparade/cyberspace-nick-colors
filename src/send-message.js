/**
 * Open a new message to a user on Cyberspace
 * Navigates to their profile and triggers the 'C' keyboard shortcut to compose
 * @param {string} username - The username to message (without @)
 * @param {string} [message] - Optional message to pre-fill in the compose box
 */
function openMessageToUser(username, message = null) {
	// Navigate to user's profile, then trigger compose shortcut
	const profileUrl = `https://cyberspace.online/${username}`;

	// If we're already on their profile, just trigger the shortcut
	if (window.location.pathname === `/${username}`) {
		console.log('navigated to user profile, triggering compose shortcut');
		document.dispatchEvent(new KeyboardEvent('keydown', { key: 'c', code: 'KeyC', bubbles: true }));
		return;
	}

	// Otherwise navigate and trigger after page load
	// Store flag in sessionStorage to trigger compose after navigation
	sessionStorage.setItem('nickColors_openCompose', 'true');
	if (message) {
		sessionStorage.setItem('nickColors_composeMessage', message);
	}
	window.location.href = profileUrl;
}

// Check if we need to open compose after navigation
if (sessionStorage.getItem('nickColors_openCompose') === 'true') {
	sessionStorage.removeItem('nickColors_openCompose');
	console.log('[NickColors] Detected openCompose flag, will try to open compose');

	// Wait for the site to be ready by polling for the C-Mail button on profile
	function tryOpenCompose(attempts = 0) {
		console.log(`[NickColors] tryOpenCompose attempt ${attempts}, readyState: ${document.readyState}`);

		// Look for the C-Mail button - need to find the smallest element containing "[C] C-Mail"
		// Use TreeWalker to find text nodes, then get their parent
		let cmailButton = null;
		const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
		let node;
		while (node = walker.nextNode()) {
			const text = node.textContent?.trim() || '';
			if (text.includes('[C]') && text.includes('C-Mail')) {
				// Found the text node, get its parent element
				cmailButton = node.parentElement;
				console.log(`[NickColors] Found text node with C-Mail, parent: ${cmailButton?.tagName}, text: "${text}"`);
				break;
			}
		}

		if (cmailButton) {
			console.log('[NickColors] Found C-Mail button, clicking it:', cmailButton);
			cmailButton.click();

			// Check if we have a message to pre-fill
			const message = sessionStorage.getItem('nickColors_composeMessage');
			if (message) {
				sessionStorage.removeItem('nickColors_composeMessage');
				// Wait for the compose input to appear, then fill it
				setTimeout(() => tryFillMessage(message, 0), 300);
			}
		} else if (attempts > 30) {
			console.log('[NickColors] Max attempts reached, giving up');
		} else {
			// Retry after a delay
			console.log('[NickColors] C-Mail button not found, retrying in 500ms');
			setTimeout(() => tryOpenCompose(attempts + 1), 500);
		}
	}

	// Try to fill the message input
	function tryFillMessage(message, attempts) {
		console.log(`[NickColors] tryFillMessage attempt ${attempts}`);
		const input = document.querySelector('input[placeholder="Type a message..."], textarea[placeholder="Type a message..."]');
		if (input) {
			console.log('[NickColors] Found message input, filling it');
			input.focus();
			input.value = message;
			// Trigger input event so the site's JS knows the value changed
			input.dispatchEvent(new Event('input', { bubbles: true }));
		} else if (attempts < 20) {
			setTimeout(() => tryFillMessage(message, attempts + 1), 200);
		} else {
			console.log('[NickColors] Could not find message input, giving up');
		}
	}

	// Start trying after initial page load
	console.log('[NickColors] readyState:', document.readyState);
	if (document.readyState === 'complete') {
		console.log('[NickColors] Page already complete, starting in 1s');
		setTimeout(tryOpenCompose, 1000);
	} else {
		console.log('[NickColors] Waiting for load event');
		window.addEventListener('load', () => {
			console.log('[NickColors] Load event fired, starting in 1s');
			setTimeout(tryOpenCompose, 1000);
		});
	}
}