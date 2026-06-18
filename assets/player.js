(function () {
    window.initMoviePlayer = function (videoId, coverId, url) {
        var video = document.getElementById(videoId);
        var cover = document.getElementById(coverId);
        var attached = false;
        var hlsInstance = null;

        function getHlsClass() {
            return window.Hls || window.LocalHls || null;
        }

        function attachSource() {
            if (attached || !video) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url;
                return;
            }
            var HlsClass = getHlsClass();
            if (HlsClass && HlsClass.isSupported()) {
                hlsInstance = new HlsClass({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(url);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = url;
        }

        function startPlayback() {
            attachSource();
            if (cover) {
                cover.classList.add('is-hidden');
            }
            video.controls = true;
            var playing = video.play();
            if (playing && playing.catch) {
                playing.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!attached) {
                    startPlayback();
                }
            });
            window.addEventListener('beforeunload', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    };
}());
