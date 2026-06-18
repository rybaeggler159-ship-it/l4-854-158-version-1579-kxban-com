(function () {
    var menuButton = document.querySelector(".menu-toggle");
    if (menuButton) {
        menuButton.addEventListener("click", function () {
            var opened = document.body.classList.toggle("nav-open");
            menuButton.setAttribute("aria-expanded", opened ? "true" : "false");
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var current = 0;
        var show = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("active", i === current);
            });
        };
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
        var input = scope.querySelector("[data-filter-input]");
        var regionSelect = scope.querySelector("[data-filter-select='region']");
        var typeSelect = scope.querySelector("[data-filter-select='type']");
        var items = Array.prototype.slice.call(scope.querySelectorAll("[data-title]"));
        var apply = function () {
            var term = input ? input.value.trim().toLowerCase() : "";
            var region = regionSelect ? regionSelect.value : "";
            var type = typeSelect ? typeSelect.value : "";
            items.forEach(function (item) {
                var text = [
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-year"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-tags")
                ].join(" ").toLowerCase();
                var okTerm = !term || text.indexOf(term) !== -1;
                var okRegion = !region || item.getAttribute("data-region") === region;
                var okType = !type || item.getAttribute("data-type") === type;
                item.classList.toggle("is-filter-hidden", !(okTerm && okRegion && okType));
            });
        };
        if (input) {
            input.addEventListener("input", apply);
            var q = new URLSearchParams(window.location.search).get("q");
            if (q) {
                input.value = q;
                apply();
            }
        }
        if (regionSelect) {
            regionSelect.addEventListener("change", apply);
        }
        if (typeSelect) {
            typeSelect.addEventListener("change", apply);
        }
    });
})();

function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("play-overlay");
    if (!video || !overlay || !source) {
        return;
    }
    var loaded = false;
    var hlsInstance = null;
    var load = function () {
        if (loaded) {
            return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls();
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
        } else {
            video.src = source;
        }
        loaded = true;
    };
    var start = function () {
        load();
        overlay.classList.add("is-hidden");
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    };
    overlay.addEventListener("click", start);
    video.addEventListener("click", function () {
        if (!loaded || video.paused) {
            start();
        }
    });
    video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
    });
    window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
            hlsInstance.destroy();
        }
    });
}
