import {
	CompletionList,
	CompletionItem,
	CompletionItemKind,
	Diagnostic,
	DiagnosticSeverity,
	Position,
	Range,
	Hover,
	MarkupKind
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';

/**
 * Re-export LSP types for use in other modules
 * 
 * Used to avoid multiple imports from 'vscode-languageserver/node'
 */
export { Position, Range, CompletionList, CompletionItem, Diagnostic };

/**
 * Defines the capabilities that a language mode can provide
 * 
 * Used to implement different language features (validation, completion) for specific languages
 */
export interface LanguageMode {
	getId(): string;
	doValidation?: (document: TextDocument) => Diagnostic[];
	doComplete?: (document: TextDocument, position: Position) => CompletionList;
	doHover?: (document: TextDocument, position: Position) => Hover | undefined;
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

/**
 * Defines a registry for multiple language modes
 * 
 * Used to manage different language modes (e.g., KDL, JSON) in the same document
 */
export interface LanguageModes {
	getMode(languageId: string): LanguageMode | undefined;
	getAllModes(): LanguageMode[];
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

/**
 * Common Niri properties with their expected value types
 * 
 * Used for property name completions and value type hints
 */
export interface NiriProperty {
	name: string;
	valueType: string;
	description: string;
}

/**
 * KDL Syntax Patterns
 */

/* Commented out to allow bare keywords similar to KDL v1.0 spec 
// Forbidden bare keywords (must have # prefix)
// const FORBIDDEN_KEYWORDS = /\b(?<!#)(true|false|null|nan|(?:-)inf)\b/g;
*/

/**
 * Niri Configuration Completions
 * 
 * Based on: https://github.com/YaLTeR/niri/wiki/Configuration:-Introduction
 */

/**
 * Top-level configuration nodes
 * 
 * Used for node name completions
 */
const NIRI_NODES = [
	'input', 'output', 'binds', 'layout', 'animations',
	'window-rule', 'layer-rule', 'switch-events',
	'keyboard', 'touchpad', 'mouse', 'trackpoint', 'xkb',
	'focus-ring', 'border', 'shadow', 'struts', 'hotkey-overlay',
	'preset-column-widths', 'preset-window-heights', 'debug'
];

/**
 * Common Niri flag nodes (toggle options)
 * 
 * Used for flag name completions
 */
const NIRI_FLAGS = [
	// Input flags
	'tap', 'dwt', 'dwtp', 'drag', 'drag-lock', 'natural-scroll',
	'numlock', 'off', 'warp-mouse-to-focus', 'disabled-on-external-mouse',
	'scroll-button-lock', 'middle-emulation',
	// General flags
	'prefer-no-csd', 'skip-at-startup', 'on',
	// Border/shadow flags
	'draw-behind-window', 'clip-to-geometry',
	// Debug flags
	'disable-cursor-plane', 'render-drm-device',
	// Window rule flags
	'open-floating', 'open-maximized', 'open-fullscreen'
];

/**
 * Common Niri properties
 * 
 * Used for property name completions and value type hints
 */
const NIRI_PROPERTIES: NiriProperty[] = [
	// Output properties
	{ name: 'mode', valueType: 'string', description: 'Display mode (e.g., "1920x1080@60")' },
	{ name: 'scale', valueType: 'number', description: 'Display scale factor (e.g., 1.5 for 150%)' },
	{ name: 'transform', valueType: 'string', description: 'Display rotation (normal, 90, 180, 270, flipped-*)' },
	{ name: 'position', valueType: 'position', description: 'Display position (x=N y=N)' },
	{ name: 'x', valueType: 'number', description: 'X coordinate' },
	{ name: 'y', valueType: 'number', description: 'Y coordinate' },

	// Layout properties
	{ name: 'gaps', valueType: 'number', description: 'Gap size around windows in logical pixels' },
	{ name: 'width', valueType: 'number', description: 'Width in logical pixels' },
	{ name: 'height', valueType: 'number', description: 'Height in logical pixels' },
	{ name: 'proportion', valueType: 'number', description: 'Width as fraction of output (0.0-1.0)' },
	{ name: 'fixed', valueType: 'number', description: 'Fixed width in logical pixels' },
	{ name: 'center-focused-column', valueType: 'string', description: 'When to center column ("never", "always", "on-overflow")' },

	// Focus ring/border properties
	{ name: 'active-color', valueType: 'color', description: 'Color on active monitor (CSS color)' },
	{ name: 'inactive-color', valueType: 'color', description: 'Color on inactive monitors' },
	{ name: 'urgent-color', valueType: 'color', description: 'Color for windows requesting attention' },
	{ name: 'from', valueType: 'color', description: 'Gradient start color' },
	{ name: 'to', valueType: 'color', description: 'Gradient end color' },
	{ name: 'angle', valueType: 'number', description: 'Gradient angle in degrees' },
	{ name: 'relative-to', valueType: 'string', description: 'Gradient relative to ("window" or "workspace-view")' },
	{ name: 'in', valueType: 'string', description: 'Color space for gradient interpolation' },

	// Shadow properties
	{ name: 'offset', valueType: 'position', description: 'Shadow offset (x=N y=N)' },
	{ name: 'softness', valueType: 'number', description: 'Shadow blur radius' },
	{ name: 'spread', valueType: 'number', description: 'Shadow spread/expansion' },
	{ name: 'color', valueType: 'color', description: 'Shadow color with opacity' },

	// Input properties
	{ name: 'accel-speed', valueType: 'number', description: 'Pointer acceleration speed (-1.0 to 1.0)' },
	{ name: 'accel-profile', valueType: 'string', description: 'Acceleration profile ("flat" or "adaptive")' },
	{ name: 'scroll-method', valueType: 'string', description: 'Scroll method (two-finger, edge, on-button-down, no-scroll)' },
	{ name: 'scroll-button', valueType: 'number', description: 'Button number for scroll-method on-button-down' },
	{ name: 'max-scroll-amount', valueType: 'string', description: 'Maximum scroll for focus-follows-mouse (e.g., "0%")' },

	// XKB properties
	{ name: 'layout', valueType: 'string', description: 'Keyboard layout (e.g., "us,ru")' },
	{ name: 'variant', valueType: 'string', description: 'Keyboard layout variant' },
	{ name: 'options', valueType: 'string', description: 'XKB options (e.g., "grp:win_space_toggle")' },
	{ name: 'model', valueType: 'string', description: 'Keyboard model' },
	{ name: 'rules', valueType: 'string', description: 'XKB rules' },

	// Keybinding properties
	{ name: 'allow-inhibiting', valueType: 'boolean', description: 'Allow apps to inhibit this shortcut' },
	{ name: 'allow-when-locked', valueType: 'boolean', description: 'Allow binding when screen is locked' },
	{ name: 'repeat', valueType: 'boolean', description: 'Allow key repeat for this binding' },
	{ name: 'cooldown-ms', valueType: 'number', description: 'Rate limit binding to N milliseconds' },
	{ name: 'hotkey-overlay-title', valueType: 'string', description: 'Title shown in hotkey overlay (or null)' },

	// Window rule properties
	{ name: 'match', valueType: 'match', description: 'Window matching criteria (app-id, title)' },
	{ name: 'app-id', valueType: 'string', description: 'Match by application ID' },
	{ name: 'title', valueType: 'string', description: 'Match by window title' },
	{ name: 'default-column-width', valueType: 'block', description: 'Default width for matched windows' },
	{ name: 'opacity', valueType: 'number', description: 'Window opacity (0.0-1.0)' },
	{ name: 'geometry-corner-radius', valueType: 'number', description: 'Window corner radius in pixels' },
	{ name: 'block-out-from', valueType: 'string', description: 'Block from capture ("screen-capture" or "screencast")' },
	{ name: 'draw-border-with-background', valueType: 'boolean', description: 'Draw border as background' },

	// Struts properties
	{ name: 'left', valueType: 'number', description: 'Left strut in logical pixels' },
	{ name: 'right', valueType: 'number', description: 'Right strut in logical pixels' },
	{ name: 'top', valueType: 'number', description: 'Top strut in logical pixels' },
	{ name: 'bottom', valueType: 'number', description: 'Bottom strut in logical pixels' },

	// Animation properties
	{ name: 'slowdown', valueType: 'number', description: 'Animation speed multiplier (>1 slows down, <1 speeds up)' },

	// Misc properties
	{ name: 'screenshot-path', valueType: 'string', description: 'Path for saving screenshots (or null)' }
];

/**
 * Common Niri key modifiers
 * 
 * Used for keybinding key completions
 */
const NIRI_KEY_MODIFIERS = [
	'Mod', 'Super', 'Alt', 'Ctrl', 'Shift'
];

/** 
 * Common Niri special keys (from default config analysis)
 * 
 * Used for keybinding key completions
 */
const NIRI_SPECIAL_KEYS = [
	// Standard keys
	'Escape', 'Return', 'Space', 'Tab', 'Backspace', 'Delete', 'Slash',
	// Arrow keys
	'Left', 'Right', 'Up', 'Down',
	// Navigation keys
	'Home', 'End', 'Page_Up', 'Page_Down',
	// Function keys
	'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
	// Number keys
	'1', '2', '3', '4', '5', '6', '7', '8', '9', '0',
	// Letter keys (vim-style)
	'H', 'J', 'K', 'L', 'U', 'I', 'O', 'Q', 'R', 'W', 'C', 'D', 'E', 'F', 'P', 'T', 'V',
	// Punctuation
	'Minus', 'Equal', 'BracketLeft', 'BracketRight', 'Comma', 'Period',
	// Media keys (XF86)
	'XF86AudioRaiseVolume', 'XF86AudioLowerVolume', 'XF86AudioMute',
	'XF86AudioMicMute', 'XF86AudioPlay', 'XF86AudioStop', 'XF86AudioPrev', 'XF86AudioNext',
	'XF86MonBrightnessUp', 'XF86MonBrightnessDown',
	// Screenshot
	'Print',
	// Mouse/touchpad events
	'WheelScrollDown', 'WheelScrollUp', 'WheelScrollLeft', 'WheelScrollRight',
	'TouchpadScrollDown', 'TouchpadScrollUp'
];

/**
 * Niri actions (from default config and wiki)
 * 
 * Used for keybinding action completions
 */
const NIRI_ACTIONS = [
	// Window management
	'spawn', 'spawn-sh', 'spawn-at-startup', 'spawn-sh-at-startup',
	'close-window', 'quit',

	// Focus actions
	'focus-column-left', 'focus-column-right',
	'focus-window-up', 'focus-window-down',
	'focus-column-first', 'focus-column-last',
	'focus-window-or-workspace-down', 'focus-window-or-workspace-up',

	// Move actions
	'move-column-left', 'move-column-right',
	'move-window-up', 'move-window-down',
	'move-column-to-first', 'move-column-to-last',
	'move-window-down-or-to-workspace-down', 'move-window-up-or-to-workspace-up',

	// Monitor actions
	'focus-monitor-left', 'focus-monitor-right', 'focus-monitor-up', 'focus-monitor-down',
	'move-column-to-monitor-left', 'move-column-to-monitor-right',
	'move-column-to-monitor-up', 'move-column-to-monitor-down',
	'move-window-to-monitor-left', 'move-window-to-monitor-right',
	'move-window-to-monitor-up', 'move-window-to-monitor-down',
	'move-workspace-to-monitor-left', 'move-workspace-to-monitor-right',
	'move-workspace-to-monitor-up', 'move-workspace-to-monitor-down',

	// Workspace actions
	'focus-workspace-down', 'focus-workspace-up', 'focus-workspace-previous',
	'focus-workspace', 'move-column-to-workspace-down', 'move-column-to-workspace-up',
	'move-column-to-workspace', 'move-window-to-workspace-down', 'move-window-to-workspace-up',
	'move-window-to-workspace', 'move-workspace-down', 'move-workspace-up',

	// Column actions
	'consume-or-expel-window-left', 'consume-or-expel-window-right',
	'consume-window-into-column', 'expel-window-from-column',
	'center-column', 'center-visible-columns',

	// Window sizing
	'maximize-column', 'fullscreen-window',
	'set-column-width', 'set-window-height',
	'switch-preset-column-width', 'switch-preset-column-width-back',
	'switch-preset-window-height', 'reset-window-height',
	'expand-column-to-available-width',

	// Window state
	'toggle-window-floating', 'switch-focus-between-floating-and-tiling',
	'toggle-column-tabbed-display',

	// Layout switching
	'switch-layout',

	// Screenshots
	'screenshot', 'screenshot-screen', 'screenshot-window',

	// System
	'toggle-keyboard-shortcuts-inhibit', 'power-off-monitors',
	'show-hotkey-overlay', 'toggle-overview',

	// Debug
	'toggle-debug-tint'
];

/**
 * Transform values for output
 * 
 * Used for transform property value completions
 */
const NIRI_TRANSFORM_VALUES = [
	'normal', '90', '180', '270',
	'flipped', 'flipped-90', 'flipped-180', 'flipped-270'
];

/**
 * Center-focused-column values
 * 
 * Used for center-focused-column property value completions
 */
const NIRI_CENTER_COLUMN_VALUES = [
	'never', 'always', 'on-overflow'
];

/**
 * Accel-profile values
 * 
 * Used for accel-profile property value completions
 */
const NIRI_ACCEL_PROFILE_VALUES = [
	'flat', 'adaptive'
];

/**
 * Scroll-method values
 * 
 * Used for scroll-method property value completions
 */
const NIRI_SCROLL_METHOD_VALUES = [
	'two-finger', 'edge', 'on-button-down', 'no-scroll'
];

/**
 * Check if a position in the text is inside a specific named block
 * 
 * Used to determine context for completions
 * 
 * @param text Full document text
 * @param offset Offset position in the text
 * @param blockName Name of the block to check (e.g., 'binds', 'input')
 * @returns True if inside the specified block, false otherwise
 */
function isInBlock(text: string, offset: number, blockName: string): boolean {
	const beforeCursor = text.substring(0, offset);
	const blockPattern = new RegExp(`\\b${blockName}\\s*\\{`, 'g');
	let lastBlockStart = -1;
	let match;

	while ((match = blockPattern.exec(beforeCursor)) !== null) {
		lastBlockStart = match.index;
	}

	if (lastBlockStart === -1) {
		return false;
	}

	// Count braces to see if we're still inside
	const afterBlock = beforeCursor.substring(lastBlockStart);
	const openBraces = (afterBlock.match(/\{/g) || []).length;
	const closeBraces = (afterBlock.match(/\}/g) || []).length;

	return openBraces > closeBraces;
}

/**
 * Get description for a node name
 * 
 * Used in completion item details/documentation
 * 
 * @param nodeName
 * @returns Description string
 */
function getNodeDescription(nodeName: string): string {
	const descriptions: Record<string, string> = {
		'input': 'Input device configuration (keyboard, mouse, touchpad)',
		'output': 'Display output configuration',
		'binds': 'Keyboard shortcuts and key bindings',
		'layout': 'Window layout and positioning settings',
		'animations': 'Animation configuration',
		'window-rule': 'Rules for specific windows',
		'focus-ring': 'Focus indicator ring settings',
		'border': 'Window border settings',
		'shadow': 'Window shadow effects',
		'struts': 'Screen edge reserved space',
		'hotkey-overlay': 'Hotkey overlay display settings',
		'preset-column-widths': 'Preset width configurations',
		'preset-window-heights': 'Preset height configurations',
		'keyboard': 'Keyboard input settings',
		'touchpad': 'Touchpad input settings',
		'mouse': 'Mouse input settings',
		'xkb': 'XKB keyboard layout configuration'
	};
	return descriptions[nodeName] || `${nodeName} configuration block`;
}

/**
 * Get relevant properties based on context
 * 
 * Used to filter property completions based on the current block
 * 
 * @param isOutput
 * @param isLayout
 * @param isFocusRing
 * @param isBorder
 * @param isShadow
 * @param isInput
 * @param isBinds
 * @param isWindowRule
 * @returns Array of relevant NiriProperty
 */
function getRelevantProperties(
	isOutput: boolean, isLayout: boolean, isFocusRing: boolean,
	isBorder: boolean, isShadow: boolean, isInput: boolean,
	isBinds: boolean, isWindowRule: boolean
): NiriProperty[] {
	if (isOutput) {
		return NIRI_PROPERTIES.filter(p =>
			['mode', 'scale', 'transform', 'position', 'x', 'y'].includes(p.name)
		);
	}
	if (isLayout) {
		return NIRI_PROPERTIES.filter(p =>
			['gaps', 'center-focused-column', 'proportion', 'fixed', 'width', 'height'].includes(p.name)
		);
	}
	if (isFocusRing || isBorder) {
		return NIRI_PROPERTIES.filter(p =>
			['width', 'active-color', 'inactive-color', 'urgent-color', 'from', 'to', 'angle', 'relative-to', 'in'].includes(p.name)
		);
	}
	if (isShadow) {
		return NIRI_PROPERTIES.filter(p =>
			['offset', 'x', 'y', 'softness', 'spread', 'color'].includes(p.name)
		);
	}
	if (isInput) {
		return NIRI_PROPERTIES.filter(p =>
			['accel-speed', 'accel-profile', 'scroll-method', 'scroll-button', 'max-scroll-amount', 'layout', 'variant', 'options', 'model', 'rules'].includes(p.name)
		);
	}
	if (isBinds) {
		return NIRI_PROPERTIES.filter(p =>
			['allow-inhibiting', 'allow-when-locked', 'repeat', 'cooldown-ms', 'hotkey-overlay-title'].includes(p.name)
		);
	}
	if (isWindowRule) {
		return NIRI_PROPERTIES.filter(p =>
			['match', 'app-id', 'title', 'opacity', 'geometry-corner-radius', 'block-out-from', 'draw-border-with-background'].includes(p.name)
		);
	}
	return NIRI_PROPERTIES;
}

/**
 * Find invalid escape sequences in KDL strings
 * 
 * Detects whether a given string is raw or not, then applies 
 * invalid escape regex only to the strings that are not raw
 * 
 * @param kdlText 
 * @returns Array of objects with string and invalid escapes found
 */
function findInvalidEscapes(kdlText: string): { string: string; invalid: string[] }[] {
	const stringRegex = /r*#*"(.*?)"#*/gs;
	const invalidEscape = /\\(?!([nrtbf"\\]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}))/g;

	const results = [];

	for (const match of kdlText.matchAll(stringRegex)) {
		const rawPrefix = match[0].match(/^r#+|^r/);
		const isRaw = !!rawPrefix;

		// skip raw strings entirely
		if (isRaw) { continue; }

		const content = match[1];
		const bad = [...content.matchAll(invalidEscape)];
		if (bad.length > 0) {
			results.push({
				string: match[0],
				invalid: bad.map(m => m[0]),
			});
		}
	}
	return results;
}

/**
 * KDL Language Mode
 * 
 * Provides validation and completion for KDL documents tailored to Niri configuration.
 * 
 * @return LanguageMode instance for KDL
 */
export function getKDLMode(): LanguageMode {
	return {
		getId() {
			return 'kdl';
		},

		doValidation(document: TextDocument): Diagnostic[] {
			const text = document.getText();
			const diagnostics: Diagnostic[] = [];
			const lines = text.split(/\r?\n/);

			for (let i = 0; i < lines.length; i++) {
				const line = lines[i];

				// Skip comments
				if (line.trim().startsWith('//') || line.trim().startsWith('/*')) {
					continue;
				}

				/** Commented out to allow bare keywords similar to KDL v1.0 spec
				// Check for forbidden bare keywords
				// But allow them after '=' (as property values like allow-inhibiting=false)
				const beforeEquals = line.split('=')[0];

				FORBIDDEN_KEYWORDS.lastIndex = 0;
				let match: RegExpExecArray | null;

				// Only check for forbidden keywords in the part before '='
				while ((match = FORBIDDEN_KEYWORDS.exec(beforeEquals))) {
					diagnostics.push({
						severity: DiagnosticSeverity.Error,
						range: {
							start: { line: i, character: match.index },
							end: { line: i, character: match.index + match[0].length }
						},
						message: `Bare keyword '${match[0]}' is not allowed. Use '#${match[0]}' instead.`,
						source: 'kdl'
					});
				}
				*/

				// Check for unclosed strings (simple check)
				const quoteCount = (line.match(/(?<!\\)"/g) || []).length;
				if (quoteCount % 2 !== 0 && !line.includes('"""')) {
					diagnostics.push({
						severity: DiagnosticSeverity.Error,
						range: {
							start: { line: i, character: 0 },
							end: { line: i, character: line.length }
						},
						message: 'Unclosed string literal',
						source: 'kdl'
					});
				}

				// Check for invalid escape sequences
				const invalidEscapes = findInvalidEscapes(text);
				for (const invalid of invalidEscapes) {
					for (const bad of invalid.invalid) {
						// Find position of invalid escape in the full document
						const idx = text.indexOf(bad, text.indexOf(invalid.string));
						if (idx === -1) { continue; }

						const startPos = document.positionAt(idx);
						const endPos = document.positionAt(idx + bad.length);

						diagnostics.push({
							severity: DiagnosticSeverity.Error,
							range: { start: startPos, end: endPos },
							message: `Invalid escape sequence '${bad}'`,
							source: 'kdl'
						});
					}
				}
			}

			// Check for unmatched braces (document-level)
			const openBraces = (text.match(/\{/g) || []).length;
			const closeBraces = (text.match(/\}/g) || []).length;
			if (openBraces !== closeBraces) {
				diagnostics.push({
					severity: DiagnosticSeverity.Warning,
					range: {
						start: { line: 0, character: 0 },
						end: { line: lines.length - 1, character: lines[lines.length - 1].length }
					},
					message: `Unmatched braces: ${openBraces} opening, ${closeBraces} closing`,
					source: 'kdl'
				});
			}

			return diagnostics;
		},

		doComplete(document: TextDocument, position: Position): CompletionList {
			const text = document.getText();
			const offset = document.offsetAt(position);
			const line = text.split(/\r?\n/)[position.line];
			const linePrefix = line.substring(0, position.character);

			const completions: CompletionItem[] = [];

			// Detect context
			const isAfterEquals = /(\w+)=\s*$/.exec(linePrefix);
			const propertyName = isAfterEquals ? isAfterEquals[1] : null;
			const isAtLineStart = /^\s*$/.test(linePrefix);
			const isInBraces = /\{\s*$/.test(linePrefix);
			const isAfterNodeName = /^\s*\w+\s+$/.test(linePrefix);

			// Check which block we're in
			const isInBindsBlock = isInBlock(text, offset, 'binds');
			const isInInputBlock = isInBlock(text, offset, 'input');
			const isInLayoutBlock = isInBlock(text, offset, 'layout');
			const isInFocusRingBlock = isInBlock(text, offset, 'focus-ring');
			const isInBorderBlock = isInBlock(text, offset, 'border');
			const isInShadowBlock = isInBlock(text, offset, 'shadow');
			const isInOutputBlock = isInBlock(text, offset, 'output');
			const isInWindowRuleBlock = isInBlock(text, offset, 'window-rule');

			// Context-specific value completions after =
			if (propertyName) {
				// Find property definition to get value type
				const propDef = NIRI_PROPERTIES.find(p => p.name === propertyName);

				if (propDef) {
					switch (propDef.valueType) {
						case 'boolean':
							completions.push(
								{ label: '#true', kind: CompletionItemKind.Value, detail: 'Tagged boolean true' },
								{ label: '#false', kind: CompletionItemKind.Value, detail: 'Tagged boolean false' }
							);
							break;

						case 'string':
							if (propertyName === 'transform') {
								NIRI_TRANSFORM_VALUES.forEach((val, i) => {
									completions.push({
										label: val,
										kind: CompletionItemKind.EnumMember,
										data: `transform_${i}`,
										detail: `Transform: ${val}`
									});
								});
							} else if (propertyName === 'center-focused-column') {
								NIRI_CENTER_COLUMN_VALUES.forEach((val, i) => {
									completions.push({
										label: `"${val}"`,
										kind: CompletionItemKind.EnumMember,
										data: `center_${i}`,
										detail: val,
										insertText: `"${val}"`
									});
								});
							} else if (propertyName === 'accel-profile') {
								NIRI_ACCEL_PROFILE_VALUES.forEach((val, i) => {
									completions.push({
										label: `"${val}"`,
										kind: CompletionItemKind.EnumMember,
										data: `accel_${i}`,
										detail: val,
										insertText: `"${val}"`
									});
								});
							} else if (propertyName === 'scroll-method') {
								NIRI_SCROLL_METHOD_VALUES.forEach((val, i) => {
									completions.push({
										label: `"${val}"`,
										kind: CompletionItemKind.EnumMember,
										data: `scroll_${i}`,
										detail: val,
										insertText: `"${val}"`
									});
								});
							} else {
								completions.push({
									label: '""',
									kind: CompletionItemKind.Snippet,
									detail: 'String value',
									insertText: '"$0"',
									insertTextFormat: 2
								});
							}
							break;

						case 'number':
							completions.push({
								label: '0',
								kind: CompletionItemKind.Value,
								detail: 'Numeric value',
								insertText: '0'
							});
							break;

						case 'color':
							completions.push(
								{ label: '"#7fc8ff"', kind: CompletionItemKind.Color, detail: 'Hex color', insertText: '"#7fc8ff"' },
								{ label: '"rgb(255, 127, 0)"', kind: CompletionItemKind.Color, detail: 'RGB color', insertText: '"rgb(${1:255}, ${2:127}, ${3:0})"', insertTextFormat: 2 },
								{ label: '"rgba(255, 127, 0, 0.5)"', kind: CompletionItemKind.Color, detail: 'RGBA color', insertText: '"rgba(${1:255}, ${2:127}, ${3:0}, ${4:0.5})"', insertTextFormat: 2 }
							);
							break;

						case 'position':
							completions.push({
								label: 'x=0 y=0',
								kind: CompletionItemKind.Snippet,
								detail: 'Position coordinates',
								insertText: 'x=${1:0} y=${2:0}',
								insertTextFormat: 2
							});
							break;
					}
				}

				// Always add basic value options
				completions.push(
					{ label: 'true', kind: CompletionItemKind.Value, detail: 'Boolean true' },

					{ label: 'false', kind: CompletionItemKind.Value, detail: 'Boolean false' },

					{ label: 'null', kind: CompletionItemKind.Value, detail: 'Null value' },
					{ label: '#null', kind: CompletionItemKind.Value, detail: 'Tagged null' },

					{ label: 'nan', kind: CompletionItemKind.Value, detail: 'Not-a-Number' },
					{ label: '#nan', kind: CompletionItemKind.Value, detail: 'Tagged NaN' },

					{ label: 'inf', kind: CompletionItemKind.Value, detail: 'Infinity' },
					{ label: '-inf', kind: CompletionItemKind.Value, detail: 'Negative Infinity' },

					{ label: '#inf', kind: CompletionItemKind.Value, detail: 'Tagged Infinity' },
					{ label: '#-inf', kind: CompletionItemKind.Value, detail: 'Tagged Negative Infinity' }
				);

				return CompletionList.create(completions, false);
			}

			// Keybinding completions in binds block
			if (isInBindsBlock && isAtLineStart) {
				// Suggest key modifiers for bindings
				NIRI_KEY_MODIFIERS.forEach((mod, index) => {
					completions.push({
						label: `${mod}+`,
						kind: CompletionItemKind.Keyword,
						data: `modifier_${index}`,
						detail: 'Key modifier',
						insertText: `${mod}+`,
						sortText: `0_${mod}`
					});
				});

				// Suggest special keys
				NIRI_SPECIAL_KEYS.forEach((key, index) => {
					completions.push({
						label: key,
						kind: CompletionItemKind.Constant,
						data: `key_${index}`,
						detail: 'Special key',
						insertText: key,
						sortText: `1_${key}`
					});
				});
			}

			// Node name completions (at line start or after opening brace)
			if ((isAtLineStart || isInBraces) && !isInBindsBlock) {
				NIRI_NODES.forEach((node, index) => {
					const detail = getNodeDescription(node);
					completions.push({
						label: node,
						kind: CompletionItemKind.Class,
						data: `node_${index}`,
						detail: detail,
						insertText: node,
						documentation: detail
					});
				});

				NIRI_FLAGS.forEach((flag, index) => {
					completions.push({
						label: flag,
						kind: CompletionItemKind.Constant,
						data: `flag_${index}`,
						detail: 'Toggle flag (enabled when present)',
						insertText: flag
					});
				});
			}

			// Context-specific property completions
			if (!isAfterEquals && !isAtLineStart) {
				const relevantProps = getRelevantProperties(
					isInOutputBlock, isInLayoutBlock, isInFocusRingBlock,
					isInBorderBlock, isInShadowBlock, isInInputBlock,
					isInBindsBlock, isInWindowRuleBlock
				);

				relevantProps.forEach((prop: NiriProperty, index: number) => {
					completions.push({
						label: prop.name,
						kind: CompletionItemKind.Property,
						data: `prop_${index}`,
						detail: prop.description,
						insertText: `${prop.name}=`,
						documentation: `Type: ${prop.valueType}\n${prop.description}`
					});
				});
			}

			// Action completions (inside binds blocks or after node names)
			if (isAfterNodeName || isInBindsBlock) {
				NIRI_ACTIONS.forEach((action, index) => {
					completions.push({
						label: action,
						kind: CompletionItemKind.Function,
						data: `action_${index}`,
						detail: `${action} action`,
						insertText: action,
						sortText: `2_${action}`
					});
				});
			}

			return CompletionList.create(completions, false);
		},

		doHover(document: TextDocument, position: Position): Hover | undefined {
			const text = document.getText();
			const offset = document.offsetAt(position);
			const context = text.substring(Math.max(0, offset - 20), offset + 20);
			const wordMatch = /\b[#]?[A-Za-z0-9\-_]+\b/.exec(context);
			if (!wordMatch) { return undefined; }

			const token = wordMatch[0];

			// Check property names
			const prop = NIRI_PROPERTIES.find(p => p.name === token);
			if (prop) {
				return {
					contents: {
						kind: MarkupKind.Markdown,
						value: `**Property** \`${prop.name}\`  \nType: \`${prop.valueType}\`  \n${prop.description}`
					}
				};
			}

			// Check node names
			if (NIRI_NODES.includes(token)) {
				return {
					contents: {
						kind: MarkupKind.Markdown,
						value: `**Section** \`${token}\` configuration block — see Niri wiki for more details.`
					}
				};
			}

			// Check flags
			if (NIRI_FLAGS.includes(token)) {
				return {
					contents: {
						kind: MarkupKind.Markdown,
						value: `**Flag** \`${token}\` — toggle this option on when present.`
					}
				};
			}

			// Literals
			if (/^#?(true|false|null|nan|inf|-inf)$/.test(token)) {
				return {
					contents: {
						kind: MarkupKind.Markdown,
						value: `**Literal** \`${token}\` — boolean/null/float literal accepted in config.`
					}
				};
			}

			// Fallback
			return undefined;
		},

		onDocumentRemoved(_document: TextDocument) {
			// Nothing to clean up for KDL mode
		},

		dispose() {
			// Nothing to dispose for KDL mode
		}
	};
}

/**
 * Language Modes Manager
 * 
 * Manages multiple language modes and delegates requests accordingly.
 * 
 * @return LanguageModes instance
 */
export function getLanguageModes(): LanguageModes {
	const kdlMode = getKDLMode();
	const modes: Record<string, LanguageMode> = {
		'kdl': kdlMode
	};

	return {
		getMode(languageId: string): LanguageMode | undefined {
			return modes[languageId];
		},

		getAllModes(): LanguageMode[] {
			return Object.values(modes);
		},

		onDocumentRemoved(document: TextDocument): void {
			for (const mode of Object.values(modes)) {
				mode.onDocumentRemoved(document);
			}
		},

		dispose(): void {
			for (const mode of Object.values(modes)) {
				mode.dispose();
			}
		}
	};
}