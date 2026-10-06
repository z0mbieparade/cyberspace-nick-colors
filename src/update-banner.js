
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
	// A fix release beats the migration notice, which comes back next load
	document.getElementById(MIGRATION_BANNER_ID)?.remove();

	const safeVersion = escapeHtml(newVersion);
	return mountBanner(UPDATE_BANNER_ID, `
		<span class="nc-update-banner-icon" aria-hidden="true">▲</span>
		<span class="nc-update-banner-text">
			<strong>Nick Colors v${safeVersion}</strong> is available &mdash; you're on v${VERSION}
		</span>
		<span class="nc-update-banner-actions">
			<button class="nc-update-banner-update link-brackets" title="Open the new version to install it"><span class="inner">UPDATE</span></button>
			<button class="nc-update-banner-later link-brackets" title="Hide until the next page load"><span class="inner">LATER</span></button>
			<button class="nc-update-banner-dismiss link-brackets" title="Don't show this again for v${safeVersion}"><span class="inner">&times;</span></button>
		</span>
	`, {
		'.nc-update-banner-update': () => window.open(getScriptURL(), '_blank'),
		'.nc-update-banner-dismiss': () => saveDismissedUpdateVersion(newVersion),
	});
}

// =====================================================
// MIGRATION BANNER
// =====================================================

// Nick Colors is retired: it lives on inside Cyberspace Atmospheric Modulator.
// Same banner as an update, minus the version: × hides it for good, LATER
// until the next page load.
const MIGRATION_BANNER_ID = 'nc-migration-banner';

/**
 * Shows the banner asking the user to move to Atmospheric Modulator.
 * No-ops once dismissed, or while another banner holds the top of the page.
 * @returns {HTMLElement|null} The banner element, or null when nothing was shown
 */
function showMigrationBanner() {
	if (_GM_getValue('migrationNoticeDismissed', '') === 'true') return null;
	if (document.getElementById(UPDATE_BANNER_ID) || document.getElementById(MIGRATION_BANNER_ID)) return null;

	const banner = mountBanner(MIGRATION_BANNER_ID, `
		<span class="nc-update-banner-icon" aria-hidden="true">▲</span>
		<span class="nc-update-banner-text">
			<strong>Nick Colors is deprecated.</strong> Please <button type="button" class="nc-update-banner-export nc-text-link">export your settings</button> and install the new <a href="https://github.com/z0mbieparade/cyberspace-atmospheric-modulator">Cyberspace Atmospheric Modulator userscript</a>. (You get nice new features like image un-dither!)
		</span>
		<span class="nc-update-banner-actions">
			<a class="nc-update-banner-install link-brackets" href="${ATMOMOD_INSTALL_URL}" target="_blank" rel="noopener"><span class="inner">INSTALL</span></a>
			<a class="nc-update-banner-moving link-brackets" href="${ATMOMOD_MOVING_URL}" target="_blank" rel="noopener"><span class="inner">HOW TO MOVE</span></a>
			<button class="nc-update-banner-later link-brackets" title="Hide until the next page load"><span class="inner">LATER</span></button>
			<button class="nc-update-banner-dismiss link-brackets" title="Don't show this again" aria-label="Don't show this again"><span class="inner">&times;</span></button>
		</span>
	`, {
		'.nc-update-banner-dismiss': () => _GM_setValue('migrationNoticeDismissed', 'true'),
	});
	// Not one of mountBanner's actions, which hide the banner: INSTALL comes next
	banner.querySelector('.nc-update-banner-export').addEventListener('click', exportSettingsToFile);
	return banner;
}

/**
 * Slides a banner in at the top of the page. Its LATER button hides it;
 * each action hides it after running.
 * @param {string} id - the banner element's id
 * @param {string} html - its contents, already escaped, with a
 *   .nc-update-banner-later button
 * @param {Object<string, Function>} actions - { selector: run on click }
 * @returns {HTMLElement} the banner
 * @throws {TypeError} when html has no LATER button or an action's selector matches nothing
 * Side effects: appends the banner to document.body
 */
function mountBanner(id, html, actions) {
	const banner = document.createElement('div');
	banner.id = id;
	banner.className = 'nc-update-banner';
	banner.setAttribute('role', 'status');
	banner.innerHTML = html;

	document.body.appendChild(banner);

	// Next frame so the transform transition has a starting value to animate from
	requestAnimationFrame(() => banner.classList.add(UPDATE_BANNER_VISIBLE_CLASS));

	const hide = () => {
		banner.classList.remove(UPDATE_BANNER_VISIBLE_CLASS);
		// Outlives the CSS transition; remove() is safe to call twice
		setTimeout(() => banner.remove(), 400);
	};

	banner.querySelector('.nc-update-banner-later').addEventListener('click', hide);
	for (const [selector, run] of Object.entries(actions)) {
		banner.querySelector(selector).addEventListener('click', () => {
			run();
			hide();
		});
	}

	return banner;
}
