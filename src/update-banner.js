
// =====================================================
// UPDATE BANNER
// =====================================================

// Slides down from the top of the page when a newer release is available. The version
// link in the dialog footer is easy to miss, so this is the loud version of that signal.
//
// Two ways out, and they mean different things:
//   LATER - hides it for now, comes back on the next page load
//   x     - records the version, so it stays hidden until something newer than it ships
const UPDATE_BANNER_ID = 'nc-update-banner';
const UPDATE_BANNER_VISIBLE_CLASS = 'nc-update-banner-visible';

/**
 * Shows the update banner for a newer version.
 * No-ops when the version isn't newer than what's installed, when it's already been
 * dismissed, or when the banner is already on screen.
 * @param {string} newVersion - The version available upstream
 * @returns {HTMLElement|null} The banner element, or null when nothing was shown
 */
function showUpdateBanner(newVersion) {
	if (!newVersion || !isNewerVersion(newVersion, VERSION)) return null;
	if (!isNewerVersion(newVersion, getDismissedUpdateVersion())) return null;
	if (document.getElementById(UPDATE_BANNER_ID)) return null;

	const banner = document.createElement('div');
	banner.id = UPDATE_BANNER_ID;
	banner.className = 'nc-update-banner';
	banner.setAttribute('role', 'status');
	banner.innerHTML = `
		<span class="nc-update-banner-icon" aria-hidden="true">▲</span>
		<span class="nc-update-banner-text">
			<strong>Nick Colors v${newVersion}</strong> is available &mdash; you're on v${VERSION}
		</span>
		<span class="nc-update-banner-actions">
			<button class="nc-update-banner-update link-brackets" title="Open the new version to install it"><span class="inner">UPDATE</span></button>
			<button class="nc-update-banner-later link-brackets" title="Hide until the next page load"><span class="inner">LATER</span></button>
			<button class="nc-update-banner-dismiss link-brackets" title="Don't show this again for v${newVersion}"><span class="inner">&times;</span></button>
		</span>
	`;

	document.body.appendChild(banner);

	// Next frame so the transform transition has a starting value to animate from
	requestAnimationFrame(() => banner.classList.add(UPDATE_BANNER_VISIBLE_CLASS));

	const hide = () => {
		banner.classList.remove(UPDATE_BANNER_VISIBLE_CLASS);
		// Outlives the CSS transition; remove() is safe to call twice
		setTimeout(() => banner.remove(), 400);
	};

	banner.querySelector('.nc-update-banner-update').addEventListener('click', () => {
		window.open(getScriptURL(), '_blank');
		hide();
	});

	banner.querySelector('.nc-update-banner-later').addEventListener('click', hide);

	banner.querySelector('.nc-update-banner-dismiss').addEventListener('click', () => {
		saveDismissedUpdateVersion(newVersion);
		hide();
	});

	return banner;
}
