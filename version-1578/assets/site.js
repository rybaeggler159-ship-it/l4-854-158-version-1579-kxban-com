(function () {
  function getRootPrefix() {
    return document.body.getAttribute('data-root') || '';
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function initMobileNavigation() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('open');
    });
  }

  function initHeroCarousel() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var next = document.querySelector('[data-hero-next]');
    var prev = document.querySelector('[data-hero-prev]');

    if (slides.length === 0) {
      return;
    }

    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }

    function startAutoPlay() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startAutoPlay();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeIndex + 1);
        startAutoPlay();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(activeIndex - 1);
        startAutoPlay();
      });
    }

    showSlide(0);
    startAutoPlay();
  }

  function initDomFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-page-filter]'));

    panels.forEach(function (panel) {
      var scopeSelector = panel.getAttribute('data-filter-scope') || 'body';
      var scope = document.querySelector(scopeSelector) || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
      var keywordInput = panel.querySelector('[data-filter-keyword]');
      var yearSelect = panel.querySelector('[data-filter-year]');
      var regionSelect = panel.querySelector('[data-filter-region]');
      var typeSelect = panel.querySelector('[data-filter-type]');
      var countTarget = document.querySelector(panel.getAttribute('data-count-target'));

      function getValue(element) {
        return element ? String(element.value || '').trim().toLowerCase() : '';
      }

      function update() {
        var keyword = getValue(keywordInput);
        var year = getValue(yearSelect);
        var region = getValue(regionSelect);
        var type = getValue(typeSelect);
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title'),
            card.getAttribute('data-year'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-tags')
          ].join(' ').toLowerCase();

          var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
          var matchesYear = !year || String(card.getAttribute('data-year')) === year;
          var matchesRegion = !region || String(card.getAttribute('data-region')).toLowerCase().indexOf(region) !== -1;
          var matchesType = !type || String(card.getAttribute('data-type')).toLowerCase().indexOf(type) !== -1;
          var matches = matchesKeyword && matchesYear && matchesRegion && matchesType;

          card.classList.toggle('hidden-by-filter', !matches);

          if (matches) {
            visible += 1;
          }
        });

        if (countTarget) {
          countTarget.textContent = '当前显示 ' + visible + ' 部影片';
        }
      }

      [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener('input', update);
          control.addEventListener('change', update);
        }
      });

      update();
    });
  }

  function createMovieCard(movie, root) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<article class="movie-card" data-movie-card>',
      '  <a class="movie-cover" href="' + root + 'movies/' + escapeHtml(movie.id) + '.html">',
      '    <div class="poster-frame">',
      '      <img src="' + root + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy" onerror="this.style.display=\'none\';">',
      '    </div>',
      '    <span class="play-chip">立即观看</span>',
      '  </a>',
      '  <div class="movie-card-body">',
      '    <div class="movie-meta-line"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
      '    <h3><a href="' + root + 'movies/' + escapeHtml(movie.id) + '.html">' + escapeHtml(movie.title) + '</a></h3>',
      '    <p>' + escapeHtml(movie.one_line || '').slice(0, 70) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '    <div class="card-footer"><span class="score">★ ' + escapeHtml(movie.score) + '</span><a href="' + root + 'category-' + escapeHtml(movie.category_slug) + '.html">' + escapeHtml(movie.category_name) + '</a></div>',
      '  </div>',
      '</article>'
    ].join('\n');
  }

  function uniqueValues(items, key) {
    var seen = {};
    return items.map(function (item) {
      return item[key];
    }).filter(function (value) {
      if (!value || seen[value]) {
        return false;
      }
      seen[value] = true;
      return true;
    }).sort();
  }

  function setSelectOptions(select, values, placeholder) {
    if (!select) {
      return;
    }

    select.innerHTML = '<option value="">' + escapeHtml(placeholder) + '</option>' + values.map(function (value) {
      return '<option value="' + escapeHtml(value) + '">' + escapeHtml(value) + '</option>';
    }).join('');
  }

  function initSearchPage() {
    var container = document.querySelector('[data-search-results]');

    if (!container || !window.MOVIES) {
      return;
    }

    var root = getRootPrefix();
    var params = new URLSearchParams(window.location.search);
    var keywordInput = document.querySelector('[data-search-keyword]');
    var categorySelect = document.querySelector('[data-search-category]');
    var yearSelect = document.querySelector('[data-search-year]');
    var regionSelect = document.querySelector('[data-search-region]');
    var countTarget = document.querySelector('[data-search-count]');
    var empty = document.querySelector('[data-search-empty]');

    setSelectOptions(categorySelect, uniqueValues(window.MOVIES, 'category_name'), '全部分类');
    setSelectOptions(yearSelect, uniqueValues(window.MOVIES, 'year').reverse(), '全部年份');
    setSelectOptions(regionSelect, uniqueValues(window.MOVIES, 'region'), '全部地区');

    if (keywordInput) {
      keywordInput.value = params.get('q') || '';
    }

    function valueOf(element) {
      return element ? String(element.value || '').trim().toLowerCase() : '';
    }

    function render() {
      var keyword = valueOf(keywordInput);
      var category = valueOf(categorySelect);
      var year = valueOf(yearSelect);
      var region = valueOf(regionSelect);
      var results = window.MOVIES.filter(function (movie) {
        var haystack = [
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category_name,
          (movie.tags || []).join(' '),
          movie.one_line
        ].join(' ').toLowerCase();

        return (!keyword || haystack.indexOf(keyword) !== -1)
          && (!category || String(movie.category_name).toLowerCase() === category)
          && (!year || String(movie.year).toLowerCase() === year)
          && (!region || String(movie.region).toLowerCase() === region);
      });

      container.innerHTML = results.slice(0, 240).map(function (movie) {
        return createMovieCard(movie, root);
      }).join('\n');

      if (countTarget) {
        var suffix = results.length > 240 ? '，已展示前 240 部，可继续缩小筛选条件' : '';
        countTarget.textContent = '找到 ' + results.length + ' 部影片' + suffix;
      }

      if (empty) {
        empty.style.display = results.length ? 'none' : 'block';
      }
    }

    [keywordInput, categorySelect, yearSelect, regionSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', render);
        control.addEventListener('change', render);
      }
    });

    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNavigation();
    initHeroCarousel();
    initDomFilters();
    initSearchPage();
  });
}());
