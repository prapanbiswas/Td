/* ============================================================
   TOOLDUCK.XYZ — Global JavaScript
   Zero-dependency, instant DOMContentLoaded attachment
   ============================================================ */

/* ── Theme: apply before paint to avoid flash ── */
(function () {
  var stored = localStorage.getItem('toolduck-theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var theme = stored || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();

(function () {
  'use strict';

  /* ── ThemeManager ── */
  var ThemeManager = {
    KEY: 'toolduck-theme',

    get() {
      return document.documentElement.getAttribute('data-theme') || 'dark';
    },

    set(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem(this.KEY, theme);
      this.updateToggleBtn();
    },

    toggle() {
      this.set(this.get() === 'dark' ? 'light' : 'dark');
    },

    updateToggleBtn() {
      var btn = document.getElementById('theme-toggle');
      if (!btn) return;
      var isDark = this.get() === 'dark';
      btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    },

    listenSystem() {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
        if (!localStorage.getItem(ThemeManager.KEY)) {
          ThemeManager.set(e.matches ? 'dark' : 'light');
        }
      });
    },

    injectToggleBtn() {
      var actions = document.querySelector('.nav-actions');
      if (!actions || document.getElementById('theme-toggle')) return;

      var btn = document.createElement('button');
      btn.id = 'theme-toggle';
      btn.className = 'theme-toggle';
      btn.setAttribute('aria-label', 'Toggle theme');
      btn.innerHTML = [
        '<svg class="icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<circle cx="12" cy="12" r="5"/>',
          '<path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>',
        '</svg>',
        '<svg class="icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">',
          '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
        '</svg>'
      ].join('');

      btn.addEventListener('click', function () {
        ThemeManager.toggle();
      });

      var hamburger = document.getElementById('nav-hamburger');
      if (hamburger) {
        actions.insertBefore(btn, hamburger);
      } else {
        actions.appendChild(btn);
      }

      this.updateToggleBtn();
    },

    init() {
      this.injectToggleBtn();
      this.listenSystem();
    }
  };

  /* ── Navigation ── */
  var Nav = {
    init() {
      var hamburger = document.getElementById('nav-hamburger');
      var mobileNav = document.getElementById('nav-mobile');
      if (hamburger && mobileNav) {
        hamburger.addEventListener('click', function () {
          var isOpen = mobileNav.classList.toggle('open');
          hamburger.setAttribute('aria-expanded', String(isOpen));
        });
        document.addEventListener('click', function (e) {
          if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
            mobileNav.classList.remove('open');
            hamburger.setAttribute('aria-expanded', 'false');
          }
        });
      }

      var links = document.querySelectorAll('.nav-links a, .nav-mobile a');
      var path = window.location.pathname.replace(/\/$/, '') || '/';
      links.forEach(function (link) {
        var href = (link.getAttribute('href') || '').replace(/\/$/, '') || '/';
        if (href === path || (href !== '/' && path.endsWith(href))) {
          link.classList.add('active');
        }
      });
    }
  };

  /* ── Cookie Consent ── */
  var CookieConsent = {
    KEY: 'toolduck-cookie-consent',

    init() {
      if (!localStorage.getItem(this.KEY)) {
        var banner = document.getElementById('cookie-banner');
        if (banner) banner.classList.add('visible');
      }
    },

    accept() {
      localStorage.setItem(this.KEY, 'accepted');
      this.hide();
      Toast.show('Preferences saved. Thank you!', 'success');
    },

    decline() {
      localStorage.setItem(this.KEY, 'declined');
      this.hide();
    },

    hide() {
      var banner = document.getElementById('cookie-banner');
      if (banner) banner.classList.remove('visible');
    }
  };

  /* ── Toast Notifications ── */
  var Toast = {
    container: null,

    init() {
      this.container = document.getElementById('toast-container');
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = 'toast-container';
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
      }
    },

    show(message, type, duration) {
      type = type || 'info';
      duration = duration || 3000;
      if (!this.container) this.init();
      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type;
      toast.textContent = message;
      this.container.appendChild(toast);
      setTimeout(function () {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(16px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(function () { toast.remove(); }, 300);
      }, duration);
    }
  };

  /* ── Copy to Clipboard ── */
  function copyToClipboard(text, btnEl) {
    navigator.clipboard.writeText(text).then(function () {
      Toast.show('Copied to clipboard!', 'success');
      if (btnEl) {
        var orig = btnEl.textContent;
        btnEl.textContent = '✓ Copied';
        btnEl.classList.add('copied');
        setTimeout(function () {
          btnEl.textContent = orig;
          btnEl.classList.remove('copied');
        }, 2000);
      }
    }).catch(function () {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      Toast.show('Copied!', 'success');
    });
  }

  /* ── Search (Homepage) ── */
  function initSearch() {
    var input = document.getElementById('tool-search');
    if (!input) return;
    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      document.querySelectorAll('.tool-card').forEach(function (card) {
        var text = card.textContent.toLowerCase();
        card.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  }

  /* ── Category Tabs (Homepage) ── */
  function initCategoryTabs() {
    var tabs = document.querySelectorAll('.tab-btn');
    if (!tabs.length) return;
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        tabs.forEach(function (t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var cat = tab.dataset.cat;
        document.querySelectorAll('.tool-card').forEach(function (card) {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ── Drag-and-Drop Zone ── */
  function initDropZone(zoneId, onFiles) {
    var zone = document.getElementById(zoneId);
    if (!zone) return;

    zone.addEventListener('dragover', function (e) {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', function (e) {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', function (e) {
      e.preventDefault();
      zone.classList.remove('drag-over');
      var files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    });

    zone.addEventListener('click', function () {
      var input = zone.querySelector('input[type="file"]');
      if (input) input.click();
    });
  }

  /* ── Format bytes ── */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    var k = 1024;
    var sizes = ['B', 'KB', 'MB', 'GB'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }

  /* ── Copy buttons init ── */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = document.getElementById(btn.dataset.copyTarget);
        if (target) copyToClipboard(target.textContent || target.value, btn);
      });
    });
    document.querySelectorAll('[data-copy-text]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        copyToClipboard(btn.dataset.copyText, btn);
      });
    });
  }

  /* ── Expose globals ── */
  window.ToolDuck = window.DevUtils = {
    Toast: Toast,
    CookieConsent: CookieConsent,
    ThemeManager: ThemeManager,
    copyToClipboard: copyToClipboard,
    initDropZone: initDropZone,
    formatBytes: formatBytes,
    initCopyButtons: initCopyButtons
  };

  /* ── Boot on DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', function () {
    ThemeManager.init();
    Nav.init();
    Toast.init();
    CookieConsent.init();
    initSearch();
    initCategoryTabs();
    initCopyButtons();

    var acceptBtn = document.getElementById('cookie-accept');
    var declineBtn = document.getElementById('cookie-decline');
    if (acceptBtn) acceptBtn.addEventListener('click', function () { CookieConsent.accept(); });
    if (declineBtn) declineBtn.addEventListener('click', function () { CookieConsent.decline(); });
  });
})();
