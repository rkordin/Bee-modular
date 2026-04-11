/**
 * BEE Modular — Reusable Footer Component (OPTIMIZED v31)
 * ========================================================
 * Loads pre-baked edge binary (90KB) instead of GLB (718KB).
 * No GLTFLoader, no DRACOLoader, no EdgesGeometry computation.
 * Pre-computed line centers — no per-frame Box3 allocation.
 *
 * USAGE:
 *   1. Add the import map in your <head> (if not already present):
 *
 *      <script type="importmap">
 *      {
 *        "imports": {
 *          "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
 *          "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
 *        }
 *      }
 *      </script>
 *
 *   2. At the bottom of your page, before </body>, add:
 *
 *      <div id="bee-footer"></div>
 *      <script type="module" src="bee-footer.js"></script>
 *
 * OPTIONS (data attributes on #bee-footer):
 *   data-edges="path/to/edges.bin"  — custom edges path (default: 3d files/logo-edges.bin)
 */

import * as THREE from 'three';

(function () {
  const mount = document.getElementById('bee-footer');
  if (!mount) {
    console.error('bee-footer.js: No element with id="bee-footer" found.');
    return;
  }

  // ── Options ──
  const edgesPath = mount.dataset.edges || '3d%20files/logo-edges.bin';

  // ── Inject CSS (identical to v30) ──
  const style = document.createElement('style');
  style.textContent = `
    /* ══════════════════════════════════════════
       BEE FOOTER — Scoped Styles
       ══════════════════════════════════════════ */
    #bee-footer {
      position: relative;
      overflow: hidden;
    }

    #bee-footer-canvas {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 0;
    }

    .bee-footer-zone {
      position: relative;
      z-index: 1;
    }

    .bee-footer-zone::before {
      content: '';
      position: absolute; inset: 0;
      background: rgba(20,20,20,0.35);
      backdrop-filter: blur(16px) saturate(1.2);
      -webkit-backdrop-filter: blur(16px) saturate(1.2);
      z-index: 0;
    }

    .bee-footer-zone::after {
      content: '';
      position: absolute; inset: 0;
      opacity: 0.03;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 128px 128px;
      pointer-events: none;
      z-index: 0;
    }

    .bee-footer-zone > * { position: relative; z-index: 1; }

    .bee-newsletter {
      padding: 80px 48px;
      text-align: center;
    }
    .bee-newsletter h3 {
      font-family: 'NHaasGrotesk', 'Helvetica Neue', 'Arial Black', sans-serif;
      font-size: 24px; font-weight: 900;
      color: #F5F0EB; margin-bottom: 8px;
    }
    .bee-newsletter p {
      font-size: 14px;
      color: rgba(245,240,235,0.5);
      margin-bottom: 24px;
    }
    .bee-nl-form {
      display: flex; gap: 12px;
      justify-content: center;
      max-width: 460px; margin: 0 auto;
    }
    .bee-nl-input {
      flex: 1; padding: 14px 20px;
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(245,240,235,0.15);
      font-family: 'Inter', system-ui, sans-serif;
      font-size: 14px; color: #F5F0EB; outline: none;
    }
    .bee-nl-input::placeholder { color: rgba(245,240,235,0.35); }
    .bee-nl-input:focus { border-color: #b5a291; }
    .bee-nl-btn {
      font-family: 'NHaasGrotesk', 'Helvetica Neue', 'Arial Black', sans-serif;
      font-size: 12px; font-weight: 700;
      letter-spacing: 0.06em; text-transform: uppercase;
      background: #b5a291; color: #fff;
      border: none; padding: 14px 28px;
      cursor: pointer; transition: all 0.3s;
    }
    .bee-nl-btn:hover { box-shadow: 0 4px 16px rgba(181,162,145,0.3); }

    .bee-ft {
      padding: 80px 48px 40px;
      border-top: 1px solid rgba(181,162,145,0.15);
    }

    .bee-ft-title-blocks {
      display: grid; grid-template-columns: repeat(3, 1fr);
      gap: 24px; max-width: 1200px;
      margin: 0 auto 40px;
    }
    .bee-ft-block {
      border: 1px solid rgba(181,162,145,0.15);
      padding: 20px 24px; position: relative;
    }
    .bee-ft-block::before {
      content: ''; position: absolute;
      top: -1px; left: -1px; right: -1px; bottom: -1px;
      border: 1px solid rgba(181,162,145,0.08);
      transform: translate(4px, 4px); pointer-events: none;
    }
    .bee-ft-row {
      display: grid; grid-template-columns: 72px 1fr; gap: 16px;
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px; letter-spacing: 0.1em;
      text-transform: uppercase;
      color: rgba(245,240,235,0.5); line-height: 2;
    }
    .bee-ft-val { color: #F5F0EB; }

    .bee-ft-grid {
      max-width: 1200px; margin: 0 auto;
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px;
    }
    .bee-ft-brand {
      font-family: 'NHaasGrotesk', 'Helvetica Neue', 'Arial Black', sans-serif;
      font-size: 18px; font-weight: 900;
      color: #F5F0EB; margin-bottom: 12px;
    }
    .bee-ft-desc {
      font-size: 13px; color: rgba(245,240,235,0.5); line-height: 1.6;
    }
    .bee-ft-col-title {
      font-family: 'NHaasGrotesk', 'Helvetica Neue', 'Arial Black', sans-serif;
      font-size: 12px; font-weight: 800;
      text-transform: uppercase; letter-spacing: 0.08em;
      color: #F5F0EB; margin-bottom: 16px;
    }
    .bee-ft-col a {
      display: block; font-size: 13px;
      color: rgba(245,240,235,0.4);
      text-decoration: none; margin-bottom: 8px;
      transition: color 0.3s;
    }
    .bee-ft-col a:hover { color: #b5a291; }
    .bee-ft-bottom {
      max-width: 1200px; margin: 48px auto 0;
      padding-top: 24px;
      border-top: 1px solid rgba(245,240,235,0.08);
      display: flex; justify-content: space-between;
      align-items: center; flex-wrap: wrap; gap: 12px;
    }
    .bee-ft-copy { font-size: 12px; color: rgba(245,240,235,0.3); }
    .bee-ft-certs {
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px; color: rgba(245,240,235,0.2);
    }

    @media (max-width: 1024px) {
      .bee-ft-grid { grid-template-columns: 1fr 1fr; }
    }
    @media (max-width: 768px) {
      .bee-ft-title-blocks { grid-template-columns: 1fr; }
      .bee-newsletter { padding: 60px 24px; }
      .bee-nl-form { flex-direction: column; }
      .bee-ft { padding: 60px 24px 32px; }
      .bee-ft-grid { grid-template-columns: 1fr; }
      .bee-ft-bottom { flex-direction: column; text-align: center; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML (identical) ──
  mount.innerHTML = `
    <canvas id="bee-footer-canvas"></canvas>
    <div class="bee-footer-zone">
      <section class="bee-newsletter">
        <h3>Stay informed.</h3>
        <p>Engineering updates. Production news. No noise.</p>
        <form class="bee-nl-form" id="bee-nl-form">
          <input type="email" name="email" class="bee-nl-input" placeholder="Email address" required>
          <button type="submit" class="bee-nl-btn">Subscribe</button>
        </form>
        <p class="bee-nl-success" id="bee-nl-success" style="display:none; color:#b5a291; margin-top:16px; font-family:'JetBrains Mono',monospace; font-size:13px; letter-spacing:0.08em;">Subscribed. Welcome aboard.</p>
      </section>
      <footer class="bee-ft">
        <div class="bee-ft-title-blocks">
          <div class="bee-ft-block">
            <div class="bee-ft-row"><span>Project</span> <span class="bee-ft-val">BEE Modular</span></div>
            <div class="bee-ft-row"><span>Client</span> <span class="bee-ft-val">Beyond Engineering d.o.o.</span></div>
            <div class="bee-ft-row"><span>Scale</span> <span class="bee-ft-val">1 : 1</span></div>
            <div class="bee-ft-row"><span>Rev</span> <span class="bee-ft-val">V8</span></div>
          </div>
          <div class="bee-ft-block">
            <div class="bee-ft-row"><span>Frame</span> <span class="bee-ft-val">S355 Structural Steel</span></div>
            <div class="bee-ft-row"><span>Profile</span> <span class="bee-ft-val">200 × 200 × 12 mm</span></div>
            <div class="bee-ft-row"><span>Tolerance</span> <span class="bee-ft-val">±0.5 mm</span></div>
            <div class="bee-ft-row"><span>Weld</span> <span class="bee-ft-val">EN ISO 3834-2</span></div>
          </div>
          <div class="bee-ft-block">
            <div class="bee-ft-row"><span>Length</span> <span class="bee-ft-val">6 000 mm (6 m)</span></div>
            <div class="bee-ft-row"><span>Width</span> <span class="bee-ft-val">2 500 mm (2.5 m)</span></div>
            <div class="bee-ft-row"><span>Height</span> <span class="bee-ft-val">2 600 mm (2.6 m)</span></div>
            <div class="bee-ft-row"><span>Mass</span> <span class="bee-ft-val">2 840 kg</span></div>
            <div class="bee-ft-row"><span>Transport</span> <span class="bee-ft-val">2 modules / truck trailer</span></div>
            <div class="bee-ft-row"><span>Certif.</span> <span class="bee-ft-val">ISO 9001 · AQAP 2110</span></div>
            <div class="bee-ft-row"><span>Origin</span> <span class="bee-ft-val">Slovenia, EU</span></div>
          </div>
        </div>
        <div class="bee-ft-grid">
          <div>
            <div class="bee-ft-brand">BEE Modular</div>
            <div class="bee-ft-desc">Beyond Engineering. Hexagonal modular architecture manufactured in Slovenia. One frame. Everything else follows.</div>
          </div>
          <div class="bee-ft-col">
            <div class="bee-ft-col-title">Product</div>
            <a href="system.html">The System</a>
            <a href="configurations.html">Configurations</a>
            <a href="defence.html">Defence</a>
            <a href="process.html">Process</a>
          </div>
          <div class="bee-ft-col">
            <div class="bee-ft-col-title">Company</div>
            <a href="about.html">About</a>
            <a href="reserve.html">Contact</a>
            <a href="#">Careers</a>
            <a href="#">Press</a>
          </div>
          <div class="bee-ft-col">
            <div class="bee-ft-col-title">Legal</div>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookie Policy</a>
          </div>
        </div>
        <div class="bee-ft-bottom">
          <div class="bee-ft-copy">© 2026 BEE Modular / Beyond Engineering d.o.o. All rights reserved.</div>
          <div class="bee-ft-certs">ISO 9001 · AQAP 2110 · EN 729-3</div>
        </div>
      </footer>
    </div>
  `;

  // ── 3D Logo Animation — Optimized ──
  const canvas = document.getElementById('bee-footer-canvas');
  if (!canvas) return;

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const maxDPR = isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setClearColor(new THREE.Color('rgb(26,26,26)'), 1);
  renderer.setPixelRatio(maxDPR);

  const scene3d = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100000);

  function resize() {
    const rect = mount.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    renderer.setSize(rect.width, rect.height);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
  }
  resize();

  const darkLineColor = new THREE.Color(0xd4c4b0);

  // ── Load pre-baked edges ──
  fetch(edgesPath)
    .then(r => r.arrayBuffer())
    .then(buffer => {
      const header = new Float32Array(buffer, 0, 6);
      const [minX, minY, minZ, rangeX, rangeY, rangeZ] = header;
      const meshCount = new Uint32Array(buffer, 24, 1)[0];
      let offset = 28;

      const allLines = [];
      const lineCenters = [];
      const edgesGroup = new THREE.Group();

      for (let m = 0; m < meshCount; m++) {
        const vertCount = new Uint32Array(buffer, offset, 1)[0];
        offset += 4;
        const data = new Int16Array(buffer, offset, vertCount * 3);
        offset += vertCount * 3 * 2;

        const positions = new Float32Array(vertCount * 3);
        let cx = 0, cy = 0, cz = 0;
        for (let i = 0; i < vertCount; i++) {
          const x = (data[i*3+0] / 32767) * rangeX + minX;
          const y = (data[i*3+1] / 32767) * rangeY + minY;
          const z = (data[i*3+2] / 32767) * rangeZ + minZ;
          positions[i*3+0] = x; positions[i*3+1] = y; positions[i*3+2] = z;
          cx += x; cy += y; cz += z;
        }

        const geom = new THREE.BufferGeometry();
        geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        const mat = new THREE.LineBasicMaterial({
          color: 0xb5a291, transparent: true, opacity: 0.30, linewidth: 1,
        });
        const lines = new THREE.LineSegments(geom, mat);
        edgesGroup.add(lines);
        allLines.push(lines);
        lineCenters.push(new THREE.Vector3(cx / vertCount, cy / vertCount, cz / vertCount));
      }

      const box = new THREE.Box3().setFromObject(edgesGroup);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      edgesGroup.position.set(-center.x, -center.y, -center.z);
      edgesGroup.rotation.x = Math.PI / 2;

      const wrapper = new THREE.Group();
      wrapper.add(edgesGroup);
      scene3d.add(wrapper);

      const maxDim = Math.max(size.x, size.y, size.z);
      const sf = maxDim * 0.5;

      camera.near = sf * 0.001;
      camera.far = sf * 20;
      camera.position.set(0, 0, 1.0 * sf);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      // Adjust cached centers
      for (const c of lineCenters) {
        c.x -= center.x; c.y -= center.y; c.z -= center.z;
      }

      allLines.forEach(line => {
        const total = line.geometry.attributes.position.count;
        line.geometry.setDrawRange(0, total);
      });

      console.log('BEE Footer: logo loaded,', allLines.length, 'line groups (optimized)');

      const worldCenter = new THREE.Vector3();
      let animId = null;

      function animate() {
        animId = requestAnimationFrame(animate);
        const t = performance.now() * 0.001;

        // Identical motion
        wrapper.rotation.y = t * 0.15;
        wrapper.rotation.x = Math.sin(t * 0.4) * 0.1;
        wrapper.rotation.z = Math.cos(t * 0.6) * 0.05;
        wrapper.position.y = Math.sin(t * 0.5) * sf * 0.08;
        const breathe = 1 + Math.sin(t * 0.7) * 0.1;
        wrapper.scale.setScalar(breathe);

        // Proximity opacity with cached centers (no Box3!)
        const camPos = camera.position;
        allLines.forEach((line, i) => {
          line.material.color.lerp(darkLineColor, 0.08);
          worldCenter.copy(lineCenters[i]);
          wrapper.localToWorld(worldCenter);
          const dist = camPos.distanceTo(worldCenter);
          const maxDist = sf * 4;
          const proximity = 1 - Math.min(1, dist / maxDist);
          const breath = Math.sin(t + proximity * 10) * 0.03;
          line.material.opacity = 0.30 + proximity * 0.45 + breath;
        });

        renderer.render(scene3d, camera);
      }
      animate();

      // Pause when hidden
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) { if (animId) { cancelAnimationFrame(animId); animId = null; } }
        else { if (!animId) animate(); }
      });
    })
    .catch(err => console.error('BEE Footer: edge load failed:', err));

  window.addEventListener('resize', resize);
  new ResizeObserver(resize).observe(mount);

  // ── HubSpot tracking script ──
  (function() {
    const hs = document.createElement('script');
    hs.id = 'hs-script-loader';
    hs.async = true;
    hs.defer = true;
    hs.src = '//js-eu1.hs-scripts.com/146301933.js';
    document.head.appendChild(hs);
  })();

  // ── Newsletter form submission via HubSpot ──
  const nlForm = document.getElementById('bee-nl-form');
  const nlSuccess = document.getElementById('bee-nl-success');
  if (nlForm) {
    nlForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = nlForm.querySelector('.bee-nl-btn');
      const emailInput = nlForm.querySelector('.bee-nl-input');
      if (!emailInput.value || !emailInput.validity.valid) return;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const email = emailInput.value.trim();

      // Identify contact via HubSpot tracking code
      const _hsq = window._hsq = window._hsq || [];
      _hsq.push(['identify', {
        email: email,
        bee_newsletter: 'true',
        hs_lead_status: 'NEW',
      }]);
      _hsq.push(['trackPageView']);

      // Also submit via HubSpot Forms API (no form GUID needed — uses non-portal endpoint)
      try {
        const hutk = document.cookie.match(/hubspotutk=([^;]*)/)?.[1] || '';
        const resp = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/146301933/bee-newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fields: [{ name: 'email', value: email }],
            context: {
              hutk: hutk || undefined,
              pageUri: window.location.href,
              pageName: document.title,
            },
          }),
        });
        // Forms API may 404 if form GUID doesn't exist yet —
        // that's fine, _hsq identify above already created the contact
      } catch { /* _hsq identify is the primary mechanism */ }

      nlForm.style.display = 'none';
      nlSuccess.style.display = 'block';
    });
  }
})();
