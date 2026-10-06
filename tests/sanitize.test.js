/**
 * Sanitizing tests: what a settings file, stored settings or overrides.json
 * may put on a name, and the HTML escaping the dialogs rely on.
 */

import { describe, it, expect } from 'vitest';
import './setup.js';

describe('escapeHtml', () => {
	it('escapes markup and both quotes', () => {
		expect(escapeHtml(`<img src=x onerror="a('b')">&`)).toBe('&lt;img src=x onerror=&quot;a(&#39;b&#39;)&quot;&gt;&amp;');
	});
});

describe('sanitizeSiteConfig', () => {
	it('drops wrong types, non-finite numbers and __proto__', () => {
		const clean = sanitizeSiteConfig(JSON.parse('{"__proto__": {"polluted": true}, "minHue": "10", "maxHue": null, "hueSpread": 1e999}'));
		expect(clean).toEqual({});
		expect({}.polluted).toBeUndefined();
	});

	it('clamps numbers into range', () => {
		expect(sanitizeSiteConfig({ minHue: -5, maxHue: 999 })).toEqual({ minHue: 0, maxHue: 360 });
	});
});

describe('sanitizeNickStyle', () => {
	it('expands the short color form', () => {
		expect(sanitizeNickStyle('#0f0', 'imported')).toEqual({ color: '#0f0' });
	});

	it('imported: keeps only the look of a name', () => {
		expect(sanitizeNickStyle({ color: 'red', zIndex: 9, width: '100vw', data: { x: 1 } }, 'imported')).toEqual({ color: 'red' });
	});

	it('typed: blocks layout and layering but keeps other CSS', () => {
		expect(sanitizeNickStyle({ color: 'red', width: '2em', position: 'fixed', transform: 'scale(9)' }, 'typed'))
			.toEqual({ color: 'red', width: '2em' });
	});

	it.each(['WebkitTransform', '-webkit-transform', 'z-index', 'offsetPath', 'Webkit-transform', 'Z-Index', 'insetInlineStart', 'MozBinding', 'msFilter'])(
		'typed: blocks %s however it is spelled', (key) => {
			expect(sanitizeNickStyle({ [key]: 'x' }, 'typed')).toBeNull();
		});

	it('typed: keeps long values and notes, which imports cap', () => {
		const long = { userNotes: 'n'.repeat(3000), textShadow: '1px 1px red, '.repeat(30) + '0 0 red' };
		expect(sanitizeNickStyle(long, 'typed')).toEqual(long);
		expect(sanitizeNickStyle(long, 'imported')).toBeNull();
	});

	it.each(['url(x)', 'image-set("x" 1x)', 'expression(alert(1))', 'javascript:x', 'red;top:0', 'red}', '\\75rl(x)', '1px\nmargin-left: -9999px'])(
		'drops the value %s', (value) => {
			expect(sanitizeNickStyle({ backgroundColor: value }, 'typed')).toBeNull();
		});

	it('keeps a tab, which is only whitespace in CSS', () => {
		expect(sanitizeNickStyle({ border: '1px\tsolid red' }, 'typed')).toEqual({ border: '1px\tsolid red' });
	});

	it('keeps any characters in icons and notes, within their length', () => {
		expect(sanitizeNickStyle({ prependIcon: '<3', userNotes: 'a;b{c}' }, 'imported')).toEqual({ prependIcon: '<3', userNotes: 'a;b{c}' });
		expect(sanitizeNickStyle({ prependIcon: 'x'.repeat(51) }, 'imported')).toBeNull();
	});
});

describe('sanitizeNickStyles', () => {
	it('drops invalid usernames and users left with nothing', () => {
		expect(sanitizeNickStyles({ 'two words': { color: 'red' }, bob: { position: 'fixed' }, eve: '#00f' }, 'imported'))
			.toEqual({ eve: { color: '#00f' } });
	});
});

describe('createInputRow', () => {
	it('escapes the value and default label', () => {
		const html = createInputRow({ id: 'x', type: 'text', value: '"><img src=x>' })
			+ createInputRow({ id: 'y', type: 'textarea', value: '</textarea><img src=x>' })
			+ createInputRow({ id: 'z', type: 'tristate', label: 'L', defaultLabel: '<img src=x>' });
		const div = document.createElement('div');
		div.innerHTML = html;
		expect(div.querySelector('img')).toBeNull();
		expect(div.querySelector('#x').value).toBe('"><img src=x>');
	});
});
