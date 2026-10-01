(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Header: scroll state, mobile menu, outside click, active link
  var hdr = $('#hdr'), burger = $('#burger'), nav = $('#nav');
  if (hdr) {
    var onScroll = function () { hdr.classList.toggle('scrolled', window.scrollY > 30); };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  }

  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    burger.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') && !e.target.closest('.hdr-bar')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); burger.focus(); }
    });
    window.matchMedia('(min-width: 1300px)').addEventListener('change', function () { setMenu(false); });
  }

  // In-page scroll-spy (only acts if the nav contains #anchor links)
  if (nav && 'IntersectionObserver' in window) {
    var links = $$('.nav-link', nav);
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var target = $('.nav-link[href="#' + en.target.id + '"]', nav);
        if (!target) return;
        links.forEach(function (l) { l.classList.remove('active'); l.removeAttribute('aria-current'); });
        target.classList.add('active'); target.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    ['home', 'about', 'services', 'setup', 'faq', 'contact'].forEach(function (id) {
      var s = document.getElementById(id); if (s) spy.observe(s);
    });
  }

  // Scroll reveal
  var stepsEl = $('#steps');
  var rvs = $$('.rv');
  $$('.cards, .hp-st, .panels, .steps, .why, .strip-in, .ccards, .faq').forEach(function (g) {
    $$('.rv', g).forEach(function (el, i) { el.style.setProperty('--d', (i * 0.08) + 's'); });
  });
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          if (stepsEl && en.target.closest('.steps')) stepsEl.classList.add('on');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    rvs.forEach(function (el) { io.observe(el); });
  } else {
    rvs.forEach(function (el) { el.classList.add('in'); });
    if (stepsEl) stepsEl.classList.add('on');
  }

  // 3D tilt (pointer devices only)
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (fine && !reduce) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'translateY(-8px) rotateX(' + (-y * 8) + 'deg) rotateY(' + (x * 8) + 'deg)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
    var scene = $('#scene'), core = scene && $('.core', scene);
    if (scene && core) {
      scene.addEventListener('mousemove', function (e) {
        var r = scene.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        core.style.transform = 'rotateY(' + (-14 + x * 16) + 'deg) rotateX(' + (8 - y * 16) + 'deg)';
      });
      scene.addEventListener('mouseleave', function () { core.style.transform = ''; });
    }
  }

  // Business ecosystem diagram (homepage)
  var eco = $('#eco'), svg = $('#eco-svg'), coreEl = $('#eco-core');
  if (eco && svg && coreEl) {
    var items = ['Tax', 'GST', 'Compliance', 'Accounting', 'Registration', 'Trademark', 'Loans'];
    var NS = 'http://www.w3.org/2000/svg';
    items.forEach(function (name, i) {
      var a = (i / items.length) * Math.PI * 2 - Math.PI / 2;
      var x = 50 + Math.cos(a) * 40, y = 50 + Math.sin(a) * 40;
      var ln = document.createElementNS(NS, 'line');
      ln.setAttribute('x1', 50); ln.setAttribute('y1', 50); ln.setAttribute('x2', x); ln.setAttribute('y2', y);
      svg.appendChild(ln);
      var n = document.createElement('button');
      n.type = 'button'; n.className = 'node'; n.textContent = name;
      n.style.left = x + '%'; n.style.top = y + '%';
      var on = function () { ln.classList.add('hl'); coreEl.classList.add('on'); };
      var off = function () { ln.classList.remove('hl'); coreEl.classList.remove('on'); };
      n.addEventListener('mouseenter', on); n.addEventListener('mouseleave', off);
      n.addEventListener('focus', on); n.addEventListener('blur', off);
      eco.appendChild(n);
    });
  }

  // FAQ accordion
  $$('.qa button').forEach(function (b) {
    b.addEventListener('click', function () {
      var qa = b.closest('.qa'), open = !qa.classList.contains('open');
      qa.classList.toggle('open', open);
      b.setAttribute('aria-expanded', open);
    });
  });

  // Lead popup (homepage only: does nothing unless #lead-modal exists)
  var lm = $('#lead-modal');
  if (lm) {
    var LEAD = { wa: '918707470994', email: 'info@esrcorporateconsultants.com', source: 'ESR Website Contact Popup', site: 'esrcorp.in', key: 'esrLeadPopupShown' };
    var lmPanel = $('.lm-panel', lm), lmForm = $('#lead-form'), formView = $('#lead-form-view'), okView = $('#lead-ok-view');
    var lmClose = $('#lead-close'), waBtn = $('#lead-wa'), mailBtn = $('#lead-mail'), editBtn = $('#lead-edit'), okTitle = $('#lead-ok-title');
    var F = { name: $('#lead-name'), mobile: $('#lead-mobile'), email: $('#lead-email'), service: $('#lead-service'), message: $('#lead-message') };
    var lastFocus = null, memSeen = false, armed = false;

    var seen = function () { try { return sessionStorage.getItem(LEAD.key) === '1'; } catch (e) { return memSeen; } };
    var markSeen = function () { memSeen = true; try { sessionStorage.setItem(LEAD.key, '1'); } catch (e) { /* storage unavailable */ } };

    var showView = function (ok) {
      formView.hidden = ok; okView.hidden = !ok;
      lmPanel.setAttribute('aria-labelledby', ok ? 'lead-ok-title' : 'lead-title');
      lmPanel.setAttribute('aria-describedby', ok ? 'lead-ok-sub' : 'lead-sub');
    };
    var openModal = function () {
      if (lm.classList.contains('open')) return;
      lastFocus = document.activeElement;
      var sw = window.innerWidth - document.documentElement.clientWidth;
      if (sw > 0) document.body.style.paddingRight = sw + 'px';
      document.documentElement.classList.add('lm-lock');
      lm.classList.add('open'); lm.setAttribute('aria-hidden', 'false');
      lmPanel.scrollTop = 0;
      lmPanel.focus({ preventScroll: true });
    };
    var closeModal = function () {
      if (!lm.classList.contains('open')) return;
      lm.classList.remove('open'); lm.setAttribute('aria-hidden', 'true');
      document.documentElement.classList.remove('lm-lock'); document.body.style.paddingRight = '';
      if (lastFocus && lastFocus.focus) { try { lastFocus.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    };

    // First meaningful scroll opens the popup once per browser session
    if (!seen()) {
      var arm = function () { setTimeout(function () { armed = true; }, 600); };
      if (document.readyState === 'complete') arm(); else window.addEventListener('load', arm);
      var onFirstScroll = function () {
        if (!armed || window.scrollY < 120) return;
        if (nav && nav.classList.contains('open')) return;
        window.removeEventListener('scroll', onFirstScroll);
        markSeen(); openModal();
      };
      window.addEventListener('scroll', onFirstScroll, { passive: true });
    }

    lmClose.addEventListener('click', closeModal);
    lm.addEventListener('mousedown', function (e) { if (e.target === lm) closeModal(); });
    document.addEventListener('keydown', function (e) {
      if (!lm.classList.contains('open')) return;
      if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled]), input, select, textarea', lmPanel).filter(function (el) { return !el.closest('[hidden]'); });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1], a = document.activeElement;
      if (e.shiftKey && (a === first || a === lmPanel)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && a === last) { e.preventDefault(); first.focus(); }
    });

    // Validation
    var normMobile = function (v) {
      var d = v.replace(/[\s\-().]/g, '');
      if (/^\+91/.test(d)) d = d.slice(3);
      else if (/^0091/.test(d)) d = d.slice(4);
      else if (/^91\d{10}$/.test(d)) d = d.slice(2);
      else if (/^0\d{10}$/.test(d)) d = d.slice(1);
      return /^[6-9]\d{9}$/.test(d) ? d : null;
    };
    var setErr = function (key, msg) {
      var box = F[key].closest('.lm-f'), out = $('#lead-' + key + '-err');
      if (out) out.textContent = msg || '';
      box.classList.toggle('bad', !!msg);
      if (msg) F[key].setAttribute('aria-invalid', 'true'); else F[key].removeAttribute('aria-invalid');
    };
    var validate = function () {
      var bad = [], v;
      v = F.name.value.trim();
      if (!v) { setErr('name', 'Please enter your full name.'); bad.push('name'); }
      else if (!/^[\p{L}][\p{L}\p{N} .,&'’-]+$/u.test(v)) { setErr('name', 'Please enter a valid name.'); bad.push('name'); }
      else setErr('name');
      v = F.mobile.value.trim();
      if (!v) { setErr('mobile', 'Please enter your mobile number.'); bad.push('mobile'); }
      else if (!normMobile(v)) { setErr('mobile', 'Enter a valid 10-digit Indian mobile number.'); bad.push('mobile'); }
      else setErr('mobile');
      v = F.email.value.trim();
      if (!v) { setErr('email', 'Please enter your email address.'); bad.push('email'); }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { setErr('email', 'Enter a valid email address.'); bad.push('email'); }
      else setErr('email');
      if (!F.service.value) { setErr('service', 'Please select the service you need.'); bad.push('service'); }
      else setErr('service');
      return bad;
    };
    ['name', 'mobile', 'email', 'service'].forEach(function (k) {
      F[k].addEventListener(k === 'service' ? 'change' : 'input', function () { setErr(k); });
    });

    // Build lead messages from the actual form values
    var lead = function () {
      var m = F.message.value.trim();
      return { name: F.name.value.trim(), mobile: '+91 ' + normMobile(F.mobile.value.trim()), email: F.email.value.trim(), service: F.service.value, message: m || 'Not specified' };
    };
    var waUrl = function (d) {
      var t = 'Hello ESR Corporate Consultants LLP,\n\nI would like to enquire about your services.\n\n' +
        'Name: ' + d.name + '\nMobile: ' + d.mobile + '\nEmail: ' + d.email + '\nService Required: ' + d.service + '\nRequirement: ' + d.message +
        '\n\nSource: ' + LEAD.source + '\n\nPlease get back to me.';
      return 'https://wa.me/' + LEAD.wa + '?text=' + encodeURIComponent(t);
    };
    var mailUrl = function (d) {
      var b = 'ESR CORPORATE CONSULTANTS LLP\r\n\r\nNew Website Enquiry\r\n\r\n' +
        'Name: ' + d.name + '\r\nMobile: ' + d.mobile + '\r\nEmail: ' + d.email + '\r\nService Required: ' + d.service +
        '\r\n\r\nRequirement:\r\n' + d.message + '\r\n\r\nSource:\r\n' + LEAD.source + '\r\n\r\nWebsite:\r\n' + LEAD.site;
      return 'mailto:' + LEAD.email + '?subject=' + encodeURIComponent('New Website Enquiry - ' + d.service) + '&body=' + encodeURIComponent(b);
    };

    lmForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate();
      if (bad.length) { F[bad[0]].focus(); return; }
      var d = lead();
      waBtn.href = waUrl(d); mailBtn.href = mailUrl(d);
      showView(true); lmPanel.scrollTop = 0; okTitle.focus({ preventScroll: true });
    });
    editBtn.addEventListener('click', function () { showView(false); F.name.focus(); });
  }

  // Homepage visual enhancements (no-op on other pages)
  $$('.hp-ph img').forEach(function (i) {
    var miss = function () { i.parentNode.classList.add('hp-miss'); };
    i.addEventListener('error', miss);
    if (i.complete && !i.naturalWidth) miss();
  });
  var hv = $('#hp-video'), vv = hv && $('video', hv);
  if (vv && window.fetch) {
    var vsrc = vv.getAttribute('data-src'), userSet = false, vb = $('.hp-vb', hv);
    fetch(vsrc, { method: 'HEAD' }).then(function (r) {
      if (!r.ok) return;
      hv.hidden = false;
      var lab = function () { var p = !vv.paused; vb.textContent = p ? 'Pause video' : 'Play video'; vb.setAttribute('aria-pressed', String(!p)); };
      vv.addEventListener('play', lab); vv.addEventListener('pause', lab); lab();
      vb.addEventListener('click', function () { userSet = true; if (vv.paused) vv.play().catch(function () {}); else vv.pause(); });
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            if (e.isIntersecting) { if (!vv.getAttribute('src')) vv.src = vsrc; if (!reduce && !userSet) vv.play().catch(function () {}); }
            else vv.pause();
          });
        }, { threshold: 0.35 }).observe(vv);
      }
    }).catch(function () {});
  }

  var yr = $('#yr'); if (yr) yr.textContent = new Date().getFullYear();
})();
