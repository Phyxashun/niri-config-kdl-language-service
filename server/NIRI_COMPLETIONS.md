# Niri Configuration Completions

This document describes the intelligent code completions provided by the KDL Language Service for Niri configuration files.

**Based on**: [Niri Wiki - Configuration](https://github.com/YaLTeR/niri/wiki/Configuration:-Introduction) and [default-config.kdl](https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl)

## Context-Aware Completions

The language server provides different completions based on where your cursor is:

### 1. Top-Level Nodes

When at the start of a line or after `{`, suggests configuration blocks:

```kdl
| ← Press Ctrl+Space here
```

**Completions**:

- `input` - Input device configuration
- `output` - Display output configuration  
- `binds` - Key bindings
- `layout` - Window layout settings
- `animations` - Animation configuration
- `window-rule` - Window-specific rules
- And more...

### 2. In `binds {}` Block

When in a binds block, suggests key combinations:

```kdl
binds {
    | ← Suggests modifiers and keys
}
```

**Key Modifiers**: `Mod+`, `Super+`, `Alt+`, `Ctrl+`, `Shift+`

**Special Keys**:

- Navigation: `Left`, `Right`, `Up`, `Down`, `Home`, `End`, `Page_Up`, `Page_Down`
- Function: `F1`-`F12`
- Media: `XF86AudioRaiseVolume`, `XF86AudioPlay`, etc.
- Numbers: `1`-`9`, `0`
- Letters: `H`, `J`, `K`, `L` (vim-style), and more
- Punctuation: `Minus`, `Equal`, `BracketLeft`, `BracketRight`, `Comma`, `Period`
- Special: `Escape`, `Return`, `Space`, `Tab`, `Print`

### 3. Properties by Context

The language server suggests relevant properties based on your current block:

#### In `output {}` Block

```kdl
output "eDP-1" {
    | ← Suggests: mode, scale, transform, position, x, y
}
```

#### In `layout {}` Block

```kdl
layout {
    | ← Suggests: gaps, center-focused-column, proportion, fixed
}
```

#### In `focus-ring {}` or `border {}` Block

```kdl
focus-ring {
    | ← Suggests: width, active-color, inactive-color, from, to, angle
}
```

#### In `shadow {}` Block

```kdl
shadow {
    | ← Suggests: offset, x, y, softness, spread, color
}
```

#### In `input {}` Sub-blocks

```kdl
input {
    touchpad {
        | ← Suggests: accel-speed, accel-profile, scroll-method
    }
}
```

#### In Key Bindings

```kdl
binds {
    Mod+Escape | ← Suggests: allow-inhibiting, allow-when-locked, repeat, cooldown-ms
}
```

### 4. Property Values

After typing `property=`, suggests appropriate values:

#### Boolean Properties

```kdl
allow-inhibiting=| ← Suggests: true, false
```

#### String Properties with Enums

**Transform**:

```kdl
transform=| ← Suggests: normal, 90, 180, 270, flipped, flipped-90, etc.
```

**Center Column**:

```kdl
center-focused-column=| ← Suggests: "never", "always", "on-overflow"
```

**Acceleration Profile**:

```kdl
accel-profile=| ← Suggests: "flat", "adaptive"
```

**Scroll Method**:

```kdl
scroll-method=| ← Suggests: "two-finger", "edge", "on-button-down", "no-scroll"
```

#### Color Properties

```kdl
active-color=| ← Suggests: "#7fc8ff", "rgb(255, 127, 0)", "rgba(...)"
```

#### Position Properties

```kdl
position | ← Suggests: x=0 y=0 (as snippet)
offset | ← Suggests: x=0 y=0 (as snippet)
```

### 5. Actions

After a key binding or node name, suggests Niri actions:

```kdl
Mod+Q { | ← Suggests all available actions
```

**Window Management**:

- `spawn`, `spawn-sh`, `close-window`, `quit`

**Focus Actions**:

- `focus-column-left`, `focus-column-right`
- `focus-window-up`, `focus-window-down`
- `focus-monitor-*`, `focus-workspace-*`

**Move Actions**:

- `move-column-left`, `move-column-right`
- `move-window-*`, `move-column-to-workspace-*`

**Column Actions**:

- `consume-or-expel-window-left/right`
- `consume-window-into-column`, `expel-window-from-column`
- `center-column`, `center-visible-columns`

**Window Sizing**:

- `maximize-column`, `fullscreen-window`
- `set-column-width`, `set-window-height`
- `switch-preset-column-width`, `reset-window-height`

**Window State**:

- `toggle-window-floating`, `toggle-column-tabbed-display`

**Screenshots**:

- `screenshot`, `screenshot-screen`, `screenshot-window`

**System**:

- `toggle-keyboard-shortcuts-inhibit`, `power-off-monitors`
- `show-hotkey-overlay`, `toggle-overview`

## Property Reference

### Output Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `mode` | string | `"1920x1080@60"` | Display resolution and refresh rate |
| `scale` | number | `1.5` | Display scale factor (1.0 = 100%) |
| `transform` | enum | `"normal"` | Display rotation |
| `position` | position | `x=1920 y=0` | Display position in global space |

### Layout Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `gaps` | number | `16` | Gap size around windows (logical pixels) |
| `center-focused-column` | enum | `"never"` | When to center focused column |
| `proportion` | number | `0.5` | Width as fraction (0.0-1.0) |
| `fixed` | number | `1920` | Fixed width in logical pixels |

### Focus Ring/Border Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `width` | number | `4` | Ring/border width in pixels |
| `active-color` | color | `"#7fc8ff"` | Color on active monitor |
| `inactive-color` | color | `"#505050"` | Color on inactive monitors |
| `from` | color | `"#80c8ff"` | Gradient start color |
| `to` | color | `"#c7ff7f"` | Gradient end color |
| `angle` | number | `45` | Gradient angle (degrees) |
| `relative-to` | enum | `"workspace-view"` | Gradient relative to |

### Shadow Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `offset` | position | `x=0 y=5` | Shadow offset from window |
| `softness` | number | `30` | Blur radius |
| `spread` | number | `5` | Shadow expansion |
| `color` | color | `"#0007"` | Shadow color with opacity |

### Input Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `accel-speed` | number | `0.2` | Pointer acceleration (-1.0 to 1.0) |
| `accel-profile` | enum | `"flat"` | Acceleration curve |
| `scroll-method` | enum | `"two-finger"` | Touchpad scroll method |
| `scroll-button` | number | `273` | Button for on-button-down scroll |
| `layout` | string | `"us,ru"` | Keyboard layout |
| `options` | string | `"grp:win_space_toggle"` | XKB options |

### Keybinding Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `allow-inhibiting` | boolean | `false` | Allow apps to block this shortcut |
| `allow-when-locked` | boolean | `true` | Work when screen is locked |
| `repeat` | boolean | `false` | Allow key repeat |
| `cooldown-ms` | number | `150` | Rate limit (milliseconds) |
| `hotkey-overlay-title` | string/null | `"Open Terminal"` | Text shown in overlay |

### Window Rule Properties

| Property | Type | Example | Description |
|----------|------|---------|-------------|
| `match` | match | `app-id="firefox"` | Window matching criteria |
| `app-id` | string/regex | `r#"^org\..*$"#` | Match by application ID |
| `title` | string/regex | `"^Picture.*"` | Match by window title |
| `opacity` | number | `0.9` | Window opacity (0.0-1.0) |
| `geometry-corner-radius` | number | `12` | Corner radius (pixels) |
| `block-out-from` | enum | `"screen-capture"` | Block from capture |

## Toggle Flags

These are node names that act as boolean flags - present = enabled, absent/commented = disabled:

### Input Flags

- `tap` - Tap-to-click on touchpad
- `dwt` - Disable-while-typing
- `dwtp` - Disable-while-trackpointing  
- `drag` - Tap-and-drag on touchpad
- `drag-lock` - Drag lock
- `natural-scroll` - Reverse scroll direction
- `numlock` - Enable numlock on startup
- `disabled-on-external-mouse` - Disable touchpad when mouse connected
- `scroll-button-lock` - Scroll button lock
- `middle-emulation` - Middle button emulation

### Other Flags

- `off` - Disable output/device
- `on` - Enable shadow
- `prefer-no-csd` - Ask clients to omit decorations
- `warp-mouse-to-focus` - Warp mouse to focused window
- `skip-at-startup` - Skip hotkey overlay at startup
- `draw-behind-window` - Draw shadow behind window
- `clip-to-geometry` - Clip to window geometry

### Window Rule Flags

- `open-floating` - Open window as floating
- `open-maximized` - Open window maximized
- `open-fullscreen` - Open window fullscreen
- `draw-border-with-background` - Draw border as background

## Snippets and Smart Completions

The language server provides smart snippets with placeholders:

### Position Values

```kdl
position x=${1:0} y=${2:0}
```

### Color Values

```kdl
"rgb(${1:255}, ${2:127}, ${3:0})"
"rgba(${1:255}, ${2:127}, ${3:0}, ${4:0.5})"
```

### String Values

```kdl
"${0}"  # Places cursor inside quotes
```

## Tips

1. **Context Matters**: The completions change based on which block you're in
2. **Property Values**: After `=`, completions are filtered to valid values for that property
3. **Sort Order**: In binds blocks, modifiers appear first, then keys, then actions
4. **Documentation**: Hover over completions to see descriptions and types
5. **Snippets**: Use Tab to jump between placeholders in snippets

## References

- **Niri Wiki**: [https://github.com/YaLTeR/niri/wiki](https://github.com/YaLTeR/niri/wiki)
- **Configuration Introduction**: [https://github.com/YaLTeR/niri/wiki/Configuration:-Introduction](https://github.com/YaLTeR/niri/wiki/Configuration:-Introduction)
- **Default Config**: [https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl](https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl)
