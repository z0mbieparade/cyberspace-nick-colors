/**
 * GM storage shim tests
 *
 * helper-functions.js picks between the sync GM_* API, the async GM.* API, and a
 * localStorage fallback. It has to get this right without a manager present, so these
 * tests load just that file with hand-built GM mocks rather than the shared setup.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

const HELPER_SOURCE = readFileSync(join(process.cwd(), 'src', 'helper-functions.js'), 'utf8');

/**
 * Evaluates helper-functions.js with the given GM API mocks injected as globals.
 * @param {Object} mocks - { GM_getValue, GM_setValue, GM, localStorage }
 * @returns {Object} The storage shim's internals for assertion
 */
function loadStorageShim({ GM_getValue, GM_setValue, GM, localStorage, console: consoleMock } = {}) {
	const factory = new Function(
		'GM_getValue', 'GM_setValue', 'GM', 'localStorage', 'console',
		`${HELPER_SOURCE}
		return { _GM_getValue, _GM_setValue, _hasSyncGM, _hasAsyncGM, _initGMCache, _gmCache };`
	);
	return factory(GM_getValue, GM_setValue, GM, localStorage, consoleMock ?? console);
}

// For cases that are expected to log a failure - keeps the run output readable
const silentConsole = { log: () => {}, warn: () => {}, error: () => {} };

function createMemoryLocalStorage() {
	const store = new Map();
	return {
		getItem: (key) => (store.has(key) ? store.get(key) : null),
		setItem: (key, value) => store.set(key, String(value)),
		removeItem: (key) => store.delete(key),
	};
}

describe('GM storage shim', () => {
	let localStorage;

	beforeEach(() => {
		localStorage = createMemoryLocalStorage();
	});

	describe('synchronous GM_* API', () => {
		it('uses GM_getValue directly', () => {
			const store = { siteConfig: '{"iconSet":"x"}' };
			const shim = loadStorageShim({
				GM_getValue: (key, defaultValue) => (key in store ? store[key] : defaultValue),
				GM_setValue: (key, value) => { store[key] = value; },
				localStorage,
			});

			expect(shim._hasSyncGM).toBe(true);
			expect(shim._hasAsyncGM).toBe(false);
			expect(shim._GM_getValue('siteConfig', null)).toBe('{"iconSet":"x"}');
		});
	});

	describe('async GM.* API (Greasemonkey 4 style)', () => {
		it('reads through the cache instead of returning a Promise', async () => {
			const store = { siteConfig: '{"iconSet":"y"}' };
			const shim = loadStorageShim({
				GM: {
					getValue: async (key) => store[key],
					setValue: async (key, value) => { store[key] = value; },
				},
				localStorage,
			});

			expect(shim._hasSyncGM).toBe(false);
			expect(shim._hasAsyncGM).toBe(true);

			// Before hydration: the default, never a Promise
			expect(shim._GM_getValue('siteConfig', null)).toBeNull();

			await shim._initGMCache();
			expect(shim._GM_getValue('siteConfig', null)).toBe('{"iconSet":"y"}');
		});
	});

	// The bug this guards: a manager that exposes the GM_* names but implements them
	// async. Detecting by name alone handed callers a Promise, which JSON.parse turned
	// into 'Unexpected token o, "[object Promise]" is not valid JSON'.
	describe('async GM_* API (names of the sync API, async behaviour)', () => {
		const makeAsyncOldStyleMocks = (store) => ({
			GM_getValue: async (key) => store[key],
			GM_setValue: async (key, value) => { store[key] = value; },
		});

		it('is not treated as the synchronous API', () => {
			const shim = loadStorageShim({ ...makeAsyncOldStyleMocks({}), localStorage });

			expect(shim._hasSyncGM).toBe(false);
			expect(shim._hasAsyncGM).toBe(true);
		});

		it('never returns a Promise from _GM_getValue', async () => {
			const store = { siteConfig: '{"iconSet":"z"}' };
			const shim = loadStorageShim({ ...makeAsyncOldStyleMocks(store), localStorage });

			expect(shim._GM_getValue('siteConfig', null)).toBeNull();

			await shim._initGMCache();

			const afterHydration = shim._GM_getValue('siteConfig', null);
			expect(afterHydration).toBe('{"iconSet":"z"}');
			expect(() => JSON.parse(afterHydration)).not.toThrow();
		});
	});

	describe('no GM API at all', () => {
		it('falls back to localStorage', () => {
			const shim = loadStorageShim({ localStorage });

			expect(shim._hasSyncGM).toBe(false);
			expect(shim._hasAsyncGM).toBe(false);

			shim._GM_setValue('siteConfig', '{"iconSet":"w"}');
			expect(shim._GM_getValue('siteConfig', null)).toBe('{"iconSet":"w"}');
			expect(localStorage.getItem('nickColors_siteConfig')).toBe('{"iconSet":"w"}');
		});

		it('returns the default for an unset key', () => {
			const shim = loadStorageShim({ localStorage });
			expect(shim._GM_getValue('siteConfig', null)).toBeNull();
		});
	});

	describe('a GM_getValue that throws', () => {
		it('falls back rather than crashing the script', () => {
			const shim = loadStorageShim({
				GM_getValue: () => { throw new Error('not permitted'); },
				GM_setValue: () => {},
				localStorage,
				console: silentConsole,
			});

			expect(shim._hasSyncGM).toBe(false);
			expect(() => shim._GM_getValue('siteConfig', null)).not.toThrow();
		});
	});
});
