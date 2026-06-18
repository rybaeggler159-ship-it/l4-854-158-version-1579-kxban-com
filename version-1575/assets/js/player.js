(function () {
    window.initMoviePlayer = function (streamUrl) {
        var video = document.getElementById("movie-player");
        var frame = document.querySelector("[data-player-frame]");
        var overlay = document.querySelector("[data-player-overlay]");
        var playButton = document.querySelector("[data-play-button]");
        var hlsInstance = null;
        var ready = false;

        if (!video || !streamUrl) {
            return;
        }

        function hideOverlay() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        }

        function attachStream() {
            if (ready) {
                return;
            }

            ready = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });

                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);

                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }

                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hlsInstance.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hlsInstance.recoverMediaError();
                    } else {
                        hlsInstance.destroy();
                    }
                });

                return;
            }

            video.src = streamUrl;
        }

        function play() {
            attachStream();
            hideOverlay();

            var promise = video.play();

            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (playButton) {
            playButton.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();
                play();
            });
        }

        if (overlay) {
            overlay.addEventListener("click", function () {
                play();
            });
        }

        if (frame) {
            frame.addEventListener("click", function (event) {
                if (event.target === video && video.paused) {
                    play();
                }
            });
        }

        video.addEventListener("play", hideOverlay);
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
    };
})();
