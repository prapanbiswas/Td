/* ============================================================
   TOOLDUCK.XYZ — Global JavaScript
   Zero-dependency, instant DOMContentLoaded attachment
   ============================================================ */

(function () {
  'use strict';

  /* ── Navigation ── */
  const Nav = {
    init() {
      const hamburger = document.getElementById('nav-hamburger');
      const mobileNav = document.getElementById('nav-mobile');
      if (hamburger && mobileNav) {
        hamburger.addEventListener('click', () => {
          mobileNav.classList.toggle('open');
          hamburger.setAttribute('aria-expanded', mobileNav.classList.contains('open'));
        });
        document.addEventListener('click', (e) => {
          if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
            mobileNav.classList.remove('open');
          }
        });
      }

      // Active link
      const links = document.querySelectorAll('.nav-links a, .nav-mobile a');
      const path = window.location.pathname;
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && path.endsWith(href.replace(/^\//, '').replace(/\/$/, '')) || href === path) {
          link.classList.add('active');
        }
      });
    }
  };

  /* ── Cookie Consent ── */
  const CookieConsent = {
    KEY: 'toolduck-cookie-consent',

    init() {
      if (!localStorage.getItem(this.KEY)) {
        const banner = document.getElementById('cookie-banner');
        if (banner) {
          banner.classList.add('visible');
        }
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
      const banner = document.getElementById('cookie-banner');
      if (banner) banner.classList.remove('visible');
    }
  };

  /* ── Toast Notifications ── */
  const Toast = {
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

    show(message, type = 'info', duration = 3000) {
      if (!this.container) this.init();
      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.textContent = message;
      this.container.appendChild(toast);
      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(16px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }, duration);
    }
  };

  /* ── Copy to Clipboard ── */
  function copyToClipboard(text, btnEl) {
    navigator.clipboard.writeText(text).then(() => {
      Toast.show('Copied to clipboard!', 'success');
      if (btnEl) {
        const orig = btnEl.textContent;
        btnEl.textContent = '✓ Copied';
        btnEl.classList.add('copied');
        setTimeout(() => {
          btnEl.textContent = orig;
          btnEl.classList.remove('copied');
        }, 2000);
      }
    }).catch(() => {
      const ta = document.createElement('textarea');
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
    const input = document.getElementById('tool-search');
    if (!input) return;
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      document.querySelectorAll('.tool-card').forEach(card => {
        const text = card.textContent.toLowerCase();
        card.style.display = (!q || text.includes(q)) ? '' : 'none';
      });
    });
  }

  /* ── Category Tabs (Homepage) ── */
  function initCategoryTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    if (!tabs.length) return;
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const cat = tab.dataset.cat;
        document.querySelectorAll('.tool-card').forEach(card => {
          card.style.display = (cat === 'all' || card.dataset.cat === cat) ? '' : 'none';
        });
      });
    });
  }

  /* ── Drag-and-Drop Zone ── */
  function initDropZone(zoneId, onFiles) {
    const zone = document.getElementById(zoneId);
    if (!zone) return;

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });

    zone.addEventListener('dragleave', (e) => {
      if (!zone.contains(e.relatedTarget)) zone.classList.remove('drag-over');
    });

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      const files = Array.from(e.dataTransfer.files);
      if (files.length) onFiles(files);
    });

    zone.addEventListener('click', () => {
      const input = zone.querySelector('input[type="file"]');
      if (input) input.click();
    });
  }

  /* ── Format bytes ── */
  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (bytes / Math.pow(k, i)).toFixed(1) + ' ' + sizes[i];
  }

  /* ── Copy buttons init ── */
  function initCopyButtons() {
    document.querySelectorAll('[data-copy-target]').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = document.getElementById(btn.dataset.copyTarget);
        if (target) copyToClipboard(target.textContent || target.value, btn);
      });
    });
    document.querySelectorAll('[data-copy-text]').forEach(btn => {
      btn.addEventListener('click', () => {
        copyToClipboard(btn.dataset.copyText, btn);
      });
    });
  }

  /* ── Expose globals ── */
  window.ToolDuck = window.DevUtils = {
    Toast,
    CookieConsent,
    copyToClipboard,
    initDropZone,
    formatBytes,
    initCopyButtons
  };

  /* ── Boot on DOMContentLoaded ── */
  document.addEventListener('DOMContentLoaded', () => {
    Nav.init();
    Toast.init();
    CookieConsent.init();
    initSearch();
    initCategoryTabs();
    initCopyButtons();

    // Cookie buttons
    document.getElementById('cookie-accept')?.addEventListener('click', () => CookieConsent.accept());
    document.getElementById('cookie-decline')?.addEventListener('click', () => CookieConsent.decline());
  });
})();
