// =====================================================
// USERNAME DETECTION
// =====================================================

function isValidUsername(username) {
	if (!username) return false;
	if (username.startsWith('@')) username = username.slice(1);
	username = username.trim().toLowerCase();

	if (EXCLUDE_VALUES.includes(username)) return false;
	if (username.includes(' ')) return false;

	return true;
}

function extractUsername(element) {
	// Try to get username from the element
	// Customize this based on how the site structures usernames

	// From href like "/username" (but not "/chat/room" or "/static/file.js" or "/guilds/x")
	const href = element.getAttribute('href');
	if (href && href.startsWith('/')) {
		const pathAfterSlash = href.slice(1);
		// Only match simple single-segment paths like "/username"
		// Skip paths that start with known non-user routes
		if (!pathAfterSlash.includes('/') && !pathAfterSlash.includes('.')) {
			const match = href.match(/^\/([^\/\?#]+)/);
			if (match && isValidUsername(match[1])) return match[1];
		}
	}

	// From data attribute
	if (element.dataset.username && isValidUsername(element.dataset.username)) {
		return element.dataset.username;
	}

	// From text content (fallback)
	let text = element.textContent.trim();
	// If text has a space (possibly from icon prefix), try the last part
	if (text.includes(' ')) {
		const parts = text.split(' ');
		text = parts[parts.length - 1]; // Take the last part (username after icon)
	}
	if (text && text.length < 30) {
		//if starts with @ remove
		if(text.startsWith('@')) text = text.slice(1);
		if(isValidUsername(text)) return text;
	}

	return null;
}

function isLikelyUsername(element) {
	// Skip already processed
	if (element.dataset.nickColored) return false;

	// Check text content - if it has a space, only allow if it looks like "icon username"
	const text = element.textContent.trim();
	if (text.includes(' ')) {
		// Only accept if it's exactly 2 parts and second part looks like username
		const parts = text.split(' ');
		if (parts.length !== 2 || parts[1].includes(' ') || parts[1].length === 0) {
			return false;
		}
		// If we get here, it might be "icon username" format - allow it
	}

	// Skip obvious non-usernames
	const href = element.getAttribute('href') || '';

	// Skip links with more than one slash (e.g., /guilds/name, /chat/room)
	const slashCount = (href.match(/\//g) || []).length;
	if (slashCount > 1) {
		return false;
	}

	// If container hints are specified, ONLY color within those containers
	// Exception: elements without href (e.g., beta site spans) use a specific enough selector
	// Also skip if current path matches a path hint (more permissive on chat pages)
	const hasHref = !!element.getAttribute('href');
	const onPermissivePath = PATH_HINTS.some(p => window.location.pathname.startsWith(p));
	if (CONTAINER_HINTS.length > 0 && hasHref && !onPermissivePath) {
		const inContainer = CONTAINER_HINTS.some(sel => element.closest(sel));
		if (!inContainer) {
			return false;
		}
	}

	// Skip if inside an excluded container
	if (CONTAINER_HINTS_EXCLUDE.length > 0) {
		const inExcluded = CONTAINER_HINTS_EXCLUDE.some(sel => element.closest(sel));
		if (inExcluded) {
			return false;
		}
	}

	// For elements with href, validate the path
	if (href) {
		const hrefPath = href.startsWith('/') ? href.slice(1) : href;
		return isValidUsername(hrefPath);
	}

	// For elements without href (e.g., beta site spans), validate text content
	return isValidUsername(text);
}

function colorizeAll() {
	const selector = USERNAME_SELECTORS.join(', ');

	document.querySelectorAll(selector).forEach(el => {
		if (!isLikelyUsername(el)) return;

		const username = extractUsername(el);
		if (username) {
			applyStyles(el, username);
		}
	});

	// Also colorize @mentions in text
	colorizeMentions();
}

function colorizeMentions() {
	// Search entire page for @mentions (they're explicit, so no risk of false positives)
	// Walk through text nodes looking for @username patterns
	const walker = document.createTreeWalker(
		document.body,
		NodeFilter.SHOW_TEXT,
		{
			acceptNode: (node) => {
				// Skip if already inside a colored mention or if no @ symbol
				if (!node.textContent.includes('@')) return NodeFilter.FILTER_REJECT;
				if (node.parentElement?.closest('[data-mention-colored]')) return NodeFilter.FILTER_REJECT;
				if (node.parentElement?.closest('[data-nick-colored]')) return NodeFilter.FILTER_REJECT;
				// Skip dialog previews (they manage their own styling)
				if (node.parentElement?.closest('.nc-dialog-preview')) return NodeFilter.FILTER_REJECT;
				// Skip script/style tags
				const tagName = node.parentElement?.tagName;
				if (tagName === 'SCRIPT' || tagName === 'STYLE' || tagName === 'TEXTAREA' || tagName === 'INPUT') {
					return NodeFilter.FILTER_REJECT;
				}
				// Skip excluded containers
				if (CONTAINER_HINTS_EXCLUDE.length > 0) {
					const inExcluded = CONTAINER_HINTS_EXCLUDE.some(sel => node.parentElement?.closest(sel));
					if (inExcluded) return NodeFilter.FILTER_REJECT;
				}
				return NodeFilter.FILTER_ACCEPT;
			}
		}
	);

	const textNodes = [];
	let node;
	while ((node = walker.nextNode())) {
		textNodes.push(node);
	}

	// Process each text node
	textNodes.forEach(textNode => {
		const text = textNode.textContent;
		// Match @username (alphanumeric, underscore, hyphen)
		const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
		let match;
		const matches = [];

		while ((match = mentionRegex.exec(text)) !== null) {
			// Skip if this looks like an email address (has word chars before the @)
			if (match.index > 0 && /[a-zA-Z0-9._-]/.test(text[match.index - 1])) {
				continue;
			}
			// Skip if followed by a dot and more text (like @site.com)
			const afterMatch = text.slice(match.index + match[0].length);
			if (/^\.[a-zA-Z]/.test(afterMatch)) {
				continue;
			}
			// Skip excluded usernames
			if (!isValidUsername(match[1])) {
				continue;
			}
			matches.push({
				full: match[0],
				username: match[1],
				index: match.index
			});
		}

		if (matches.length === 0) return;

		// Build new content with colored spans
		const fragment = document.createDocumentFragment();
		let lastIndex = 0;

		matches.forEach(m => {
			// Add text before the mention
			if (m.index > lastIndex) {
				fragment.appendChild(document.createTextNode(text.slice(lastIndex, m.index)));
			}

			// Create colored span for the mention
			const span = document.createElement('span');
			span.textContent = m.full;

			const isInverted = INVERTED_CONTAINERS.length > 0 &&
				!!textNode.parentElement?.closest(INVERTED_CONTAINERS.join(', '));

			applyStyles(span, m.username, {
				matchType: 'mention',
				isInverted
			});

			//  Object.assign(span.style, styles);
			fragment.appendChild(span);

			lastIndex = m.index + m.full.length;
		});

		// Add remaining text
		if (lastIndex < text.length) {
			fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
		}

		// Replace the text node with the fragment
		textNode.parentNode.replaceChild(fragment, textNode);
	});
}