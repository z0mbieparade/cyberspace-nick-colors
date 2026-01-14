# Nick Colors Logic

This document describes the mathematical logic for theme detection, color generation, range mapping, and WCAG-compliant contrast-based inversion.

## Table of Contents

1. [Theme Detection](#1-theme-detection)
2. [Color Generation](#2-color-generation)
3. [Range Mapping](#3-range-mapping)
4. [WCAG Contrast Detection & Inversion](#4-wcag-contrast-detection--inversion)
5. [Inverted Containers](#5-inverted-containers)

---

## 1. Theme Detection

The script detects the site's current theme to determine foreground/background colors for contrast calculation.

### 1.1 Theme Priority

```
1. custom_theme from localStorage (user's custom color settings)
2. data-theme from <body> → lookup in PRESET_THEMES
3. Default: dark theme assumption (fg: #e0e0e0, bg: #0a0a0a)
```

### 1.2 Detection Flow

```javascript
// Step 1: Check localStorage for custom theme
siteTheme = JSON.parse(localStorage.getItem('custom_theme'))

// Step 2: If no custom theme, get preset name from body
if (!siteTheme) {
    themeName = document.body.dataset.theme  // e.g., "Dark", "Matrix", "z0ylent"
    preset = PRESET_THEMES[themeName]
    if (preset) {
        siteTheme = { fg: preset.fg, bg: preset.bg }
    }
}
```

### 1.3 Preset Themes

Each preset theme defines:
- `fg`: Foreground color (hex) - used for HSL extraction and contrast base
- `bg`: Background color (hex) - used for WCAG contrast calculation
- `color`: Nick color generation config (hue/saturation/lightness ranges)

| Theme | Foreground | Background | Hue Range |
|-------|------------|------------|-----------|
| Full Spectrum | #e0e0e0 | #0a0a0a | 0-360 |
| z0ylent | #91ff00 | #060f04 | 60-150 |
| Dark | #efe5c0 | #000000 | 0-360 |
| Light | #000000 | #efe5c0 | 0-360 |
| C64 | #bfbfbf | #2a2ab8 | 180-280 |
| VT320 | #ff9a10 | #170800 | 15-55 |
| Matrix | #a0e044 | #000000 | 70-140 |
| Poetry | #222222 | #fefaf8 | 0-360 |
| Brutalist | #c0d0e8 | #080810 | 180-260 |
| GRiD | #fea813 | #180f06 | 20-60 |
| System | #efe5c0 | #000000 | 0-360 |

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

Priority order for determining background color:
1. Site theme background color (`siteTheme.bg` → hex to RGB)
2. CSS variable `--color-bg` → hex to RGB
3. Default: `rgb(10, 10, 10)` (assumes dark background)

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

### 4.7 Inversion Logic (Normal Context)

When inverted on a **dark background** page:

| Property | Before | After |
|----------|--------|-------|
| `color` | `hsl(h, s%, l%)` | `var(--color-fg, #fff)` |
| `backgroundColor` | (none) | `hsl(h, s%, l%)` |
| `padding` | (none) | `0 0.25em` |

**Rationale:** The username color becomes a background "pill", and the text uses the page's foreground color (typically light on dark themes) for guaranteed readability.

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

```javascript
isInverted = element.closest('.profile-box-inverted') !== null
```

### 5.2 Double-Inversion Handling

If a color was already inverted by contrast detection, and it's in an inverted container, we reverse it:

| Scenario | Action |
|----------|--------|
| Normal color in inverted container | Invert it (bg becomes color) |
| Already inverted in inverted container | Reverse back to normal |

### 5.3 Inversion Logic (Inverted Container)

When in an inverted container (light background):

| Property | Before | After |
|----------|--------|-------|
| `color` | `hsl(h, s%, l%)` | `var(--color-bg, #000)` |
| `backgroundColor` | (none) | `hsl(h, s%, l%)` |
| `padding` | (none) | `0 0.25rem` |

**Note:** Uses `--color-bg` (dark) for text because the container background is already light.

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
