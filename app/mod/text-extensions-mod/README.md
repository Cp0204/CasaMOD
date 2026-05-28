# text-extensions-mod

## Overview

This CasaMOD module injects an **"Edit as Text"** button into the CasaOS file detail popup, allowing you to edit text files directly in the browser with syntax highlighting powered by CasaOS's built-in CodeMirror instance.

## Features

- 📝 **Text File Editing**: Edit your text files right in the CasaOS interface
- 🎨 **Syntax Highlighting**: Supports multiple file types with CodeMirror's monokai theme
- 💾 **Quick Save**: Save files with Ctrl+S (Windows/Linux) or Cmd+S (Mac)
- 🔢 **Line Numbers**: Track your position with line and column indicators
- 🎯 **Auto-Detection**: Automatically detects file paths from the file modal
- 🛡️ **Fallback Support**: Works with plain textarea if CodeMirror isn't available

## Supported File Extensions

By default, the following extensions are supported:

```
m3u, m3u8, strm, nfo, log, cfg, toml, ini, conf, properties, env,
htaccess, gitignore, editorconfig, dockerfile, makefile, lock, csv,
tsv, lst, pls, xspf, md
```

Plus all extensionless files (files without an extension).

## Configuration

To add or remove supported file extensions, edit the `EXTRA_TEXT_EXTENSIONS` array at the top of `mod.js`:

```javascript
const EXTRA_TEXT_EXTENSIONS = [
  "m3u", "m3u8", "strm", "nfo", "log", "cfg", "toml",
  // Add your extensions here
  "myext",
];
```

After making changes:
1. Restart CasaMOD
2. Hard-refresh your browser (Ctrl+Shift+R on Windows/Linux, Cmd+Shift+R on Mac)

## Supported Syntax Highlighting Modes

The module intelligently maps file extensions to CodeMirror modes. Highlighted modes include:

- **Shell**: `.sh`, `.bash`, `.zsh`, `Dockerfile`, `Makefile`, `.htaccess`
- **Markup**: `.xml`, `.svg`, `.html`, `.htm`, `.pug`
- **Styles**: `.css`, `.sass`, `.scss`, `.stylus`
- **Data**: `.yaml`, `.yml`
- **Code**: `.js`, `.ts`, `.json`, `.php`, `.py`, `.rb`, `.go`, `.rs`, `.lua`, `.sql`
- **Plain Text**: Everything else (markdown, config files, etc.)

## Usage

1. Open a file in CasaOS that has a supported extension
2. The file detail popup will show an **"✏️ Edit as Text"** button
3. Click the button to open the editor
4. Make your changes and click **Save** (or press Ctrl+S / Cmd+S)
5. Close the editor with the **✕** button or press Escape

## Editor Features

- **Keyboard Shortcuts**:
  - **Ctrl+S / Cmd+S**: Save the file
  - **Tab**: Insert 2-space indentation
  - **Escape**: Close the editor (with unsaved change warning)

- **Status Bar**: Shows current file path and cursor position (Ln X, Col Y)

- **Mode Badge**: Displays the detected syntax highlighting mode

## Error Handling

- If the file path cannot be auto-detected, you'll be prompted to paste the full path (e.g., `/DATA/Media/TV.m3u`)
- If a file fails to load, an error message is displayed in the editor
- If CodeMirror is unavailable, a plain textarea with line numbers is used as fallback

## Requirements

- CasaOS with CasaMOD installed
- CodeMirror (built into CasaOS) for syntax highlighting

## Version

**v5.1** - Optimized text editor with improved UI and better file type detection

## License

Part of CasaMOD - [https://github.com/metisro/CasaMOD](https://github.com/metisro/CasaMOD)
