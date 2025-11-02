# Debugging Guide - Configuration Issues

## The Problem

The error you encountered:

```text
TypeError: Cannot read properties of null (reading 'validate')
```

This happened because the language server tried to access `settings.validate` but `settings` was `null`.

## Why It Happened

1. **No configuration registered**: VS Code didn't know about the `kdlLanguageServer` configuration section
2. **Null return value**: When configuration isn't registered, `workspace.getConfiguration()` can return `null`
3. **No null check**: The code assumed settings would always be valid

## The Fixes

### 1. Added Null Safety in `server.ts`

**Before:**

```typescript
if (!settings.validate) {
    // This crashes if settings is null
}
```

**After:**

```typescript
if (!settings || settings.validate === false) {
    // Now handles null safely
}
```

### 2. Added Default Values in `getDocumentSettings()`

```typescript
.then((config) => {
    // Ensure we always return valid settings
    return {
        maxNumberOfProblems: config?.maxNumberOfProblems ?? defaultSettings.maxNumberOfProblems,
        validate: config?.validate ?? defaultSettings.validate
    };
});
```

### 3. Registered Configuration in `package.json`

Added the `configuration` contribution point:

```json
"configuration": {
    "type": "object",
    "title": "KDL Language Server",
    "properties": {
        "kdlLanguageServer.validate": {
            "type": "boolean",
            "default": true,
            "description": "Enable/disable validation of KDL documents"
        },
        "kdlLanguageServer.maxNumberOfProblems": {
            "type": "number",
            "default": 100,
            "description": "Maximum number of problems to report per document"
        }
    }
}
```

## Testing the Fix

### 1. Rebuild Everything

```bash
npm run compile
```

### 2. Reload the Extension Development Host

- Press `Ctrl+Shift+F5` (or `Cmd+Shift+F5` on Mac)
- Or close and restart the Extension Development Host window

### 3. Open a KDL File

Open your Niri config:

```bash
~/.config/niri/config.kdl
```

### 4. Verify No Errors

Check the Output panel:

- View → Output
- Select "KDL Language Server" from dropdown
- Should see connection messages, no errors

### 5. Test Validation

Try adding an error to your config:

```kdl
// This should show an error (bare keyword without #)
test-node true
```

Should see a red squiggle under `true` with message:

```text
Bare keyword 'true' is not allowed. Use '#true' instead.
```

### 6. Test Completions

Type in your config:

```kdl
input {
    |  ← cursor here, press Ctrl+Space
}
```

Should see completions for:

- `keyboard`
- `touchpad`
- `mouse`
- `tap`
- `natural-scroll`
- etc.

## Configuration Settings

You can now configure the language server in VS Code settings:

### UI Settings

1. File → Preferences → Settings
2. Search for "kdl"
3. Adjust:
   - **KDL Language Server: Validate** - Enable/disable validation
   - **KDL Language Server: Max Number Of Problems** - Limit diagnostics

### JSON Settings

```json
{
    "kdlLanguageServer.validate": true,
    "kdlLanguageServer.maxNumberOfProblems": 100,
    "kdlLanguageServer.trace.server": "verbose"  // For debugging
}
```

## Debugging Tips

### Enable Verbose Logging

In settings.json:

```json
{
    "kdlLanguageServer.trace.server": "verbose"
}
```

Then check Output → "KDL Language Server" to see all LSP messages.

### Check Server is Running

Output should show:

```text
[Info  - 5:11:00 PM] Connection to server got closed. Server will restart.
[Info  - 5:11:00 PM] Starting server
```

### Verify Language ID

When you open a .kdl file, the status bar should show:

```text
KDL
```

If it shows "Plain Text", the language isn't registered correctly.

### Check File Association

In settings.json, ensure:

```json
{
    "files.associations": {
        "*.kdl": "kdl"
    }
}
```

## Common Issues

### Issue: No completions appear

**Solution:** Make sure cursor is in the right context:

- At line start for node names
- After `=` for values
- Inside `{}` blocks for child nodes

### Issue: Validation not working

**Solution:** Check settings:

```json
{
    "kdlLanguageServer.validate": true
}
```

### Issue: Server keeps restarting

**Solution:** Check for syntax errors in your TypeScript code:

```bash
npm run compile
```

### Issue: Changes not reflected

**Solution:** Rebuild and reload:

```bash
npm run compile
# Then press Ctrl+Shift+F5 in VS Code
```

## File Structure Checklist

Ensure you have all these files:

```text
project-root/
├── package.json                      ✓ Extension manifest with configuration
├── tsconfig.json                     ✓ Root build config
├── language-configuration.json       ✓ Comment/bracket settings
├── syntaxes/
│   └── kdl.tmLanguage.json          ✓ TextMate grammar
├── client/
│   ├── package.json                 ✓ Client dependencies
│   ├── tsconfig.json                ✓ Client build config
│   └── src/
│       └── extension.ts             ✓ Extension entry point
└── server/
    ├── package.json                 ✓ Server dependencies
    ├── tsconfig.json                ✓ Server build config
    └── src/
        ├── server.ts                ✓ Main server (updated)
        ├── languageModes.ts         ✓ KDL language implementation
        └── languageModelCache.ts    ✓ Caching utility
```

## Next Steps

After confirming everything works:

1. **Add more validations** in `languageModes.ts`
2. **Add hover information** for nodes and properties
3. **Add code actions** for quick fixes
4. **Add semantic highlighting**
5. **Publish to VS Code Marketplace**

## Success Indicators

✅ No errors in Output panel
✅ Red squiggles appear for invalid syntax
✅ Completions work (Ctrl+Space)
✅ Configuration settings are visible in VS Code
✅ Extension Development Host doesn't crash

If all these work, your language server is functioning correctly!
