# KDL Language Service for Niri Configuration

A comprehensive language server and VS Code extension providing full language support for KDL (KDL Document Language) files, with special optimizations for [Niri Wayland Compositor](https://github.com/YaLTeR/niri) configuration files.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue.svg)](https://www.typescriptlang.org/)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.100+-green.svg)](https://code.visualstudio.com/)

## NOTE

This is a work in progress.

## Features

### 🎯 Syntax Highlighting

- Full KDL 2.0 syntax support with TextMate grammar
- Special highlighting for Niri-specific constructs:
  - Key bindings (`Mod+Escape`, `Ctrl+Alt+T`)
  - Toggle flags (`tap`, `natural-scroll`, `numlock`)
  - Output device patterns (`output "eDP-1" {}`)
  - Property assignments with bare identifiers (`allow-inhibiting=false`)

### ✨ IntelliSense & Completions

- **Context-aware completions** based on cursor position
- **Niri configuration nodes**: `input`, `output`, `binds`, `layout`, `animations`, etc.
- **Key modifiers**: `Mod`, `Super`, `Alt`, `Ctrl`, `Shift`
- **Special keys**: All XF86 media keys, function keys, navigation keys
- **Actions**: `spawn`, `close-window`, `focus-column-left`, etc.
- **Properties**: `mode`, `scale`, `position`, `allow-inhibiting`, `cooldown-ms`, etc.
- **Values**: Both keyword form (`#true`, `#false`, `#null`) and bare identifiers

### 🔍 Validation & Diagnostics

- **Forbidden bare keywords**: Detects keywords without `#` prefix (except as property values)
- **Unclosed strings**: Identifies missing closing quotes
- **Invalid escape sequences**: Validates string escape codes
- **Unmatched braces**: Warns about missing `{` or `}`

### 🎨 Editor Features

- **Smart bracket matching** and auto-closing
- **Comment toggling** (`//` and `/* */`)
- **Code folding** for nested blocks
- **Indentation rules** for clean formatting
- **Region markers** (`#region` / `#endregion`)
- **Multi-line string support** with `"""`

## Installation

### From Source (Development)

1. Clone the repository:

  ```sh
  git clone https://github.com/Phyxashun/niri-config-kdl-language-service.git
  cd niri-config-kdl-language-service
  ```

2. Install dependencies:

  ```sh
  npm run postinstall
  ```

3. Compile the extension:

  ```sh
  npm run compile
  ```

4. Open in VS Code and press `F5` to launch Extension Development Host

### From VSIX Package (Coming Soon)

```bash
code --install-extension kdl-language-service-x.x.x.vsix
```

## Usage

### Opening KDL Files

The extension automatically activates for files with `.kdl` extension, including:

- `~/.config/niri/config.kdl` (Niri configuration)
- Any other `.kdl` files

### Configuration Settings

Access settings via `File → Preferences → Settings` and search for "kdl":

```json
{
  "kdlLanguageServer.validate": true,
  "kdlLanguageServer.maxNumberOfProblems": 100,
  "kdlLanguageServer.trace.server": "off"
}
```

| Setting                                 | Type    | Default | Description                  |
| --------------------------------------- | ------- | ------- | ---------------------------- |
| `kdlLanguageServer.validate`            | boolean | `true`  | Enable/disable validation    |
| `kdlLanguageServer.maxNumberOfProblems` | number  | `100`   | Maximum diagnostics per file |
| `kdlLanguageServer.trace.server`        | string  | `"off"` | LSP communication tracing    |

### Keybindings in Niri Config

The extension provides intelligent completions for Niri key bindings:

```kdl
binds {
    // Type 'Mod+' to see key suggestions
    Mod+Escape allow-inhibiting=false { toggle-keyboard-shortcuts-inhibit; }
    
    // Type 'XF86' to see media key suggestions
    XF86AudioRaiseVolume allow-when-locked=true { spawn-sh "wpctl set-volume @DEFAULT_AUDIO_SINK@ 0.1+"; }
    
    // Context-aware action completions
    Mod+Q repeat=false { close-window; }
}
```

### Auto-Completion

Press `Ctrl+Space` to trigger completions:

- **In `binds {}` blocks**: Key modifiers, special keys, and actions
- **At line start**: Node names and toggle flags
- **After `=`**: Values (both bare and keyword forms)
- **In any block**: Child node suggestions

## KDL Language Support

This extension supports both KDL 1.0 (used by Niri) and KDL 2.0 specifications:

### KDL 1.0 (Niri)

- Node-based configuration
- Properties with `key=value` syntax
- Children blocks with `{ }`
- Comments with `//` and `/* */`
- Slashdash comments `/-` for disabling sections

### KDL 2.0 Features

- Type annotations `(type)value`
- Multi-line strings with `"""`
- Raw strings with `#"text"#`
- All numeric formats (hex, octal, binary)
- Unicode escapes `\u{...}`

## Architecture

```text
niri-config-kdl-language-service/
├── client/                          # VS Code extension client
│   └── src/
│       └── extension.ts            # Extension entry point
├── server/                          # Language server
│   └── src/
│       ├── server.ts               # LSP server implementation
│       ├── languageModes.ts        # KDL language mode
│       └── languageModelCache.ts   # Document caching
├── syntaxes/
│   └── kdl.tmLanguage.json        # TextMate grammar
├── language-configuration.json     # Editor features config
└── package.json                    # Extension manifest
```

### Technology Stack

- **Language Server Protocol (LSP)**: `vscode-languageserver` 9.0.1
- **TypeScript**: 5.9.3
- **Node.js**: 14.0+
- **VS Code Engine**: 1.100+

## Credits & References

This extension was built using knowledge and patterns from the following resources:

### KDL Specification

- **KDL Official Specification** (v2.0.0): [https://kdl.dev/spec/](https://kdl.dev/spec/)
- **KDL v1.0 Specification**: [https://kdl.dev/spec-v1](https://kdl.dev/spec-v1)

### Niri Wayland Compositor

- **Niri Project**: [https://github.com/YaLTeR/niri](https://github.com/YaLTeR/niri)
- **Niri Configuration Documentation**: [https://yalter.github.io/niri/Configuration%3A-Introduction.html](https://yalter.github.io/niri/Configuration%3A-Introduction.html)
- **Default config.kdl**: [https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl](https://github.com/YaLTeR/niri/blob/main/resources/default-config.kdl)

### Existing KDL Tooling

- **vscode-kdl Extension**: [https://github.com/kdl-org/vscode-kdl](https://github.com/kdl-org/vscode-kdl)
  - Referenced for TextMate grammar patterns
  - Base patterns adapted and extended for Niri support

### Language Server Development

- **TextMate Manual**: [https://macromates.com/textmate/manual/](https://macromates.com/textmate/manual/)
  - Language grammar development
- **VS Code Language Extensions Guide**: [https://code.visualstudio.com/api/language-extensions/overview](https://code.visualstudio.com/api/language-extensions/overview)
- **LSP Specification**: [https://microsoft.github.io/language-server-protocol/](https://microsoft.github.io/language-server-protocol/)

## Development

### Prerequisites

- Node.js 14.0 or higher
- npm or yarn
- VS Code 1.100 or higher

### Building

```bash
# Install dependencies
npm run postinstall

# Compile TypeScript
npm run compile

# Watch mode (auto-recompile on changes)
npm run watch
```

### Debugging

1. Open the project in VS Code
2. Press `F5` to launch Extension Development Host
3. Open a `.kdl` file in the development instance
4. Check Output panel → "KDL Language Server" for logs

To enable verbose logging:

```json
{
  "kdlLanguageServer.trace.server": "verbose"
}
```

### Project Structure

- **client/**: VS Code extension that launches the language server
- **server/**: Language server implementing LSP
  - `server.ts`: Main server, handles LSP connection and requests
  - `languageModes.ts`: KDL-specific validation and completions
  - `languageModelCache.ts`: Efficient document caching
- **syntaxes/**: TextMate grammar for syntax highlighting
- **language-configuration.json**: Bracket matching, comments, indentation

### Adding New Features

#### Add Validation

Edit `server/src/languageModes.ts` → `doValidation()` method

#### Add Completions

Edit `server/src/languageModes.ts` → `doComplete()` method

#### Update Syntax Highlighting

Edit `syntaxes/kdl.tmLanguage.json`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Areas for Improvement

- [ ] Hover information for nodes and properties
- [ ] Go to definition for node references
- [ ] Document formatting
- [ ] Code actions (quick fixes)
- [ ] Semantic tokens for advanced highlighting
- [ ] Full KDL parser for more accurate validation
- [ ] Snippets for common Niri patterns
- [ ] Schema validation for Niri config

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- **KDL Team** for creating the KDL specification
- **YaLTeR** for the Niri Wayland Compositor
- **kdl-org** for the original vscode-kdl extension
- **Microsoft** for VS Code and LSP documentation
- **Claude AI** for development assistance

## Support

- **Issues**: [GitHub Issues](https://github.com/Phyxashun/niri-config-kdl-language-service/issues)
- **Niri Community**: [Matrix Chat](https://matrix.to/#/#niri:matrix.org)
- **KDL Community**: [GitHub Discussions](https://github.com/kdl-org/kdl/discussions)

## Changelog

### v1.0.0 (Initial Release)

- Full KDL 1.0 and 2.0 syntax support
- Niri-specific completions and validation
- Context-aware IntelliSense
- Key binding support with modifiers
- Property value validation
- Smart bracket matching and folding

---

**Happy configuring!** 🚀

If you find this extension useful, please consider starring the repository on GitHub!
