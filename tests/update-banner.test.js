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
