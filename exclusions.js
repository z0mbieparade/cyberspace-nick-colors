/**
 * Reads src/exclusions.json and generates the two things that need to stay in sync:
 * the userscript @exclude metadata lines, and the HOST_EXCLUDE/PATH_EXCLUDE constants
 * injected into the bundle. Shared by build.js and tests/setup.js.
 */

const fs = require('fs');
const path = require('path');

const EXCLUSIONS_FILE = path.join(__dirname, 'src', 'exclusions.json');

const exclusions = JSON.parse(fs.readFileSync(EXCLUSIONS_FILE, 'utf8'));

const HOST_EXCLUDE = Object.keys(exclusions.hosts || {});
const PATH_EXCLUDE = Object.keys(exclusions.paths || {});

// @exclude lines for the userscript header - one for the host, one for its subdomains
function buildExcludeMetadata() {
	return HOST_EXCLUDE
		.flatMap(host => [`https://${host}/*`, `https://*.${host}/*`])
		.map(pattern => `// @exclude      ${pattern}`)
		.join('\n');
}

// Constant declarations injected into the bundle, with the notes kept as comments
function buildExclusionsCode() {
	const declare = (name, entries) => {
		const lines = Object.entries(entries || {})
			.map(([pattern, note]) => `\t'${pattern}', // ${note}`)
			.join('\n');
		return `const ${name} = [\n${lines}\n];`;
	};

	return [
		'// Generated from src/exclusions.json at build time - edit that file, not this block',
		declare('HOST_EXCLUDE', exclusions.hosts),
		declare('PATH_EXCLUDE', exclusions.paths),
	].join('\n');
}

module.exports = { HOST_EXCLUDE, PATH_EXCLUDE, buildExcludeMetadata, buildExclusionsCode };
