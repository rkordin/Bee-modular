/**
 * BEE Modular — Reusable Hero Component (OPTIMIZED v31)
 * ======================================================
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
 *   2. As the first element in <body>, add:
 *
 *      <div id="bee-hero"></div>
 *      <script type="module" src="bee-hero.js"></script>
 *
 * OPTIONS (data attributes on #bee-hero):
 *   data-edges="path/to/edges.bin"    — custom edges path (default: 3d files/logo-edges.bin)
 *   data-bg="#F1F1F1"                 — background color (default: #F1F1F1)
 *   data-line1="What if one shape"    — first line text
 *   data-line2="could do"             — second line text
 *   data-line3="everything?"          — third line text
 *   data-fade-out="true"             — enable scroll fade-out (default: true)
 */

import * as THREE from 'three';

(function () {
  const mount = document.getElementById('bee-hero');
  if (!mount) {
    console.error('bee-hero.js: No element with id="bee-hero" found.');
    return;
  }

  // ── Options ──
  const edgesPath = mount.dataset.edges || '3d%20files/logo-edges.bin';
  const bgColor = mount.dataset.bg || '#F1F1F1';
  const line1 = mount.dataset.line1 || 'What if one shape';
  const line2 = mount.dataset.line2 || 'could do';
  const line3 = mount.dataset.line3 || 'everything?';
  const enableFadeOut = mount.dataset.fadeOut !== 'false';

  // ── Inject CSS (identical to v30) ──
  const style = document.createElement('style');
  style.textContent = `
    #bee-hero {
      position: relative;
    }

    #bee-hero-canvas {
      position: fixed;
      top: 0; left: 0;
      width: 100vw; height: 100vh;
      z-index: 0;
      transition: opacity 0.8s ease;
    }
    #bee-hero-canvas.bh-fade-out { opacity: 0; }

    .bh-hero {
      position: relative;
      z-index: 1;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      transition: opacity 0.8s ease;
    }
    .bh-hero.bh-fade-out { opacity: 0; }

    /* Frosted glass overlay — fixed on top of canvas */
    .bh-glass-overlay {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      background: transparent;
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 1;
      pointer-events: none;
      transition: opacity 0.8s ease;
    }
    .bh-hero.bh-fade-out ~ .bh-glass-overlay,
    .bh-fade-out .bh-glass-overlay { opacity: 0; }

    .bh-noise-overlay {
      position: fixed; top: 0; left: 0;
      width: 100vw; height: 100vh;
      opacity: 0.07;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      background-size: 128px 128px;
      pointer-events: none;
      z-index: 1;
    }

    .bh-hero { z-index: 2; }
    .bh-hero > * { position: relative; z-index: 1; }

    .bh-content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-20%, -50%);
      border-left: none;
      padding-left: 32px;
    }

    /* Animated accent line */
    .bh-content::before {
      content: '';
      position: absolute;
      left: 0;
      width: 2px;
      background: #b5a291;
      animation: bhLineGrow 0.7s cubic-bezier(0.25, 0.1, 0.25, 1) 0s forwards,
                 bhLineShrink 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) 0.7s forwards;
      top: -50vh;
      height: 0;
      opacity: 0;
    }

    @keyframes bhLineGrow {
      0% { opacity: 0; top: -50vh; height: 0; }
      10% { opacity: 1; }
      100% { opacity: 1; top: -50vh; height: calc(100% + 50vh); }
    }

    @keyframes bhLineShrink {
      0% { top: -50vh; height: calc(100% + 50vh); }
      100% { top: 0; height: 100%; }
    }

    .bh-line {
      font-family: 'NHaasGrotesk', 'Helvetica Neue', 'Helvetica', 'Arial Black', sans-serif;
      font-size: clamp(28px, 3.5vw, 42px);
      letter-spacing: -0.04em;
      line-height: 1.25;
      color: #1A1A1A;
      overflow: hidden;
    }

    .bh-line-1 { font-weight: 200; }
    .bh-line-2 { font-weight: 900; }
    .bh-line-3 { font-weight: 900; color: #b5a291; }

    .bh-word {
      display: inline-block;
      white-space: pre;
      opacity: 0;
      filter: blur(12px);
      transform: translateY(8px);
      animation: bhWordReveal 0.8s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
    }

    @keyframes bhWordReveal {
      to { opacity: 1; filter: blur(0px); transform: translateY(0); }
    }

    .bh-scroll {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      position: absolute;
      bottom: 40px;
      left: 50%;
      transform: translateX(-50%);
    }

    .bh-scroll span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 9px;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: rgba(0,0,0,0.25);
    }

    .bh-scroll-line {
      width: 1px;
      height: 40px;
      background: linear-gradient(180deg, rgba(0,0,0,0.15), transparent);
      animation: bhScrollPulse 2s ease-in-out infinite;
    }

    @keyframes bhScrollPulse {
      0%, 100% { opacity: 0.3; transform: scaleY(1); }
      50% { opacity: 1; transform: scaleY(1.2); }
    }

    @media (max-width: 768px) {
      .bh-content { left: 24px; transform: translateY(-50%); padding-left: 24px; }
    }
  `;
  document.head.appendChild(style);

  // ── Inject HTML (identical) ──
  mount.innerHTML = `
    <canvas id="bee-hero-canvas"></canvas>
    <div class="bh-glass-overlay"></div>
    <div class="bh-noise-overlay"></div>
    <section class="bh-hero">
      <div class="bh-content">
        <div class="bh-line bh-line-1" data-bh-reveal>${line1}</div>
        <div class="bh-line bh-line-2" data-bh-reveal>${line2}</div>
        <div class="bh-line bh-line-3" data-bh-reveal>${line3}</div>
      </div>
      <div class="bh-scroll">
        <span>Scroll</span>
        <div class="bh-scroll-line"></div>
      </div>
    </section>
  `;

  // ── Word-by-word blur reveal (identical) ──
  const baseDelay = 0.3;
  const wordGap = 0.15;
  let wordIndex = 0;

  mount.querySelectorAll('[data-bh-reveal]').forEach(line => {
    const text = line.textContent;
    line.textContent = '';
    const words = text.split(/(\s+)/);

    words.forEach(word => {
      const span = document.createElement('span');
      span.className = 'bh-word';
      span.textContent = word;
      span.style.animationDelay = (baseDelay + wordIndex * wordGap) + 's';
      line.appendChild(span);
      if (word.trim()) wordIndex++;
    });
  });

  // ── Scroll fade-out (identical) ──
  if (enableFadeOut) {
    const hero = mount.querySelector('.bh-hero');
    const heroCanvas = document.getElementById('bee-hero-canvas');
    let heroGone = false;

    window.addEventListener('scroll', function () {
      if (heroGone) return;
      if (window.scrollY > window.innerHeight * 0.3) {
        heroGone = true;
        hero.classList.add('bh-fade-out');
        heroCanvas.classList.add('bh-fade-out');
        mount.querySelectorAll('.bh-glass-overlay, .bh-noise-overlay').forEach(el => el.style.opacity = '0');
        setTimeout(() => {
          mount.style.height = '0';
          mount.style.overflow = 'hidden';
          mount.style.pointerEvents = 'none';
        }, 1000);
      }
    }, { passive: true });
  }

  // ── 3D Logo Animation — Optimized ──
  const canvas = document.getElementById('bee-hero-canvas');
  if (!canvas) return;

  const isMobile = /Mobi|Android/i.test(navigator.userAgent);
  const maxDPR = isMobile ? 1.0 : Math.min(window.devicePixelRatio, 1.5);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !isMobile, alpha: false, powerPreference: 'high-performance' });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(maxDPR);
  renderer.setClearColor(new THREE.Color(bgColor), 1);

  const scene3d = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100000);

  const lightLineColor = new THREE.Color(0x8B7355);

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
          color: 0x8B7355, transparent: true, opacity: 0.35, linewidth: 1,
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
      camera.position.set(0, 0, 0.5 * sf);
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

      console.log('BEE Hero: logo loaded,', allLines.length, 'line groups (optimized)');

      const worldCenter = new THREE.Vector3();
      let animId = null;

      function animate() {
        animId = requestAnimationFrame(animate);
        const t = performance.now() * 0.001;

        // Identical motion
        wrapper.rotation.y = Math.sin(t * 0.12) * 1.4;
        wrapper.rotation.x = Math.sin(t * 0.35) * 0.08;
        wrapper.rotation.z = Math.cos(t * 0.5) * 0.04;
        wrapper.position.y = Math.sin(t * 0.45) * sf * 0.06;
        const breathe = 1 + Math.sin(t * 0.6) * 0.08;
        wrapper.scale.setScalar(breathe);

        // Proximity opacity with cached centers (no Box3!)
        const camPos = camera.position;
        allLines.forEach((line, i) => {
          line.material.color.lerp(lightLineColor, 0.08);
          worldCenter.copy(lineCenters[i]);
          wrapper.localToWorld(worldCenter);
          const dist = camPos.distanceTo(worldCenter);
          const maxDist = sf * 4;
          const proximity = 1 - Math.min(1, dist / maxDist);
          const breath = Math.sin(t + proximity * 10) * 0.02;
          line.material.opacity = 0.25 + proximity * 0.40 + breath;
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
    .catch(err => console.error('BEE Hero: edge load failed:', err));

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }, 150);
  });
})();
