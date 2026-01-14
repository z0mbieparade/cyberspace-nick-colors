# Cyberspace Nick Colors

A userscript that adds consistent, hash-based colors to usernames on [Cyberspace](https://cyberspace.online). Created because I can't handle users all being the same color in a chatroom, it gives me a headache.

## Installation

1. Install [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/)
2. Click here and Greasemonkey or Tampermonkey should give you the option to install the script: [Install](https://github.com/z0mbieparade/cyberspace-nick-colors/raw/refs/heads/main/cyberspace-nick-colors.user.js)
3. Return to cyberspace.online and refresh.

## Usage

- **Right-click any colored username** (or long-press on mobile) to customize its color
  - Set custom text color via sliders or hex/hsl value
  - Set custom icon (prepended character/emoji)
  - Override style variations (bold, italic, small-caps) with tri-state toggles (auto/on/off)
  - Add additional CSS (background, text-decoration, etc.)
  - Open global settings from the per-user dialog
- **Greasemonkey menu** has options for:
  - Nick Colors Settings (global color/style settings)
  - Refresh Nick Colors
  - Clear All Custom Colors

## Features

- **Hash-based coloring** - Each username gets a consistent color based on its hash
- **@mention detection** - Colors @username mentions in text (excludes email addresses)
- **Hue range selection** - Limit colors to a specific hue range with wrap-around support
- **Saturation/Lightness ranges** - Add variation to saturation and lightness
- **Contrast threshold** - Automatically invert colors when contrast is too low
- **Preset themes** - Quick presets matching cyberspace.online site themes (Dark, Light, C64, VT320, Matrix, etc.)
- **Site theme integration** - Optionally match your custom site theme's hue, saturation, or lightness
- **Style variations** - Optionally vary font-weight, italic, and small-caps based on username hash
- **Username icons** - Optionally prepend and/or append a hash-based icon from a customizable set to each username
- **Per-user overrides** - Right-click any username to set custom color, icon, font family, and style variations
- **Import/Export** - Backup and restore your settings via file or clipboard

## Nick Style Override

The script links to [overrides.json](/overrides.json), and loads any colors saved there. If you'd like a style applied site-wide for other users running the script to see, message me on [Cyberspace](https://cyberspace.online/z0ylent) and I'll update it.

## Site Theme Integration

The script can read your custom theme settings and optionally match its hue range, saturation, or lightness.

## Development

```bash
npm install
node build.js [version] [--no-minify]
```

The source files are in `src/` and the build script concatenates and minifies them into the final userscript.

## Contributing

This repo is mirrored on GitHub, the source repo is [on my personal Gitea](https://git.z0m.bi).

## License

GNU GENERAL PUBLIC LICENSE

## Contact

- Email: hey@z0m.bi
- Cyberspace: [@z0ylent](https://cyberspace.online/z0ylent)
