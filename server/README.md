# KDL Language Server Architecture

## Overview

This is a streamlined KDL language server for VS Code, optimized for both general KDL files and Niri Wayland Compositor configuration files. It's compatible with `vscode-languageserver` 9.0.1.

## File Structure

```text
server/
├── server.ts                  # Main language server entry point
├── languageModes.ts          # KDL language mode implementation
└── languageModelCache.ts     # Document caching utility
```

## Architecture Simplification

### What We Removed

The original example was based on the HTML language server which needed:

- **embeddedSupport.ts** - For CSS/JS embedded in HTML (not needed for KDL)
- **cssMode.ts** - CSS language support (not needed for KDL)
- **htmlMode.ts** - HTML language support (not needed for KDL)

KDL is a standalone format with no embedded languages, so we simplified to a single-mode architecture.

### What We Kept

- **languageModelCache.ts** - Useful for caching parsed documents efficiently
- **LanguageMode interface** - Clean abstraction for language capabilities
- **Configuration management** - Per-document settings support

## Key Components

### 1. server.ts

**Main language server** that handles:

- LSP connection management
- Document lifecycle (open, change, close)
- Configuration synchronization
- Diagnostic push/pull (LSP 3.17)
- Completion requests
- Workspace folder management

**Key Features:**

- Incremental document sync (efficient)
- Per-document settings cache
- Both push and pull diagnostics
- Trigger characters: `"`, `(`, `{`, `=`, ` `, `#`

### 2. languageModes.ts

**KDL-specific language implementation** providing:

#### Validation (`doValidation`)

- ✅ Forbidden bare keywords (`true` → `#true`)
- ✅ Unclosed string literals
- ✅ Invalid escape sequences
- ✅ Unmatched braces

#### Completion (`doComplete`)

Context-aware completions for:

- **Node names**: `input`, `output`, `binds`, `layout`, etc.
- **Flag nodes**: `tap`, `natural-scroll`, `numlock`, etc.
- **Properties**: `mode`, `scale`, `position`, `gaps`, etc.
- **Actions**: `spawn`, `close-window`, `focus-column-left`, etc.
- **Values**: `#true`, `#false`, `#null`

#### Smart Context Detection

- After `=` → suggests values
- At line start → suggests nodes and flags
- After node name → suggests actions
- In braces → suggests child nodes

### 3. languageModelCache.ts

**Efficient caching utility** that:

- Caches parsed documents by URI
- Invalidates on version/language changes
- Automatic cleanup of stale entries
- LRU eviction when max entries reached

**Usage:**

```typescript
const cache = getLanguageModelCache<MyModel>(
    10,    // max entries
    60,    // cleanup interval (seconds)
    parseDocument
);

const model = cache.get(document);
```

## Settings

Configure in VS Code settings:

```json
{
  "kdlLanguageServer.validate": true,
  "kdlLanguageServer.maxNumberOfProblems": 100
}
```

## LSP Capabilities

### Implemented

- ✅ Document synchronization (incremental)
- ✅ Diagnostics (push & pull)
- ✅ Code completion
- ✅ Completion resolve
- ✅ Configuration management
- ✅ Workspace folders

### Not Yet Implemented

- ⏳ Hover information
- ⏳ Go to definition
- ⏳ Find references
- ⏳ Document formatting
- ⏳ Code actions (quick fixes)
- ⏳ Semantic tokens

## Extension Points

### Adding More Validations

Edit `languageModes.ts` → `doValidation()`:

```typescript
// Example: Check for duplicate node names
const nodeNames = new Set<string>();
for (const match of line.matchAll(/^\s*(\w+)\s*\{/g)) {
    if (nodeNames.has(match[1])) {
        diagnostics.push({
            severity: DiagnosticSeverity.Warning,
            range: { ... },
            message: `Duplicate node '${match[1]}'`
        });
    }
    nodeNames.add(match[1]);
}
```

### Adding More Completions

Edit `languageModes.ts` → `NIRI_*` constants:

```typescript
const NIRI_NODES = [
    'input', 'output', 'binds',
    'your-new-node'  // Add here
];
```

### Adding Hover Information

Implement in `languageModes.ts`:

```typescript
export interface LanguageMode {
    // ... existing methods
    doHover?: (document: TextDocument, position: Position) => Hover | null;
}
```

Then register in `server.ts`:

```typescript
connection.onHover((params) => {
    const mode = languageModes.getMode('kdl');
    return mode?.doHover?.(document, params.position);
});
```

## Niri-Specific Features

### Flag Detection

Recognizes Niri's toggle pattern:

```kdl
touchpad {
    tap              # Present = enabled
    // natural-scroll  # Commented = disabled
}
```

### Output Pattern

Handles device-specific nodes:

```kdl
output "eDP-1" {
    mode "1920x1080@120"
    scale 2
}
```

### Action Completions

Provides all Niri action commands in `binds {}` blocks.

## Performance Considerations

1. **Incremental Sync** - Only sends changed text
2. **Document Cache** - Avoids reparsing unchanged documents
3. **Diagnostic Limits** - Respects `maxNumberOfProblems` setting
4. **Async Validation** - Doesn't block on validation
5. **Lazy Cleanup** - Periodic cache cleanup, not on every change

## Testing

Test with sample KDL files:

```kdl
// Should show error: bare keyword
node true

// Should show error: unclosed string
property "unclosed

// Should show error: invalid escape
text "\q"

// Should show completions
input {
    |  ← trigger completion here
}
```

## Debugging

Enable in launch.json:

```json
{
    "name": "Attach to Server",
    "type": "node",
    "request": "attach",
    "port": 6009,
    "restart": true,
    "outFiles": ["${workspaceFolder}/server/out/**/*.js"]
}
```

Server runs with `--inspect=6009` in debug mode (see extension.ts).

## Next Steps

Recommended enhancements:

1. Full KDL parser for accurate syntax tree
2. Semantic tokens for better syntax highlighting
3. Hover documentation for all nodes/properties
4. Code actions for quick fixes (add `#`, fix escapes)
5. Document symbols for outline view
6. Folding ranges for better code navigation
