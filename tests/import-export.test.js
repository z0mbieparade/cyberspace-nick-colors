import { describe, it, expect, beforeEach } from 'vitest';
import './setup.js';

// Reset state before each test
beforeEach(() => {
	// Reset siteConfig to defaults
	for (const key in siteConfig) {
		delete siteConfig[key];
	}
	Object.assign(siteConfig, DEFAULT_SITE_CONFIG);

	// Clear custom nick colors
	for (const key in customNickColors) {
		delete customNickColors[key];
	}
});

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
		const data = { sc: { mS: 35 } }; // minified siteConfig.minSaturation
		const result = importSettings(data);
		expect(result.success).toBe(true);
	});

	it('returns success for custom nick colors', () => {
		const data = { customNickColors: { testuser: { color: 'hsl(180, 50%, 50%)' } } };
		const result = importSettings(data);
		expect(result.success).toBe(true);
	});
});

describe('v1 to v2 migration', () => {
	it('migrates v1 format with separate configs', () => {
		// Example v1 export format
		const v1Data = {
			v: 1,
			at: '2025-12-16T02:53:34.271Z',
			cc: { mL: 40, xL: 60 },           // colorConfig
			stc: { hS: 5 },                    // siteThemeConfig
			sc: { vW: true, vI: true, vC: true }, // styleConfig (v1)
			cnc: {}                            // customNickColors
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(result.message).toContain('migrated from v1');

		// Verify merged config values
		expect(siteConfig.minLightness).toBe(40);
		expect(siteConfig.maxLightness).toBe(60);
		expect(siteConfig.hueSpread).toBe(5);
		expect(siteConfig.varyWeight).toBe(true);
		expect(siteConfig.varyItalic).toBe(true);
		expect(siteConfig.varyCase).toBe(true);
	});

	it('migrates v1 format with only colorConfig', () => {
		const v1Data = {
			v: 1,
			cc: { mS: 30, xS: 90 }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(siteConfig.minSaturation).toBe(30);
		expect(siteConfig.maxSaturation).toBe(90);
	});

	it('migrates v1 format with customNickColors', () => {
		const v1Data = {
			v: 1,
			cnc: {
				testuser: { c: 'hsl(180, 50%, 50%)', fW: 'bold' }
			}
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(customNickColors.testuser.color).toBe('hsl(180, 50%, 50%)');
		expect(customNickColors.testuser.fontWeight).toBe('bold');
	});

	it('detects v1 by presence of cc key even without version', () => {
		const v1Data = {
			cc: { mH: 100, xH: 200 }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(result.message).toContain('migrated from v1');
		expect(siteConfig.minHue).toBe(100);
		expect(siteConfig.maxHue).toBe(200);
	});

	it('detects v1 by presence of stc key', () => {
		const v1Data = {
			stc: { uH: true, hS: 15 }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(result.message).toContain('migrated from v1');
		expect(siteConfig.useSiteThemeHue).toBe(true);
		expect(siteConfig.hueSpread).toBe(15);
	});

	it('handles unminified v1 format with colorConfig', () => {
		const v1Data = {
			version: 1,
			colorConfig: { minLightness: 45, maxLightness: 75 }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(result.message).toContain('migrated from v1');
		expect(siteConfig.minLightness).toBe(45);
		expect(siteConfig.maxLightness).toBe(75);
	});

	it('handles unminified v1 format with siteThemeConfig key renames', () => {
		const v1Data = {
			version: 1,
			siteThemeConfig: {
				useHueRange: true,       // renamed to useSiteThemeHue
				useSaturation: true,     // renamed to useSiteThemeSat
				useLightness: true,      // renamed to useSiteThemeLit
				saturationSpread: 20,    // renamed to satSpread
				lightnessSpread: 15      // renamed to litSpread
			}
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(siteConfig.useSiteThemeHue).toBe(true);
		expect(siteConfig.useSiteThemeSat).toBe(true);
		expect(siteConfig.useSiteThemeLit).toBe(true);
		expect(siteConfig.satSpread).toBe(20);
		expect(siteConfig.litSpread).toBe(15);
	});

	it('handles unminified v1 format with styleConfig', () => {
		const v1Data = {
			version: 1,
			styleConfig: { varyWeight: true, prependIcon: true, iconSet: '★ ◆' }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(siteConfig.varyWeight).toBe(true);
		expect(siteConfig.prependIcon).toBe(true);
		expect(siteConfig.iconSet).toBe('★ ◆');
	});

	it('ignores excludeRanges from v1 (removed in v1.1)', () => {
		const v1Data = {
			version: 1,
			colorConfig: { minHue: 50, excludeRanges: [[100, 150]] }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(siteConfig.minHue).toBe(50);
		expect(siteConfig.excludeRanges).toBeUndefined();
	});

	it('detects v1 by presence of colorConfig key', () => {
		const v1Data = {
			colorConfig: { contrastThreshold: 5 }
		};

		const result = importSettings(v1Data);
		expect(result.success).toBe(true);
		expect(result.message).toContain('migrated from v1');
		expect(siteConfig.contrastThreshold).toBe(5);
	});
});
