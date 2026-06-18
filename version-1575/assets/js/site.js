(function () {
    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");

    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === current;
                slide.classList.toggle("is-active", active);
                slide.setAttribute("aria-hidden", active ? "false" : "true");
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }

            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5000);
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    function applyFilters(panel) {
        var root = panel.closest("main") || document;
        var cards = Array.prototype.slice.call(root.querySelectorAll("[data-card]"));
        var input = panel.querySelector("[data-search-input]");
        var region = panel.querySelector("[data-region-filter]");
        var year = panel.querySelector("[data-year-filter]");
        var genre = panel.querySelector("[data-genre-filter]");
        var text = normalize(input ? input.value : "");
        var regionValue = normalize(region ? region.value : "");
        var yearValue = normalize(year ? year.value : "");
        var genreValue = normalize(genre ? genre.value : "");

        cards.forEach(function (card) {
            var searchable = normalize([
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-year"),
                card.getAttribute("data-genre"),
                card.getAttribute("data-type")
            ].join(" "));
            var matchText = !text || searchable.indexOf(text) !== -1;
            var matchRegion = !regionValue || normalize(card.getAttribute("data-region")) === regionValue;
            var matchYear = !yearValue || normalize(card.getAttribute("data-year")) === yearValue;
            var matchGenre = !genreValue || normalize(card.getAttribute("data-genre")).indexOf(genreValue) !== -1;

            card.classList.toggle("is-hidden", !(matchText && matchRegion && matchYear && matchGenre));
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-box]")).forEach(function (panel) {
        var controls = Array.prototype.slice.call(panel.querySelectorAll("input, select"));
        var reset = panel.querySelector("[data-filter-reset]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        var searchInput = panel.querySelector("[data-search-input]");

        if (query && searchInput) {
            searchInput.value = query;
        }

        controls.forEach(function (control) {
            control.addEventListener("input", function () {
                applyFilters(panel);
            });

            control.addEventListener("change", function () {
                applyFilters(panel);
            });
        });

        if (reset) {
            reset.addEventListener("click", function () {
                controls.forEach(function (control) {
                    control.value = "";
                });
                applyFilters(panel);
            });
        }

        applyFilters(panel);
    });
})();
