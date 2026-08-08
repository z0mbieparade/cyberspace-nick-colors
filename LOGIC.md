# Nick Colors Logic

This document describes the mathematical logic for theme detection, color generation, range mapping, and WCAG-compliant contrast-based inversion.

## Table of Contents

1. [Theme Detection](#1-theme-detection)
2. [Color Generation](#2-color-generation)
3. [Range Mapping](#3-range-mapping)
4. [WCAG Contrast Detection & Inversion](#4-wcag-contrast-detection--inversion)
5. [Inverted Containers](#5-inverted-containers)
6. [Test Verification](#6-test-verification)
7. [Configuration Reference](#7-configuration-reference)

---

## 1. Theme Detection

The script detects the site's current theme to determine foreground/background colors for contrast calculation.

### 1.1 Theme Name

The theme name comes from `<html data-theme="...">` (falling back to `<body>`), e.g. `"Dark"`, `"Matrix"`, `"z0ylent"`. It is read into `siteThemeName` at load, and a `MutationObserver` on that attribute re-reads it and refreshes all colors when the user switches themes.

The name is only used to look up a preset in `PRESET_THEMES` — it is not itself a source of colors.

### 1.2 Color Resolution

`getThemeColors()` resolves each color key (`bg`, `fg`, `fgDim`, `border`, `codeBg`) independently, through a 4-step fallback chain. The first source that yields a *valid* color wins — a value that is empty, `transparent`, or `none` is skipped, so a partially-defined theme still resolves.

```
1. CSS variable on :root  (--color-bg, --color-fg, --color-fg-dim, --color-border, --color-code-bg)
2. custom_theme from localStorage  (siteCustomTheme — user's custom color settings)
3. PRESET_THEMES[themeName].colors
4. PRESET_THEMES['Full Spectrum'].colors  (fg: #e0e0e0, bg: #0a0a0a)
```

Because the chain is per-key, the live CSS variables take priority over the preset table. The preset colors are a fallback for when the site has not set (or has set to `transparent`) the variable.

Two derived keys are also resolved:

- `invertedBg` / `invertedFg` — colors for [inverted containers](#5-inverted-containers). By default these are the swap of the normal pair (`invertedBg` = `fg`, `invertedFg` = `bg`), but a preset's optional `logic` block can remap them to any other color key. Only `Poetry` does this today (`invertedContainerBg: 'codeBg'`), because a plain fg/bg swap on a light theme reads as too harsh.

The script then mirrors all resolved colors onto its own `--nc-*` variables via `initCssVariables()`, so the dialog UI can style itself without depending on the site's variables existing.

### 1.3 Semantic Colors

`getThemeColors()` also derives `error` / `warn` / `success` / `info` (hues 0 / 45 / 120 / 210) and their `*Bg` variants from the resolved `fg` and `bg`, then runs each pair through `adjustContrastToThreshold()` so alerts stay readable on any theme. These are used only by the script's own dialogs, never for nick colors.

### 1.4 Preset Themes

Each entry in `PRESET_THEMES` defines:
- `colors`: `{ fg, bg, fgDim, border, codeBg }` — fallbacks for the resolution chain above
- `settings`: nick color generation config, merged over `DEFAULT_SITE_CONFIG` (hue/saturation/lightness ranges, contrast threshold)
- `logic` *(optional)*: `{ invertedContainerBg, invertedContainerFg }` — remaps which color keys inverted containers use

| Theme | Foreground | Background | Hue Range | Saturation | Lightness |
|-------|------------|------------|-----------|------------|-----------|
| Full Spectrum | `#e0e0e0` | `#0a0a0a` | 0-360 | 70-100 | 55-75 |
| z0ylent | `#91ff00` | `#060f04` | 60-150 | 80-100 | 45-65 |
| Dark | `#efe5c0` | `#000000` | 0-70 | 12-60 | 65-80 |
| Light | `#000000` | `#efe5c0` | 344-44 | 12-60 | 30-45 |
| C64 | `hsla(0,0%,100%,.75)` | `#2a2ab8` | 180-280 | 70-90 | 60-75 |
| VT320 | `#ff9a10` | `#170800` | 15-55 | 90-100 | 50-65 |
| Matrix | `rgba(160,224,68,.9)` | `#000000` | 70-140 | 75-95 | 45-60 |
| Poetry | `#222222` | `#fefaf8` | 339-46 | 0-35 | 30-45 |
| Brutalist | `#c0d0e8` | `#080810` | 180-260 | 50-70 | 60-75 |
| GRiD | `#fea813` | `#180f06` | 20-60 | 90-100 | 50-65 |
| System | `#efe5c0` | `#000000` | 0-360 | 60-80 | 65-80 |

`Light` (344-44) and `Poetry` (339-46) use [wrap-around hue ranges](#33-hue-mapping-wrap-around-range). All presets use a contrast threshold of 4.5.

---

## 2. Color Generation

### 2.1 Hash-Based Base Color

Each username generates a deterministic "base color" using hash functions:

```
hash(username)       → h ∈ [0, 359]    (hue)
hash(username_sat)   → s ∈ [0, 100]    (saturation)
hash(username_lit)   → l ∈ [0, 100]    (lightness)
```

The hash function:
```javascript
hash(str) = |Σ(charCode[i] + ((hash << 5) - hash))| mod range
```

**Properties:**
- Deterministic: same username always produces same color
- Case-insensitive: "User" and "user" produce identical colors
- Uniformly distributed across full HSL space

### 2.2 Custom & Override Colors

Priority order (highest to lowest):
1. User-saved custom color (`customNickColors[username].color`)
2. Remote/manual override (`MANUAL_OVERRIDES[username].color`)
3. Hash-generated color

---

## 3. Range Mapping

Base colors use the full HSL range. Range mapping constrains colors to configured bounds.

### 3.1 Linear Mapping Formula

For saturation and lightness (0-100 scale):

```
mapped = min + (value / 100) × (max - min)
```

**Examples:**

| Input | Range | Calculation | Output |
|-------|-------|-------------|--------|
| 50 | [70, 100] | 70 + (50/100) × 30 | 85 |
| 0 | [30, 80] | 30 + (0/100) × 50 | 30 |
| 100 | [30, 80] | 30 + (100/100) × 50 | 80 |
| 25 | [60, 90] | 60 + (25/100) × 30 | 67.5 |

**Verification equation:**
```
(mapped - min) / (max - min) = value / 100
```

### 3.2 Hue Mapping (Normal Range)

When `minHue ≤ maxHue`:

```
mapped = minHue + (hue / 360) × (maxHue - minHue)
```

**Examples:**

| Input | Range | Calculation | Output |
|-------|-------|-------------|--------|
| 180 | [100, 200] | 100 + (180/360) × 100 | 150 |
| 0 | [200, 280] | 200 + (0/360) × 80 | 200 |
| 360 | [200, 280] | 200 + (360/360) × 80 | 280 |

### 3.3 Hue Mapping (Wrap-Around Range)

When `minHue > maxHue` (e.g., 300-60 means red-to-orange wrapping through 0):

```
totalRange = (360 - minHue) + maxHue
mapped = minHue + (hue / 360) × totalRange
if mapped ≥ 360: mapped = mapped - 360
```

**Example: Range [300, 60]**

Total range = (360 - 300) + 60 = 120°

| Input | Calculation | Raw | Wrapped |
|-------|-------------|-----|---------|
| 0 | 300 + (0/360) × 120 | 300 | 300 |
| 180 | 300 + (0.5) × 120 | 360 | 0 |
| 360 | 300 + (1.0) × 120 | 420 | 60 |

---

## 4. WCAG Contrast Detection & Inversion

This implementation uses the WCAG 2.1 contrast ratio calculation for accessibility-compliant color contrast detection.

### 4.1 Color Conversion (HSL → RGB)

Before calculating contrast, colors must be converted from HSL to RGB:

```javascript
// HSL to RGB conversion
if (saturation === 0) {
    r = g = b = lightness
} else {
    q = lightness < 0.5
        ? lightness × (1 + saturation)
        : lightness + saturation - lightness × saturation
    p = 2 × lightness - q
    r = hue2rgb(p, q, hue + 1/3)
    g = hue2rgb(p, q, hue)
    b = hue2rgb(p, q, hue - 1/3)
}
```

### 4.2 Relative Luminance

Per WCAG 2.1 specification, relative luminance is calculated as:

```
L = 0.2126 × R + 0.7152 × G + 0.0722 × B
```

Where R, G, B are linearized from sRGB:

```
if (sRGB ≤ 0.03928):
    linear = sRGB / 12.92
else:
    linear = ((sRGB + 0.055) / 1.055)^2.4
```

**Range:** 0 (black) to 1 (white)

**Note:** The green coefficient (0.7152) is largest because the human eye is most sensitive to green light.

### 4.3 Contrast Ratio Calculation

The WCAG contrast ratio between two colors:

```
contrastRatio = (L₁ + 0.05) / (L₂ + 0.05)
```

Where L₁ is the lighter luminance and L₂ is the darker luminance.

**Range:** 1:1 (no contrast) to 21:1 (maximum contrast: black on white)

### 4.4 WCAG Threshold Levels

| Threshold | WCAG Level | Use Case |
|-----------|------------|----------|
| 3.0 | AA (large text) | Text ≥ 18pt or ≥ 14pt bold |
| 4.5 | AA (normal text) | Standard body text (default) |
| 7.0 | AAA | Enhanced accessibility |

### 4.5 Background Detection

The background a nick is measured against, in priority order:

1. The nick's own `backgroundColor`, if an override or custom style set one
2. `invertedBg` from the resolved theme colors, if the element is in an [inverted container](#5-inverted-containers)
3. `bg` from the resolved theme colors

Steps 2 and 3 come from `getThemeColors()`, so they carry its full [4-step fallback chain](#12-color-resolution) — CSS variable, then `custom_theme`, then preset, then the `Full Spectrum` default of `#0a0a0a`.

### 4.6 Inversion Decision

```
if userInvertSetting === true:
    shouldInvert = true
else if userInvertSetting === false:
    shouldInvert = false
else:  // auto mode
    contrastRatio = getContrastRatio(colorRgb, backgroundRgb)
    if contrastThreshold > 0 AND contrastRatio < contrastThreshold:
        shouldInvert = true
    else:
        shouldInvert = false
```

### 4.7 Applying the Decision

**When inverting**, the nick color becomes a background "pill" and the text takes a contrasting color:

| Property | Before | After |
|----------|--------|-------|
| `color` | `hsl(h, s%, l%)` | contrasting color (see below) |
| `backgroundColor` | (none) | `hsl(h, s%, l%)` |
| `padding` | (none) | `0 0.25em` |

The text color is the nick's own `backgroundColor` if one was set; otherwise `pickBestContrastingColor()` picks whichever of the theme's `invertedFg` / `invertedBg` scores a higher contrast ratio against the nick color.

**When not inverting**, only `color` is set — no pill, no padding.

In both cases, unless monochrome mode is on, the resulting pair is then run through `adjustContrastToThreshold()`, which walks lightness in ±5 steps (max 20 iterations) until the pair clears the threshold. So the final color is rarely the raw mapped color — inversion is the coarse fix, lightness adjustment is the fine one.

Monochrome mode (`useSingleColor`) skips the adjustment entirely: the user picked an exact color and gets it verbatim.

### 4.8 Contrast Examples

Assuming dark background (luminance ≈ 0.003):

| Color | Luminance | Ratio | Threshold=4.5 |
|-------|-----------|-------|---------------|
| White (#fff) | 1.000 | 21.0 | No invert |
| Light gray (#bbb) | 0.459 | 9.4 | No invert |
| Medium gray (#888) | 0.246 | 5.0 | No invert |
| Dark gray (#666) | 0.133 | 2.8 | Invert |
| Very dark (#333) | 0.031 | 1.2 | Invert |

---

## 5. Inverted Containers

Some page sections (e.g., `.profile-box-inverted`) already have inverted colors (light background instead of dark).

### 5.1 Detection

Matched against the `INVERTED_CONTAINERS` list:

```javascript
isInverted = INVERTED_CONTAINERS.some(sel => element.closest(sel))
```

Callers may also pass `isInverted` explicitly — `colorizeMentions()` does this, computing it from the text node's parent before the mention span exists in the DOM.

### 5.2 Effect

There is no separate inversion path for these containers. `isInverted` simply swaps which theme colors the [contrast math](#4-wcag-contrast-detection--inversion) measures against:

| | Background compared against | Text color candidates |
|---|---|---|
| Normal | `bg` | `fg` / `bg` |
| Inverted container | `invertedBg` | `invertedFg` / `invertedBg` |

Everything downstream — the threshold check, the pill inversion, the lightness adjustment — is identical. A nick that needs no inversion on the page background may well need one inside an inverted container, and it falls out of the math rather than a special case.

### 5.3 Per-Theme Remapping

By default `invertedBg` is the theme's `fg` and `invertedFg` is its `bg` — a straight swap. A preset's optional `logic` block overrides this. `Poetry` sets `invertedContainerBg: 'codeBg'` and `invertedContainerFg: 'fg'`, so its inverted containers use the soft `#f0e0dd` code background rather than flipping to near-black.

---

## 6. Test Verification

### 6.1 Range Mapping Tests

```javascript
// Saturation: 50 in range [70, 100]
expect(mapToRange(50, 70, 100)).toBe(85)
// 70 + (50/100) × 30 = 70 + 15 = 85 ✓

// Hue: 180 in range [100, 200]
expect(mapHueToRange(180, 100, 200)).toBe(150)
// 100 + (180/360) × 100 = 100 + 50 = 150 ✓

// Wrap-around hue: 0 in range [300, 60]
expect(mapHueToRange(0, 300, 60)).toBe(300)
// Start of range = 300 ✓

// Wrap-around hue: 360 in range [300, 60]
expect(mapHueToRange(360, 300, 60)).toBe(60)
// End of range = 60 ✓
```

### 6.2 WCAG Contrast Tests

```javascript
// Black on white = maximum contrast (21:1)
const black = { r: 0, g: 0, b: 0 }
const white = { r: 255, g: 255, b: 255 }
expect(getContrastRatio(black, white)).toBeCloseTo(21, 0)

// Same colors = no contrast (1:1)
const gray = { r: 128, g: 128, b: 128 }
expect(getContrastRatio(gray, gray)).toBe(1)

// Relative luminance of pure colors
expect(getRelativeLuminance({r: 255, g: 0, b: 0})).toBeCloseTo(0.2126, 2) // Red
expect(getRelativeLuminance({r: 0, g: 255, b: 0})).toBeCloseTo(0.7152, 2) // Green
expect(getRelativeLuminance({r: 0, g: 0, b: 255})).toBeCloseTo(0.0722, 2) // Blue
```

### 6.3 Contrast Inversion Tests

```javascript
// Force low contrast (dark color on dark bg)
siteConfig.minLightness = 5
siteConfig.maxLightness = 15
siteConfig.contrastThreshold = 4.5

// Low lightness on dark bg = poor contrast ratio, should invert
expect(styles.backgroundColor).toBeDefined()

// Force high contrast (light color on dark bg)
siteConfig.minLightness = 70
siteConfig.maxLightness = 90

// High lightness on dark bg = good contrast ratio, should NOT invert
expect(styles.backgroundColor).toBeUndefined()
```

---

## 7. Configuration Reference

### Color Config Defaults

| Property | Default | Range | Description |
|----------|---------|-------|-------------|
| `minHue` | 0 | 0-360 | Minimum hue |
| `maxHue` | 360 | 0-360 | Maximum hue |
| `minSaturation` | 70 | 0-100 | Minimum saturation % |
| `maxSaturation` | 100 | 0-100 | Maximum saturation % |
| `minLightness` | 55 | 0-100 | Minimum lightness % |
| `maxLightness` | 75 | 0-100 | Maximum lightness % |
| `contrastThreshold` | 4.5 | 0-21 | WCAG contrast ratio threshold (0=disabled) |

### Site Theme Config Defaults

| Property | Default | Description |
|----------|---------|-------------|
| `useHueRange` | false | Match hue to site theme |
| `hueSpread` | 30 | ± degrees from theme hue |
| `useSaturation` | false | Match saturation to site theme |
| `saturationSpread` | 15 | ± percentage from theme saturation |
| `useLightness` | false | Match lightness to site theme |
| `lightnessSpread` | 10 | ± percentage from theme lightness |
