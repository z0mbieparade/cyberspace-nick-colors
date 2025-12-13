import { describe, it, expect, beforeEach } from 'vitest';
import './setup.js';

describe('isValidUsername', () => {
	it('accepts valid usernames', () => {
		expect(isValidUsername('testuser')).toBe(true);
		expect(isValidUsername('User123')).toBe(true);
		expect(isValidUsername('user_name')).toBe(true);
		expect(isValidUsername('user-name')).toBe(true);
		expect(isValidUsername('a')).toBe(true);
	});

	it('rejects reserved words', () => {
		expect(isValidUsername('Loading')).toBe(false);
		expect(isValidUsername('loading')).toBe(false);
		expect(isValidUsername('LOADING')).toBe(false);
	});

	it('rejects usernames with spaces', () => {
		expect(isValidUsername('user name')).toBe(false);
		expect(isValidUsername('test user')).toBe(false);
	});

	it('rejects empty strings', () => {
		expect(isValidUsername('')).toBe(false);
		expect(isValidUsername(null)).toBe(false);
		expect(isValidUsername(undefined)).toBe(false);
	});
});

describe('getBaseColor', () => {
	beforeEach(() => {
		// Clear custom colors
		Object.keys(customNickColors).forEach(k => delete customNickColors[k]);
		Object.keys(MANUAL_OVERRIDES).forEach(k => delete MANUAL_OVERRIDES[k]);
	});

	it('returns consistent color for same username', () => {
		const color1 = getBaseColor('testuser');
		const color2 = getBaseColor('testuser');
		expect(color1).toEqual(color2);
	});

	it('returns HSL object with valid ranges', () => {
		const color = getBaseColor('anyuser');
		expect(color.h).toBeGreaterThanOrEqual(0);
		expect(color.h).toBeLessThan(360);
		expect(color.s).toBeGreaterThanOrEqual(0);
		expect(color.s).toBeLessThanOrEqual(100);
		expect(color.l).toBeGreaterThanOrEqual(0);
		expect(color.l).toBeLessThanOrEqual(100);
	});

	it('uses custom color when set', () => {
		customNickColors['testuser'] = { color: 'hsl(180, 50%, 50%)' };
		const color = getBaseColor('testuser');
		expect(color).toEqual({ h: 180, s: 50, l: 50 });
	});

	it('uses manual override when no custom color', () => {
		MANUAL_OVERRIDES['testuser'] = { color: 'hsl(90, 75%, 60%)' };
		const color = getBaseColor('testuser');
		expect(color).toEqual({ h: 90, s: 75, l: 60 });
	});

	it('prioritizes custom color over manual override', () => {
		customNickColors['testuser'] = { color: 'hsl(180, 50%, 50%)' };
		MANUAL_OVERRIDES['testuser'] = { color: 'hsl(90, 75%, 60%)' };
		const color = getBaseColor('testuser');
		expect(color).toEqual({ h: 180, s: 50, l: 50 });
	});
});

describe('applyRangeMapping', () => {
	it('maps color to configured ranges', () => {
		const base = { h: 180, s: 50, l: 50 };
		const config = {
			minHue: 0, maxHue: 360,
			minSaturation: 60, maxSaturation: 100,
			minLightness: 40, maxLightness: 80
		};
		const result = applyRangeMapping(base, config);

		// h unchanged (full range)
		expect(result.h).toBe(180);
		// s: 50% of 0-100 maps to 50% of 60-100 = 80
		expect(result.s).toBe(80);
		// l: 50% of 0-100 maps to 50% of 40-80 = 60
		expect(result.l).toBe(60);
	});
});

describe('generateStyles', () => {
	beforeEach(() => {
		Object.keys(customNickColors).forEach(k => delete customNickColors[k]);
		Object.keys(MANUAL_OVERRIDES).forEach(k => delete MANUAL_OVERRIDES[k]);
		Object.assign(colorConfig, DEFAULT_COLOR_CONFIG);
		Object.assign(styleConfig, DEFAULT_STYLE_CONFIG);
	});

	it('returns object with color property', () => {
		const styles = generateStyles('testuser');
		expect(styles.color).toBeDefined();
		expect(styles.color).toMatch(/^hsl\(/);
	});

	it('applies custom background color', () => {
		customNickColors['testuser'] = {
			color: 'hsl(180, 50%, 50%)',
			backgroundColor: 'hsl(0, 0%, 20%)'
		};
		const styles = generateStyles('testuser');
		expect(styles.backgroundColor).toBe('hsl(0, 0%, 20%)');
	});

	it('applies font variations when enabled', () => {
		styleConfig.varyWeight = true;
		styleConfig.varyItalic = true;
		styleConfig.varyCase = true;

		const styles = generateStyles('testuser');
		expect(['normal', 'bold']).toContain(styles.fontWeight);
		expect(['normal', 'italic']).toContain(styles.fontStyle);
		expect(['normal', 'small-caps']).toContain(styles.fontVariant);
	});
});

describe('getHashBasedIcon', () => {
	it('returns null when icons disabled', () => {
		const config = { prependIcon: false, appendIcon: false, iconSet: '★ ♦ ♠' };
		const icon = getHashBasedIcon('testuser', config);
		expect(icon).toBeNull();
	});

	it('returns null when iconSet empty', () => {
		const config = { prependIcon: true, appendIcon: false, iconSet: '' };
		const icon = getHashBasedIcon('testuser', config);
		expect(icon).toBeNull();
	});

	it('returns consistent icon for same username', () => {
		const config = { prependIcon: true, appendIcon: false, iconSet: '★ ♦ ♠ ♣' };
		const icon1 = getHashBasedIcon('testuser', config);
		const icon2 = getHashBasedIcon('testuser', config);
		expect(icon1).toBe(icon2);
	});

	it('returns icon from iconSet', () => {
		const config = { prependIcon: true, appendIcon: false, iconSet: '★ ♦ ♠' };
		const icon = getHashBasedIcon('testuser', config);
		expect(['★', '♦', '♠']).toContain(icon);
	});
});

describe('DOM manipulation', () => {
	beforeEach(() => {
		document.body.innerHTML = '<div id="chat"></div>';
		Object.keys(customNickColors).forEach(k => delete customNickColors[k]);
		Object.assign(colorConfig, DEFAULT_COLOR_CONFIG);
	});

	describe('applyStyles', () => {
		it('applies color to element', () => {
			const el = document.createElement('span');
			el.textContent = 'testuser';
			applyStyles(el, 'testuser');

			expect(el.style.color).toBeTruthy();
			expect(el.dataset.nickColored).toBe('true');
			expect(el.dataset.username).toBe('testuser');
		});

		it('applies prepend icon when enabled', () => {
			styleConfig.prependIcon = true;
			styleConfig.iconSet = '★';

			const el = document.createElement('span');
			el.textContent = 'testuser';
			applyStyles(el, 'testuser');

			expect(el.textContent).toContain('★');
			expect(el.dataset.iconApplied).toBe('true');
		});
	});

	describe('colorizeAll', () => {
		it('colorizes nick elements in containers', () => {
			// colorizeAll uses CONTAINER_HINTS which includes .chat-main-content
			document.body.innerHTML = `
				<div class="chat-main-content">
					<a href="/user1">user1</a>
					<a href="/user2">user2</a>
				</div>
			`;

			colorizeAll();

			const nicks = document.querySelectorAll('a[href^="/"]');
			nicks.forEach(nick => {
				expect(nick.style.color).toBeTruthy();
				expect(nick.dataset.nickColored).toBe('true');
			});
		});

		it('skips already colored elements', () => {
			document.body.innerHTML = `
				<div class="chat-main-content">
					<a href="/user1" data-nick-colored="true">user1</a>
				</div>
			`;

			const nick = document.querySelector('a');
			nick.style.color = 'red';

			colorizeAll();

			// Should keep the original color
			expect(nick.style.color).toBe('red');
		});

		it('skips links outside container hints', () => {
			document.body.innerHTML = `
				<div class="other-container">
					<a href="/user1">user1</a>
				</div>
			`;

			colorizeAll();

			const nick = document.querySelector('a');
			expect(nick.dataset.nickColored).toBeUndefined();
		});
	});

	describe('colorizeMentions', () => {
		beforeEach(() => {
			// Reset style config to avoid icon pollution from other tests
			Object.assign(styleConfig, DEFAULT_STYLE_CONFIG);
		});

		it('wraps @mentions in styled spans', () => {
			document.body.innerHTML = `
				<div id="chat">
					<p>Hello @testuser how are you?</p>
				</div>
			`;

			colorizeMentions();

			const mention = document.querySelector('[data-mention-colored]');
			expect(mention).toBeTruthy();
			expect(mention.textContent).toContain('@testuser');
			expect(mention.style.color).toBeTruthy();
		});

		it('skips email addresses', () => {
			document.body.innerHTML = `
				<div id="chat">
					<p>Email me at test@example.com</p>
				</div>
			`;

			colorizeMentions();

			const mention = document.querySelector('[data-mention-colored]');
			expect(mention).toBeNull();
		});

		it('skips invalid usernames like Loading', () => {
			document.body.innerHTML = `
				<div id="chat">
					<p>Please wait @Loading...</p>
				</div>
			`;

			colorizeMentions();

			const mention = document.querySelector('[data-mention-colored]');
			expect(mention).toBeNull();
		});
	});
});
