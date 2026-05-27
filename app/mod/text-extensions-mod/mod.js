/**
 * CasaMOD: text-extensions v5.1
 * Injects an "Edit as Text" button into the CasaOS file detail popup.
 * Uses CasaOS's built-in CodeMirror instance for syntax highlighting.
 *
 * Edit EXTRA_TEXT_EXTENSIONS to add/remove extensions.
 * Restart CasaMOD + hard-refresh (Ctrl+Shift+R) after changes.
 */

(function () {
  "use strict";

  // ─── CONFIGURE YOUR EXTENSIONS HERE ──────────────────────────────────────────
  const EXTRA_TEXT_EXTENSIONS = [
    "m3u", "m3u8", "strm", "nfo", "log", "cfg", "toml",
    "ini", "conf", "properties", "env", "htaccess",
    "gitignore", "editorconfig", "dockerfile", "makefile",
    "lock", "csv", "tsv", "lst", "pls", "xspf", "md",
  ];
  // ─────────────────────────────────────────────────────────────────────────────

  // ── Map extensions to CodeMirror modes ───────────────────────────────────────
  // Only modes confirmed loaded AND rendering with monokai theme:
  //   shell, xml, htmlmixed, css, sass, stylus, pug, yaml,
  //   javascript, php, python, ruby, go, rust, lua, sql
  // Everything else → "null" (plain text, no broken half-colored output)
  const EXT_MODE_MAP = {
    // shell / config — good highlighting
    sh: "shell", bash: "shell", zsh: "shell",
    dockerfile: "shell", makefile: "shell", htaccess: "shell",
    // markup — good highlighting
    xml: "xml", svg: "xml",
    html: "htmlmixed", htm: "htmlmixed",
    pug: "pug",
    // styles — good highlighting
    css: "css", sass: "sass", scss: "sass", stylus: "stylus",
    // data — good highlighting
    yaml: "yaml", yml: "yaml",
    // code — good highlighting
    js: "javascript", ts: "javascript", json: "javascript",
    php: "php", py: "python", rb: "ruby",
    go: "go", rs: "rust", lua: "lua", sql: "sql",
    // ── plain text (no usable highlighting in monokai) ──
    md: "null", markdown: "null",       // markdown tokens not styled
    toml: "null", ini: "null", cfg: "null", conf: "null",
    env: "null", properties: "null", editorconfig: "null",
    lock: "null", gitignore: "null",
    m3u: "null", m3u8: "null", strm: "null",
    pls: "null", lst: "null", xspf: "null",
    nfo: "null", log: "null",
    csv: "null", tsv: "null",
  };

  function getExt(name) {
    if (!name) return "";
    const parts = name.split(".");
    if (parts.length === 1) return "";                      // no dot → no extension
    if (parts.length === 2 && parts[0] === "") return "";   // dotfile like .gitignore
    return parts.pop().toLowerCase();
  }

  function hasNoExtension(name) {
    if (!name) return false;
    const parts = name.split(".");
    return parts.length === 1 || (parts.length === 2 && parts[0] === "");
  }

  function isExtra(name) {
    if (hasNoExtension(name)) return true; // always offer edit for extensionless files
    return EXTRA_TEXT_EXTENSIONS.includes(getExt(name));
  }

  function getModeForFile(name) {
    if (hasNoExtension(name)) {
      const lower = (name || "").toLowerCase();
      if (lower === "dockerfile") return "shell";
      if (lower === "makefile" || lower === "gnumakefile") return "shell";
      if (lower === "vagrantfile") return "ruby";
      return "null";
    }
    return EXT_MODE_MAP[getExt(name)] || "null";
  }

  // ── Auth & path helpers ───────────────────────────────────────────────────────
  function getToken() {
    try {
      return document.querySelector("#app").__vue__.$store.state.access_token || "";
    } catch (_) { return ""; }
  }

  function getCurrentPath() {
    try {
      return document.querySelector("#app").__vue__.$store.state.currentPath || "";
    } catch (_) { return ""; }
  }

  function buildFilePath(fileName) {
    const modal = document.querySelector(".file-modal");
    if (modal) {
      const fromVue = getFilePathFromVue(modal);
      if (fromVue) return fromVue;
    }
    const dir = getCurrentPath().replace(/\/$/, "");
    return dir ? dir + "/" + fileName : null;
  }

  // ── Get CodeMirror constructor from CasaOS's existing instance ────────────────
  function getCodeMirror() {
    try {
      const el = document.querySelector(".CodeMirror");
      if (el && el.CodeMirror) return el.CodeMirror.constructor;
    } catch (_) {}
    return null;
  }

  // ── Watch for the file detail modal ──────────────────────────────────────────
  new MutationObserver(function (mutations) {
    for (const m of mutations) {
      for (const node of m.addedNodes) {
        if (node.nodeType !== 1) continue;
        const modals = node.classList?.contains("file-modal")
          ? [node]
          : [...(node.querySelectorAll?.(".file-modal") || [])];
        for (const modal of modals) injectButton(modal);
        if (node.closest?.(".file-modal")) injectButton(node.closest(".file-modal"));
      }
    }
  }).observe(document.body, { childList: true, subtree: true });

  function injectButton(modal) {
    if (modal.querySelector("#tex-edit-btn")) return;

    const titleEl = modal.querySelector("p.title");
    if (!titleEl) return;
    const fileName = titleEl.textContent.trim();
    if (!isExtra(fileName)) return;

    const btnContainer = modal.querySelector(".buttons");
    const downloadBtn = modal.querySelector("button.is-primary");
    if (!btnContainer || !downloadBtn) return;

    const editBtn = document.createElement("button");
    editBtn.id = "tex-edit-btn";
    editBtn.type = "button";
    editBtn.className = "button is-info";
    editBtn.style.cssText = "margin-left:8px;";
    editBtn.innerHTML = "<span>✏️ Edit as Text</span>";

    editBtn.addEventListener("click", async function (e) {
      e.stopPropagation();
      const filePath = buildFilePath(fileName);
      if (!filePath) {
        const manual = prompt("Could not auto-detect file path.\nPlease paste the full path (e.g. /DATA/Media/TV.m3u):");
        if (!manual) return;
        closeModal(modal);
        await openEditor(manual.trim(), fileName);
        return;
      }
      closeModal(modal);
      await openEditor(filePath, fileName);
    });

    btnContainer.appendChild(editBtn);
    console.log("[CasaMOD text-extensions] Button injected for:", fileName);
  }

  function closeModal(modal) {
    const closeBtn = modal.querySelector(".close-button, .casa-close-outline")?.closest("span, button");
    if (closeBtn) closeBtn.click();
    else modal.classList.remove("is-active");
  }

  // ── Vue path extraction ───────────────────────────────────────────────────────
  function getFilePathFromVue(modal) {
    const candidates = [...getAncestors(modal), modal, ...modal.querySelectorAll("*")];
    for (const el of candidates) {
      const vm = el.__vue__;
      if (!vm) continue;
      const path = searchVmForPath(vm, 8);
      if (path) return path;
    }
    return null;
  }

  function searchVmForPath(vm, depth) {
    if (!vm || depth <= 0) return null;
    const pathKeys = ["filePath", "path", "currentFilePath", "selectPath",
      "file", "currentFile", "selectFile", "item", "node", "fileInfo", "fileData", "detail"];
    for (const key of pathKeys) {
      for (const src of [vm, vm.$props, vm.$data, vm._data]) {
        if (!src) continue;
        const val = src[key];
        if (!val) continue;
        if (typeof val === "string" && val.startsWith("/")) return val;
        if (typeof val === "object" && typeof val.path === "string") return val.path;
      }
    }
    return searchVmForPath(vm.$parent, depth - 1);
  }

  function getAncestors(el) {
    const result = [];
    let node = el.parentElement;
    while (node) { result.push(node); node = node.parentElement; }
    return result;
  }

  // ── Open editor ───────────────────────────────────────────────────────────────
  async function openEditor(filePath, fileName) {
    if (document.getElementById("text-ext-overlay")) return;

    const token = getToken();
    let content = "";
    try {
      const resp = await fetch(
        `/v1/file?path=${encodeURIComponent(filePath)}&timestamp=${Date.now()}`,
        {
          method: "GET",
          headers: {
            Authorization: token,
            Accept: "application/json, text/plain, */*",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          credentials: "include",
        }
      );
      content = resp.ok
        ? await resp.text()
        : `[Error ${resp.status}: ${resp.statusText}]\n\nPath tried: ${filePath}`;
    } catch (err) {
      content = `[Error loading file: ${err.message}]`;
    }

    showModal(filePath, fileName, content);
  }

  // ── Editor modal ──────────────────────────────────────────────────────────────
  function showModal(filePath, fileName, content) {
    const CodeMirror = getCodeMirror();

    // ── Overlay ──
    const overlay = document.createElement("div");
    overlay.id = "text-ext-overlay";
    overlay.style.cssText = [
      "position:fixed;inset:0;z-index:99999",
      "background:rgba(0,0,0,.72)",
      "display:flex;align-items:center;justify-content:center",
    ].join(";");

    // ── Dialog ──
    const dialog = document.createElement("div");
    dialog.style.cssText = [
      "background:#272822;color:#f8f8f2;border-radius:12px",
      "width:100%;height:100%",
      "display:flex;flex-direction:column",
      "box-shadow:0 12px 48px rgba(0,0,0,.7);overflow:hidden",
      "font-family:system-ui,sans-serif",
    ].join(";");

    // ── Header ──
    const header = document.createElement("div");
    header.style.cssText = [
      "display:flex;align-items:center;justify-content:space-between",
      "padding:10px 16px;background:#1e1f1c",
      "border-bottom:1px solid #3e3d32;flex-shrink:0",
    ].join(";");

    const titleSpan = document.createElement("span");
    titleSpan.style.cssText = "font-size:13px;font-weight:600;opacity:.9;color:#f8f8f2;";
    titleSpan.textContent = "📄 " + fileName;

    const btnRow = document.createElement("div");
    btnRow.style.cssText = "display:flex;gap:8px;align-items:center;";

    // Mode badge
    const modeName = getModeForFile(fileName);
    const modeBadge = document.createElement("span");
    modeBadge.style.cssText = [
      "font-size:11px;padding:2px 8px;border-radius:20px",
      "background:#3e3d32;color:#a6e22e;font-family:monospace",
    ].join(";");
    modeBadge.textContent = modeName === "null" ? "plain text" : modeName;

    const saveBtn = document.createElement("button");
    saveBtn.textContent = "Save";
    saveBtn.style.cssText = [
      "padding:5px 18px;border-radius:30px;border:none;cursor:pointer",
      "background:#48c78e;color:#fff;font-weight:700;font-size:13px",
    ].join(";");

    const closeBtn = document.createElement("button");
    closeBtn.textContent = "✕";
    closeBtn.style.cssText = [
      "padding:5px 12px;border-radius:30px;border:none;cursor:pointer",
      "background:#3e3d32;color:#f92672;font-size:13px",
    ].join(";");

    btnRow.appendChild(modeBadge);
    btnRow.appendChild(saveBtn);
    btnRow.appendChild(closeBtn);
    header.appendChild(titleSpan);
    header.appendChild(btnRow);

    // ── Editor area ──
    const editorWrap = document.createElement("div");
    editorWrap.style.cssText = "flex:1;overflow:hidden;display:flex;flex-direction:column;";

    // ── Status bar ──
    const statusBar = document.createElement("div");
    statusBar.style.cssText = [
      "padding:3px 16px;font-size:11px;color:#75715e",
      "background:#1e1f1c;border-top:1px solid #3e3d32",
      "flex-shrink:0;display:flex;justify-content:space-between",
      "font-family:monospace;",
    ].join(";");
    const statusPath = document.createElement("span");
    statusPath.textContent = filePath;
    const statusPos = document.createElement("span");
    statusPos.textContent = "Ln 1, Col 1";
    statusBar.appendChild(statusPath);
    statusBar.appendChild(statusPos);

    dialog.appendChild(header);
    dialog.appendChild(editorWrap);
    dialog.appendChild(statusBar);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    // ── Dirty tracking ──
    let isDirty = false;

    // ── Close handler ──
    const close = () => {
      if (isDirty && !confirm("You have unsaved changes. Close anyway?")) return;
      overlay.remove();
      document.removeEventListener("keydown", globalKeyHandler);
    };
    closeBtn.onclick = close;
    overlay.addEventListener("click", e => { if (e.target === overlay) close(); });

    // ── CodeMirror path ──
    if (CodeMirror) {
      const cmHost = document.createElement("div");
      cmHost.style.cssText = "flex:1;overflow:hidden;";
      editorWrap.appendChild(cmHost);

      const cm = CodeMirror(cmHost, {
        value: content,
        mode: getModeForFile(fileName),
        theme: "monokai",
        lineNumbers: true,
        lineWrapping: false,
        tabSize: 2,
        indentWithTabs: false,
        autofocus: true,
        extraKeys: {
          "Ctrl-S": () => saveBtn.click(),
          "Cmd-S":  () => saveBtn.click(),
        },
      });

      // Fill the host height
      cm.setSize("100%", "100%");

      // Status bar cursor updates
      cm.on("cursorActivity", () => {
        const cur = cm.getCursor();
        statusPos.textContent = `Ln ${cur.line + 1}, Col ${cur.ch + 1}`;
      });

      // Dirty tracking
      cm.on("change", () => { isDirty = true; });

      // Save
      saveBtn.onclick = async () => {
        await saveFile(filePath, cm.getValue(), saveBtn, getToken());
        isDirty = false;
      };

    } else {
      // ── Fallback: plain textarea with line numbers ──
      console.warn("[CasaMOD text-extensions] CodeMirror not found, using plain textarea.");

      const fallbackWrap = document.createElement("div");
      fallbackWrap.style.cssText = "flex:1;display:flex;overflow:hidden;background:#272822;";

      const lineNumbers = document.createElement("div");
      lineNumbers.style.cssText = [
        "padding:16px 8px;text-align:right;color:#75715e;background:#1e1f1c",
        "font-family:ui-monospace,monospace;font-size:13px;line-height:1.65",
        "user-select:none;overflow:hidden;white-space:pre;flex-shrink:0;",
      ].join(";");

      const textarea = document.createElement("textarea");
      textarea.value = content;
      textarea.spellcheck = false;
      textarea.style.cssText = [
        "flex:1;resize:none;border:none;outline:none;padding:16px",
        "background:#272822;color:#f8f8f2",
        "font-family:ui-monospace,monospace;font-size:13px;line-height:1.65;tab-size:2;",
      ].join(";");

      function updateLineNumbers() {
        const total = textarea.value.split("\n").length;
        const pad = String(total).length;
        lineNumbers.style.width = (pad * 9 + 20) + "px";
        let out = "";
        for (let i = 1; i <= total; i++) out += String(i).padStart(pad, " ") + "\n";
        lineNumbers.textContent = out;
      }

      textarea.addEventListener("input", () => { isDirty = true; updateLineNumbers(); });
      textarea.addEventListener("change", updateLineNumbers);
      textarea.addEventListener("scroll", () => { lineNumbers.scrollTop = textarea.scrollTop; });
      textarea.addEventListener("click", updateStatus);
      textarea.addEventListener("keyup", updateStatus);

      function updateStatus() {
        const lines = textarea.value.slice(0, textarea.selectionStart).split("\n");
        statusPos.textContent = `Ln ${lines.length}, Col ${lines[lines.length - 1].length + 1}`;
      }

      // Tab key → indent
      textarea.addEventListener("keydown", e => {
        if (e.key === "Tab") {
          e.preventDefault();
          const s = textarea.selectionStart;
          const end = textarea.selectionEnd;
          textarea.value = textarea.value.slice(0, s) + "  " + textarea.value.slice(end);
          textarea.selectionStart = textarea.selectionEnd = s + 2;
          updateLineNumbers();
        }
      });

      updateLineNumbers();
      fallbackWrap.appendChild(lineNumbers);
      fallbackWrap.appendChild(textarea);
      editorWrap.appendChild(fallbackWrap);
      textarea.focus();

      saveBtn.onclick = async () => {
        await saveFile(filePath, textarea.value, saveBtn, getToken());
        isDirty = false;
      };
    }

    // ── Global keyboard shortcuts ──
    function globalKeyHandler(e) {
      if (e.key === "Escape") close();
      // Ctrl/Cmd+S handled by CodeMirror extraKeys above;
      // add it here too for the textarea fallback
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        saveBtn.click();
      }
    }
    document.addEventListener("keydown", globalKeyHandler);
  }

  // ── Save helper ───────────────────────────────────────────────────────────────
  async function saveFile(filePath, value, saveBtn, token) {
    saveBtn.textContent = "Saving…";
    saveBtn.disabled = true;
    try {
      const r = await fetch("/v1/file", {
        method: "PUT",
        headers: {
          Authorization: token,
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json;charset=UTF-8",
        },
        credentials: "include",
        body: JSON.stringify({ path: filePath, content: value }),
      });
      if (r.ok) {
        saveBtn.textContent = "Saved ✓";
        setTimeout(() => { saveBtn.textContent = "Save"; saveBtn.disabled = false; }, 1800);
      } else {
        const j = await r.json().catch(() => ({}));
        alert("Save failed: " + (j.message || r.statusText));
        saveBtn.textContent = "Save";
        saveBtn.disabled = false;
      }
    } catch (err) {
      alert("Save failed: " + err.message);
      saveBtn.textContent = "Save";
      saveBtn.disabled = false;
    }
  }

  console.log("[CasaMOD] text-extensions v5.1 loaded ✓  extra extensions:", EXTRA_TEXT_EXTENSIONS.join(", "));
})();
