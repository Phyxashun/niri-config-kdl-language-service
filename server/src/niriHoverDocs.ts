export interface HoverDocEntry {
	description: string;
	example?: string;        // KDL snippet
	color?: string;          // optional color hint (emoji only)
	emoji?: string;          // optional icon
}

export const NIRI_HOVER_DOCS: Record<string, HoverDocEntry> = {
	// =====================
	// Window/Layout
	// =====================
	"window": {
		description: "Defines a display window or view",
		example: `window {
  title = "My Window"
  floating = true
}`,
		color: "cyan",
		emoji: "🖼️"
	},

	"monitor": {
		description: "Selects a specific output device",
		example: `monitor id=0`,
		color: "cyan",
		emoji: "🖥️"
	},

	"workspace": {
		description: "Groups windows logically",
		example: `workspace name="MainWorkspace"`,
		color: "cyan",
		emoji: "🗂️"
	},

	// =====================
	// Matching
	// =====================
	"match": {
		description: "Specifies matching rules for window conditions.\nCommon fields include `app-id` and `title`",
		example: `match {
  app-id = "org.wezfurlong.wezterm"
  title = "My Window"
}`,
		color: "yellow",
		emoji: "🔍"
	},

	"app-id": {
		description: "Matches the window's application ID",
		example: `match app-id = "org.wezfurlong.wezterm"`,
		color: "yellow",
		emoji: "📦"
	},

	"title": {
		description: "Matches the window's title",
		example: `match title = "My Window"`,
		color: "yellow",
		emoji: "🏷️"
	},

	"window-rule": {
		description: "Defines how windows matching a given pattern should behave. You can nest `match` and configuration options inside.",
		example: `window-rule {
  match title = "My Window"
  floating = true
}`,
		color: "magenta",
		emoji: "⚙️"
	},

	// =====================
	// Boolean literals
	// =====================
	"true": {
		description: 'Boolean literal representing "enabled" or "on"',
		example: `window-rule = true`,
		color: "green",
		emoji: "✅"
	},

	"#true": {
		description: 'Boolean literal representing "enabled" or "on"',
		example: `window-rule = #true`,
		color: "green",
		emoji: "✅"
	},

	"false": {
		description: 'Boolean literal representing "disabled" or "off"',
		example: `window-rule = false`,
		color: "red",
		emoji: "❌"
	},

	"#false": {
		description: 'Boolean literal representing "disabled" or "off"',
		example: `window-rule = #false`,
		color: "red",
		emoji: "❌"
	},

	// =====================
	// Special literals
	// =====================
	"null": {
		description: 'Represents a null value',
		example: `property = null`,
		color: "gray",
		emoji: "⚪"
	},

	"nan": {
		description: 'Represents "not a number"',
		example: `property = nan`,
		color: "orange",
		emoji: "⚠️"
	},

	"#nan": {
		description: 'Represents "not a number"',
		example: `property = #nan`,
		color: "orange",
		emoji: "⚠️"
	},

	"inf": {
		description: 'Represents positive infinity',
		example: `property = inf`,
		color: "blue",
		emoji: "♾️"
	},

	"-inf": {
		description: 'Represents negative infinity',
		example: `property = -inf`,
		color: "blue",
		emoji: "♾️"
	},

	// Add more Niri configuration nodes here following the same pattern
};


export const OLD_NIRI_HOVER_DOCS: Record<string, string> = {
	// Top‑level sections
	"input": `**input**  
Configure input devices and behavior (keyboard, touchpad, mouse, trackpoint, xkb).  

\`\`\`kdl
input {
  keyboard {
    xkb {
      layout "us"
      variant "altgr-intl"
      options "ctrl:nocaps,grp:alt_shift_toggle"
    }
  }
}
\`\`\`

🛠️ Input device configuration`,

	"output": `**output**  
Configure display outputs (monitors) — mode, scale, position, rotation.  

\`\`\`kdl
output "eDP‑1" {
  mode "1920x1080@60"
  scale 1.2
  position x=0 y=0
}
\`\`\`

🖥️ Output display configuration`,

	"binds": `**binds**  
Define keyboard shortcuts and actions. Each key binding is its own entry.  

\`\`\`kdl
binds {
  Mod+T { spawn "alacritty"; }
  Shift+Mod+Q { close-window; }
}
\`\`\`

⌨️ Key binding configuration`,

	"layout": `**layout**  
Configure window layout, column widths, gaps, default size, etc.  

\`\`\`kdl
layout {
  gaps 5
  preset-column-widths { proportion 0.33; proportion 0.5; proportion 0.67; }
}
\`\`\`

📐 Layout configuration`,

	"animations": `**animations**  
Animation settings for window transitions, slowing, speeding up, etc.  

\`\`\`kdl
animations {
  slowdown 1.5
}
\`\`\`

🎞️ Animation settings`,

	"window-rule": `**window-rule**  
Define rules for windows matching certain criteria. Behavior like floating, maximized, etc.  

\`\`\`kdl
window-rule {
  match app-id = "org.wezfurlong.wezterm"
  floating = true
}
\`\`\`

🎯 Window rule configuration`,

	"layer-rule": `**layer-rule**  
Rules for layered surfaces (e.g., overlays, always‑on‑top).  

\`\`\`kdl
layer-rule {
  match title = "Overlay"
  open-floating
}
\`\`\`

🧱 Layer rule configuration`,

	"switch-events": `**switch-events**  
Define monitor/workspace switching events (like when outputs connect/disconnect).  

\`\`\`kdl
switch-events {
  on output‑connected "HDMI‑A‑1" { workspace 2; }
}
\`\`\`

🔄 Switch events configuration`,

	"gestures": `**gestures**  
Configure touchpad or pointer gestures (swipe, pinch) for various actions.  

\`\`\`kdl
gestures {
  three‑finger‑swipe‑left { workspace‑left; }
}
\`\`\`

✋ Gesture configuration`,

	"debug": `**debug**  
Debug settings for internal compositor behavior (cursor plane, rendering, etc).  

\`\`\`kdl
debug {
  disable‑cursor‑plane
}
\`\`\`

🐞 Debug configuration`,

	"include": `**include**  
Include another KDL config file for modular setup.  

\`\`\`kdl
include "other-config.kdl"
\`\`\`

📄 Include external config file`,

	// Example literal & flag entries (reuse approach from earlier)
	"true": `**true**  
Boolean literal representing “enabled” / “on”.

\`\`\`kdl
some-property = true
\`\`\`

<span style="color:green;">✅ Enabled</span>`,

	"#true": `**#true**  
Tagged boolean literal representing “enabled” / “on”.

\`\`\`kdl
some-property = #true
\`\`\`

<span style="color:green;">✅ Enabled</span>`,

	"false": `**false**  
Boolean literal representing “disabled” / “off”.

\`\`\`kdl
some-property = false
\`\`\`

<span style="color:red;">❌ Disabled</span>`,

	"#false": `**#false**  
Tagged boolean literal representing “disabled” / “off”.

\`\`\`kdl
some-property = #false
\`\`\`

<span style="color:red;">❌ Disabled</span>`,

	"null": `**null**  
Represents a null value.

\`\`\`kdl
some-property = null
\`\`\`

<span style="color:gray;">⚪ Null</span>`,

	"nan": `**nan**  
Represents “not a number”.

\`\`\`kdl
some‑property = nan
\`\`\`

<span style="color:orange;">⚠️ NaN</span>`,

	"inf": `**inf**  
Represents positive infinity.

\`\`\`kdl
some‑property = inf
\`\`\`

<span style="color:blue;">♾️ Infinity</span>`,

	"-inf": `**-inf**  
Represents negative infinity.

\`\`\`kdl
some‑property = -inf
\`\`\`

<span style="color:blue;">♾️ ‑Infinity</span>`,
};
