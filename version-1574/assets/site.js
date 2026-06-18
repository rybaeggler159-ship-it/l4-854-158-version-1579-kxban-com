(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var carousel = document.querySelector('[data-hero-carousel]');
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
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
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function fillFilterOptions(cards, selector, attribute) {
    var select = document.querySelector(selector);
    if (!select) {
      return;
    }
    var values = cards
      .map(function (card) {
        return card.getAttribute(attribute) || '';
      })
      .filter(Boolean)
      .filter(function (value, index, array) {
        return array.indexOf(value) === index;
      })
      .sort(function (a, b) {
        if (/^\d{4}$/.test(a) && /^\d{4}$/.test(b)) {
          return Number(b) - Number(a);
        }
        return a.localeCompare(b, 'zh-CN');
      });

    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function initLocalFilters() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-movie-card]'));
    var input = document.querySelector('[data-local-filter]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    var status = document.querySelector('[data-filter-status]');

    if (!cards.length || (!input && !yearSelect && !typeSelect)) {
      return;
    }

    fillFilterOptions(cards, '[data-year-filter]', 'data-year');
    fillFilterOptions(cards, '[data-type-filter]', 'data-type');

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var year = yearSelect ? yearSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var cardYear = card.getAttribute('data-year') || '';
        var cardType = card.getAttribute('data-type') || '';
        var matched = true;

        if (query && text.indexOf(query) === -1) {
          matched = false;
        }
        if (year && cardYear !== year) {
          matched = false;
        }
        if (type && cardType !== type) {
          matched = false;
        }

        card.classList.toggle('is-hidden', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前显示 ' + visible + ' 部';
      }
    }

    [input, yearSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  }

  function cardTemplate(movie) {
    return '' +
      '<article class="movie-card" data-movie-card>' +
        '<a href="' + movie.url + '" class="movie-card-link" aria-label="观看 ' + escapeHtml(movie.title) + '">' +
          '<div class="movie-cover" style="background-image: url(\'' + movie.cover + '\');">' +
            '<div class="cover-shade"></div>' +
            '<span class="play-dot">▶</span>' +
          '</div>' +
          '<div class="movie-card-body">' +
            '<div class="badge-row">' +
              '<span>' + escapeHtml(movie.year) + '</span>' +
              '<span>' + escapeHtml(movie.region) + '</span>' +
              '<span>' + escapeHtml(movie.type) + '</span>' +
            '</div>' +
            '<h3>' + escapeHtml(movie.title) + '</h3>' +
            '<p>' + escapeHtml(movie.oneLine) + '</p>' +
          '</div>' +
        '</a>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initGlobalSearch() {
    var app = document.querySelector('[data-search-app]');
    if (!app || !window.MOVIE_INDEX) {
      return;
    }
    var input = app.querySelector('[data-global-search]');
    var button = app.querySelector('[data-global-search-button]');
    var resultBox = app.querySelector('[data-search-results]');
    var title = app.querySelector('[data-search-title]');
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';

    function render(query) {
      var normalized = query.trim().toLowerCase();
      var results = window.MOVIE_INDEX.filter(function (movie) {
        if (!normalized) {
          return movie.featured;
        }
        return movie.search.indexOf(normalized) !== -1;
      }).slice(0, normalized ? 80 : 24);

      resultBox.innerHTML = results.map(cardTemplate).join('');
      title.textContent = normalized ? '搜索结果：' + results.length + ' 部' : '热门推荐';
    }

    if (input) {
      input.value = initialQuery;
      input.addEventListener('input', function () {
        render(input.value);
      });
    }

    if (button) {
      button.addEventListener('click', function () {
        render(input ? input.value : '');
      });
    }

    render(initialQuery);
  }

  ready(function () {
    initMenu();
    initHero();
    initLocalFilters();
    initGlobalSearch();
  });
})();
