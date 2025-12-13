import { describe, it, expect, beforeEach } from 'vitest';
import './setup.js';

/**
 * Tests for nick color range mapping with restricted/non-restricted site settings
 */

describe('Range Mapping with Site Settings', () => {
	beforeEach(() => {
		// Reset to defaults
		Object.assign(colorConfig, JSON.parse(JSON.stringify(DEFAULT_COLOR_CONFIG)));
	});

	describe('mapToRange (saturation/lightness)', () => {
		it('maps 0 to min value', () => {
			expect(mapToRange(0, 30, 80)).toBe(30);
		});

		it('maps 100 to max value', () => {
			expect(mapToRange(100, 30, 80)).toBe(80);
		});

		it('maps 50 to middle of range', () => {
			expect(mapToRange(50, 30, 80)).toBe(55); // 30 + 0.5 * 50 = 55
		});

		it('returns value unchanged for full range (0-100)', () => {
			expect(mapToRange(50, 0, 100)).toBe(50);
			expect(mapToRange(25, 0, 100)).toBe(25);
		});

		it('handles narrow ranges', () => {
			// Very narrow range: 70-75
			expect(mapToRange(0, 70, 75)).toBe(70);
			expect(mapToRange(100, 70, 75)).toBe(75);
			expect(mapToRange(50, 70, 75)).toBe(72.5);
		});
	});

	describe('mapHueToRange', () => {
		it('maps 0 to min hue', () => {
			expect(mapHueToRange(0, 100, 200)).toBe(100);
		});

		it('maps 360 to max hue', () => {
			expect(mapHueToRange(360, 100, 200)).toBe(200);
		});

		it('maps proportionally within range', () => {
			// 180 is 50% of 360, should map to 50% of 100-200 range
			expect(mapHueToRange(180, 100, 200)).toBe(150);
		});

		it('returns hue unchanged for full range (0-360)', () => {
			expect(mapHueToRange(180, 0, 360)).toBe(180);
		});

		it('handles wrap-around range (min > max)', () => {
			// Range 300-60 wraps around: 300->360->0->60
			// 0 input maps to start (300)
			expect(mapHueToRange(0, 300, 60)).toBe(300);
			// 360 input maps to end (60)
			expect(mapHueToRange(360, 300, 60)).toBe(60);
		});
	});

	describe('applyRangeMapping', () => {
		it('maps base color to restricted saturation range', () => {
			const base = { h: 180, s: 50, l: 50 };
			const config = {
				minHue: 0, maxHue: 360,
				minSaturation: 70, maxSaturation: 100,
				minLightness: 0, maxLightness: 100
			};
			const result = applyRangeMapping(base, config);

			// s: 50% of 0-100 maps to 50% of 70-100 = 85
			expect(result.s).toBe(85);
			// h and l unchanged (full range)
			expect(result.h).toBe(180);
			expect(result.l).toBe(50);
		});

		it('maps base color to restricted lightness range', () => {
			const base = { h: 180, s: 50, l: 50 };
			const config = {
				minHue: 0, maxHue: 360,
				minSaturation: 0, maxSaturation: 100,
				minLightness: 40, maxLightness: 80
			};
			const result = applyRangeMapping(base, config);

			// l: 50% of 0-100 maps to 50% of 40-80 = 60
			expect(result.l).toBe(60);
		});

		it('maps base color to restricted hue range', () => {
			const base = { h: 180, s: 50, l: 50 };
			const config = {
				minHue: 200, maxHue: 280,
				minSaturation: 0, maxSaturation: 100,
				minLightness: 0, maxLightness: 100
			};
			const result = applyRangeMapping(base, config);

			// h: 180/360 = 50%, maps to 50% of 200-280 = 240
			expect(result.h).toBe(240);
		});

		it('maps to combined restricted ranges', () => {
			const base = { h: 180, s: 50, l: 50 };
			const config = {
				minHue: 100, maxHue: 200,
				minSaturation: 60, maxSaturation: 90,
				minLightness: 45, maxLightness: 75
			};
			const result = applyRangeMapping(base, config);

			// h: 180/360 = 50% -> 150
			expect(result.h).toBe(150);
			// s: 50% of 0-100 -> 50% of 60-90 = 75
			expect(result.s).toBe(75);
			// l: 50% of 0-100 -> 50% of 45-75 = 60
			expect(result.l).toBe(60);
		});
	});

	describe('getEffectiveColorConfig with site theme', () => {
		beforeEach(() => {
			// Reset site theme config
			Object.assign(siteThemeConfig, JSON.parse(JSON.stringify(DEFAULT_SITE_THEME_CONFIG)));
		});

		it('returns base colorConfig when no site theme', () => {
			// siteThemeHsl is undefined in test env
			const effective = getEffectiveColorConfig();
			expect(effective.minSaturation).toBe(colorConfig.minSaturation);
			expect(effective.maxSaturation).toBe(colorConfig.maxSaturation);
		});

		it('respects colorConfig ranges when site theme disabled', () => {
			colorConfig.minSaturation = 80;
			colorConfig.maxSaturation = 100;
			colorConfig.minLightness = 50;
			colorConfig.maxLightness = 70;

			const effective = getEffectiveColorConfig();
			expect(effective.minSaturation).toBe(80);
			expect(effective.maxSaturation).toBe(100);
			expect(effective.minLightness).toBe(50);
			expect(effective.maxLightness).toBe(70);
		});
	});

	describe('generateStyles with restricted ranges', () => {
		// Helper to parse HSL with decimals: hsl(180.5, 75.3%, 50.2%)
		function parseHslWithDecimals(color) {
			if (!color) return null;
			const match = color.match(/hsl\(([\d.]+),\s*([\d.]+)%?,\s*([\d.]+)%?\)/);
			if (match) {
				return { h: parseFloat(match[1]), s: parseFloat(match[2]), l: parseFloat(match[3]) };
			}
			return parseColorToHsl(color);
		}

		beforeEach(() => {
			Object.keys(customNickColors).forEach(k => delete customNickColors[k]);
			Object.keys(MANUAL_OVERRIDES).forEach(k => delete MANUAL_OVERRIDES[k]);
			Object.assign(colorConfig, JSON.parse(JSON.stringify(DEFAULT_COLOR_CONFIG)));
			Object.assign(styleConfig, JSON.parse(JSON.stringify(DEFAULT_STYLE_CONFIG)));
		});

		it('generates color within saturation range', () => {
			colorConfig.minSaturation = 80;
			colorConfig.maxSaturation = 100;

			const styles = generateStyles('testuser');
			const hsl = parseHslWithDecimals(styles.color);

			expect(hsl).not.toBeNull();
			expect(hsl.s).toBeGreaterThanOrEqual(80);
			expect(hsl.s).toBeLessThanOrEqual(100);
		});

		it('generates color within lightness range', () => {
			colorConfig.minLightness = 50;
			colorConfig.maxLightness = 70;

			const styles = generateStyles('testuser');
			const hsl = parseHslWithDecimals(styles.color);

			expect(hsl).not.toBeNull();
			expect(hsl.l).toBeGreaterThanOrEqual(50);
			expect(hsl.l).toBeLessThanOrEqual(70);
		});

		it('generates color within hue range', () => {
			colorConfig.minHue = 200;
			colorConfig.maxHue = 280;
			colorConfig.contrastThreshold = 0; // Disable inversion for this test

			const styles = generateStyles('testuser');
			const hsl = parseHslWithDecimals(styles.color);

			expect(hsl).not.toBeNull();
			expect(hsl.h).toBeGreaterThanOrEqual(200);
			expect(hsl.h).toBeLessThanOrEqual(280);
		});

		it('generates consistent colors for same username', () => {
			const styles1 = generateStyles('consistentuser');
			const styles2 = generateStyles('consistentuser');

			expect(styles1.color).toBe(styles2.color);
		});

		it('generates different colors for different usernames', () => {
			const styles1 = generateStyles('user_alpha');
			const styles2 = generateStyles('user_beta');

			// Very unlikely to be exactly the same
			expect(styles1.color).not.toBe(styles2.color);
		});
	});
});
