/**
 * BEE Modular — Hand-drawn circle animation
 * Draws an organic SVG circle/ellipse around text when it scrolls into view.
 *
 * Usage: Add class="handdrawn-circle" to any element you want circled.
 * Optional: data-color="#b5a291" to override stroke color.
 *           data-width="8" to override stroke width.
 *
 * Auto-detects dark backgrounds and uses accent beige color.
 */
(function() {
  // SVG path for an organic, hand-drawn circle/ellipse
  // Slightly wobbly, not perfectly round — feels human
  function getCirclePath(w, h) {
    const cx = w / 2;
    const cy = h / 2;
    const rx = w / 2 + 15;
    const ry = h / 2 + 12;
    // Two passes for a hand-drawn feel — slight offset on second pass
    return `M ${cx + rx * 0.97} ${cy - ry * 0.08}
      C ${cx + rx * 0.9} ${cy - ry * 0.95},
        ${cx - rx * 0.1} ${cy - ry * 1.05},
        ${cx - rx * 0.95} ${cy - ry * 0.15}
      C ${cx - rx * 1.02} ${cy + ry * 0.3},
        ${cx - rx * 0.85} ${cy + ry * 1.0},
        ${cx + rx * 0.05} ${cy + ry * 0.98}
      C ${cx + rx * 0.6} ${cy + ry * 1.02},
        ${cx + rx * 1.0} ${cy + ry * 0.4},
        ${cx + rx * 0.97} ${cy - ry * 0.08}`;
  }

  function initHanddrawn() {
    const targets = document.querySelectorAll('.handdrawn-circle');
    if (!targets.length) return;

    targets.forEach(function(el) {
      // Detect if on dark background
      const bg = window.getComputedStyle(el.closest('section, div') || el).backgroundColor;
      const m = bg.match(/(\d+)/g);
      const brightness = m ? (parseInt(m[0]) * 0.299 + parseInt(m[1]) * 0.587 + parseInt(m[2]) * 0.114) : 200;
      const isDark = brightness < 100;

      const color = el.getAttribute('data-color') || (isDark ? 'rgba(181,162,145,0.5)' : 'rgba(181,162,145,0.3)');
      const strokeWidth = el.getAttribute('data-width') || '3';

      // Wrap element for relative positioning
      el.style.position = 'relative';
      el.style.display = 'inline-block';

      // Create SVG overlay
      const rect = el.getBoundingClientRect();
      const w = el.offsetWidth;
      const h = el.offsetHeight;

      const padX = 50, padY = 35;
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', w + padX * 2);
      svg.setAttribute('height', h + padY * 2);
      svg.setAttribute('viewBox', `0 0 ${w + padX * 2} ${h + padY * 2}`);
      svg.style.cssText = `
        position: absolute;
        top: -${padY}px; left: -${padX}px;
        pointer-events: none;
        z-index: -1;
        overflow: visible;
      `;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', getCirclePath(w + padX * 2, h + padY * 2));
      path.setAttribute('fill', 'none');
      path.setAttribute('stroke', color);
      path.setAttribute('stroke-width', strokeWidth);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');

      // Set up for animation
      const length = path.getTotalLength ? path.getTotalLength() : 1500;
      path.style.strokeDasharray = length;
      path.style.strokeDashoffset = length;
      path.style.transition = 'none';

      svg.appendChild(path);
      el.appendChild(svg);

      // Animate when visible
      const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            // Small delay then draw
            setTimeout(function() {
              path.style.transition = 'stroke-dashoffset 2s cubic-bezier(0.43, 0.13, 0.23, 0.96)';
              path.style.strokeDashoffset = '0';
            }, 300);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(el);
    });
  }

  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHanddrawn);
  } else {
    // Small delay to ensure layout is calculated
    setTimeout(initHanddrawn, 100);
  }
})();
