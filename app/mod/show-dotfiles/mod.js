/**
 * CasaMOD: show-dotfiles v1.0.0
 * Button: injects a toggle into the CasaOS settings dropdown.
 * Files:  after the file manager renders, finds the Vue component instance
 *         and pushes dotfiles directly into its reactive fileList data,
 *         avoiding all XHR/fetch interception timing issues.
 */
(function () {
  "use strict";

  const STORAGE_KEY = "casamod_show_dotfiles";
  let showDotfiles = localStorage.getItem(STORAGE_KEY) !== "false";

  // ─── Token ────────────────────────────────────────────────────────────────
  function token() {
    try {
      return document.querySelector("#app").__vue__.$store.state.access_token || "";
    } catch (_) {
      return localStorage.getItem("access_token") || "";
    }
  }

  // ─── Fetch dotfiles for a directory ───────────────────────────────────────
  async function getDotfiles(dirPath) {
    try {
      const url = `/v1/folder?path=${encodeURIComponent(dirPath)}&show_hidden=1`;
      const res = await fetch(url, {
        method: "GET",
        headers: { Authorization: token(), Accept: "application/json" },
        credentials: "include",
      });
      if (!res.ok) return [];
      const json = await res.json();
      const content = json?.data?.content;
      if (!Array.isArray(content)) return [];
      return content.filter((f) => f.name && f.name.startsWith("."));
    } catch {
      return [];
    }
  }

  // ─── Find the file-panel Vue instance ────────────────────────────────────
  function findFilePanel() {
    function walk(vm) {
      if (!vm) return null;
      if (vm.$options?.name === 'file-panel') return vm;
      for (const c of vm.$children || []) {
        const found = walk(c);
        if (found) return found;
      }
      return null;
    }
    return walk(document.querySelector('#app').__vue__);
  }

  // ─── Inject dotfiles into Vue reactive data ───────────────────────────────
  async function injectDotfilesIntoVue() {
    if (!showDotfiles) return;

    const fp = findFilePanel();
    if (!fp || !Array.isArray(fp.listData) || fp.listData.length === 0) return;

    const dirPath = fp.currentPath;
    if (!dirPath) return;

    const dots = await getDotfiles(dirPath);
    if (dots.length === 0) return;

    const existingNames = new Set(fp.listData.map((f) => f.name));
    let added = 0;
    dots.forEach((df) => {
      if (!existingNames.has(df.name)) {
        fp.listData.push(df);
        added++;
      }
    });

    if (added > 0) {
      fp.listData.sort((a, b) => {
        if (a.is_dir !== b.is_dir) return a.is_dir ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
      // Update the "Total X items" label directly in the DOM
      const totalLabel = document.querySelector(".control-label");
      if (totalLabel && totalLabel.textContent.includes("Total")) {
        totalLabel.textContent = ` Total ${fp.listData.length} items `;
      }
      console.info(`[show-dotfiles] Injected ${added} dotfile(s) into ${dirPath}`);
    }
  }

  // ─── Watch for file list renders ──────────────────────────────────────────
  // After each XHR to /v1/folder completes, give Vue 300ms to render,
  // then inject dotfiles into the Vue instance.
  const _origOpen = XMLHttpRequest.prototype.open;
  const _origSend = XMLHttpRequest.prototype.send;

  XMLHttpRequest.prototype.open = function (method, url) {
    this._casamod_url = url;
    return _origOpen.apply(this, arguments);
  };

  XMLHttpRequest.prototype.send = function () {
    const url = this._casamod_url || "";
    const isDirList = /\/v1\/folder(\?|$)/i.test(url) && !url.includes("show_hidden=1");

    if (isDirList && showDotfiles) {
      this.addEventListener("load", () => {
        clearTimeout(injectDotfilesIntoVue._timer);
        injectDotfilesIntoVue._timer = setTimeout(injectDotfilesIntoVue, 300);
      });
    }
    return _origSend.apply(this, arguments);
  };

  // ─── Settings menu injection ───────────────────────────────────────────────
  function buildSettingsRow() {
    const row = document.createElement("div");
    row.id = "casamod-dotfiles-row";
    row.className =
      "is-flex is-align-items-center mb-1 _is-large _box hover-effect _is-radius pr-2 mr-4 ml-4";

    const checked = showDotfiles ? 'checked=""' : "";

    row.innerHTML = `
      <div class="is-flex is-align-items-center is-flex-grow-1 _is-normal">
        <span class="icon mr-1 ml-2 is-20">
          <i class="casa casa-show-search-outline is-size-5"></i>
        </span>
        Show hidden dot files
      </div>
      <div>
        <div class="field">
          <label class="switch is-flex-direction-row-reverse mr-0 _small is-rounded"
                 style="cursor:pointer">
            <input id="casamod-dotfiles-checkbox" type="checkbox"
                   ${showDotfiles ? "checked" : ""}>
            <span class="check is-dark"></span>
          </label>
        </div>
      </div>`;

    // Bulma's BDropdown closes via a document-level capture listener.
    // We must intercept at capture phase too.
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, true);
    row.addEventListener("click", (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, false);

    const checkbox = row.querySelector("#casamod-dotfiles-checkbox");
    const label = row.querySelector("label");

    label.addEventListener("click", (e) => {
      e.stopPropagation();
      e.stopImmediatePropagation();
    }, true);

    checkbox.addEventListener("change", (e) => {
      e.stopPropagation();
      showDotfiles = checkbox.checked;
      localStorage.setItem(STORAGE_KEY, String(showDotfiles));
      triggerFileRefresh();
    });

    return row;
  }

  function injectSettingsRow() {
    // Already injected?
    // The settings dropdown must be open / in the DOM
    const usbIcon = document.querySelector(".dropdown-content .casa-usb-outline");
    if (!usbIcon) return false;

    const usbRow = usbIcon.closest("._box");
    if (!usbRow) return false;

    // Only skip if our row is already the next sibling (still attached after this exact usbRow)
    const next = usbRow.nextElementSibling;
    if (next && next.id === "casamod-dotfiles-row") return true;

    const row = buildSettingsRow();
    usbRow.parentNode.insertBefore(row, usbRow.nextSibling);

    // Block Bulma's document-level capture handler from seeing clicks on our row.
    // Bulma adds its close listener to document with useCapture=false (bubble),
    // but we add ours with useCapture=true so it runs first in the capture phase
    // and stops the event entirely before it reaches Bulma.
    document.addEventListener("click", (e) => {
      if (row.contains(e.target)) {
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    }, true);

    return true;
  }

  // ─── File manager refresh ─────────────────────────────────────────────────
  function triggerFileRefresh() {
    // CasaOS file manager has a path bar or breadcrumb; clicking back+forward
    // in the SPA router is the cleanest way to force a re-fetch.
    // Dispatch a custom event that the file manager might listen for.
    window.dispatchEvent(new CustomEvent("casaos:refresh-files"));

    // Also try clicking a visible refresh button if the file manager is open
    for (const sel of [
      "[class*='refresh']",
      "[title*='refresh' i]",
      "[aria-label*='refresh' i]",
    ]) {
      const el = document.querySelector(sel);
      if (el) { el.click(); break; }
    }
  }

  // ─── MutationObserver: watch for settings dropdown opening ────────────────
  let injectTimer = null;
  const observer = new MutationObserver(() => {
    clearTimeout(injectTimer);
    injectTimer = setTimeout(() => {
      if (injectSettingsRow()) {
        // Disconnect until the dropdown closes, then re-arm
        observer.disconnect();
        const closeWatcher = new MutationObserver(() => {
          if (!document.querySelector(".dropdown-content .casa-usb-outline")) {
            closeWatcher.disconnect();
            observer.observe(document.body, { childList: true, subtree: true });
          }
        });
        closeWatcher.observe(document.body, { childList: true, subtree: true });
      }
    }, 200);
  });
  observer.observe(document.body, { childList: true, subtree: true });

  console.info("[CasaMOD] show-dotfiles v1.0.0 loaded. Token present:", !!token());
})();
