#!/usr/bin/env node
/* update-tools.js — Transforms all 21 tool pages:
   - PNG badge logo in nav (replaces inline SVG duck)
   - SVG hamburger icon (replaces ☰)
   - SVG tool-page-icon (replaces emoji, per slug)
   - Strips emoji from badges, panel-titles, info-card icons
   - Cookie banner clean-up (no 🍪)
   - Full branded footer
   - Related-tools section injected before <footer>
*/
'use strict';
const fs = require('fs');
const path = require('path');

/* ── Tool metadata ─────────────────────────────────────── */
const toolInfo = {
  'image-compressor':  { name: 'Image Compressor',        desc: 'Compress JPEG, PNG & WebP locally',      cat: 'Image' },
  'png-to-webp':       { name: 'PNG to WebP Converter',   desc: 'Convert PNG to WebP in-browser',          cat: 'Image' },
  'webp-converter':    { name: 'WebP Converter',           desc: 'Convert any image to WebP format',        cat: 'Image' },
  'webp-cruncher':     { name: 'WebP Cruncher',            desc: 'Batch WebP compression tool',             cat: 'Image' },
  'svg-optimizer':     { name: 'SVG Optimizer',            desc: 'Minify and clean SVG code',               cat: 'Image' },
  'svg-renderer':      { name: 'SVG to PNG Studio',        desc: 'Export SVG to PNG at any resolution',     cat: 'Image' },
  'metadata-stripper': { name: 'Metadata Stripper',        desc: 'Strip EXIF metadata from images',         cat: 'Image' },
  'location-remover':  { name: 'GPS Location Remover',     desc: 'Remove GPS coordinates from photos',      cat: 'Image' },
  'exif-purger':       { name: 'EXIF Purger',              desc: 'Deep-clean image EXIF data',              cat: 'Image' },
  'hash-generator':    { name: 'SHA Hash Generator',       desc: 'SHA-256, SHA-512 & HMAC hashing',        cat: 'Dev'   },
  'jwt-inspector':     { name: 'JWT Inspector',             desc: 'Decode and inspect JWT tokens offline',  cat: 'Dev'   },
  'json-visualizer':   { name: 'JSON Visualizer',           desc: 'Format and explore JSON tree view',      cat: 'Dev'   },
  'diff-checker':      { name: 'Diff Checker',              desc: 'Side-by-side text comparison',           cat: 'Dev'   },
  'yaml-transformer':  { name: 'YAML ↔ JSON Transformer',  desc: 'Bidirectional YAML and JSON converter',  cat: 'Dev'   },
  'regex-simulator':   { name: 'RegEx Simulator',           desc: 'Live regex pattern tester',              cat: 'Dev'   },
  'cron-explainer':    { name: 'Cron Explainer',            desc: 'Decode cron schedules to plain English', cat: 'Dev'   },
  'glass-studio':      { name: 'Glassmorphism CSS Lab',     desc: 'Generate glass UI CSS effects',          cat: 'CSS'   },
  'tailwind-master':   { name: 'Tailwind Palette Master',   desc: 'Generate Tailwind color palettes',       cat: 'CSS'   },
  'string-encoder':    { name: 'String Encoder / Decoder',  desc: 'Base64, URL encode/decode & more',       cat: 'Text'  },
  'table-builder':     { name: 'Markdown Table Builder',    desc: 'Build markdown tables visually',         cat: 'Text'  },
  'log-filter':        { name: 'Log File Filter',            desc: 'Filter and grep large log files',       cat: 'Text'  },
};

/* ── Related tools map ─────────────────────────────────── */
const relatedMap = {
  'image-compressor':  ['png-to-webp',      'metadata-stripper', 'webp-converter'],
  'png-to-webp':       ['image-compressor',  'webp-converter',    'svg-optimizer'],
  'webp-converter':    ['png-to-webp',       'image-compressor',  'metadata-stripper'],
  'webp-cruncher':     ['image-compressor',  'png-to-webp',       'webp-converter'],
  'svg-optimizer':     ['svg-renderer',      'image-compressor',  'glass-studio'],
  'svg-renderer':      ['svg-optimizer',     'image-compressor',  'glass-studio'],
  'metadata-stripper': ['location-remover',  'exif-purger',       'image-compressor'],
  'location-remover':  ['metadata-stripper', 'exif-purger',       'image-compressor'],
  'exif-purger':       ['metadata-stripper', 'location-remover',  'image-compressor'],
  'hash-generator':    ['jwt-inspector',     'string-encoder',    'diff-checker'],
  'jwt-inspector':     ['hash-generator',    'string-encoder',    'json-visualizer'],
  'json-visualizer':   ['yaml-transformer',  'diff-checker',      'jwt-inspector'],
  'diff-checker':      ['yaml-transformer',  'regex-simulator',   'json-visualizer'],
  'yaml-transformer':  ['json-visualizer',   'diff-checker',      'string-encoder'],
  'regex-simulator':   ['diff-checker',      'string-encoder',    'log-filter'],
  'cron-explainer':    ['regex-simulator',   'yaml-transformer',  'json-visualizer'],
  'glass-studio':      ['tailwind-master',   'svg-renderer',      'svg-optimizer'],
  'tailwind-master':   ['glass-studio',      'string-encoder',    'svg-optimizer'],
  'string-encoder':    ['hash-generator',    'jwt-inspector',     'yaml-transformer'],
  'table-builder':     ['string-encoder',    'diff-checker',      'log-filter'],
  'log-filter':        ['regex-simulator',   'diff-checker',      'json-visualizer'],
};

/* ── SVG icons for tool-page-icon (28×28 viewport, stroke) */
const pageIcons = {
  'image-compressor':  `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="22" height="16" rx="2.5"/><path d="M10 14h8M14 10l-4 4 4 4"/></svg>`,
  'png-to-webp':       `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="11" height="11" rx="2"/><rect x="15" y="12" width="11" height="11" rx="2"/><path d="M13 10.5h4M13 10.5l-2.5-2.5M13 10.5l-2.5 2.5"/></svg>`,
  'webp-converter':    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5.5A10 10 0 0 1 24 14"/><path d="M21 5.5l-4.5.6.6-4.5"/><path d="M7 22.5A10 10 0 0 1 4 14"/><path d="M7 22.5l4.5-.6-.6 4.5"/></svg>`,
  'webp-cruncher':     `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="22" height="16" rx="2.5"/><path d="M10 14h8M14 10l-4 4 4 4"/></svg>`,
  'svg-optimizer':     `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="14,3 17,10.5 25,11.5 19.5,17 21.5,25 14,21 6.5,25 8.5,17 3,11.5 11,10.5"/></svg>`,
  'svg-renderer':      `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 21L17 8l3 3L7 24H4v-3z"/><path d="M15 10l3 3"/><path d="M20 4l4 4-2 2-4-4 2-2z"/></svg>`,
  'metadata-stripper': `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3L4 7.5V14c0 6.5 4.3 11.7 10 12.5 5.7-.8 10-6 10-12.5V7.5L14 3z"/><path d="M10 14l3 3 5-5"/></svg>`,
  'location-remover':  `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3C10.1 3 7 6.1 7 10c0 5.8 7 15 7 15s7-9.2 7-15c0-3.9-3.1-7-7-7z"/><circle cx="14" cy="10" r="2.5"/><path d="M4 4l20 20"/></svg>`,
  'exif-purger':       `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="22" height="18" rx="2.5"/><circle cx="10" cy="12" r="2.5"/><path d="M3 20l6-6 4 4 5-6 7 8"/><path d="M19 5l5 5M24 5l-5 5"/></svg>`,
  'hash-generator':    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M6 10h16M6 18h16M11 5l-2.5 18M19.5 5l-2.5 18"/></svg>`,
  'jwt-inspector':     `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="5.5"/><path d="M17 18l7 7"/><circle cx="12" cy="13" r="2" fill="currentColor" stroke="none"/></svg>`,
  'json-visualizer':   `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 5H5a2 2 0 0 0-2 2v3M7 5v4M7 5h5"/><path d="M5 14v4M5 22v2a2 2 0 0 0 2 2h3"/><path d="M14 24h4M20 24h3a2 2 0 0 0 2-2v-3"/><path d="M23 15v-4M23 7V5a2 2 0 0 0-2-2h-3"/><rect x="10" y="10" width="8" height="8" rx="1"/></svg>`,
  'diff-checker':      `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="10" height="20" rx="2"/><rect x="15" y="4" width="10" height="20" rx="2"/><path d="M6 9h4M6 13h4M6 17h4"/><path d="M18 9h4M18 17h4"/></svg>`,
  'yaml-transformer':  `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10L3 14l4 4"/><path d="M21 10l4 4-4 4"/><path d="M17 5l-6 18"/></svg>`,
  'regex-simulator':   `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h4M4 13h7M4 19h9"/><rect x="14" y="5" width="11" height="18" rx="2"/><path d="M18 11l2.5-2.5 2.5 2.5M21 8.5v6"/></svg>`,
  'cron-explainer':    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="14" cy="14" r="10"/><path d="M14 9v5l3 3"/></svg>`,
  'glass-studio':      `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="22" height="18" rx="3"/><path d="M3 10h22" opacity=".5"/><rect x="6" y="14" width="9" height="7" rx="2" stroke-dasharray="2 1.5"/><circle cx="21" cy="17.5" r="3" stroke-dasharray="2 1.5"/></svg>`,
  'tailwind-master':   `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="19" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/><rect x="19" y="11" width="6" height="6" rx="1.5"/><rect x="3" y="19" width="6" height="6" rx="1.5"/><rect x="11" y="19" width="6" height="6" rx="1.5"/><rect x="19" y="19" width="6" height="6" rx="1.5"/></svg>`,
  'string-encoder':    `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 9l-4 5 4 5"/><path d="M23 9l4 5-4 5"/><path d="M18 5l-8 18"/></svg>`,
  'table-builder':     `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="22" height="20" rx="2.5"/><path d="M3 10h22M10 10v14M3 16h22"/></svg>`,
  'log-filter':        `<svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h20l-8 9v8l-4-2v-6L4 6z"/></svg>`,
};

/* ── Smaller card icons for related-tools section ─────── */
const cardIcons = {
  'image-compressor':  `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="18" height="12" rx="2"/><path d="M8 11h6M11 8l-3 3 3 3"/></svg>`,
  'png-to-webp':       `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="8" height="8" rx="1.5"/><rect x="12" y="10" width="8" height="8" rx="1.5"/><path d="M10 8h2M10 8l-2-2M10 8l-2 2"/></svg>`,
  'webp-converter':    `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 4.5A8 8 0 0 1 19 11"/><path d="M17 4.5l-3.5.5.5-3.5"/><path d="M5 17.5A8 8 0 0 1 3 11"/><path d="M5 17.5l3.5-.5-.5 3.5"/></svg>`,
  'webp-cruncher':     `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="18" height="12" rx="2"/><path d="M8 11h6M11 8l-3 3 3 3"/></svg>`,
  'svg-optimizer':     `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="11,2 13.5,8.5 20,9 15.5,13.5 17,20 11,16.5 5,20 6.5,13.5 2,9 8.5,8.5"/></svg>`,
  'svg-renderer':      `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17.5L14.5 6l2.5 2.5L5.5 20H3v-2.5z"/><path d="M12.5 8l2 2"/><path d="M16 3l3 3-1.5 1.5-3-3L16 3z"/></svg>`,
  'metadata-stripper': `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2L3 6v5c0 5 3.6 9.3 8 10 4.4-.7 8-5 8-10V6L11 2z"/><path d="M8 11l2 2 4-4"/></svg>`,
  'location-remover':  `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2C8.2 2 6 4.2 6 7c0 4.5 5 11 5 11s5-6.5 5-11c0-2.8-2.2-5-5-5z"/><circle cx="11" cy="7" r="2"/><path d="M3 3l16 16"/></svg>`,
  'exif-purger':       `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="18" height="14" rx="2"/><circle cx="8" cy="9" r="2"/><path d="M2 16l4-4 3 3 4-5 5 6"/></svg>`,
  'hash-generator':    `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M5 8h12M5 14h12M9 4l-2 14M15 4l-2 14"/></svg>`,
  'jwt-inspector':     `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="10" r="4"/><path d="M13 14l7 7"/><circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none"/></svg>`,
  'json-visualizer':   `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h-2a1 1 0 0 0-1 1v2M5 3v3M5 3h4"/><path d="M4 9v4M4 17v2a1 1 0 0 0 1 1h2"/><path d="M9 19h4M17 19h2a1 1 0 0 0 1-1v-2"/><path d="M18 13V9M18 5V3a1 1 0 0 0-1-1h-2"/><path d="M8 8h6v6H8z"/></svg>`,
  'diff-checker':      `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="8" height="16" rx="1.5"/><rect x="12" y="3" width="8" height="16" rx="1.5"/><path d="M5 7h2M5 10h2M5 13h2"/><path d="M15 7h2M15 13h2"/></svg>`,
  'yaml-transformer':  `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l-4 3 4 3"/><path d="M17 8l4 3-4 3"/><path d="M13 4l-4 14"/></svg>`,
  'regex-simulator':   `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h3M3 11h5M3 16h7"/><rect x="11" y="4" width="9" height="14" rx="2"/><path d="M14 9l2-2 2 2M16 7v5"/></svg>`,
  'cron-explainer':    `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M11 7v4l2.5 2.5"/></svg>`,
  'glass-studio':      `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="18" height="14" rx="2.5"/><path d="M2 8h18" opacity=".5"/><rect x="5" y="11" width="7" height="5" rx="1.5" stroke-dasharray="2 1"/><circle cx="16" cy="13.5" r="2" stroke-dasharray="2 1"/></svg>`,
  'tailwind-master':   `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="5" height="5" rx="1"/><rect x="8.5" y="2" width="5" height="5" rx="1"/><rect x="15" y="2" width="5" height="5" rx="1"/><rect x="2" y="8.5" width="5" height="5" rx="1"/><rect x="8.5" y="8.5" width="5" height="5" rx="1"/><rect x="15" y="8.5" width="5" height="5" rx="1"/><rect x="2" y="15" width="5" height="5" rx="1"/><rect x="8.5" y="15" width="5" height="5" rx="1"/><rect x="15" y="15" width="5" height="5" rx="1"/></svg>`,
  'string-encoder':    `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7l-3 4 3 4"/><path d="M18 7l3 4-3 4"/><path d="M14 4l-6 14"/></svg>`,
  'table-builder':     `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="18" height="16" rx="2"/><path d="M2 8h18M8 8v11M2 13h18"/></svg>`,
  'log-filter':        `<svg width="20" height="20" viewBox="0 0 22 22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 5h16l-6 7v6l-4-2V12L3 5z"/></svg>`,
};

/* ── Nav logo SVG → PNG image ──────────────────────────── */
const NAV_LOGO_SVG_RE = /<svg class="logo-duck"[\s\S]*?<\/svg>/;
const NAV_LOGO_IMG = `<img src="../../assets/images/duck-logo.png" alt="ToolDuck logo" class="nav-logo-img" width="44" height="44">`;

/* ── Hamburger ─────────────────────────────────────────── */
const HAMBURGER_SVG = `<svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true"><path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

/* ── Emoji strip regex ─────────────────────────────────── */
// Matches common emoji used in this codebase; strip them from text-only spots
const EMOJI_RE = /[\u{1F300}-\u{1FFFF}\u{2194}-\u{21AA}\u{231A}-\u{231B}\u{23E9}-\u{23FA}\u{25AA}-\u{27BF}\u{2934}-\u{2935}\u{2B05}-\u{2B55}\u{3030}\u{303D}\u{3297}\u{3299}✅✕✓✗☰🍪📖🏗️❓]/gu;

/* ── Info-card icon SVG replacements ───────────────────── */
const INFO_ICON_SVGS = {
  manual:  `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="1" width="14" height="16" rx="2"/><path d="M5 5h8M5 8h8M5 11h5"/></svg>`,
  arch:    `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="3"/><path d="M9 1v3M9 14v3M1 9h3M14 9h3M3.2 3.2l2.1 2.1M12.7 12.7l2.1 2.1M3.2 14.8l2.1-2.1M12.7 5.3l2.1-2.1"/></svg>`,
  faq:     `<svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="8"/><path d="M6.8 6.8a2.5 2.5 0 0 1 4.9.8c0 2-2.7 2.4-2.7 4"/><circle cx="9" cy="13.5" r=".5" fill="currentColor" stroke="none"/></svg>`,
};

/* ── Build the new footer HTML ─────────────────────────── */
function buildFooter() {
  return `<footer class="site-footer">
  <div class="footer-main">
    <div class="footer-col footer-col-brand">
      <a href="../../" class="footer-logo-row" aria-label="ToolDuck Home">
        <img src="../../assets/images/duck-logo.png" alt="ToolDuck logo" class="footer-logo-img" width="42" height="42">
        <span class="footer-logo-text">tool<span>duck</span>.xyz</span>
      </a>
      <p class="footer-desc">19 free developer tools that run entirely in your browser. No server uploads, no tracking, no accounts. Your data stays on your machine.</p>
      <a href="../../privacy-policy.html" class="footer-privacy-badge">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 1L2 3v3c0 3 1.8 5.5 4 6 2.2-.5 4-3 4-6V3L6 1z"/></svg>
        100% Privacy-First
      </a>
    </div>
    <div class="footer-col">
      <h4>Popular Tools</h4>
      <ul>
        <li><a href="../../tools/hash-generator/">SHA Hash Generator</a></li>
        <li><a href="../../tools/jwt-inspector/">JWT Inspector</a></li>
        <li><a href="../../tools/image-compressor/">Image Compressor</a></li>
        <li><a href="../../tools/diff-checker/">Diff Checker</a></li>
        <li><a href="../../tools/regex-simulator/">RegEx Simulator</a></li>
        <li><a href="../../tools/json-visualizer/">JSON Visualizer</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>More Tools</h4>
      <ul>
        <li><a href="../../tools/yaml-transformer/">YAML ↔ JSON</a></li>
        <li><a href="../../tools/string-encoder/">String Encoder</a></li>
        <li><a href="../../tools/glass-studio/">Glassmorphism Lab</a></li>
        <li><a href="../../tools/tailwind-master/">Tailwind Palette</a></li>
        <li><a href="../../tools/table-builder/">Table Builder</a></li>
        <li><a href="../../tools/log-filter/">Log Filter</a></li>
      </ul>
    </div>
    <div class="footer-col">
      <h4>Company</h4>
      <ul>
        <li><a href="../../privacy-policy.html">Privacy Policy</a></li>
        <li><a href="../../terms.html">Terms of Service</a></li>
        <li><a href="../../cookie-policy.html">Cookie Policy</a></li>
        <li><a href="../../contact.html">Contact Us</a></li>
        <li><a href="../../sitemap.xml">Sitemap</a></li>
        <li><a href="../../">All 19 Tools</a></li>
      </ul>
    </div>
  </div>
  <div class="footer-bottom-bar">
    <p>&copy; 2025 ToolDuck.xyz &mdash; All tools run 100% in your browser.</p>
    <div class="footer-bottom-links">
      <a href="../../privacy-policy.html">Privacy</a>
      <a href="../../terms.html">Terms</a>
      <a href="../../sitemap.xml">Sitemap</a>
    </div>
  </div>
</footer>`;
}

/* ── Build related-tools section ───────────────────────── */
function buildRelatedTools(slug) {
  const related = relatedMap[slug];
  if (!related || related.length === 0) return '';
  const cards = related.map(rSlug => {
    const info = toolInfo[rSlug];
    if (!info) return '';
    const icon = cardIcons[rSlug] || '';
    return `      <a href="../../tools/${rSlug}/" class="related-tool-card">
        <div class="related-tool-icon">${icon}</div>
        <div class="related-tool-meta">
          <div class="related-tool-name">${info.name}</div>
          <div class="related-tool-desc">${info.desc}</div>
        </div>
        <span class="related-tool-badge">${info.cat}</span>
        <span class="related-arrow">&rarr;</span>
      </a>`;
  }).join('\n');

  return `
<section class="related-tools-section">
  <div class="related-tools-inner">
    <h2 class="related-title">
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 1L1.5 5v4.5c0 4.1 3 7.7 7.5 8.5 4.5-.8 7.5-4.4 7.5-8.5V5L9 1z"/></svg>
      More Free Tools You Might Like
    </h2>
    <div class="related-tools-grid">
${cards}
    </div>
  </div>
</section>`;
}

/* ── Transform one tool page ───────────────────────────── */
function transformPage(filePath, slug) {
  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Nav: replace SVG duck logo with PNG img
  html = html.replace(NAV_LOGO_SVG_RE, NAV_LOGO_IMG);

  // 2. Nav: replace ☰ hamburger with SVG
  html = html.replace(/>\u2630<\/button>/g, `>${HAMBURGER_SVG}</button>`);
  html = html.replace(/>☰<\/button>/g, `>${HAMBURGER_SVG}</button>`);

  // 3. tool-page-icon: replace emoji with SVG
  const icon = pageIcons[slug];
  if (icon) {
    html = html.replace(
      /<div class="tool-page-icon">[^<]*<\/div>/,
      `<div class="tool-page-icon">${icon}</div>`
    );
  }

  // 4. Badges: strip emoji from badge text (keep the text label)
  html = html.replace(
    /(<span class="badge[^"]*"[^>]*>)([^<]+)(<\/span>)/g,
    (m, open, content, close) => open + content.replace(EMOJI_RE, '').replace(/^\s+/, '').trimEnd() + close
  );

  // 5. Panel titles: strip emoji
  html = html.replace(
    /(<span class="panel-title">)([^<]+)(<\/span>)/g,
    (m, open, content, close) => open + content.replace(EMOJI_RE, '').replace(/^\s+/, '').trimEnd() + close
  );

  // 6. Button labels (file/hash/clear buttons): strip emoji from text nodes in buttons
  // Only strip from btn labels that are text content (not input wrappers)
  html = html.replace(
    /(<(?:button|label)[^>]*class="btn[^"]*"[^>]*>)([^<]+)(<\/(?:button|label)>)/g,
    (m, open, content, close) => open + content.replace(EMOJI_RE, '').replace(/^\s+/, '').trimEnd() + close
  );

  // 7. Info-card .icon spans: replace emoji with SVG
  // Pattern: <span class="icon">EMOJI</span> inside h3
  html = html.replace(/<span class="icon">[\s\S]*?<\/span>/g, (m) => {
    const inner = m.replace(/<span class="icon">|<\/span>/g, '').trim();
    // Detect icon type by content
    if (/📖|Manual|User Guide|How to|Using/.test(inner + (m.match(/\>(.*?)\</s) || ['',''])[1])) {
      return `<span class="icon">${INFO_ICON_SVGS.manual}</span>`;
    } else if (/🏗|Arch|Engine|Technolog|How it|Under|Works/.test(inner)) {
      return `<span class="icon">${INFO_ICON_SVGS.arch}</span>`;
    } else if (/❓|FAQ|Question|Frequen/.test(inner)) {
      return `<span class="icon">${INFO_ICON_SVGS.faq}</span>`;
    }
    // Fallback: identify by position later
    return `<span class="icon">${INFO_ICON_SVGS.faq}</span>`;
  });

  // 7b. Info-card h3 titles: detect and assign correct icons
  html = html.replace(
    /(<div class="info-card"[^>]*>[\s\S]*?<h3>)<span class="icon">[\s\S]*?<\/span>([\s\S]*?)(<\/h3>)/g,
    (m, pre, titleText, post) => {
      let svg = INFO_ICON_SVGS.faq;
      if (/Manual|Guide|How to Use|Using|Step|Operational/i.test(titleText)) svg = INFO_ICON_SVGS.manual;
      else if (/Architect|Engine|Technical|Under the Hood|Works|Technolog|Powered/i.test(titleText)) svg = INFO_ICON_SVGS.arch;
      else if (/FAQ|Frequently|Question/i.test(titleText)) svg = INFO_ICON_SVGS.faq;
      return `${pre}<span class="icon">${svg}</span>${titleText}${post}`;
    }
  );

  // 8. Cookie banner: remove 🍪 and the "Cookie Notice" strong wrapper
  html = html.replace(
    /<strong[^>]*>[\s\S]*?🍪[\s\S]*?<\/strong>\s*[—\-–]?\s*/g,
    ''
  );
  html = html.replace(/🍪\s*/g, '');

  // 9. Replace entire <footer>...</footer> block with new branded footer
  html = html.replace(/<footer class="site-footer">[\s\S]*?<\/footer>/, buildFooter());

  // 10. Inject related-tools section before the footer
  const relatedHtml = buildRelatedTools(slug);
  if (relatedHtml) {
    html = html.replace(/<footer class="site-footer">/, relatedHtml + '\n<footer class="site-footer">');
  }

  // 11. General cleanup: strip remaining stray emoji from h1, h2, h3 text and option labels
  html = html.replace(
    /(<(?:h1|h2|h3|option|label|strong|em)[^>]*>)([^<]+)(<\/(?:h1|h2|h3|option|label|strong|em)>)/g,
    (m, open, content, close) => {
      const stripped = content.replace(EMOJI_RE, '').replace(/^\s+/, '');
      return open + stripped + close;
    }
  );

  // 12. Add meta keywords and og:description if missing
  if (!html.includes('og:description')) {
    const info = toolInfo[slug];
    if (info) {
      html = html.replace(
        /(<meta property="og:url"[^>]*>)/,
        `<meta property="og:description" content="${info.desc} — free, 100% browser-based, no upload required.">\n  $1`
      );
    }
  }

  return html;
}

/* ── Main: process all tool directories ────────────────── */
const toolsDir = path.join(__dirname, '..', 'tools');
const toolDirs = fs.readdirSync(toolsDir).filter(d => {
  return fs.statSync(path.join(toolsDir, d)).isDirectory();
});

let updated = 0;
for (const slug of toolDirs) {
  const filePath = path.join(toolsDir, slug, 'index.html');
  if (!fs.existsSync(filePath)) continue;

  try {
    const transformed = transformPage(filePath, slug);
    fs.writeFileSync(filePath, transformed, 'utf8');
    console.log(`✓ ${slug}`);
    updated++;
  } catch (err) {
    console.error(`✗ ${slug}: ${err.message}`);
  }
}

console.log(`\nDone — ${updated} pages updated.`);
