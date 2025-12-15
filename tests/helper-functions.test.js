import { describe, it, expect } from 'vitest';
import './setup.js';

describe('hexToHsl', () => {
	it('converts black correctly', () => {
		const result = hexToHsl('#000000');
		expect(result).toEqual({ h: 0, s: 0, l: 0 });
	});

	it('converts white correctly', () => {
		const result = hexToHsl('#ffffff');
		expect(result).toEqual({ h: 0, s: 0, l: 100 });
	});

	it('converts pure red correctly', () => {
		const result = hexToHsl('#ff0000');
		expect(result).toEqual({ h: 0, s: 100, l: 50 });
	});

	it('converts pure green correctly', () => {
		const result = hexToHsl('#00ff00');
		expect(result).toEqual({ h: 120, s: 100, l: 50 });
	});

	it('converts pure blue correctly', () => {
		const result = hexToHsl('#0000ff');
		expect(result).toEqual({ h: 240, s: 100, l: 50 });
	});

	it('handles hex without # prefix', () => {
		const result = hexToHsl('ff0000');
		expect(result).toEqual({ h: 0, s: 100, l: 50 });
	});

	it('returns null for invalid hex', () => {
		expect(hexToHsl('#gg0000')).toBeNull();
		expect(hexToHsl('invalid')).toBeNull();
		expect(hexToHsl('#fff')).toBeNull(); // 3-char hex not supported
	});
});

describe('toKebabCase', () => {
	it('converts camelCase to kebab-case', () => {
		expect(toKebabCase('backgroundColor')).toBe('background-color');
		expect(toKebabCase('fontWeight')).toBe('font-weight');
		expect(toKebabCase('minSaturation')).toBe('min-saturation');
	});

	it('handles already lowercase strings', () => {
		expect(toKebabCase('color')).toBe('color');
	});

	it('handles multiple capitals', () => {
		expect(toKebabCase('borderTopLeftRadius')).toBe('border-top-left-radius');
	});
});

describe('stylesToCssString', () => {
	it('converts style object to CSS string', () => {
		const styles = { backgroundColor: 'red', fontSize: '12px' };
		const result = stylesToCssString(styles);
		expect(result).toBe('background-color: red; font-size: 12px');
	});

	it('handles custom separator', () => {
		const styles = { color: 'blue', padding: '10px' };
		const result = stylesToCssString(styles, '\n');
		expect(result).toBe('color: blue\npadding: 10px');
	});

	it('handles empty object', () => {
		expect(stylesToCssString({})).toBe('');
	});
});

describe('parseColor', () => {
	it('parses hsl string', () => {
		const result = parseColor('hsl(180, 50%, 60%)');
		expect(result).toEqual({ h: 180, s: 50, l: 60 });
	});

	it('parses hsl without % signs', () => {
		const result = parseColor('hsl(90, 75, 25)');
		expect(result).toEqual({ h: 90, s: 75, l: 25 });
	});

	it('parses hex color', () => {
		const result = parseColor('#ff0000');
		expect(result).toEqual({ h: 0, s: 100, l: 50 });
	});

	it('returns null for empty input', () => {
		expect(parseColor('')).toBeNull();
		expect(parseColor(null)).toBeNull();
		expect(parseColor(undefined)).toBeNull();
	});

	it('parses rgb color', () => {
		const result = parseColor('rgb(255, 0, 0)');
		expect(result).toEqual({ h: 0, s: 100, l: 50 });
	});

	it('returns null for unsupported formats', () => {
		expect(parseColor('red')).toBeNull();
	});
});

describe('mapHueToRange', () => {
	it('returns hue unchanged for full range', () => {
		expect(mapHueToRange(180, 0, 360)).toBe(180);
		expect(mapHueToRange(0, 0, 360)).toBe(0);
		expect(mapHueToRange(360, 0, 360)).toBe(360);
	});

	it('maps proportionally for normal range', () => {
		// 180 is 50% of 360, should map to 50% of 100-200 range = 150
		expect(mapHueToRange(180, 100, 200)).toBe(150);
		// 0 maps to min
		expect(mapHueToRange(0, 100, 200)).toBe(100);
		// 360 maps to max
		expect(mapHueToRange(360, 100, 200)).toBe(200);
	});

	it('handles wrap-around range', () => {
		// Range 300-60 means 300->360->0->60 (total 120 degrees)
		// 0 input should map to 300 (start)
		expect(mapHueToRange(0, 300, 60)).toBe(300);
		// 360 input should map to 60 (end)
		expect(mapHueToRange(360, 300, 60)).toBe(60);
	});
});

describe('mapToRange', () => {
	it('returns value unchanged for full range', () => {
		expect(mapToRange(50, 0, 100)).toBe(50);
	});

	it('maps proportionally', () => {
		// 50 is 50% of 100, should map to 50% of 20-80 range = 50
		expect(mapToRange(50, 20, 80)).toBe(50);
		// 0 maps to min
		expect(mapToRange(0, 20, 80)).toBe(20);
		// 100 maps to max
		expect(mapToRange(100, 20, 80)).toBe(80);
	});
});

describe('hashString', () => {
	it('returns consistent hash for same input', () => {
		const hash1 = hashString('testuser');
		const hash2 = hashString('testuser');
		expect(hash1).toBe(hash2);
	});

	it('normalizes case', () => {
		expect(hashString('TestUser')).toBe(hashString('testuser'));
		expect(hashString('TESTUSER')).toBe(hashString('testuser'));
	});

	it('trims whitespace', () => {
		expect(hashString('  testuser  ')).toBe(hashString('testuser'));
	});

	it('returns different hashes for different inputs', () => {
		const hash1 = hashString('user1');
		const hash2 = hashString('user2');
		expect(hash1).not.toBe(hash2);
	});

	it('returns positive integer', () => {
		const hash = hashString('anyuser');
		expect(hash).toBeGreaterThanOrEqual(0);
		expect(Number.isInteger(hash)).toBe(true);
	});
});

