(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var menuButton = document.querySelector('[data-menu-toggle]');
  var navigation = document.querySelector('[data-navigation]');

  if (menuButton && navigation) {
    menuButton.addEventListener('click', function () {
      navigation.classList.toggle('is-open');
    });
  }

  selectAll('[data-hero]').forEach(function (slider) {
    var slides = selectAll('[data-hero-slide]', slider);
    var dots = selectAll('[data-hero-dot]', slider);
    var previous = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (previous) {
      previous.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        restart();
      });
    });

    show(0);
    start();
  });

  selectAll('[data-search-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-search-input]');
    var cards = selectAll('[data-search-card]', scope);
    var empty = scope.querySelector('[data-empty-state]');

    function filter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var shown = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search-card').toLowerCase();
        var visible = !keyword || text.indexOf(keyword) !== -1;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (empty) {
        empty.hidden = shown !== 0;
      }
    }

    if (input) {
      input.addEventListener('input', filter);
      filter();
    }
  });

  selectAll('[data-player]').forEach(function (player) {
    var video = player.querySelector('video');
    var overlay = player.querySelector('[data-play-button]');
    var sourceNode = video ? video.querySelector('source') : null;
    var playlist = sourceNode ? sourceNode.getAttribute('src') : '';
    var prepared = false;
    var hlsInstance = null;

    function prepare() {
      if (!video || prepared || !playlist) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        selectAll('source', video).forEach(function (source) {
          source.parentNode.removeChild(source);
        });
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(playlist);
        hlsInstance.attachMedia(video);
      } else {
        video.setAttribute('src', playlist);
      }

      prepared = true;
    }

    function play() {
      prepare();
      player.classList.add('is-playing');
      if (video) {
        var attempt = video.play();
        if (attempt && typeof attempt.catch === 'function') {
          attempt.catch(function () {});
        }
      }
    }

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });
      video.addEventListener('ended', function () {
        if (hlsInstance) {
          hlsInstance.stopLoad();
        }
      });
    }
  });
})();
