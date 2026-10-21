/* Portfolio interactions: nav, marquee, scroll reveal, render queue,
   lazy loop videos and lazy VTurb players. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var VTURB_ACCOUNT = '078ca594-053b-427b-a22f-58f182182f25';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------------- nav */
  function initNav() {
    var button = document.querySelector('.nav-hamburger');
    var links = document.getElementById('nav-links');
    if (!button || !links) return;

    function setOpen(isOpen) {
      links.classList.toggle('open', isOpen);
      button.classList.toggle('open', isOpen);
      button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      button.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    }

    button.addEventListener('click', function () {
      setOpen(!links.classList.contains('open'));
    });
    links.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () { setOpen(false); });
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') setOpen(false);
    });
  }

  /* -------------------------------------------------- hero title fit */
  // Scales the blue line so both title lines share the exact same width.
  function initTitleFit() {
    var top = document.querySelector('.h1-white');
    var bottom = document.querySelector('.h1-blue');
    if (!top || !bottom) return;

    function fit() {
      var target = top.getBoundingClientRect().width;
      var size = parseFloat(bottom.style.fontSize) || 1.3016;
      for (var i = 0; i < 4; i++) {
        var current = bottom.getBoundingClientRect().width;
        if (!target || !current) return;
        size *= target / current;
        bottom.style.fontSize = size.toFixed(4) + 'em';
      }
    }

    var kicker = document.querySelector('.hero-kicker');

    // Kicker spans the title width. Narrow screens trade letter-spacing for size.
    function fitKicker() {
      if (!kicker) return;
      kicker.classList.add('is-fit');
      var target = top.getBoundingClientRect().width;
      if (!target) return;
      var spacing = 0.3;
      var size = 0;

      function solve() {
        kicker.style.setProperty('--ks', spacing + 'em');
        kicker.style.fontSize = '';
        size = parseFloat(window.getComputedStyle(kicker).fontSize);
        for (var i = 0; i < 4; i++) {
          var perPx = kicker.getBoundingClientRect().width / size - spacing;
          if (!perPx) return;
          size = target / perPx;
          kicker.style.fontSize = size.toFixed(3) + 'px';
        }
      }

      solve();
      if (size < 12) {
        spacing = 0.06;
        solve();
      }
    }

    function fitAll() {
      fit();
      fitKicker();
    }

    fitAll();
    window.addEventListener('resize', fitAll);
    window.addEventListener('load', fitAll);
    if (document.fonts) {
      document.fonts.addEventListener('loadingdone', fitAll);
      if (document.fonts.ready) document.fonts.ready.then(fitAll).catch(function () {});
    }
  }

  /* ------------------------------------------------------------- marquee */
  function initMarquee() {
    document.querySelectorAll('[data-marquee]').forEach(function (track) {
      var original = track.innerHTML;
      track.innerHTML = original + original + original;
    });
  }

  /* -------------------------------------------------------------- reveal */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  /* -------------------------------------------------------- render queue */
  function initRenderQueue() {
    var queue = document.querySelector('[data-render-queue]');
    if (!queue) return;
    var fills = queue.querySelectorAll('.ps-fill');

    function fill() {
      fills.forEach(function (bar, i) {
        window.setTimeout(function () {
          bar.style.width = bar.getAttribute('data-w') + '%';
        }, reduceMotion.matches ? 0 : i * 140);
      });
    }

    if (!('IntersectionObserver' in window)) return fill();
    var observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) {
          fill();
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(queue);
  }

  /* --------------------------------------------------------- loop videos */
  function initLoopVideos() {
    document.querySelectorAll('video.loop-video').forEach(function (video) {
      var src = video.getAttribute('data-src');
      var poster = video.getAttribute('data-poster');
      var loaded = false;
      var visible = false;

      function load() {
        if (loaded) return;
        loaded = true;
        if (poster) video.poster = poster;
        if (src) video.src = src;
      }

      function sync() {
        if (visible && !reduceMotion.matches) {
          load();
          var playback = video.play();
          if (playback && playback.catch) playback.catch(function () {});
        } else {
          video.pause();
        }
      }

      if (!('IntersectionObserver' in window)) {
        load();
        visible = true;
        sync();
        return;
      }

      var preloader = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            load();
            preloader.disconnect();
          }
        },
        { rootMargin: '800px 0px' }
      );
      var player = new IntersectionObserver(
        function (entries) {
          visible = entries[0].isIntersecting;
          sync();
        },
        { threshold: 0.2 }
      );
      preloader.observe(video);
      player.observe(video);
      reduceMotion.addEventListener('change', sync);
    });
  }

  /* ------------------------------------------------------- vturb iframes */
  function loadVturbSdk() {
    if (document.querySelector('script[data-vturb-sdk="v4"]')) return;
    var script = document.createElement('script');
    script.src = 'https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js';
    script.async = true;
    script.dataset.vturbSdk = 'v4';
    document.head.appendChild(script);
  }

  // Click-to-play cover: nothing loads (or autoplays) until the visitor clicks.
  function coverUrl(playerId) {
    return 'https://images.converteai.net/' + VTURB_ACCOUNT + '/players/' + playerId + '/cover.jpg';
  }

  function addCover(host, playerId, label, onPlay) {
    var cover = document.createElement('button');
    cover.type = 'button';
    cover.className = 'vt-cover';
    cover.style.backgroundImage = 'url(' + coverUrl(playerId) + ')';
    cover.setAttribute('aria-label', 'Reproduzir ' + (label || 'vídeo'));
    cover.innerHTML = '<span class="vt-play" aria-hidden="true">▶</span>';
    cover.addEventListener('click', function () {
      cover.remove();
      onPlay();
    });
    host.appendChild(cover);
  }

  function initVturbIframes() {
    document.querySelectorAll('.vturb-iframe-host[data-player-id]').forEach(function (host) {
      var playerId = host.getAttribute('data-player-id');
      var iframe = host.querySelector('iframe');
      if (!iframe) return;

      iframe.addEventListener('load', function () {
        if (iframe.src !== 'about:blank') iframe.classList.add('is-loaded');
      });

      addCover(host, playerId, iframe.title, function () {
        loadVturbSdk();
        var query = window.location.search || '?';
        iframe.src =
          'https://scripts.converteai.net/' +
          VTURB_ACCOUNT +
          '/players/' +
          playerId +
          '/v4/embed.html' +
          query +
          '&vl=' +
          encodeURIComponent(window.location.href);
      });
    });
  }

  /* -------------------------------------------------- vturb smartplayers */
  function initVturbPlayers() {
    document.querySelectorAll('.vturb-player-host').forEach(function (host) {
      var element = host.querySelector('vturb-smartplayer');
      if (!element) return;
      var playerId = (element.id || '').replace(/^vid-/, '');

      // Lock the host to the video ratio: once the SDK is defined, an unloaded
      // smartplayer collapses to 0px.
      var placeholder = host.querySelector('.vturb-player-placeholder');
      var ratio = placeholder ? parseFloat(placeholder.style.paddingTop || placeholder.style.padding) : 0;
      if (ratio) host.style.aspectRatio = '100 / ' + ratio;

      var mutations = new MutationObserver(function () {
        host.querySelectorAll('img:not([alt])').forEach(function (img) {
          img.alt = '';
          img.setAttribute('role', 'presentation');
        });
      });
      mutations.observe(host, { childList: true, subtree: true });

      addCover(host, playerId, host.getAttribute('aria-label'), function () {
        if (document.querySelector('script[data-vturb-player="' + playerId + '"]')) return;
        var script = document.createElement('script');
        script.src =
          'https://scripts.converteai.net/' + VTURB_ACCOUNT + '/players/' + playerId + '/v4/player.js';
        script.async = true;
        script.dataset.vturbPlayer = playerId;
        document.head.appendChild(script);
      });
    });
  }

  /* -------------------------------------------------------- ads carousel */
  function initAdsCarousel() {
    document.querySelectorAll('[data-carousel]').forEach(function (carousel) {
      var track = carousel.querySelector('[data-track]');
      var prev = carousel.querySelector('.car-prev');
      var next = carousel.querySelector('.car-next');
      var dotsHolder = carousel.parentNode.querySelector('[data-dots]');
      var cards = Array.prototype.slice.call(track.querySelectorAll('.clip-card'));
      if (!track || !cards.length) return;

      var dots = [];

      // One dot per reachable position (cards minus the ones already in view).
      function buildDots() {
        if (!dotsHolder) return;
        var gap = parseFloat(window.getComputedStyle(track).columnGap) || 0;
        var visible = Math.max(1, Math.round((track.clientWidth + gap) / (cards[0].getBoundingClientRect().width + gap)));
        var count = Math.max(1, cards.length - visible + 1);
        if (dots.length === count) return;
        dotsHolder.innerHTML = '';
        dots = [];
        for (var i = 0; i < count; i++) dots.push(dotsHolder.appendChild(document.createElement('span')));
      }

      function current() {
        var left = track.scrollLeft;
        var best = 0;
        cards.forEach(function (card, i) {
          if (Math.abs(card.offsetLeft - track.offsetLeft - left) < Math.abs(cards[best].offsetLeft - track.offsetLeft - left)) best = i;
        });
        return best;
      }

      function goTo(index) {
        index = Math.max(0, Math.min(cards.length - 1, index));
        track.scrollTo({ left: cards[index].offsetLeft - track.offsetLeft, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
        window.setTimeout(update, 450);
      }

      function pauseAll(except) {
        cards.forEach(function (card) {
          var video = card.querySelector('video');
          if (video && card !== except && !video.paused) video.pause();
        });
      }

      function update() {
        var max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
        buildDots();
        var still = track.scrollWidth - track.clientWidth <= 2;
        carousel.classList.toggle('is-static', still);
        carousel.parentNode.classList.toggle('is-static', still);
        var index = track.scrollLeft >= max ? dots.length - 1 : Math.min(current(), dots.length - 1);
        dots.forEach(function (dot, i) { dot.classList.toggle('is-active', i === index); });
      }

      prev.addEventListener('click', function () {
        pauseAll();
        goTo(current() - 1);
      });
      next.addEventListener('click', function () {
        pauseAll();
        goTo(current() + 1);
      });
      track.addEventListener('scroll', update, { passive: true });
      track.addEventListener('scrollend', update);
      window.addEventListener('resize', update);

      // Native videos: starting one pauses the others.
      cards.forEach(function (card) {
        var video = card.querySelector('video');
        if (video) video.addEventListener('play', function () { pauseAll(card); });
      });

      update();
    });
  }

  /* --------------------------------------------------- anchor scrolling */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        if (!href || href === '#') return;
        var target = document.querySelector(href);
        if (!target) return;
        event.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', href);
      });
    });
  }

  function start() {
    initNav();
    initTitleFit();
    initMarquee();
    initReveal();
    initRenderQueue();
    initLoopVideos();
    initAdsCarousel();
    initVturbIframes();
    initVturbPlayers();
    initAnchors();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
