(function() {
  'use strict';

  function initPerformance() {
    if (!window.performance) return;

    window.performance.mark('finboard-app-start');

    window.addEventListener('load', function() {
      window.performance.mark('finboard-loaded');
      
      setTimeout(function() {
        logPerformanceMetrics();
      }, 1000);
    });

    let lastUrl = location.href;
    new MutationObserver(function() {
      const url = location.href;
      if (url !== lastUrl) {
        lastUrl = url;
        window.performance.mark('route-change-' + Date.now());
      }
    }).observe(document, { subtree: true, childList: true });
  }

  function logPerformanceMetrics() {
    if (!window.performance) return;

    const nav = window.performance.getEntriesByType('navigation')[0];
    const paint = window.performance.getEntriesByType('paint');
    
    const metrics = {
      domContentLoaded: nav ? nav.domContentLoadedEventEnd - nav.domContentLoadedEventStart : 0,
      loadTime: nav ? nav.loadEventEnd - nav.loadEventStart : 0,
      firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
      firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
      resources: window.performance.getEntriesByType('resource').length,
    };

    console.group('📊 FinBoard Performance');
    console.log('Load Metrics:', metrics);
    console.log('Memory:', window.performance.memory || 'Not available');
    console.groupEnd();
  }

  function optimizeResources() {
    // Skip font preloading - Next.js handles Geist fonts automatically
    // Focus on lazy loading optimization instead
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.remove('lazy');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      document.querySelectorAll('img[data-src]').forEach(function(img) {
        imageObserver.observe(img);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      initPerformance();
      optimizeResources();
    });
  } else {
    initPerformance();
    optimizeResources();
  }

  window.FinBoardPerf = {
    logMetrics: logPerformanceMetrics,
    mark: function(name) {
      window.performance.mark('finboard-' + name);
    }
  };

})();