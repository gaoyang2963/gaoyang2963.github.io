// Visitor widget: IP geolocation + busuanzi pageview counter
(function() {
  'use strict';

  // Busuanzi - site/page view counter
  // Load script asynchronously
  function loadBusuanzi() {
    if (typeof busuanzi !== 'undefined') return;
    var s = document.createElement('script');
    s.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
    s.async = true;
    document.head.appendChild(s);
  }

  // IP geolocation using free API
  function detectLocation() {
    var infoEl = document.getElementById('visitor-info');
    var locationEl = infoEl ? infoEl.querySelector('.visitor-location') : null;
    if (!locationEl) return;

    // Try ipapi.co first (no key needed, 1000/day free)
    fetch('https://ipapi.co/json/')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data.city && data.country_name) {
          locationEl.textContent = 'You are visiting from: ' + data.city + ', ' + data.country_name;
        } else if (data.region && data.country_name) {
          locationEl.textContent = 'You are visiting from: ' + data.region + ', ' + data.country_name;
        } else if (data.country_name) {
          locationEl.textContent = 'You are visiting from: ' + data.country_name;
        }
      })
      .catch(function() {
        // Fallback: ip-api.com
        fetch('http://ip-api.com/json/')
          .then(function(r) { return r.json(); })
          .then(function(data) {
            if (data.city && data.country) {
              locationEl.textContent = 'You are visiting from: ' + data.city + ', ' + data.country;
            }
          })
          .catch(function() {
            locationEl.textContent = 'Location detection unavailable';
          });
      });
  }

  // Init when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Only run on pages that have the visitor widget
    if (!document.getElementById('visitor-widget')) return;

    loadBusuanzi();
    detectLocation();

    // Update busuanzi count after it loads
    var attempts = 0;
    var timer = setInterval(function() {
      attempts++;
      var pv = document.getElementById('busuanzi_value_site_pv');
      if (pv && pv.textContent && pv.textContent !== '-') {
        clearInterval(timer);
      }
      if (attempts > 30) clearInterval(timer);
    }, 500);
  }
})();
