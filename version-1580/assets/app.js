(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function openMobileMenu() {
    var toggle = $('.mobile-toggle');
    var panel = $('.mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
      toggle.setAttribute('aria-expanded', panel.classList.contains('open') ? 'true' : 'false');
    });
  }

  function setupHero() {
    var slides = $all('.hero-slide');
    var dots = $all('.hero-dot');
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function filterCards() {
    var input = $('.js-filter-input');
    var region = $('.js-filter-region');
    var year = $('.js-filter-year');
    var cards = $all('.movie-card');
    var empty = $('.empty-result');
    if (!cards.length) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    if (input && q) {
      input.value = q;
    }
    function apply() {
      var keyword = normalize(input ? input.value : '');
      var regionValue = normalize(region ? region.value : '');
      var yearValue = normalize(year ? year.value : '');
      var count = 0;
      cards.forEach(function (card) {
        var text = normalize(card.textContent);
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var ok = true;
        if (keyword && text.indexOf(keyword) === -1) {
          ok = false;
        }
        if (regionValue && cardRegion.indexOf(regionValue) === -1) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }
        card.style.display = ok ? '' : 'none';
        if (ok) {
          count += 1;
        }
      });
      if (empty) {
        empty.style.display = count ? 'none' : 'block';
      }
    }
    [input, region, year].forEach(function (control) {
      if (control) {
        control.addEventListener('input', apply);
        control.addEventListener('change', apply);
      }
    });
    apply();
  }

  function setupPlayers() {
    $all('.js-watch-player').forEach(function (box) {
      var video = $('video', box);
      var button = $('.play-layer', box);
      var stream = box.getAttribute('data-stream');
      var started = false;
      if (!video || !stream) {
        return;
      }
      function attach() {
        if (started) {
          video.play();
          return;
        }
        started = true;
        if (button) {
          button.classList.add('hidden');
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          video.play();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play();
          });
          return;
        }
        video.src = stream;
        video.play();
      }
      if (button) {
        button.addEventListener('click', function (event) {
          event.stopPropagation();
          attach();
        });
      }
      box.addEventListener('click', function (event) {
        if (event.target === video) {
          return;
        }
        attach();
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          attach();
        }
      });
    });
  }

  openMobileMenu();
  setupHero();
  filterCards();
  setupPlayers();
})();
