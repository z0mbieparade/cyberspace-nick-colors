import { describe, it, expect } from 'vitest';
import './setup.js';

describe('minifyKeys', () => {
	it('minifies known keys', () => {
		const input = { minSaturation: 50, maxLightness: 80 };
		const result = minifyKeys(input);
		expect(result).toEqual({ mS: 50, xL: 80 });
	});

	it('preserves unknown keys', () => {
		const input = { unknownKey: 'value' };
		const result = minifyKeys(input);
		expect(result).toEqual({ unknownKey: 'value' });
	});

	it('handles nested objects', () => {
		const input = { siteConfig: { minHue: 0, maxHue: 360 } };
		const result = minifyKeys(input);
		expect(result).toEqual({ sc: { mH: 0, xH: 360 } });
	});

	it('handles arrays', () => {
		const input = { items: [[50, 100], [200, 250]] };
		const result = minifyKeys(input);
		expect(result).toEqual({ items: [[50, 100], [200, 250]] });
	});

	it('handles null and primitives', () => {
		expect(minifyKeys(null)).toBeNull();
		expect(minifyKeys(42)).toBe(42);
		expect(minifyKeys('string')).toBe('string');
	});
});

describe('maxifyKeys', () => {
	it('expands minified keys', () => {
		const input = { mS: 50, xL: 80 };
		const result = maxifyKeys(input);
		expect(result).toEqual({ minSaturation: 50, maxLightness: 80 });
	});

	it('preserves unknown keys', () => {
		const input = { unknownKey: 'value' };
		const result = maxifyKeys(input);
		expect(result).toEqual({ unknownKey: 'value' });
	});

	it('handles nested objects', () => {
		const input = { sc: { mH: 0, xH: 360 } };
		const result = maxifyKeys(input);
		expect(result).toEqual({ siteConfig: { minHue: 0, maxHue: 360 } });
	});

	it('handles arrays', () => {
		const input = { items: [[50, 100], [200, 250]] };
		const result = maxifyKeys(input);
		expect(result).toEqual({ items: [[50, 100], [200, 250]] });
	});

	it('is inverse of minifyKeys', () => {
		const original = {
			siteConfig: { minSaturation: 30, maxLightness: 70 },
			customNickColors: { user1: { color: 'hsl(180, 50%, 50%)' } }
		};
		const minified = minifyKeys(original);
		const restored = maxifyKeys(minified);
		expect(restored).toEqual(original);
	});
});

describe('getNonDefaultValues', () => {
	it('returns only changed values', () => {
		const current = { a: 1, b: 2, c: 3 };
		const defaults = { a: 1, b: 5, c: 3 };
		const result = getNonDefaultValues(current, defaults);
		expect(result).toEqual({ b: 2 });
	});

	it('returns null when all values match defaults', () => {
		const current = { a: 1, b: 2 };
		const defaults = { a: 1, b: 2 };
		const result = getNonDefaultValues(current, defaults);
		expect(result).toBeNull();
	});

	it('handles nested objects', () => {
		const current = { arr: [1, 2, 3] };
		const defaults = { arr: [1, 2, 4] };
		const result = getNonDefaultValues(current, defaults);
		expect(result).toEqual({ arr: [1, 2, 3] });
	});
});

describe('exportSettings', () => {
	it('includes version and exportedAt', () => {
		const result = exportSettings();
		expect(result.version).toBeDefined();
		expect(result.exportedAt).toBeDefined();
	});

	it('only includes non-default values', () => {
		// Reset to defaults
		Object.assign(siteConfig, DEFAULT_SITE_CONFIG);

		const result = exportSettings();
		// With all defaults, only version/exportedAt should be present
		expect(result.siteConfig).toBeUndefined();
	});
});

describe('importSettings', () => {
	it('returns error for invalid data', () => {
		expect(importSettings(null).success).toBe(false);
		expect(importSettings('string').success).toBe(false);
		expect(importSettings(123).success).toBe(false);
	});

	it('returns error for unsupported version', () => {
		const result = importSettings({ version: 999 });
		expect(result.success).toBe(false);
		expect(result.message).toContain('newer than supported');
	});

	it('returns success for valid color config data', () => {
		const data = { siteConfig: { minSaturation: 40 } };
		const result = importSettings(data);
		expect(result.success).toBe(true);
		expect(result.message).toBe('Settings imported successfully');
	});

	it('returns success for minified keys', () => {
		const data = { cc: { mS: 35 } }; // minified siteConfig.minSaturation
		const result = importSettings(data);
		expect(result.success).toBe(true);
	});

	it('returns success for custom nick colors', () => {
		const data = { customNickColors: { testuser: { color: 'hsl(180, 50%, 50%)' } } };
		const result = importSettings(data);
		expect(result.success).toBe(true);
	});
});
