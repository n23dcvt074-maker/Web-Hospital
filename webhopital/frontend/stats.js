(function(){
  'use strict';
  function formatNumber(n){
    try {
      return n.toLocaleString('vi-VN');
    } catch (e) {
      return String(n);
    }
  }

  function animateCount(el){
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    // duration scales gently with target size for nicer pacing
    const base = 900;
    const scale = Math.min(2200, base + Math.floor(Math.log10(Math.max(1, target)) * 600));
    const duration = Math.max(700, scale);
    const start = 0;
    const startTime = performance.now();

    function tick(now){
      const progress = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = formatNumber(current) + suffix;
      if(progress < 1){
        requestAnimationFrame(tick);
      } else {
        el.textContent = formatNumber(target) + suffix;
      }
    }

    requestAnimationFrame(tick);
  }

  function initCounters(){
    const els = document.querySelectorAll('.stat-number');
    if(!els || els.length === 0) return;

    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){
          const el = entry.target;
          if(!el.dataset.animated){
            animateCount(el);
            el.dataset.animated = '1';
          }
          // optional: unobserve after animated
          obs.unobserve(el);
        }
      });
    }, {threshold: 0.4});

    els.forEach(el => {
      // ensure initial text is 0 or formatted 0
      el.textContent = '0' + (el.getAttribute('data-suffix')||'');
      io.observe(el);
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initCounters);
  } else {
    initCounters();
  }
})();
