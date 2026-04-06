/**
 * BEE Modular — Reusable Nav Component
 * =====================================
 * Self-contained navigation with both top (light) and bottom (dark/glass) bars.
 * Injects its own CSS + HTML. Works on index (hash scroll) and subpages (file links).
 *
 * USAGE:
 *   <div id="bee-nav"></div>
 *   <script type="module" src="bee-nav.js"></script>
 *
 * OPTIONS (data attributes on #bee-nav):
 *   data-active="system"         — highlight current page link
 *   data-music="false"           — disable music player (default: true)
 *   data-music-src="path/to.mp3" — custom music file path
 */

(function () {
  const mount = document.getElementById('bee-nav');
  if (!mount) {
    console.error('bee-nav.js: No element with id="bee-nav" found.');
    return;
  }

  // ── Detect context ──
  const loc = window.location.pathname;
  const isIndex = loc.endsWith('/') || loc.endsWith('/index.html') || loc.endsWith('index.html') || loc === '';
  const activePage = mount.dataset.active || '';
  const showMusic = mount.dataset.music !== 'false';
  const musicSrc = mount.dataset.musicSrc || 'MUSIC/epic-2026-03-02-14-05-19-utc/AudioCopper_Epic_Main.mp3';

  // ── Navigation items ──
  const navItems = [
    { key: 'system',   labelTop: 'The System',     labelBottom: 'System',         hash: '#system',     file: 'system.html' },
    { key: 'configs',  labelTop: 'Configurations',  labelBottom: 'Configurations', hash: '#bp-configs', file: 'configurations.html' },
    { key: 'defence',  labelTop: 'Defence',         labelBottom: 'Defence',        hash: '#bp-defence', file: 'defence.html' },
    { key: 'process',  labelTop: 'Process',         labelBottom: 'Process',        hash: '#bp-process', file: 'process.html' },
    { key: 'about',    labelTop: 'About',           labelBottom: 'About',          hash: '#bp-about',   file: 'about.html' },
  ];

  function linkHref(item) {
    if (isIndex) return item.hash;
    return item.file;
  }

  function reserveHref() {
    if (isIndex) return '#bp-reserve';
    return 'reserve.html';
  }

  function reserveOnClick() {
    if (isIndex) {
      return `event.preventDefault();document.getElementById('bp-reserve').scrollIntoView({behavior:'smooth'})`;
    }
    return '';
  }

  function activeClass(key) {
    return key === activePage ? ' style="color:var(--on-dark)"' : '';
  }

  // ── Build link lists ──
  const topLinks = navItems.map(item =>
    `<li><a href="${linkHref(item)}"${activeClass(item.key)}>${item.labelTop}</a></li>`
  ).join('\n    ');

  const bottomLinks = navItems.map(item =>
    `<li><a href="${linkHref(item)}"${activeClass(item.key)}>${item.labelBottom}</a></li>`
  ).join('\n    ');

  const mobileLinks = navItems.map(item =>
    `<li><a href="${linkHref(item)}" class="bee-mobile-link">${item.labelTop}</a></li>`
  ).join('\n      ');

  // ── Hamburger button HTML (reused in top & bottom navs) ──
  const hamburgerHTML = `<button class="bee-hamburger" aria-label="Menu"><span></span><span></span><span></span></button>`;

  // ── Music player HTML ──
  const musicHTML = showMusic ? `
    <div class="nav-bottom-music" id="navMusic">
      <button class="music-toggle-btn" id="musicToggle" title="Toggle music">
        <div class="music-icon"></div>
        <div class="music-bars">
          <span></span><span></span><span></span><span></span>
        </div>
        <span class="music-label">Sound</span>
      </button>
      <input type="range" class="music-vol" id="musicVol" min="0" max="100" value="25" title="Volume">
    </div>` : '';

  // ── Audio element ──
  const audioHTML = showMusic ? `
  <audio id="bgMusic" loop preload="auto">
    <source src="${musicSrc}" type="audio/mpeg">
  </audio>` : '';

  // ── Inject CSS ──
  const style = document.createElement('style');
  style.textContent = `
/* ════════════════════════════════════════════════
   BEE NAV — Scoped Styles (injected by bee-nav.js)
   ════════════════════════════════════════════════ */

/* TOP NAV — technical / editorial */
.nav-top {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  height: 72px; padding: 0 48px;
  display: flex; align-items: center; justify-content: space-between;
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.nav-top.hide {
  opacity: 0; transform: translateY(-20px); pointer-events: none;
}
.nav-top-left { display: flex; align-items: center; gap: 10px; }
.nav-top-logo-img { height: 20px; width: auto; }
.nav-top-links {
  display: flex; align-items: center; gap: 28px;
  list-style: none;
}
.nav-top-links a {
  font-family: var(--font-m); font-size: 11px; font-weight: 400;
  color: var(--secondary); text-decoration: none;
  letter-spacing: 0.08em; text-transform: uppercase;
  transition: color 0.3s;
}
.nav-top-links a:hover { color: var(--headline); }
.nav-top-right {
  display: flex; align-items: center; gap: 20px;
}
.nav-top-cta {
  font-family: var(--font-m); font-size: 10px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--headline); background: none;
  border: 1px solid rgba(26,26,26,0.15);
  padding: 8px 20px; cursor: pointer;
  transition: all 0.3s;
  text-decoration: none; display: inline-block;
}
.nav-top-cta:hover { border-color: var(--headline); background: var(--headline); color: var(--bg); }

/* BOTTOM NAV — floating glass bar */
.nav-bottom {
  position: fixed; bottom: 4vh; left: 50%;
  transform: translateX(-50%) translateY(30px);
  width: calc(100% - 80px); max-width: 1100px;
  height: 56px; z-index: 1000;
  background: rgba(26,26,26,0.92);
  backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: 0 8px 40px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.12);
  padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between;
  opacity: 0; pointer-events: none;
  transition: opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1);
}
.nav-bottom.show {
  opacity: 1; pointer-events: all;
  transform: translateX(-50%) translateY(0);
}
.nav-bottom-left { display: flex; align-items: center; gap: 8px; }
.nav-bottom-logo-img { height: 18px; width: auto; filter: brightness(0) invert(1); }
.nav-bottom-links {
  display: flex; align-items: center; gap: 24px;
  list-style: none;
}
.nav-bottom-links a {
  font-family: var(--font-m); font-size: 10px; font-weight: 400;
  color: var(--secondary); text-decoration: none;
  letter-spacing: 0.06em; text-transform: uppercase;
  transition: color 0.3s;
}
.nav-bottom-links a:hover { color: var(--headline); }
.nav-bottom-cta {
  font-family: var(--font-m); font-size: 10px; font-weight: 500;
  letter-spacing: 0.1em; text-transform: uppercase;
  background: none; color: var(--on-dark);
  border: 1px solid rgba(245,240,235,0.25);
  padding: 8px 20px; cursor: pointer; transition: all 0.3s;
  text-decoration: none; display: inline-block;
}
.nav-bottom-cta:hover { border-color: var(--on-dark); background: rgba(245,240,235,0.1); }
.nav-bottom-links a { color: rgba(245,240,235,0.5) !important; }
.nav-bottom-links a:hover { color: var(--on-dark) !important; }

/* Dark mode for navs */
.nav-top.nav-dark .nav-top-logo-img { filter: brightness(0) invert(1); }
.nav-top.nav-dark .nav-top-links a { color: rgba(245,240,235,0.5); }
.nav-top.nav-dark .nav-top-links a:hover { color: var(--on-dark); }
.nav-top.nav-dark .nav-top-cta { color: var(--on-dark); border-color: rgba(245,240,235,0.2); }
.nav-bottom.nav-dark-mode .nav-bottom-links a { color: rgba(245,240,235,0.5); }

/* ════════════════════════════════════════════════
   MUSIC PLAYER (inside bottom nav)
   ════════════════════════════════════════════════ */
.nav-bottom-music {
  display: flex; align-items: center; gap: 10px;
  margin-left: 16px;
}
.music-toggle-btn {
  display: flex; align-items: center; gap: 8px;
  background: none; border: none;
  cursor: pointer; padding: 4px;
}
.music-icon {
  width: 14px; height: 14px;
  position: relative;
  display: flex; align-items: center; justify-content: center;
}
/* Play triangle (default — music off) */
.music-icon::before {
  content: '';
  display: block;
  width: 0; height: 0;
  border-style: solid;
  border-width: 6px 0 6px 10px;
  border-color: transparent transparent transparent rgba(245,240,235,0.6);
  transition: all 0.3s ease;
}
/* Pause bars (music on) */
.nav-bottom.music-playing .music-icon::before {
  border-width: 0;
  width: 3px; height: 12px;
  border-radius: 1px;
  background: var(--accent);
  box-shadow: 6px 0 0 var(--accent);
}
.music-bars {
  display: flex; align-items: flex-end; gap: 2px;
  height: 16px; width: 20px;
}
.music-bars span {
  display: block; width: 3px;
  background: var(--accent);
  transition: height 0.2s ease;
  height: 3px;
}
.nav-bottom.music-playing .music-bars span:nth-child(1) { animation: beeNavBar1 0.8s ease-in-out infinite; }
.nav-bottom.music-playing .music-bars span:nth-child(2) { animation: beeNavBar2 0.7s ease-in-out infinite 0.1s; }
.nav-bottom.music-playing .music-bars span:nth-child(3) { animation: beeNavBar3 0.9s ease-in-out infinite 0.2s; }
.nav-bottom.music-playing .music-bars span:nth-child(4) { animation: beeNavBar1 0.75s ease-in-out infinite 0.15s; }
.nav-bottom:not(.music-playing) .music-bars span { height: 3px !important; }
@keyframes beeNavBar1 { 0%,100%{height:4px} 50%{height:16px} }
@keyframes beeNavBar2 { 0%,100%{height:8px} 50%{height:4px} }
@keyframes beeNavBar3 { 0%,100%{height:6px} 50%{height:14px} }
.music-label {
  font-family: var(--font-m); font-size: 9px;
  letter-spacing: 0.1em; text-transform: uppercase;
  color: rgba(245,240,235,0.5);
  user-select: none;
}
.nav-bottom.music-playing .music-label { color: var(--accent); }
.music-vol {
  -webkit-appearance: none; appearance: none;
  width: 60px; height: 2px;
  background: rgba(245,240,235,0.15);
  outline: none; cursor: pointer;
  border-radius: 1px;
}
.music-vol::-webkit-slider-thumb {
  -webkit-appearance: none; appearance: none;
  width: 10px; height: 10px;
  background: var(--accent);
  border-radius: 50%; cursor: pointer;
}
.music-vol::-moz-range-thumb {
  width: 10px; height: 10px;
  background: var(--accent);
  border-radius: 50%; border: none; cursor: pointer;
}

/* ════════════════════════════════════════════════
   HAMBURGER BUTTON
   ════════════════════════════════════════════════ */
.bee-hamburger {
  display: none; /* hidden on desktop */
  width: 28px; height: 20px;
  position: relative; cursor: pointer;
  background: none; border: none; padding: 0;
  z-index: 10001;
  flex-shrink: 0;
}
.bee-hamburger span {
  display: block; position: absolute; left: 0;
  width: 100%; height: 2px;
  background: var(--headline, #1A1A1A);
  transition: transform 0.35s cubic-bezier(0.4,0,0.2,1),
              opacity 0.25s ease,
              top 0.35s cubic-bezier(0.4,0,0.2,1);
}
.bee-hamburger span:nth-child(1) { top: 0; }
.bee-hamburger span:nth-child(2) { top: 9px; }
.bee-hamburger span:nth-child(3) { top: 18px; }

/* Animate to X when open */
.bee-hamburger.open span:nth-child(1) { top: 9px; transform: rotate(45deg); }
.bee-hamburger.open span:nth-child(2) { opacity: 0; }
.bee-hamburger.open span:nth-child(3) { top: 9px; transform: rotate(-45deg); }

/* Dark context (nav-top.nav-dark or when inside bottom nav) */
.nav-top.nav-dark .bee-hamburger span,
.nav-bottom .bee-hamburger span {
  background: var(--on-dark, #F5F0EB);
}
/* When overlay is open, force light color on hamburger */
.bee-hamburger.open span {
  background: #F5F0EB;
}

/* ════════════════════════════════════════════════
   MOBILE OVERLAY MENU
   ════════════════════════════════════════════════ */
.bee-mobile-overlay {
  position: fixed; inset: 0; z-index: 10000;
  background: #1A1A1A;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  gap: 0;
  opacity: 0; visibility: hidden;
  transform: translateX(100%);
  transition: opacity 0.4s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1), visibility 0s 0.45s;
}
.bee-mobile-overlay.open {
  opacity: 1; visibility: visible;
  transform: translateX(0);
  transition: opacity 0.4s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1), visibility 0s 0s;
}
.bee-mobile-overlay ul {
  list-style: none; padding: 0; margin: 0;
  display: flex; flex-direction: column;
  align-items: center; gap: 28px;
}
.bee-mobile-overlay ul li a {
  font-family: 'JetBrains Mono', monospace;
  font-size: 14px; font-weight: 400;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #b5a291; text-decoration: none;
  transition: color 0.3s;
}
.bee-mobile-overlay ul li a:hover { color: #F5F0EB; }
.bee-mobile-overlay .bee-mobile-cta {
  margin-top: 40px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px; font-weight: 500;
  letter-spacing: 0.12em; text-transform: uppercase;
  color: #F5F0EB; background: none;
  border: 1px solid rgba(245,240,235,0.25);
  padding: 14px 40px; cursor: pointer;
  text-decoration: none; display: inline-block;
  transition: all 0.3s;
}
.bee-mobile-overlay .bee-mobile-cta:hover {
  border-color: #F5F0EB; background: rgba(245,240,235,0.08);
}
.bee-mobile-overlay .bee-mobile-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 9px; letter-spacing: 0.15em;
  text-transform: uppercase; color: rgba(245,240,235,0.35);
  margin-bottom: 32px;
}

@media (max-width: 1024px) {
  .nav-top-links, .nav-bottom-links { display: none; }
  .nav-top-cta { display: none; }
  .bee-hamburger { display: block; }
  .nav-bottom { width: calc(100% - 32px); bottom: calc(16px + env(safe-area-inset-bottom)); height: 52px; }
  .music-vol { width: 40px; }
}
@media (max-width: 768px) {
  .nav-top { padding: 0 24px; }
  .music-label { display: none; }
  .music-vol { width: 36px; }
}
`;
  document.head.appendChild(style);

  // ── Inject HTML ──
  mount.innerHTML = `
<!-- TOP NAV -->
<nav class="nav-top" id="navTop">
  <div class="nav-top-left">
    <img src="LOGO/BEE%20MODULAR%20LOGO%20ON%20WHITE.svg" alt="BEE Modular" class="nav-top-logo-img">
  </div>
  <ul class="nav-top-links">
    ${topLinks}
  </ul>
  <div class="nav-top-right">
    <a href="${reserveHref()}" class="nav-top-cta"${reserveOnClick() ? ` onclick="${reserveOnClick()}"` : ''}>Reserve</a>
    ${hamburgerHTML}
  </div>
</nav>

<!-- BOTTOM NAV -->
<nav class="nav-bottom" id="navBottom">
  <div class="nav-bottom-left">
    <img src="LOGO/BEE%20MODULAR%20LOGO%20ON%20BLACK.svg" alt="BEE Modular" class="nav-bottom-logo-img">
  </div>
  <ul class="nav-bottom-links">
    ${bottomLinks}
  </ul>
  <div class="nav-bottom-right" style="display:flex;align-items:center;gap:16px;">
    ${musicHTML}
    <a href="${reserveHref()}" class="nav-bottom-cta"${reserveOnClick() ? ` onclick="${reserveOnClick()}"` : ''}>Reserve</a>
  </div>
</nav>
<!-- MOBILE OVERLAY -->
<div class="bee-mobile-overlay" id="beeMobileOverlay">
  <span class="bee-mobile-label">Navigation</span>
  <ul>
    ${mobileLinks}
  </ul>
  <a href="${reserveHref()}" class="bee-mobile-cta bee-mobile-link"${reserveOnClick() ? ` onclick="${reserveOnClick()}"` : ''}>Reserve</a>
</div>
${audioHTML}
`;

  // ── Music player logic ──
  if (showMusic) {
    const musicToggle = document.getElementById('musicToggle');
    const musicVolEl = document.getElementById('musicVol');
    const bgMusic = document.getElementById('bgMusic');
    const navBottom = document.getElementById('navBottom');

    if (bgMusic) {
      bgMusic.volume = 0.25;

      function toggleMusic() {
        if (!bgMusic.paused) {
          bgMusic.pause();
          navBottom.classList.remove('music-playing');
        } else {
          bgMusic.play().catch(() => {});
          navBottom.classList.add('music-playing');
        }
      }

      if (musicToggle) {
        musicToggle.addEventListener('click', toggleMusic);
      }

      if (musicVolEl) {
        musicVolEl.addEventListener('input', (e) => {
          bgMusic.volume = e.target.value / 100;
        });
      }

      // Auto-play on first user interaction
      let hasAutoPlayed = false;
      function autoPlayOnce() {
        if (hasAutoPlayed) return;
        hasAutoPlayed = true;
        bgMusic.play().then(() => {
          navBottom.classList.add('music-playing');
        }).catch(() => {});
        document.removeEventListener('click', autoPlayOnce);
        document.removeEventListener('scroll', autoPlayOnce);
      }
      document.addEventListener('click', autoPlayOnce, { once: false });
      document.addEventListener('scroll', autoPlayOnce, { once: false });
    }
  }

  // ── Subpage: show bottom nav by default after small scroll ──
  if (!isIndex) {
    const navTop = document.getElementById('navTop');
    const navBottom = document.getElementById('navBottom');

    // On subpages, show the bottom nav after scrolling past 300px
    let subpageScrollHandler = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 300) {
        navTop.classList.add('hide');
        navBottom.classList.add('show');
      } else {
        navTop.classList.remove('hide');
        navBottom.classList.remove('show');
      }
    };
    window.addEventListener('scroll', subpageScrollHandler, { passive: true });
    // Run once on load
    subpageScrollHandler();
  }
  // On index page, the existing ScrollTrigger/GSAP code controls show/hide via navTop/navBottom IDs.

  // ── Mobile hamburger menu logic ──
  const overlay = document.getElementById('beeMobileOverlay');
  const hamburgers = document.querySelectorAll('.bee-hamburger');
  let mobileMenuOpen = false;

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    overlay.classList.toggle('open', mobileMenuOpen);
    hamburgers.forEach(btn => btn.classList.toggle('open', mobileMenuOpen));
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    if (!mobileMenuOpen) return;
    mobileMenuOpen = false;
    overlay.classList.remove('open');
    hamburgers.forEach(btn => btn.classList.remove('open'));
    document.body.style.overflow = '';
  }

  hamburgers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileMenu();
    });
  });

  // Close on link click
  document.querySelectorAll('.bee-mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMobileMenu();
  });

})();
