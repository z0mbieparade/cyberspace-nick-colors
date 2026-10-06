/**
 * Update banner tests
 *
 * Covers the version comparison the check depends on, and the banner's show/dismiss
 * rules - it must not appear for an older or equal version, and dismissing a version
 * has to keep it hidden until something newer ships.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { TEST_VERSION } from './setup.js';

// The version the fixture reports as installed; the literals below sit either side of it
const LOCAL_VERSION = TEST_VERSION;

/**
 * Run fn with downloads captured instead of started: jsdom cannot download.
 * @param {function(string[]): *} fn - gets the list of downloaded file names
 * @returns {Promise} settles after fn, with the stubs restored
 */
async function withDownloadStub(fn) {
	const downloads = [];
	const originalClick = window.HTMLAnchorElement.prototype.click;
	const { createObjectURL, revokeObjectURL } = URL;
	window.HTMLAnchorElement.prototype.click = function () { downloads.push(this.download); };
	URL.createObjectURL = () => 'blob:test';
	URL.revokeObjectURL = () => {};
	try {
		await fn(downloads);
	} finally {
		window.HTMLAnchorElement.prototype.click = originalClick;
		Object.assign(URL, { createObjectURL, revokeObjectURL });
	}
}

describe('compareVersions', () => {
	it('orders by numeric segment, not string', () => {
		// The case a lexicographic compare gets backwards
		expect(compareVersions('1.3.10', '1.3.9')).toBe(1);
		expect(compareVersions('1.3.9', '1.3.10')).toBe(-1);
	});

	it('treats missing segments as zero', () => {
		expect(compareVersions('1.3', '1.3.0')).toBe(0);
		expect(compareVersions('1.3', '1.3.1')).toBe(-1);
	});

	it('reports equality', () => {
		expect(compareVersions('1.3.3', '1.3.3')).toBe(0);
	});

	it('compares major and minor before patch', () => {
		expect(compareVersions('2.0.0', '1.9.9')).toBe(1);
		expect(compareVersions('1.4.0', '1.3.99')).toBe(1);
	});

	it('handles empty and junk input without throwing', () => {
		expect(compareVersions('', '')).toBe(0);
		expect(compareVersions(null, undefined)).toBe(0);
		expect(compareVersions('1.3.3', '')).toBe(1);
	});

	it('tolerates a leading v', () => {
		expect(compareVersions('v1.3.3', '1.3.3')).toBe(0);
		expect(compareVersions('v1.3.4', '1.3.3')).toBe(1);
	});
});

describe('isNewerVersion', () => {
	it('is true only for a genuinely newer version', () => {
		expect(isNewerVersion('1.3.4', '1.3.3')).toBe(true);
		expect(isNewerVersion('1.3.3', '1.3.3')).toBe(false);
		// A local dev build ahead of main must not prompt to "update" backwards
		expect(isNewerVersion('1.3.2', '1.3.3')).toBe(false);
	});
});

describe('showUpdateBanner', () => {
	beforeEach(() => {
		document.getElementById(UPDATE_BANNER_ID)?.remove();
		saveDismissedUpdateVersion('');
	});

	it('shows for a newer version', () => {
		const banner = showUpdateBanner('1.3.4');

		expect(banner).not.toBeNull();
		expect(document.getElementById(UPDATE_BANNER_ID)).not.toBeNull();
		expect(banner.textContent).toContain('1.3.4');
		expect(banner.textContent).toContain(LOCAL_VERSION);
	});

	it('does not show for the installed version', () => {
		expect(showUpdateBanner(LOCAL_VERSION)).toBeNull();
		expect(document.getElementById(UPDATE_BANNER_ID)).toBeNull();
	});

	it('does not show for an older version', () => {
		expect(showUpdateBanner('1.3.2')).toBeNull();
	});

	it('does nothing without a version', () => {
		expect(showUpdateBanner(null)).toBeNull();
		expect(showUpdateBanner('')).toBeNull();
	});

	it('does not stack a second banner', () => {
		showUpdateBanner('1.3.4');
		expect(showUpdateBanner('1.3.4')).toBeNull();
		expect(document.querySelectorAll(`#${UPDATE_BANNER_ID}`).length).toBe(1);
	});

	describe('dismissal', () => {
		it('records the version when dismissed with x', () => {
			const banner = showUpdateBanner('1.3.4');
			banner.querySelector('.nc-update-banner-dismiss').click();

			expect(getDismissedUpdateVersion()).toBe('1.3.4');
		});

		it('stays hidden for a version already dismissed', () => {
			saveDismissedUpdateVersion('1.3.4');
			expect(showUpdateBanner('1.3.4')).toBeNull();
		});

		it('shows again when a newer version than the dismissed one ships', () => {
			saveDismissedUpdateVersion('1.3.4');
			expect(showUpdateBanner('1.3.5')).not.toBeNull();
		});

		it('LATER does not record the version, so it returns next load', () => {
			const banner = showUpdateBanner('1.3.4');
			banner.querySelector('.nc-update-banner-later').click();

			expect(getDismissedUpdateVersion()).toBe('');
		});
	});
});

describe('showMigrationBanner', () => {
	beforeEach(() => {
		document.getElementById(UPDATE_BANNER_ID)?.remove();
		document.getElementById(MIGRATION_BANNER_ID)?.remove();
		GM_setValue('migrationNoticeDismissed', '');
		saveDismissedUpdateVersion('');
	});

	it('links to the install and the moving guide', () => {
		const banner = showMigrationBanner();
		expect(banner.querySelector('.nc-update-banner-install').href).toMatch(/cyberspace-atmospheric-modulator\.user\.js$/);
		expect(banner.querySelector('.nc-update-banner-moving').href).toMatch(/#moving-from-nick-colors$/);
	});

	it('stays hidden for good once dismissed with x, but not after LATER', () => {
		showMigrationBanner().querySelector('.nc-update-banner-later').click();
		document.getElementById(MIGRATION_BANNER_ID).remove();
		expect(showMigrationBanner()).not.toBeNull();

		document.getElementById(MIGRATION_BANNER_ID).querySelector('.nc-update-banner-dismiss').click();
		document.getElementById(MIGRATION_BANNER_ID).remove();
		expect(showMigrationBanner()).toBeNull();
	});

	it('gives way to an update banner', () => {
		showMigrationBanner();
		showUpdateBanner('1.3.4');
		expect(document.getElementById(MIGRATION_BANNER_ID)).toBeNull();
	});

	it('downloads the settings file from export your settings, and stays up for INSTALL', async () => {
		await withDownloadStub(async (downloads) => {
			const banner = showMigrationBanner();
			// The slide-in class lands a frame later
			await new Promise(resolve => setTimeout(resolve, 10));
			banner.querySelector('.nc-update-banner-export').click();
			expect(downloads).toEqual([expect.stringMatching(/^nick-colors-settings-\d{4}-\d{2}-\d{2}\.json$/)]);
			expect(banner.classList.contains('nc-update-banner-visible')).toBe(true);
		});
	});

	it('waits while the update banner holds the top of the page', () => {
		showUpdateBanner('1.3.4');
		expect(showMigrationBanner()).toBeNull();
	});
});

describe('showUpdateBanner escaping', () => {
	it('shows a fetched version as text', () => {
		document.getElementById(UPDATE_BANNER_ID)?.remove();
		saveDismissedUpdateVersion('');
		const banner = showUpdateBanner('9.9.9<img src=x>');
		expect(banner.querySelector('img')).toBeNull();
		document.getElementById(UPDATE_BANNER_ID)?.remove();
	});
});

describe('dialog footer deprecation line', () => {
	it('downloads the settings file from export your settings', async () => {
		let dialog;
		try {
			await withDownloadStub((downloads) => {
				dialog = createDialog({ title: 'Test', content: '' });
				dialog.querySelector('.nc-export-settings').click();
				expect(downloads).toEqual([expect.stringMatching(/^nick-colors-settings-\d{4}-\d{2}-\d{2}\.json$/)]);
			});
		} finally {
			dialog?.close();
		}
	});
});
