# DevUtils Hub

## Project Overview
A premium, multi-page developer utility tools directory website built with pure semantic HTML5, modern CSS3 (with CSS custom properties), and vanilla JavaScript. Zero external frameworks, zero build tools, zero dependencies.

**Live URL:** https://devutils.app/

## Architecture
- **Stack:** HTML5 + CSS3 + Vanilla JS only. No frameworks, no bundlers, no Node modules beyond the static file server.
- **Server:** `server.js` — a minimal Node.js HTTP static file server (no Express, pure `http` module).
- **Styling:** `assets/css/global.css` — single global stylesheet with CSS custom properties for full dark/light theming.
- **Scripts:** `assets/js/global.js` — shared utility library (ThemeManager, Toast, CookieConsent, etc). All event listeners attach on DOMContentLoaded.
- **Tool Pages:** Each tool lives in `tools/<slug>/index.html` with its full working implementation inlined in a `<script>` block.

## File Structure
```
/
├── index.html                    # Homepage / directory hub
├── privacy-policy.html           # GDPR/CCPA privacy policy
├── terms.html                    # Terms of service
├── cookie-policy.html            # Cookie disclosure
├── contact.html                  # Contact form
├── sitemap.xml                   # XML sitemap (all 20 URLs)
├── server.js                     # Static file server
├── assets/
│   ├── css/global.css            # Complete design system
│   └── js/global.js              # Shared utilities
└── tools/
    ├── exif-purger/index.html
    ├── webp-cruncher/index.html
    ├── json-visualizer/index.html
    ├── svg-renderer/index.html
    ├── cron-explainer/index.html
    ├── jwt-inspector/index.html
    ├── glass-studio/index.html
    ├── table-builder/index.html
    ├── regex-simulator/index.html
    ├── tailwind-master/index.html
    ├── string-encoder/index.html
    ├── diff-checker/index.html
    ├── yaml-transformer/index.html
    ├── hash-generator/index.html
    └── log-filter/index.html
```

## Running the Project
```bash
node server.js
```
Serves on `http://0.0.0.0:3000`. Uses environment variable `PORT` if set.

## Design System
- **Theme:** Dark/light glassmorphic with CSS custom properties under `:root` and `[data-theme="dark"]`
- **Accent:** `#6c63ff` (purple) + `#00d4ff` (cyan)
- **Typography:** system-ui / -apple-system stack
- **Glassmorphism:** `backdrop-filter: blur(20px)` + `rgba` backgrounds + `border: 1px solid rgba(255,255,255,0.08)`

## Ad Slots
- **Sidebar:** 300×600px glass card in `.ad-sidebar`, sticky on desktop, hidden on mobile
- **Footer:** Sticky 90px banner in `.sticky-ad-footer`, always visible
- Both slots contain `<!-- GOOGLE ADSENSE INLINE TRACKING CODE SLOT -->` comment markers

## SEO Architecture
- Every page has unique `<title>`, `<meta name="description">`, `<link rel="canonical">`, and Open Graph tags
- Tool pages contain structured H3 info sections (User Manual, Architecture Insight, FAQ) below the fold
- FAQ uses semantic `<details>` + `<summary>` HTML with target keywords woven in naturally
- sitemap.xml covers all 20 URLs with appropriate priority and changefreq values

## User Preferences
- Always use semantic HTML5 with proper ARIA attributes
- No external libraries or CDN dependencies for core functionality
- All tool implementations must run 100% client-side (no fetch to external APIs)
- Maintain the dark/light theme system using CSS custom properties only
- Keep AdSense slot comment markers in place for all ad containers
