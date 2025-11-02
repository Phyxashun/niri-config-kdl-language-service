/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
	CompletionList,
	CompletionItem,
	CompletionItemKind,
	Diagnostic,
	DiagnosticSeverity,
	Position,
	Range,
} from 'vscode-languageserver/node';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getLanguageModelCache, LanguageModelCache } from './languageModelCache';

export { Position, Range, CompletionList, CompletionItem, Diagnostic };

// ============================================================================
// Language Mode Interface
// ============================================================================
// Defines the capabilities that a language mode can provide

export interface LanguageMode {
	getId(): string;
	doValidation?: (document: TextDocument) => Diagnostic[];
	doComplete?: (document: TextDocument, position: Position) => CompletionList;
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

export interface LanguageModes {
	getMode(languageId: string): LanguageMode | undefined;
	getAllModes(): LanguageMode[];
	onDocumentRemoved(document: TextDocument): void;
	dispose(): void;
}

// ============================================================================
// KDL Syntax Patterns
// ============================================================================

// Forbidden bare keywords (must have # prefix)
//const FORBIDDEN_KEYWORDS = /\b(?<!#)(true|false|null|nan|(?:-)inf)\b/g;
const FORBIDDEN_KEYWORDS = /\b#?(true|false|null|nan|(?:-)?inf)\b/g;
const VALID_LITERAL = /^#?(true|false|null|nan|(?:-)?inf)$/;
const NONSTANDARD_PREFIX = /^#(true|false|null)$/;

// Common Niri configuration nodes
const NIRI_NODES = [
	'input', 'output', 'binds', 'layout', 'animations', 'window-rule',
	'keyboard', 'touchpad', 'mouse', 'trackpoint', 'xkb',
	'focus-ring', 'border', 'shadow', 'struts', 'hotkey-overlay',
	'preset-column-widths', 'preset-window-heights'
];

// Common Niri flag nodes (toggle options)
const NIRI_FLAGS = [
	'tap', 'dwt', 'dwtp', 'drag', 'drag-lock', 'natural-scroll',
	'numlock', 'off', 'prefer-no-csd', 'warp-mouse-to-focus',
	'skip-at-startup', 'disabled-on-external-mouse'
];

// Common Niri properties
const NIRI_PROPERTIES = [
	'mode', 'scale', 'transform', 'position', 'x', 'y',
	'gaps', 'width', 'height', 'offset', 'softness', 'spread',
	'accel-speed', 'accel-profile', 'scroll-method', 'scroll-button',
	'layout', 'variant', 'options', 'model', 'rules',
	'allow-inhibiting', 'repeat', 'cooldown-ms', 'hotkey-overlay-title'
];

// Common Niri key modifiers
const NIRI_KEY_MODIFIERS = [
	'Mod', 'Super', 'Alt', 'Ctrl', 'Shift'
];

// Common Niri special keys
const NIRI_SPECIAL_KEYS = [
	'Escape', 'Return', 'Space', 'Tab', 'Backspace', 'Delete',
	'Left', 'Right', 'Up', 'Down',
	'Home', 'End', 'Page_Up', 'Page_Down',
	'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12',
	'XF86AudioRaiseVolume', 'XF86AudioLowerVolume', 'XF86AudioMute',
	'XF86AudioMicMute', 'XF86AudioPlay', 'XF86AudioStop', 'XF86AudioPrev', 'XF86AudioNext',
	'XF86MonBrightnessUp', 'XF86MonBrightnessDown',
	'Print', 'WheelScrollDown', 'WheelScrollUp', 'WheelScrollLeft', 'WheelScrollRight',
	'TouchpadScrollDown', 'TouchpadScrollUp'
];

// Common Niri actions/commands
const NIRI_ACTIONS = [
	'spawn', 'spawn-sh', 'close-window', 'quit',
	'focus-column-left', 'focus-column-right', 'focus-window-up', 'focus-window-down',
	'move-column-left', 'move-column-right', 'move-window-up', 'move-window-down',
	'focus-workspace-up', 'focus-workspace-down', 'focus-monitor-left', 'focus-monitor-right',
	'maximize-column', 'fullscreen-window', 'toggle-window-floating',
	'screenshot', 'screenshot-screen', 'screenshot-window',
	'power-off-monitors', 'show-hotkey-overlay'
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a position in the text is inside a specific named block
 */
function isInBlock(text: string, offset: number, blockName: string): boolean {
	const beforeCursor = text.substring(0, offset);
	const blockPattern = new RegExp(`\\b${blockName}\\s*\\{`, 'g');
	let lastBlockStart = -1;
	let match;

	while ((match = blockPattern.exec(beforeCursor)) !== null) {
		lastBlockStart = match.index;
	}

	if (lastBlockStart === -1) return false;

	// Count braces to see if we're still inside
	const afterBlock = beforeCursor.substring(lastBlockStart);
	const openBraces = (afterBlock.match(/\{/g) || []).length;
	const closeBraces = (afterBlock.match(/\}/g) || []).length;

	return openBraces > closeBraces;
}

// ============================================================================
// KDL Language Mode
// ============================================================================

function findInvalidEscapes(kdlText: string): { string: string; invalid: string[] }[] {
	const stringRegex = /r(#+)?"(.*?)"\1?/gs;
	const invalidEscape = /\\(?!([nrtbf"\\]|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8}))/g;
	const results: { string: string; invalid: string[] }[] = [];

	for (const match of kdlText.matchAll(stringRegex)) {
		const isRaw = match[0].startsWith('r');
		if (isRaw) continue;

		const content = match[2];
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

				// Check for forbidden bare keywords
				// But allow them after '=' (as property values like allow-inhibiting=false)
				const beforeEquals = line.split('=')[0];
				const afterEquals = line.includes('=') ? line.split('=').slice(1).join('=') : '';
/*
				FORBIDDEN_KEYWORDS.lastIndex = 0;
				let match: RegExpExecArray | null;

				// Only check for forbidden keywords in the part before '='
				while ((match = FORBIDDEN_KEYWORDS.exec(beforeEquals))) {
					diagnostics.push({
						severity: DiagnosticSeverity.Hint,
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
				// (do this *after* the per-line checks)
				const invalidEscapes = findInvalidEscapes(text);
				for (const invalid of invalidEscapes) {
					for (const bad of invalid.invalid) {
						// Find position of invalid escape in the full document
						const idx = text.indexOf(bad, text.indexOf(invalid.string));
						if (idx === -1) continue;

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
			const isAfterEquals = /=\s*$/.test(linePrefix);
			const isAtLineStart = /^\s*$/.test(linePrefix);
			const isInBraces = /\{\s*$/.test(linePrefix);
			const isAfterNodeName = /^\s*\w+\s+$/.test(linePrefix);
			const isInBindsBlock = isInBlock(text, offset, 'binds');

			// Keybinding completions in binds block
			if (isInBindsBlock && isAtLineStart) {
				// Suggest key modifiers for bindings
				NIRI_KEY_MODIFIERS.forEach((mod, index) => {
					completions.push({
						label: `${mod}+`,
						kind: CompletionItemKind.Keyword,
						data: `modifier_${index}`,
						detail: 'Key modifier',
						insertText: `${mod}+`
					});
				});

				// Suggest special keys
				NIRI_SPECIAL_KEYS.forEach((key, index) => {
					completions.push({
						label: key,
						kind: CompletionItemKind.Constant,
						data: `key_${index}`,
						detail: 'Special key',
						insertText: key
					});
				});
			}

			// Node name completions (at line start or after opening brace)
			if ((isAtLineStart || isInBraces) && !isInBindsBlock) {
				NIRI_NODES.forEach((node, index) => {
					completions.push({
						label: node,
						kind: CompletionItemKind.Class,
						data: `node_${index}`,
						detail: `${node} configuration block`,
						insertText: node
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

			// Property completions
			if (!isAfterEquals && !isAtLineStart) {
				NIRI_PROPERTIES.forEach((prop, index) => {
					completions.push({
						label: prop,
						kind: CompletionItemKind.Property,
						data: `prop_${index}`,
						detail: `${prop} property`,
						insertText: `${prop}=`
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
						insertText: action
					});
				});
			}

			// Boolean/null completions (after =, or as arguments)
			if (isAfterEquals || isAfterNodeName) {
				completions.push(
					{
						label: '#true',
						kind: CompletionItemKind.Value,
						data: 'bool_true',
						detail: 'Boolean true value',
						insertText: '#true'
					},
					{
						label: '#false',
						kind: CompletionItemKind.Value,
						data: 'bool_false',
						detail: 'Boolean false value',
						insertText: '#false'
					},
					{
						label: '#null',
						kind: CompletionItemKind.Value,
						data: 'null',
						detail: 'Null value',
						insertText: '#null'
					},
					{
						label: 'true',
						kind: CompletionItemKind.Value,
						data: 'bare_true',
						detail: 'Bare true (identifier)',
						insertText: 'true'
					},
					{
						label: 'false',
						kind: CompletionItemKind.Value,
						data: 'bare_false',
						detail: 'Bare false (identifier)',
						insertText: 'false'
					}
				);
			}

			// String completions for common patterns
			if (isAfterEquals) {
				completions.push({
					label: '""',
					kind: CompletionItemKind.Snippet,
					data: 'string',
					detail: 'Empty string',
					insertText: '"$0"',
					insertTextFormat: 2 // Snippet format
				});
			}

			return CompletionList.create(completions, false);
		},

		onDocumentRemoved(_document: TextDocument) {
			// Nothing to clean up for KDL mode
		},

		dispose() {
			// Nothing to dispose for KDL mode
		}
	};
}

// ============================================================================
// Language Modes Manager
// ============================================================================

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