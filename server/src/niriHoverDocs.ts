export interface Documentation {
	description: string;	 // brief description of the entry
	icon?: string;          // optional icon
	example?: string;        // optional KDL snippet
}

export const NIRI_HOVER_DOCS: Record<string, Documentation> = {

	"window": {
		description: "Defines a display window or view",
		icon: "🖼️",
		example: `
window {
	title = "My Window"
	floating = true
}`,
	},

	"monitor": {
		description: "Selects a specific output device",
		icon: "🖥️",
		example: `
monitor id=0`,
	},

	"workspace": {
		description: "Groups windows logically",
		icon: "🗂️",
		example: `
workspace name="MainWorkspace"`,
	},


	"match": {
		description: "Specifies matching rules for window conditions. Common fields include `app-id` and `title`",
		icon: "🔍",
		example: `
match {
	app-id = "org.wezfurlong.wezterm"
	title = "My Window"
}`,
	},

	"app-id": {
		description: "Matches the window's application ID",
		icon: "📦",
		example: `
match app-id = "org.wezfurlong.wezterm"`,
	},

	"title": {
		description: "Matches the window's title",
		icon: "🏷️",
		example: `
match title = "My Window"`,
	},

	"window-rule": {
		description: "Defines how windows matching a given pattern should behave. You can nest `match` and configuration options inside.",
		icon: "⚙️",
		example: `
window-rule {
	match title = "My Window"
	floating = true
}`,
	},


	"true": {
		description: 'Boolean literal representing "enabled" or "on"',
		icon: "✅",
		example: `
window-rule = true`,
	},

	"#true": {
		description: 'Boolean literal representing "enabled" or "on"',
		icon: "✅",
		example: `
window-rule = #true`,
	},

	"false": {
		description: 'Boolean literal representing "disabled" or "off"',
		icon: "❌",
		example: `
window-rule = false`,
	},

	"#false": {
		description: 'Boolean literal representing "disabled" or "off"',
		icon: "❌",
		example: `
window-rule = #false`,
	},

	"null": {
		description: 'Represents a null value',
		icon: "⚪",
		example: `
property = null`,
	},

	"nan": {
		description: 'Represents "not a number"',
		icon: "⚠️",
		example: `
property = nan`,
	},

	"#nan": {
		description: 'Represents "not a number"',
		icon: "⚠️",
		example: `
property = #nan`,
	},

	"inf": {
		description: 'Represents positive infinity',
		icon: "♾️",
		example: `
property = inf`,
	},

	"-inf": {
		description: 'Represents negative infinity',
		icon: "♾️",
		example: `
property = -inf`,
	},
};

/*
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
*/