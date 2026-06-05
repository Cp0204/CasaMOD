# CasaMOD - show-dotfiles v1.0.0

Show hidden dot files (`.env`, `.gitignore`, `.ssh`, etc.) in the CasaOS file manager.

## Features

- Toggle in the **Settings dropdown** (gear icon) under "Automount USB drive"
- Dotfiles appear alongside regular files, sorted folders-first then alphabetically
- "Total X items" count updates to include dotfiles
- Toggle state persists across sessions via localStorage

## Known Issues

- Clicking the toggle causes the Settings dropdown to close (Bulma's dropdown close handler cannot be fully intercepted from a mod context). The toggle still works — just reopen Settings to verify the state.

## Install

1. Copy the `show-dotfiles` folder to `/DATA/AppData/casamod/mod/show-dotfiles/`
2. Restart CasaMOD: `docker restart casamod` - or restart CasaMOD from CasaOS interface
3. Hard-refresh the browser (`Ctrl+Shift+R`)

## How it works

- Patches `XMLHttpRequest.prototype.send` to detect `/v1/folder` requests
- After Vue renders the file list, finds the `file-panel` Vue component and pushes dotfiles directly into its reactive `listData` array via a second authenticated request to `/v1/folder?show_hidden=1`
- Injects a toggle row into the Settings dropdown using a `MutationObserver`

## Compatibility

- CasaOS 0.4.x (tested on 0.4.15)
- CasaMOD required

## Author & License

- metisro
- Part of CasaMOD - [https://github.com/metisro/CasaMOD](https://github.com/metisro/CasaMOD)
