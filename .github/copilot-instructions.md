# Copilot Coding Agent Instructions for niri-config-kdl-language-service

## Project Overview

- **Purpose:** VS Code extension and language server for KDL files, with deep support for Niri Wayland Compositor configuration.

- **Major Components:**
  - `client/`: VS Code extension client (entry: `src/extension.ts`)
  - `server/`: Language server (entry: `src/server.ts`)
  - `syntaxes/`: TextMate grammar and language configuration for KDL

## Architecture & Data Flow

- **Single-mode LSP:** No embedded languages; all logic is in the KDL mode (`server/src/languageModes.ts`).
- **Document caching:** Uses `languageModelCache.ts` for efficient, versioned document model storage.
- **LSP Features:**
  - Incremental sync, push/pull diagnostics, context-aware completions, per-document settings.
  - Trigger characters: `"`, `(`, `{`, `=`, ` `, `#`.
- **Completions:**
  - Context-sensitive: node names, flags, properties, actions, values (see `NIRI_*` constants in `languageModes.ts`).
  - Niri-specific: key bindings, device/output blocks, toggle flags, property enums.

## Developer Workflows

- **Build:** `npm run compile` (or use VS Code build task)
- **Watch:** `npm run watch` (auto-recompiles on change)
- **Lint:** `npm run lint` (uses `eslint.config.mjs`)
- **Cleanup:** `./cleanup.sh` (removes build artifacts, node_modules, cache)
- **Debug:**
  - Launch with VS Code (`F5` or use `.vscode/launch.json`)
  - Server debug port: 6009 (`--inspect=6009`)
- **Test:** Open `.kdl` files and verify completions/diagnostics in VS Code

## Project Conventions & Patterns

- **Validation:**
  - Bare keywords (e.g. `true`) forbidden except as property values; must use `#true`.
  - Unclosed strings, invalid escapes, unmatched braces detected in `doValidation()`.
- **Completions:**
  - Context detection (block, property, after `=`) is key; see `doComplete()` logic.
  - Property completions filtered by block context (e.g. `output`, `layout`, `binds`).
  - Value completions for enums, booleans, colors, positions, etc.
- **Settings:**
  - User-configurable via `kdlLanguageServer.*` in VS Code settings.
  - See `package.json` and `README.md` for all options.
- **Extending:**
  - Add new validations/completions in `server/src/languageModes.ts`.
  - Update grammar in `syntaxes/kdl.tmLanguage.json`.

## Integration Points

- **LSP:** Uses `vscode-languageserver` and `vscode-languageclient` (see `package.json` in `server/` and `client/`).
- **Niri:** Completions and validation rules are tailored to [Niri's config spec](https://github.com/YaLTeR/niri/wiki/Configuration:-Introduction).
- **KDL:** Supports both KDL 1.0 and 2.0 features (multi-line/raw strings, type annotations, etc).

## Key Files

- `server/src/languageModes.ts`: Core of validation and completions logic
- `server/src/server.ts`: LSP server entry, document/config management
- `client/src/extension.ts`: VS Code extension entry
- `syntaxes/kdl.tmLanguage.json`: Syntax highlighting rules
- `language-configuration.json`: Editor behaviors (brackets, comments, folding)
- `README.md`, `server/README.md`, `server/NIRI_COMPLETIONS.md`: Deep-dive docs and examples

## Examples

- See `server/NIRI_COMPLETIONS.md` for property/action/value completion details
- See `README.md` for architecture, usage, and extension points

---
**For best results:**

- Always check block context and property name before suggesting completions.
- Use the cache for document models; avoid reparsing unchanged files.
- Follow the validation and completion patterns in `languageModes.ts` for consistency.
