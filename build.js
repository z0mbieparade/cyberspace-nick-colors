#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { minify } = require('terser');

const SRC_DIR = path.join(__dirname, 'src');
const OUTPUT_FILE = path.join(__dirname, 'cyberspace-nick-colors.user.js');

// Get version from command line or default
const version = process.argv[2] || '1.0.0';
const shouldMinify = !process.argv.includes('--no-minify');

console.log(`Building cyberspace-nick-colors.user.js v${version}${shouldMinify ? ' (minified)' : ''}...`);

// Metadata header (must not be minified for userscript managers)
const metadata = `// ==UserScript==
// @name         Cyberspace Nick Colors
// @author       https://z0m.bi/ (@z0ylent)
// @namespace    https://cyberspace.online/
// @version      ${version}
// @description  Consistent bright colors for usernames across the site
// @match        https://cyberspace.online/*
// @updateURL    https://github.com/z0mbieparade/cyberspace-nick-colors/raw/refs/heads/main/cyberspace-nick-colors.user.js
// @downloadURL  https://github.com/z0mbieparade/cyberspace-nick-colors/raw/refs/heads/main/cyberspace-nick-colors.user.js
// @grant        GM_registerMenuCommand
// @grant        GM.registerMenuCommand
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @connect      gist.githubusercontent.com
// @run-at       document-idle
// ==/UserScript==`;

// Build parts: can be a filename (relative to src/) or a raw string
const codeParts = [
	// IIFE wrapper start
`(function() {
	'use strict';
	const VERSION = '${version}';`,

	// Source files (in order)
	'helper-functions.js',
	'header.js',
	'import-export.js',
	'send-message.js',
	'debug.js',
	'nick-style-functions.js',
	'nick-functions.js',
	'slider-component.js',
	'dialog-component.js',
	'user-settings-panel.js',
	'site-settings-panel.js',
	'init.js',
	// IIFE wrapper end
	`})();`,
];

// Process code parts
const code = codeParts.map(part => {
	// If it's a .js file, read from src/
	if (part.endsWith('.js')) {
		const filePath = path.join(SRC_DIR, part);
		if (!fs.existsSync(filePath)) {
			console.warn(`  Warning: ${part} not found, skipping`);
			return '';
		}
		console.log(`  + ${part}`);
		return fs.readFileSync(filePath, 'utf8');
	}
	// Otherwise it's a raw string
	return part;
}).filter(Boolean).join('\n\n');

async function build() {
	let finalCode = code;
	const originalSize = code.length;

	if (shouldMinify) {
		try {
			const result = await minify(finalCode, {
				compress: {
					drop_console: false,
					passes: 2,
				},
				mangle: {
					reserved: ['GM_setValue', 'GM_getValue', 'GM_registerMenuCommand', 'GM_xmlhttpRequest']
				},
				format: {
					comments: false,
				}
			});
			finalCode = result.code;
			console.log(`  Minified: ${(originalSize / 1024).toFixed(1)} KB → ${(finalCode.length / 1024).toFixed(1)} KB`);
		} catch (err) {
			console.error('Minification failed:', err.message);
		}
	}

	// Combine metadata + code
	const output = `${metadata}\n\n${finalCode}`;

	// Write output file
	fs.writeFileSync(OUTPUT_FILE, output);

	console.log(`\nBuilt successfully: ${OUTPUT_FILE}`);
	console.log(`Version: ${version}`);
	console.log(`Total size: ${(output.length / 1024).toFixed(1)} KB`);
}

build();
