/**
 * BEE Modular — Frontend CMS
 * Lightweight vanilla JS inline image editor.
 * Activation: add ?edit=true to the URL, or set localStorage bee-cms-edit=true
 * Images with data-cms="true" become click-to-replace when edit mode is on.
 * Replacements persist in localStorage; Export downloads a JSON manifest.
 */
(function () {
  'use strict';

  const LS_EDIT_KEY  = 'bee-cms-edit';
  const LS_STORE_KEY = 'bee-cms-images';

  // ── Helpers ────────────────────────────────────────────
  function getStore() {
    try { return JSON.parse(localStorage.getItem(LS_STORE_KEY)) || {}; }
    catch { return {}; }
  }
  function setStore(obj) { localStorage.setItem(LS_STORE_KEY, JSON.stringify(obj)); }

  function isEditAllowed() {
    return new URLSearchParams(location.search).get('edit') === 'true'
        || localStorage.getItem(LS_EDIT_KEY) === 'true';
  }

  // ── Apply stored overrides on every page load ─────────
  function applyOverrides() {
    const store = getStore();
    document.querySelectorAll('img[data-cms="true"]').forEach(img => {
      const key = img.getAttribute('data-cms-key');
      if (key && store[key]) img.src = store[key];
    });
  }

  // ── Build the CMS UI ─────────────────────────────────
  let editMode = false;
  let panel, toggleBtn;

  function injectStyles() {
    const s = document.createElement('style');
    s.textContent = `
      /* ── CMS floating panel ── */
      .bee-cms-panel {
        position: fixed; bottom: 24px; right: 24px; z-index: 99999;
        display: flex; gap: 8px; align-items: center;
        font-family: 'JetBrains Mono', monospace; font-size: 11px;
      }
      .bee-cms-btn {
        background: #191919; color: #F5A623; border: 1px solid #F5A623;
        padding: 8px 14px; border-radius: 4px; cursor: pointer;
        font-family: inherit; font-size: inherit; text-transform: uppercase;
        letter-spacing: 0.06em; transition: background .2s, color .2s;
      }
      .bee-cms-btn:hover { background: #F5A623; color: #191919; }
      .bee-cms-btn.active { background: #F5A623; color: #191919; }

      /* ── Image overlay ── */
      .bee-cms-overlay {
        z-index: 9999;
        display: flex; align-items: center; justify-content: center;
        background: rgba(25, 25, 25, 0.65);
        transition: opacity .25s; cursor: pointer;
        border: 2px dashed #F5A623; border-radius: 4px;
        pointer-events: none;
      }
      .bee-cms-overlay span {
        font-family: 'JetBrains Mono', monospace; font-size: 13px;
        color: #F5A623; text-transform: uppercase; letter-spacing: 0.08em;
        pointer-events: none; text-align: center; padding: 8px;
      }

      /* ── Counter badge ── */
      .bee-cms-badge {
        background: #F5A623; color: #191919; border-radius: 50%;
        width: 20px; height: 20px; display: inline-flex;
        align-items: center; justify-content: center;
        font-size: 10px; font-weight: 700; margin-left: 4px;
      }
    `;
    document.head.appendChild(s);
  }

  function createPanel() {
    panel = document.createElement('div');
    panel.className = 'bee-cms-panel';
    panel.innerHTML = `
      <button class="bee-cms-btn" id="beeCmsToggle">Edit Mode</button>
      <button class="bee-cms-btn" id="beeCmsExport" style="display:none">Export</button>
      <button class="bee-cms-btn" id="beeCmsReset" style="display:none">Reset</button>
    `;
    document.body.appendChild(panel);

    toggleBtn = document.getElementById('beeCmsToggle');
    const exportBtn = document.getElementById('beeCmsExport');
    const resetBtn  = document.getElementById('beeCmsReset');

    toggleBtn.addEventListener('click', () => {
      editMode = !editMode;
      toggleBtn.classList.toggle('active', editMode);
      exportBtn.style.display = editMode ? '' : 'none';
      resetBtn.style.display  = editMode ? '' : 'none';
      localStorage.setItem(LS_EDIT_KEY, editMode ? 'true' : 'false');
      refreshOverlays();
    });

    exportBtn.addEventListener('click', exportJSON);
    resetBtn.addEventListener('click', resetAll);

    // Restore edit state from localStorage
    if (localStorage.getItem(LS_EDIT_KEY) === 'true') {
      editMode = true;
      toggleBtn.classList.add('active');
      exportBtn.style.display = '';
      resetBtn.style.display  = '';
    }
  }

  // ── Overlays (no-wrap approach — overlays float on top of images) ──
  const overlays = [];

  function refreshOverlays() {
    // Remove existing overlays
    overlays.forEach(o => o.remove());
    overlays.length = 0;

    if (!editMode) return;

    document.querySelectorAll('img[data-cms="true"]').forEach(img => {
      // Make parent position:relative if not already
      const parent = img.parentElement;
      const parentPos = getComputedStyle(parent).position;
      if (parentPos === 'static') parent.style.position = 'relative';

      const overlay = document.createElement('div');
      overlay.className = 'bee-cms-overlay';
      const store = getStore();
      const key = img.getAttribute('data-cms-key');
      const isOverridden = key && store[key];
      overlay.innerHTML = `<span>${isOverridden ? 'Click to replace (modified)' : 'Click to replace'}</span>`;

      // Position overlay to match the image within its parent
      overlay.style.position = 'absolute';
      overlay.style.top = img.offsetTop + 'px';
      overlay.style.left = img.offsetLeft + 'px';
      overlay.style.width = img.offsetWidth + 'px';
      overlay.style.height = img.offsetHeight + 'px';
      overlay.style.opacity = '0';

      overlay.addEventListener('mouseenter', () => { overlay.style.opacity = '1'; overlay.style.pointerEvents = 'auto'; });
      overlay.addEventListener('mouseleave', () => { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; });

      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        pickFile(img);
      });

      parent.appendChild(overlay);
      overlays.push(overlay);
    });
  }

  // ── File picker + store ───────────────────────────────
  function pickFile(img) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result;
        const key = img.getAttribute('data-cms-key');
        if (!key) return;

        // Store
        const store = getStore();
        store[key] = dataUrl;
        setStore(store);

        // Apply
        img.src = dataUrl;

        // Refresh overlay label
        refreshOverlays();
      };
      reader.readAsDataURL(file);
      input.remove();
    });
    input.click();
  }

  // ── Export / Reset ────────────────────────────────────
  function exportJSON() {
    const store = getStore();
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'bee-cms-images.json';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function resetAll() {
    if (!confirm('Reset all image overrides? This will restore originals.')) return;
    localStorage.removeItem(LS_STORE_KEY);
    // Reload to restore original src attributes
    location.reload();
  }

  // ── Init ──────────────────────────────────────────────
  function init() {
    // Always apply stored overrides (even when not in edit mode)
    applyOverrides();

    // Only show the CMS panel when edit access is allowed
    if (!isEditAllowed()) return;

    injectStyles();
    createPanel();
    refreshOverlays();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
