(function () {
    var header = document.querySelector('.site-header');
    var menuToggle = document.querySelector('.menu-toggle');

    if (header && menuToggle) {
        menuToggle.addEventListener('click', function () {
            header.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var activeIndex = 0;

    function activateSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, itemIndex) {
            slide.classList.toggle('active', itemIndex === activeIndex);
        });
        dots.forEach(function (dot, itemIndex) {
            dot.classList.toggle('active', itemIndex === activeIndex);
        });
    }

    dots.forEach(function (dot, itemIndex) {
        dot.addEventListener('click', function () {
            activateSlide(itemIndex);
        });
    });

    if (slides.length > 1) {
        window.setInterval(function () {
            activateSlide(activeIndex + 1);
        }, 5200);
    }

    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));

    function normalizeText(value) {
        return String(value || '').toLowerCase().trim();
    }

    function filterCards(input) {
        var scope = input.closest('[data-filter-scope]') || document;
        var query = normalizeText(input.value);
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
        var empty = scope.querySelector('.no-results');
        var shown = 0;

        cards.forEach(function (card) {
            var haystack = [
                card.getAttribute('data-title'),
                card.getAttribute('data-region'),
                card.getAttribute('data-year'),
                card.getAttribute('data-genre'),
                card.getAttribute('data-tags')
            ].join(' ').toLowerCase();
            var matched = !query || haystack.indexOf(query) !== -1;
            card.style.display = matched ? '' : 'none';
            if (matched) {
                shown += 1;
            }
        });

        if (empty) {
            empty.style.display = shown ? 'none' : 'block';
        }
    }

    filterInputs.forEach(function (input) {
        input.addEventListener('input', function () {
            filterCards(input);
        });
        if (input.value) {
            filterCards(input);
        }
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
        filterInputs.forEach(function (input) {
            if (!input.value) {
                input.value = initialQuery;
                filterCards(input);
            }
        });
    }

    var chipButtons = Array.prototype.slice.call(document.querySelectorAll('[data-chip-filter]'));
    chipButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var scope = button.closest('[data-filter-scope]') || document;
            var field = button.getAttribute('data-chip-filter');
            var value = button.getAttribute('data-chip-value');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-title]'));
            var siblings = Array.prototype.slice.call(scope.querySelectorAll('[data-chip-filter="' + field + '"]'));
            siblings.forEach(function (item) {
                item.classList.remove('active');
            });
            button.classList.add('active');
            cards.forEach(function (card) {
                var matched = value === 'all' || card.getAttribute('data-' + field) === value;
                card.style.display = matched ? '' : 'none';
            });
        });
    });
}());
