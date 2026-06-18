(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var mobileNav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !mobileNav) {
      return;
    }

    toggle.addEventListener("click", function () {
      mobileNav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function uniqueValues(cards, key) {
    var values = cards.map(function (card) {
      return card.getAttribute(key) || "";
    }).filter(Boolean);

    return Array.from(new Set(values)).sort(function (a, b) {
      return b.localeCompare(a, "zh-Hans-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }

    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll(".js-filter-scope"));

    scopes.forEach(function (scope) {
      var search = scope.querySelector(".movie-search");
      var region = scope.querySelector(".region-filter");
      var year = scope.querySelector(".year-filter");
      var type = scope.querySelector(".type-filter");
      var section = scope.parentElement;
      var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
      var empty = document.createElement("div");
      empty.className = "filter-empty";
      empty.textContent = "没有找到匹配内容";
      empty.hidden = true;

      if (cards.length) {
        cards[cards.length - 1].after(empty);
      }

      fillSelect(region, uniqueValues(cards, "data-region"));
      fillSelect(year, uniqueValues(cards, "data-year"));
      fillSelect(type, uniqueValues(cards, "data-type"));

      function apply() {
        var keyword = search ? search.value.trim().toLowerCase() : "";
        var regionValue = region ? region.value : "";
        var yearValue = year ? year.value : "";
        var typeValue = type ? type.value : "";
        var visible = 0;

        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute("data-title"),
            card.getAttribute("data-region"),
            card.getAttribute("data-type"),
            card.getAttribute("data-year"),
            card.getAttribute("data-genre")
          ].join(" ").toLowerCase();

          var matched = true;
          matched = matched && (!keyword || haystack.indexOf(keyword) !== -1);
          matched = matched && (!regionValue || card.getAttribute("data-region") === regionValue);
          matched = matched && (!yearValue || card.getAttribute("data-year") === yearValue);
          matched = matched && (!typeValue || card.getAttribute("data-type") === typeValue);

          card.hidden = !matched;

          if (matched) {
            visible += 1;
          }
        });

        empty.hidden = visible !== 0;
      }

      [search, region, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });
    });
  }

  ready(function () {
    setupNavigation();
    setupHero();
    setupFilters();
  });
})();
