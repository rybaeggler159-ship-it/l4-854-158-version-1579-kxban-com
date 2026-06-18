(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var video = document.getElementById("movieVideo");
    var cover = document.querySelector("[data-player-cover]");
    var shell = document.querySelector("[data-player-shell]");
    var url = window.__PLAYER_URL__;
    var started = false;
    var hls = null;

    if (!video || !url) {
      return;
    }

    function attach() {
      if (started) {
        return;
      }

      started = true;

      if (cover) {
        cover.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      var playPromise = video.play();

      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", attach);
    }

    if (shell) {
      shell.addEventListener("click", function (event) {
        if (!started && event.target !== video) {
          attach();
        }
      });
    }

    video.addEventListener("click", function () {
      if (!started) {
        attach();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
        hls = null;
      }
    });
  });
})();
