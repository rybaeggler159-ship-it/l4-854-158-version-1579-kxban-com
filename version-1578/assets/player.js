(function () {
  function loadHlsLibrary() {
    return new Promise(function (resolve, reject) {
      if (window.Hls) {
        resolve(window.Hls);
        return;
      }

      var existingScript = document.querySelector('script[data-hls-library]');

      if (existingScript) {
        existingScript.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existingScript.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.20/dist/hls.min.js';
      script.async = true;
      script.defer = true;
      script.setAttribute('data-hls-library', 'true');
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', reject);
      document.head.appendChild(script);
    });
  }

  function setStatus(player, message) {
    var status = player.querySelector('[data-player-status]');

    if (status) {
      status.textContent = message;
    }
  }

  async function attachSource(player, video, source) {
    if (video.dataset.ready === 'true') {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.ready = 'true';
      return;
    }

    var Hls = await loadHlsLibrary();

    if (!Hls || !Hls.isSupported()) {
      throw new Error('当前浏览器不支持 HLS 播放。');
    }

    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
      backBufferLength: 90
    });

    hls.loadSource(source);
    hls.attachMedia(video);
    video.dataset.ready = 'true';
    player._hls = hls;
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('[data-play-button]');
      var overlay = player.querySelector('[data-player-overlay]');
      var source = player.getAttribute('data-m3u8');

      if (!video || !button || !source) {
        return;
      }

      button.addEventListener('click', async function () {
        button.disabled = true;
        setStatus(player, '正在初始化播放线路…');

        try {
          await attachSource(player, video, source);
          if (overlay) {
            overlay.classList.add('hidden');
          }
          await video.play();
          setStatus(player, '播放已开始');
        } catch (error) {
          button.disabled = false;
          setStatus(player, '播放器初始化失败，请检查网络或播放源。');
          console.error(error);
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initPlayers);
}());
