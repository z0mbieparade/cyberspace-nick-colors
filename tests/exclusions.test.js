/**
 * The exclusion lists live in src/exclusions.json and feed two consumers:
 * the userscript @exclude header, and the constants injected into the bundle.
 * These tests pin that generation so the two can't drift.
 */

import { describe, it, expect } from 'vitest';
import { createRequire } from 'module';

const {
	HOST_EXCLUDE,
	PATH_EXCLUDE,
	buildExcludeMetadata,
	buildExclusionsCode,
} = createRequire(import.meta.url)('../exclusions.js');

describe('exclusion lists', () => {
	it('excludes the page and terminal subdomains', () => {
		expect(HOST_EXCLUDE).toContain('page.cyberspace.online');
		expect(HOST_EXCLUDE).toContain('terminal.cyberspace.online');
	});

	it('excludes the /pages and /terminal paths', () => {
		expect(PATH_EXCLUDE).toContain('/pages');
		expect(PATH_EXCLUDE).toContain('/terminal');
	});
});

describe('buildExcludeMetadata', () => {
	const metadata = buildExcludeMetadata();

	it('emits a host and a subdomain pattern for every excluded host', () => {
		for (const host of HOST_EXCLUDE) {
			expect(metadata).toContain(`// @exclude      https://${host}/*`);
			expect(metadata).toContain(`// @exclude      https://*.${host}/*`);
		}
		expect(metadata.split('\n')).toHaveLength(HOST_EXCLUDE.length * 2);
	});

	it('only emits @exclude lines', () => {
		for (const line of metadata.split('\n')) {
			expect(line).toMatch(/^\/\/ @exclude {6}https:\/\/\S+$/);
		}
	});
});

describe('buildExclusionsCode', () => {
	const code = buildExclusionsCode();

	it('declares both constants with every entry', () => {
		const declared = new Function(`${code} return { HOST_EXCLUDE, PATH_EXCLUDE };`)();
		expect(declared.HOST_EXCLUDE).toEqual(HOST_EXCLUDE);
		expect(declared.PATH_EXCLUDE).toEqual(PATH_EXCLUDE);
	});
});
