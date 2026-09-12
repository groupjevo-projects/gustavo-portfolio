/* Portfolio interactions: staggered menu, true-focus headline,
   lazy loop videos and lazy VTurb players. Vanilla JS + GSAP. */
(function () {
  'use strict';

  var VTURB_ACCOUNT = '078ca594-053b-427b-a22f-58f182182f25';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------------------------------------------------------------- menu */
  function initStaggeredMenu() {
    var wrapper = document.querySelector('.staggered-menu-wrapper');
    if (!wrapper || typeof gsap === 'undefined') return;

    var panel = wrapper.querySelector('.staggered-menu-panel');
    var prelayersHolder = wrapper.querySelector('.sm-prelayers');
    var prelayers = prelayersHolder
      ? Array.prototype.slice.call(prelayersHolder.querySelectorAll('.sm-prelayer'))
      : [];
    var toggle = wrapper.querySelector('.sm-toggle');
    var icon = wrapper.querySelector('.sm-icon');
    var textInner = wrapper.querySelector('.sm-toggle-textInner');
    var position = wrapper.getAttribute('data-position') === 'left' ? -100 : 100;
    var menuButtonColor = '#fffef9';
    var openMenuButtonColor = '#fffef9';

    if (!panel || !icon || !textInner) return;

    var open = false;
    var openTl = null;
    var closeTween = null;
    var iconTween = null;
    var colorTween = null;
    var textTween = null;

    gsap.set([panel].concat(prelayers), { xPercent: position, opacity: 1 });
    gsap.set(icon, { rotate: 0, transformOrigin: '50% 50%' });
    gsap.set(textInner, { yPercent: 0 });
    if (prelayersHolder) gsap.set(prelayersHolder, { opacity: 1 });
    gsap.set(toggle, { color: menuButtonColor });

    function buildOpenTimeline() {
      if (openTl) openTl.kill();
      if (closeTween) closeTween.kill();

      var labels = gsap.utils.toArray(panel.querySelectorAll('.sm-panel-itemLabel'));
      var numbered = gsap.utils.toArray(
        panel.querySelectorAll('.sm-panel-list[data-numbering] .sm-panel-item')
      );
      var kicker = panel.querySelector('.sm-panel-kicker');

      gsap.set(labels, { yPercent: 140, rotate: 8 });
      gsap.set(numbered, { '--sm-num-opacity': 0 });
      if (kicker) gsap.set(kicker, { y: 16, opacity: 0 });

      var tl = gsap.timeline({ paused: true });

      prelayers.forEach(function (layer, i) {
        tl.fromTo(
          layer,
          { xPercent: position },
          { xPercent: 0, duration: 0.5, ease: 'power4.out' },
          i * 0.07
        );
      });

      var panelStart = prelayers.length ? (prelayers.length - 1) * 0.07 + 0.08 : 0;
      tl.fromTo(
        panel,
        { xPercent: position },
        { xPercent: 0, duration: 0.65, ease: 'power4.out' },
        panelStart
      );

      var contentStart = panelStart + 0.1;
      if (kicker) {
        tl.to(kicker, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' }, contentStart);
      }
      tl.to(
        labels,
        {
          yPercent: 0,
          rotate: 0,
          duration: 0.82,
          ease: 'power4.out',
          stagger: { each: 0.065, from: 'start' }
        },
        contentStart + 0.03
      );
      tl.to(
        numbered,
        {
          duration: 0.5,
          ease: 'power2.out',
          '--sm-num-opacity': 1,
          stagger: { each: 0.055, from: 'start' }
        },
        contentStart + 0.1
      );

      openTl = tl;
      return tl;
    }

    function animateIcon(isOpen) {
      if (iconTween) iconTween.kill();
      iconTween = gsap.to(icon, {
        rotate: isOpen ? 225 : 0,
        duration: isOpen ? 0.8 : 0.35,
        ease: isOpen ? 'power4.out' : 'power3.inOut',
        overwrite: 'auto'
      });
    }

    function animateColor(isOpen) {
      if (colorTween) colorTween.kill();
      colorTween = gsap.to(toggle, {
        color: isOpen ? openMenuButtonColor : menuButtonColor,
        duration: 0.3,
        ease: 'power2.out'
      });
    }

    function animateText(toOpen) {
      if (textTween) textTween.kill();
      var first = toOpen ? 'Menu' : 'Fechar';
      var second = toOpen ? 'Fechar' : 'Menu';
      var lines = [first, second, first, second];
      textInner.innerHTML = '';
      lines.forEach(function (label) {
        var span = document.createElement('span');
        span.className = 'sm-toggle-line';
        span.textContent = label;
        textInner.appendChild(span);
      });
      gsap.set(textInner, { yPercent: 0 });
      textTween = gsap.to(textInner, {
        yPercent: (-(lines.length - 1) / lines.length) * 100,
        duration: 0.68,
        ease: 'power4.out'
      });
    }

    function playClose() {
      if (openTl) openTl.kill();
      if (closeTween) closeTween.kill();
      closeTween = gsap.to(prelayers.concat([panel]), {
        xPercent: position,
        duration: 0.32,
        ease: 'power3.in',
        overwrite: 'auto'
      });
    }

    function setState(isOpen) {
      open = isOpen;
      if (isOpen) wrapper.setAttribute('data-open', '');
      else wrapper.removeAttribute('data-open');
      panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      toggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
      panel.querySelectorAll('.sm-panel-item').forEach(function (link) {
        link.setAttribute('tabindex', isOpen ? '0' : '-1');
      });
    }

    function closeMenu(refocus) {
      if (!open) return;
      setState(false);
      playClose();
      animateIcon(false);
      animateColor(false);
      animateText(false);
      if (refocus) toggle.focus();
    }

    function openMenu() {
      setState(true);
      buildOpenTimeline().play(0);
      animateIcon(true);
      animateColor(true);
      animateText(true);
    }

    toggle.addEventListener('click', function () {
      if (open) closeMenu(false);
      else openMenu();
    });

    document.addEventListener('keydown', function (event) {
      if (open && event.key === 'Escape') closeMenu(true);
    });

    document.addEventListener('mousedown', function (event) {
      if (!open) return;
      if (wrapper.contains(event.target)) return;
      closeMenu(false);
    });

    panel.querySelectorAll('.sm-panel-item').forEach(function (link) {
      link.addEventListener('click', function (event) {
        var href = link.getAttribute('href');
        closeMenu(false);
        if (href && href.charAt(0) === '#') {
          event.preventDefault();
          var target = document.querySelector(href);
          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.replaceState(null, '', href);
        }
      });
    });

    setState(false);
  }

  /* ----------------------------------------------------------- trueFocus */
  function initTrueFocus() {
    var container = document.querySelector('.hero-focus');
    if (!container) return;

    var words = Array.prototype.slice.call(container.querySelectorAll('[data-focus-word]'));
    var frame = container.querySelector('[class*="__frame"]');
    if (!words.length || !frame) return;

    var blurAmount = 1.5;
    var animationDuration = 0.45;
    var pauseBetween = 1;
    var index = 0;
    var timer = null;

    function paint() {
      var still = reduceMotion.matches;
      words.forEach(function (word, i) {
        var focused = still || i === index;
        word.style.filter = 'blur(' + (focused ? 0 : blurAmount) + 'px)';
        word.style.transitionDuration = still ? '0s' : animationDuration + 's';
      });

      var active = words[index];
      var box = container.getBoundingClientRect();
      var target = active.getBoundingClientRect();
      frame.style.transform =
        'translate3d(' + (target.left - box.left) + 'px, ' + (target.top - box.top) + 'px, 0)';
      frame.style.width = target.width + 'px';
      frame.style.height = target.height + 'px';
      frame.style.opacity = still ? '0' : '1';
      frame.style.transitionDuration = still ? '0s' : animationDuration + 's';
    }

    function schedule() {
      if (timer) window.clearInterval(timer);
      if (reduceMotion.matches || words.length < 2) return;
      timer = window.setInterval(function () {
        index = (index + 1) % words.length;
        paint();
      }, Math.max(100, (animationDuration + pauseBetween) * 1000));
    }

    window.requestAnimationFrame(paint);
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(paint);
      ro.observe(container);
      words.forEach(function (word) {
        ro.observe(word);
      });
    }
    window.addEventListener('resize', paint);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint).catch(function () {});
    reduceMotion.addEventListener('change', function () {
      paint();
      schedule();
    });
    schedule();
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

  function initVturbIframes() {
    document.querySelectorAll('.vturb-iframe-host[data-player-id]').forEach(function (host) {
      var playerId = host.getAttribute('data-player-id');
      var strategy = host.getAttribute('data-loading') || 'viewport';
      var iframe = host.querySelector('iframe');
      var button = host.querySelector('.vturb-play-button');
      if (!iframe) return;

      iframe.addEventListener('load', function () {
        if (iframe.src !== 'about:blank') iframe.classList.add('is-loaded');
      });

      function load() {
        if (iframe.src && iframe.src !== 'about:blank') return;
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
      }

      if (button) {
        button.addEventListener('click', function () {
          button.remove();
          load();
        });
        return;
      }

      if (!('IntersectionObserver' in window)) {
        load();
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            load();
            observer.disconnect();
          }
        },
        { rootMargin: '500px 0px' }
      );
      observer.observe(host);
    });
  }

  /* -------------------------------------------------- vturb smartplayers */
  function initVturbPlayers() {
    document.querySelectorAll('.vturb-player-host').forEach(function (host) {
      var element = host.querySelector('vturb-smartplayer');
      if (!element) return;
      var playerId = (element.id || '').replace(/^vid-/, '');
      var poster = element.getAttribute('data-poster');
      var loaded = false;

      var mutations = new MutationObserver(function () {
        host.querySelectorAll('img:not([alt])').forEach(function (img) {
          img.alt = '';
          img.setAttribute('role', 'presentation');
        });
      });
      mutations.observe(host, { childList: true, subtree: true });

      function load() {
        if (loaded) return;
        loaded = true;
        var placeholder = host.querySelector('.vturb-player-placeholder');
        if (poster && placeholder) placeholder.style.backgroundImage = 'url(' + poster + ')';
        if (document.querySelector('script[data-vturb-player="' + playerId + '"]')) return;
        var script = document.createElement('script');
        script.src =
          'https://scripts.converteai.net/' + VTURB_ACCOUNT + '/players/' + playerId + '/v4/player.js';
        script.async = true;
        script.dataset.vturbPlayer = playerId;
        document.head.appendChild(script);
      }

      if (!('IntersectionObserver' in window)) {
        load();
        return;
      }
      var observer = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            load();
            observer.disconnect();
          }
        },
        { rootMargin: '800px 0px' }
      );
      observer.observe(host);
    });
  }

  /* --------------------------------------------------- anchor scrolling */
  function initAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      if (link.closest('.staggered-menu-panel')) return;
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
    initStaggeredMenu();
    initTrueFocus();
    initLoopVideos();
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
