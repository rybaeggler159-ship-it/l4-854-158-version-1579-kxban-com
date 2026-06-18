(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
    script.onload = callback;
    script.onerror = function () {
      callback(new Error('HLS 脚本加载失败'));
    };
    document.head.appendChild(script);
  }

  function showMessage(frame, message) {
    var box = frame.querySelector('[data-video-message]');
    if (box) {
      box.hidden = false;
      box.textContent = message;
    }
  }

  function initPlayer(video) {
    var frame = video.closest('[data-video-frame]');
    var playButton = frame ? frame.querySelector('[data-video-play]') : null;
    var source = video.getAttribute('data-m3u8');

    if (!frame || !source) {
      return;
    }

    function playVideo() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showMessage(frame, '浏览器阻止了自动播放，请再次点击播放器开始播放。');
        });
      }
    }

    video.addEventListener('play', function () {
      frame.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      frame.classList.remove('is-playing');
    });

    video.addEventListener('ended', function () {
      frame.classList.remove('is-playing');
    });

    if (playButton) {
      playButton.addEventListener('click', playVideo);
    }

    loadHls(function (error) {
      if (!error && window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            showMessage(frame, '网络错误，正在尝试重新加载播放源。');
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            showMessage(frame, '媒体错误，正在尝试恢复播放。');
            hls.recoverMediaError();
          } else {
            showMessage(frame, '播放器错误，请刷新页面重试。');
            hls.destroy();
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        showMessage(frame, '当前浏览器需要加载 HLS 支持脚本后播放，请检查网络连接后刷新页面。');
      }
    });
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-hls-video]')).forEach(initPlayer);
  });
})();
