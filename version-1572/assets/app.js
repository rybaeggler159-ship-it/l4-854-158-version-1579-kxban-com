(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector("[data-hero-carousel]");
    if (!carousel) {
      return;
    }
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
    var prev = carousel.querySelector("[data-hero-prev]");
    var next = carousel.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initListingFilters() {
    var containers = Array.prototype.slice.call(document.querySelectorAll("[data-movie-listing]"));
    containers.forEach(function (container) {
      var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
      var input = container.querySelector("[data-search-input]");
      var yearFilter = container.querySelector("[data-year-filter]");
      var typeFilter = container.querySelector("[data-type-filter]");
      var count = container.querySelector("[data-result-count]");
      var chips = Array.prototype.slice.call(container.querySelectorAll(".filter-chip"));
      var selectedRegion = "";
      var selectedCategory = "";

      function apply() {
        var query = normalize(input ? input.value : "");
        var year = normalize(yearFilter ? yearFilter.value : "");
        var type = normalize(typeFilter ? typeFilter.value : "");
        var visible = 0;

        cards.forEach(function (card) {
          var search = normalize(card.getAttribute("data-search"));
          var cardYear = normalize(card.getAttribute("data-year"));
          var cardType = normalize(card.getAttribute("data-type"));
          var cardRegion = normalize(card.getAttribute("data-region"));
          var cardCategory = normalize(card.getAttribute("data-category"));
          var matched = true;

          if (query && search.indexOf(query) === -1) {
            matched = false;
          }
          if (year && cardYear !== year) {
            matched = false;
          }
          if (type && cardType !== type) {
            matched = false;
          }
          if (selectedRegion && cardRegion !== selectedRegion) {
            matched = false;
          }
          if (selectedCategory && cardCategory !== selectedCategory) {
            matched = false;
          }

          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = "当前显示 " + visible + " 部影片";
        }
      }

      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          var reset = chip.hasAttribute("data-filter-reset");
          var region = chip.getAttribute("data-filter-region") || "";
          var category = chip.getAttribute("data-filter-category") || "";

          if (reset) {
            selectedRegion = "";
            selectedCategory = "";
            if (input) {
              input.value = "";
            }
            if (yearFilter) {
              yearFilter.value = "";
            }
            if (typeFilter) {
              typeFilter.value = "";
            }
          } else if (region) {
            selectedRegion = region.toLowerCase();
            selectedCategory = "";
          } else if (category) {
            selectedCategory = category.toLowerCase();
            selectedRegion = "";
          }

          chips.forEach(function (item) {
            item.classList.remove("is-active");
          });
          chip.classList.add("is-active");
          apply();
        });
      });

      [input, yearFilter, typeFilter].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      var source = shell.getAttribute("data-m3u8");
      var attached = false;
      var hls;

      if (!video || !source || !overlay) {
        return;
      }

      function attachSource() {
        if (attached) {
          return;
        }
        attached = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: false });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else {
          video.src = source;
        }
      }

      function startPlayback() {
        attachSource();
        overlay.classList.add("is-hidden");
        video.controls = true;
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }

      overlay.addEventListener("click", startPlayback);
      video.addEventListener("click", function () {
        if (video.paused) {
          startPlayback();
        }
      });
      video.addEventListener("playing", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (video.currentTime === 0) {
          overlay.classList.remove("is-hidden");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && typeof hls.destroy === "function") {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initListingFilters();
    initPlayers();
  });
})();
