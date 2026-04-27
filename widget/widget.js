/**
 * Fuqah AI Chat Widget — Embeddable Script
 * Version: 3.0.0
 *
 * Usage:
 *   <script src="https://widget.fuqah.net/widget.js" charset="UTF-8" data-store-id="STORE_ID"></script>
 *
 * The script reads data-store-id, fetches settings + branding from Supabase,
 * then builds the entire chat widget DOM dynamically.
 */
(function () {
  'use strict';

  // ═══════════════════════════════════════════════════════════════════
  // 1. READ CONFIG FROM SCRIPT TAG
  // ═══════════════════════════════════════════════════════════════════
  var scriptTag = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var STORE_ID = scriptTag.getAttribute('data-store-id') || 'store_shrman';
  console.log('[Fuqah] Loader starting, storeId=' + STORE_ID);
  var BASE_URL = (function () {
    var src = scriptTag.getAttribute('src') || '';
    var idx = src.lastIndexOf('/');
    return idx > 0 ? src.substring(0, idx) : '.';
  })();
  console.log('[Fuqah] BASE_URL=' + BASE_URL);

  // Supabase config
  var SUPABASE_PROJECT = 'kyohutbusszojssbgbvw';
  var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5b2h1dGJ1c3N6b2pzc2JnYnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNDk5NTYsImV4cCI6MjA5MTcyNTk1Nn0.TgYntJK3VQeH3CpB1GGX1OYPOp_l91Kk6DmlyttghUo';
  var API_BASE = 'https://' + SUPABASE_PROJECT + '.supabase.co/functions/v1/make-server-9f71bdbf';

  // ═══════════════════════════════════════════════════════════════════
  // 2. DEFAULT SETTINGS (fallback if API fails)
  // ═══════════════════════════════════════════════════════════════════
  var settings = {
    mode: 'light',
    mainColor: '#000000',
    widgetOuterColor: '#000000',
    widgetInnerColor: '#FFFFFF',
    position: 'bottom-right',
    storeName: 'Fuqah AI',
    storeLogo: null,
    storeIcon: null,
  };

  // ═══════════════════════════════════════════════════════════════════
  // 3. COLOR PALETTES
  // ═══════════════════════════════════════════════════════════════════
  var LIGHT = {
    chatBg: '#FFFFFF', chatBorder: '#e5e7eb', msgBg: '#FFFFFF',
    userBubbleBg: '#f3f4f6', userBubbleText: '#1f2937',
    inputBg: '#FFFFFF', inputRowBg: '#f3f4f6', inputBorder: '#e5e7eb',
    inputText: '#1f2937', inputPlaceholder: '#9ca3af',
    primaryText: '#1f2937', secondaryText: '#6b7280',
    footerBg: '#f9fafb', footerBorder: '#e5e7eb', footerText: '#9ca3af', footerBrand: '#6b7280',
  };
  var DARK = {
    chatBg: '#1e293b', chatBorder: '#334155', msgBg: '#1e293b',
    userBubbleBg: '#334155', userBubbleText: '#f1f5f9',
    inputBg: '#0f172a', inputRowBg: '#0f172a', inputBorder: '#334155',
    inputText: '#f1f5f9', inputPlaceholder: '#64748b',
    primaryText: '#f1f5f9', secondaryText: '#94a3b8',
    footerBg: '#0f172a', footerBorder: '#334155', footerText: '#64748b', footerBrand: '#94a3b8',
  };

  function mc() { return settings.mode === 'dark' ? DARK : LIGHT; }
  function isDark() { return settings.mode === 'dark'; }

  // ═══════════════════════════════════════════════════════════════════
  // 4. PHONE VALIDATION
  // ═══════════════════════════════════════════════════════════════════
  var PHONE_RULES = {
    SA: { prefixes: ['05'], length: 10, error: 'رقم السعودية يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' },
    AE: { prefixes: ['05','04','02','03','06','07','09'], length: 10, error: 'رقم الإمارات يجب أن يبدأ بـ 05 ويتكون من 10 أرقام' },
    KW: { prefixes: ['5','6','9'], length: 8, error: 'رقم الكويت يجب أن يبدأ بـ 5 أو 6 أو 9 ويتكون من 8 أرقام' },
    QA: { prefixes: ['3','5','6','7'], length: 8, error: 'رقم قطر يجب أن يتكون من 8 أرقام' },
    BH: { prefixes: ['3','6'], length: 8, error: 'رقم البحرين يجب أن يبدأ بـ 3 أو 6 ويتكون من 8 أرقام' },
    OM: { prefixes: ['7','9'], length: 8, error: 'رقم عُمان يجب أن يبدأ بـ 7 أو 9 ويتكون من 8 أرقام' },
    YE: { prefixes: ['7'], length: 9, error: 'رقم اليمن يجب أن يبدأ بـ 7 ويتكون من 9 أرقام' },
    IQ: { prefixes: ['07'], length: 11, error: 'رقم العراق يجب أن يبدأ بـ 07 ويتكون من 11 رقماً' },
    JO: { prefixes: ['07'], length: 10, error: 'رقم الأردن يجب أن يبدأ بـ 07 ويتكون من 10 أرقام' },
    EG: { prefixes: ['01'], length: 11, error: 'رقم مصر يجب أن يبدأ بـ 01 ويتكون من 11 رقماً' },
  };
  var COUNTRIES = [
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', placeholder: '05xxxxxxxx' },
    { code: 'AE', name: 'UAE', dialCode: '+971', placeholder: '05xxxxxxxx' },
    { code: 'KW', name: 'Kuwait', dialCode: '+965', placeholder: '5xxxxxxxx' },
    { code: 'QA', name: 'Qatar', dialCode: '+974', placeholder: '3xxxxxxxx' },
    { code: 'BH', name: 'Bahrain', dialCode: '+973', placeholder: '3xxxxxxxx' },
    { code: 'OM', name: 'Oman', dialCode: '+968', placeholder: '9xxxxxxxx' },
    { code: 'YE', name: 'Yemen', dialCode: '+967', placeholder: '7xxxxxxxx' },
    { code: 'IQ', name: 'Iraq', dialCode: '+964', placeholder: '7xxxxxxxx' },
    { code: 'JO', name: 'Jordan', dialCode: '+962', placeholder: '7xxxxxxxx' },
    { code: 'EG', name: 'Egypt', dialCode: '+20', placeholder: '01xxxxxxxx' },
  ];

  function validatePhone(countryCode, rawPhone) {
    var cleaned = rawPhone.replace(/\D/g, '');
    var rule = PHONE_RULES[countryCode];
    if (!rule) return cleaned.length >= 7 ? { valid: true, error: '' } : { valid: false, error: 'يرجى إدخال رقم هاتف صحيح' };
    if (cleaned.length !== rule.length) return { valid: false, error: rule.error };
    var ok = rule.prefixes.some(function (p) { return cleaned.indexOf(p) === 0; });
    if (!ok) return { valid: false, error: rule.error };
    return { valid: true, error: '' };
  }

  // ═══════════════════════════════════════════════════════════════════
  // 5. STATE
  // ═══════════════════════════════════════════════════════════════════
  var state = {
    isOpen: false,
    messages: [],
    isTyping: false,
    currentScreen: 'chat', // chat | ticket-form | ticket-created | rating
    showModal: false,
    ticketCreated: false,
    ticketSource: 'form',
    ticketId: '#TKT-' + Math.floor(10000 + Math.random() * 90000),
    conversationId: 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9),
    attachment: null,
    rating: 0,
    hoveredRating: 0,
    feedback: '',
    bottomOffset: 0,
  };

  // ═══════════════════════════════════════════════════════════════════
  // 6. UTILITY FUNCTIONS
  // ═══════════════════════════════════════════════════════════════════
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
  function isMobile() { return window.innerWidth < 640; }
  function el(tag, cls, attrs) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function svg(html, w, h) {
    var wrap = el('span');
    wrap.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (w || 20) + '" height="' + (h || 20) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + html + '</svg>';
    return wrap.firstChild;
  }

  // URL detection in text
  var URL_RE = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;
  function textWithLinks(text) {
    var parts = text.split(URL_RE);
    var frag = document.createDocumentFragment();
    parts.forEach(function (part) {
      if (part.match(URL_RE)) {
        var a = el('a');
        a.href = part.indexOf('http') === 0 ? part : 'https://' + part;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = part;
        a.style.cssText = 'color:#3b82f6;text-decoration:underline;cursor:pointer;word-break:break-all;';
        a.onclick = function (e) { e.stopPropagation(); };
        frag.appendChild(a);
      } else {
        frag.appendChild(document.createTextNode(part));
      }
    });
    return frag;
  }

  // Country flag SVG
  function flagSVG(code, size) {
    size = size || 20;
    var h = size * 0.75;
    var content = '';
    switch (code) {
      case 'SA': content = '<rect width="40" height="30" fill="#006C35"/><rect x="8" y="8" width="24" height="8" rx="1" fill="#FFF" opacity=".9"/><rect x="12" y="18" width="16" height="1.5" rx=".75" fill="#FFF" opacity=".9"/><rect x="12" y="17" width="1.5" height="4" rx=".5" fill="#FFF" opacity=".9"/>'; break;
      case 'AE': content = '<rect width="40" height="10" fill="#00732F"/><rect y="10" width="40" height="10" fill="#FFF"/><rect y="20" width="40" height="10" fill="#000"/><rect width="10" height="30" fill="#F00"/>'; break;
      case 'KW': content = '<rect width="40" height="10" fill="#007A3D"/><rect y="10" width="40" height="10" fill="#FFF"/><rect y="20" width="40" height="10" fill="#CE1126"/><polygon points="0,0 12,7.5 12,22.5 0,30" fill="#000"/>'; break;
      case 'QA': content = '<rect width="40" height="30" fill="#8A1538"/><polygon points="0,0 14,0 18,3.33 14,6.66 18,10 14,13.33 18,16.66 14,20 18,23.33 14,26.66 18,30 14,30 0,30" fill="#FFF"/>'; break;
      case 'BH': content = '<rect width="40" height="30" fill="#CE1126"/><polygon points="0,0 12,0 16,3 12,6 16,9 12,12 16,15 12,18 16,21 12,24 16,27 12,30 0,30" fill="#FFF"/>'; break;
      case 'OM': content = '<rect width="40" height="10" fill="#FFF"/><rect y="10" width="40" height="10" fill="#DB161B"/><rect y="20" width="40" height="10" fill="#008000"/><rect width="12" height="30" fill="#DB161B"/><rect x="3" y="1.5" width="6" height="6" rx="1" fill="#FFF" opacity=".5"/>'; break;
      case 'YE': content = '<rect width="40" height="10" fill="#CE1126"/><rect y="10" width="40" height="10" fill="#FFF"/><rect y="20" width="40" height="10" fill="#000"/>'; break;
      case 'IQ': content = '<rect width="40" height="10" fill="#CE1126"/><rect y="10" width="40" height="10" fill="#FFF"/><rect y="20" width="40" height="10" fill="#000"/><rect x="10" y="12" width="20" height="6" rx="1" fill="#007A3D" opacity=".85"/>'; break;
      case 'JO': content = '<rect width="40" height="10" fill="#000"/><rect y="10" width="40" height="10" fill="#FFF"/><rect y="20" width="40" height="10" fill="#007A3D"/><polygon points="0,0 18,15 0,30" fill="#CE1126"/><circle cx="7" cy="15" r="2" fill="#FFF"/>'; break;
      case 'EG': content = '<rect width="40" height="10" fill="#CE1126"/><rect y="10" width="40" height="10" fill="#FFF"/><rect y="20" width="40" height="10" fill="#000"/><circle cx="20" cy="15" r="3.5" fill="#C09300" opacity=".85"/>'; break;
      default: content = '<rect width="40" height="30" fill="#e5e7eb"/><text x="20" y="18" text-anchor="middle" font-size="10" fill="#6b7280">' + esc(code) + '</text>';
    }
    var wrap = el('span');
    wrap.innerHTML = '<svg viewBox="0 0 40 30" width="' + size + '" height="' + h + '" class="fq-flag" role="img" aria-label="' + esc(code) + '">' + content + '</svg>';
    return wrap.firstChild;
  }

  // Fuqah footer SVG
  var FUQAH_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" class="fq-footer-logo"><defs><radialGradient id="fq-g" cx="250" cy="250" fx="250" fy="250" r="349.5" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#00fff4"/><stop offset=".1" stop-color="#00f5f1"/><stop offset=".27" stop-color="#00ddec"/><stop offset=".49" stop-color="#01b5e3"/><stop offset=".74" stop-color="#027ed6"/><stop offset="1" stop-color="#043cc8"/></radialGradient></defs><path fill="url(#fq-g)" d="M84.82,211.75h24.95v24.95h-24.95v-24.95ZM59.88,211.75h24.95v-24.95h-24.95v24.95ZM84.82,186.8h24.95v-24.95h-24.95v24.95ZM59.88,161.86h24.95v-24.95h-24.95v24.95ZM84.82,136.91h24.95v-24.95h-24.95v24.95ZM109.77,111.97h24.95v-24.95h-24.95v24.95ZM134.71,136.91h24.95v-24.95h-24.95v24.95ZM159.66,111.97h24.95v-24.95h-24.95v24.95ZM134.71,87.02h24.95v-24.95h-24.95v24.95ZM184.61,87.02h24.95v-24.95h-24.95v24.95ZM209.55,111.97h24.95v-24.95h-24.95v24.95ZM213.41,212.58h24.95v-24.95h-24.95v24.95ZM209.55,62.07h24.95v-24.95h-24.95v24.95ZM34.93,236.7h24.95v-24.95h-24.95v24.95ZM236.7,415.18v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM211.75,440.12v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM186.8,415.18v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM161.86,440.12v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM136.91,415.18v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM111.97,390.23v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM136.91,365.29v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM111.97,340.34v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM87.02,365.29v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM87.02,315.39v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM111.97,290.45v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM62.07,290.45v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM236.7,465.07v-24.95s-24.95,0-24.95,0v24.95s24.95,0,24.95,0ZM415.18,263.3h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM440.12,288.25h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM390.23,388.03h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM340.34,388.03h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM365.29,412.98h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM315.39,412.98h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM290.45,388.03h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM290.45,437.93h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM465.07,263.3h-24.95s0,24.95,0,24.95h24.95s0-24.95,0-24.95ZM263.3,84.82v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM288.25,59.88v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM313.2,84.82v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM338.14,59.88v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM363.09,84.82v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM388.03,109.77v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM363.09,134.71v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM388.03,159.66v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM412.98,134.71v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM412.98,184.61v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM388.03,209.55v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM437.93,209.55v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM263.3,34.93v24.95s24.95,0,24.95,0v-24.95s-24.95,0-24.95,0ZM263.3,187.63v24.95s72.48,0,72.48,0v-24.95s-72.48,0-72.48,0ZM164.22,237.53v24.95s171.57,0,171.57,0v-24.95s-171.57,0-171.57,0ZM164.22,287.42v24.95s83.65,0,83.65,0v-24.95s-83.65,0-83.65,0Z"/></svg>';

  // Bubble SVG icon
  var BUBBLE_PATH = 'M500,217.35c-156.1,0-282.65,126.55-282.65,282.65s126.55,282.65,282.65,282.65v68.68s282.65-77.5,282.65-351.33c0-156.11-126.55-282.65-282.65-282.65Z';

  // ═══════════════════════════════════════════════════════════════════
  // 7. PLATFORM BOTTOM BAR DETECTION
  // ═══════════════════════════════════════════════════════════════════
  var KNOWN_SELECTORS = [
    '.product-actions-bar','.zid-product-sticky-bar','.sticky-add-to-cart',
    '.sticky-atc-bar','.product-sticky-bar','.product-bottom-bar',
    '[data-sticky-add-to-cart]','.zid-sticky-bar','.add-to-cart-bar',
    '.mobile-product-actions','.mobile-add-to-cart',
    '.s-product-sticky-bar','.salla-sticky-bar','.s-cart-sticky',
    '.salla-bottom-bar','.s-bottom-bar','[data-salla-sticky]',
    '.shopify-sticky-bar','.product-sticky-form',
    '.fixed-bottom-bar','.sticky-bottom-bar','.bottom-action-bar',
    '.mobile-bottom-bar','.floating-bottom-bar','#bottom-bar','#sticky-add-to-cart',
  ];

  function detectBottomBar() {
    var maxH = 0;
    KNOWN_SELECTORS.forEach(function (sel) {
      try {
        var els = document.querySelectorAll(sel);
        for (var i = 0; i < els.length; i++) {
          var s = window.getComputedStyle(els[i]);
          if ((s.position === 'fixed' || s.position === 'sticky') && s.display !== 'none' && s.visibility !== 'hidden' && parseFloat(s.opacity) !== 0) {
            var r = els[i].getBoundingClientRect();
            if (r.height >= 40 && r.height <= 200 && (window.innerHeight - r.bottom) <= 10 && r.width >= window.innerWidth * 0.5) {
              if (r.height > maxH) maxH = r.height;
            }
          }
        }
      } catch (e) { /* skip */ }
    });
    if (maxH === 0) {
      var cands = document.querySelectorAll('body > *, [class*="sticky"], [class*="fixed"], [class*="bottom"]');
      for (var i = 0; i < cands.length; i++) {
        var s = window.getComputedStyle(cands[i]);
        if ((s.position === 'fixed' || s.position === 'sticky') && s.display !== 'none' && s.visibility !== 'hidden') {
          var r = cands[i].getBoundingClientRect();
          if (r.height >= 40 && r.height <= 200 && (window.innerHeight - r.bottom) <= 10 && r.width >= window.innerWidth * 0.5) {
            if (r.height > maxH) maxH = r.height;
          }
        }
      }
    }
    return maxH;
  }

  function scanBottomBar() {
    var h = detectBottomBar();
    state.bottomOffset = h > 0 ? h + 12 : 0;
    updateBubblePosition();
  }

  // ═══════════════════════════════════════════════════════════════════
  // 8. BODY SCROLL LOCK
  // ═══════════════════════════════════════════════════════════════════
  var savedScrollY = 0, savedBodyCSS = '', blockDocTouch = null;

  function lockBody() {
    savedScrollY = window.scrollY;
    savedBodyCSS = document.body.style.cssText;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    document.body.style.position = 'fixed';
    document.body.style.top = '-' + savedScrollY + 'px';
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    blockDocTouch = function (e) {
      var w = document.getElementById('fq-chat-window');
      if (w && w.contains(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener('touchmove', blockDocTouch, { passive: false });
  }

  function unlockBody() {
    if (blockDocTouch) { document.removeEventListener('touchmove', blockDocTouch); blockDocTouch = null; }
    document.body.style.cssText = savedBodyCSS;
    window.scrollTo(0, savedScrollY);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 9. DOWNLOAD AS IMAGE
  // ═══════════════════════════════════════════════════════════════════
  function downloadAsImage(type) {
    var W = 800, P = 40, LH = 24, GAP = 16;
    var msgs = state.messages;
    var name = settings.storeName;
    var dark = isDark();
    var bg = dark ? '#1e293b' : '#FFFFFF';
    var txt = dark ? '#f1f5f9' : '#1f2937';
    var sec = dark ? '#94a3b8' : '#6b7280';
    var accent = dark ? '#3b82f6' : '#0ea5e9';
    var sep = dark ? '#334155' : '#e5e7eb';
    var sMBg = dark ? '#334155' : '#f3f4f6';
    var cMBg = dark ? '#1e40af' : '#dbeafe';

    var c0 = document.createElement('canvas'); c0.width = W; c0.height = 100;
    var ctx0 = c0.getContext('2d');
    ctx0.font = '14px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
    var mw = W - P * 2;

    function wrap(ctx, t, max) {
      var words = t.split(' '), lines = [], cur = '';
      words.forEach(function (w) {
        var test = cur ? cur + ' ' + w : w;
        if (ctx.measureText(test).width > max && cur) { lines.push(cur); cur = w; }
        else cur = test;
      });
      if (cur) lines.push(cur);
      return lines.length ? lines : [''];
    }

    var h = P + 36 + GAP + 2 + GAP;
    var metaCount = 4 + (type === 'ticket' ? 2 : 0);
    h += metaCount * LH + GAP + 2 + GAP;
    msgs.forEach(function (m) {
      var sender = m.sender === 'store' ? name : 'العميل';
      var time = m.timestamp ? m.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';
      var full = '[' + time + '] ' + sender + ': ' + (m.text || '[مرفق]');
      h += wrap(ctx0, full, mw - 16).length * LH + 8;
    });
    h += GAP + 2 + GAP + LH + P;

    var c = document.createElement('canvas');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = W * dpr; c.height = h * dpr;
    var ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, h);

    var y = P;
    ctx.fillStyle = accent;
    ctx.font = 'bold 22px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
    ctx.textAlign = 'center';
    var title = type === 'ticket' ? 'سجل التذكرة — ' + name : 'سجل المحادثة — ' + name;
    ctx.fillText(title, W / 2, y + 22); y += 36 + GAP;
    ctx.fillStyle = sep; ctx.fillRect(P, y, W - P * 2, 2); y += 2 + GAP;

    ctx.textAlign = 'right';
    ctx.font = '14px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
    var mx = W - P;
    var meta = [['معرّف المحادثة', state.conversationId]];
    if (type === 'ticket') meta.push(['رقم التذكرة', state.ticketId]);
    meta.push(['المتجر', name], ['التاريخ', new Date().toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })], ['عدد الرسائل', '' + msgs.length]);
    if (type === 'ticket') meta.push(['الحالة', 'مفتوحة']);
    meta.forEach(function (m) {
      ctx.fillStyle = sec; ctx.fillText(m[0] + ': ', mx, y + 16);
      var lw = ctx.measureText(m[0] + ': ').width;
      ctx.fillStyle = txt; ctx.font = 'bold 14px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
      ctx.fillText(m[1], mx - lw, y + 16);
      ctx.font = '14px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
      y += LH;
    });
    y += GAP;
    ctx.fillStyle = sep; ctx.fillRect(P, y, W - P * 2, 2); y += 2 + GAP;

    msgs.forEach(function (m) {
      var isCust = m.sender === 'customer';
      var sender = isCust ? 'العميل' : name;
      var time = m.timestamp ? m.timestamp.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }) : '';
      var full = '[' + time + '] ' + sender + ': ' + (m.text || '[مرفق]');
      var lines = wrap(ctx, full, mw - 16);
      var ph = lines.length * LH + 8;
      ctx.fillStyle = isCust ? cMBg : sMBg;
      ctx.beginPath();
      var rx = P, ry = y - 2, rw = W - P * 2, rh = ph, rr = 8;
      ctx.moveTo(rx + rr, ry); ctx.lineTo(rx + rw - rr, ry);
      ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rr);
      ctx.lineTo(rx + rw, ry + rh - rr);
      ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rr, ry + rh);
      ctx.lineTo(rx + rr, ry + rh);
      ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rr);
      ctx.lineTo(rx, ry + rr);
      ctx.quadraticCurveTo(rx, ry, rx + rr, ry);
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = txt;
      ctx.font = '14px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
      lines.forEach(function (l) { ctx.fillText(l, mx - 8, y + 14); y += LH; });
      y += 8;
    });

    y += GAP;
    ctx.fillStyle = sep; ctx.fillRect(P, y, W - P * 2, 2); y += 2 + GAP;
    ctx.fillStyle = sec;
    ctx.font = '13px "IBM Plex Sans Arabic","Segoe UI",Arial,sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('مدعوم من فقاعة AI — www.fuqah.ai', W / 2, y + 14);

    c.toBlob(function (blob) {
      if (!blob) return;
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      var prefix = type === 'ticket' ? 'تذكرة-' + state.ticketId : 'محادثة-' + state.conversationId;
      a.download = prefix + '-' + name + '.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }

  // ═══════════════════════════════════════════════════════════════════
  // 10. LOAD CSS
  // ═══════════════════════════════════════════════════════════════════
  function loadCSS() {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = BASE_URL + '/widget.css';
    document.head.appendChild(link);
    console.log('[Fuqah] CSS link injected: ' + link.href);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 11. DOM REFERENCES
  // ═══════════════════════════════════════════════════════════════════
  var dom = {};

  // ═══════════════════════════════════════════════════════════════════
  // 12. BUILD DOM
  // ═══════════════════════════════════════════════════════════════════
  function buildWidget() {
    // Root container
    var root = el('div', 'fq-widget-root');
    root.id = 'fq-widget-root';

    // ── Bubble ──
    var bubble = el('button', 'fq-bubble fq-bubble-enter');
    bubble.id = 'fq-bubble';
    bubble.setAttribute('aria-label', 'فتح المحادثة');
    updateBubbleSVG(bubble);
    bubble.onclick = function () { openChat(); };
    root.appendChild(bubble);
    dom.bubble = bubble;

    // ── Touch overlay ──
    var overlay = el('div', 'fq-touch-overlay');
    overlay.id = 'fq-overlay';
    overlay.style.display = 'none';
    root.appendChild(overlay);
    dom.overlay = overlay;

    // ── Chat window ──
    var win = el('div', 'fq-chat-window fq-no-scrollbar');
    win.id = 'fq-chat-window';
    win.style.display = 'none';
    win.setAttribute('dir', 'rtl');

    // Inner container for height
    var inner = el('div');
    inner.style.cssText = 'display:flex;flex-direction:column;overflow:hidden;height:100%;';
    win.appendChild(inner);
    dom.windowInner = inner;

    root.appendChild(win);
    dom.window = win;

    // ── Modal overlay (initially hidden) ──
    dom.modalOverlay = null;

    if (!document.body) {
      console.error('[Fuqah] FATAL: document.body not available. Cannot inject widget.');
      return;
    }
    document.body.appendChild(root);
    dom.root = root;

    console.log('[Fuqah] DOM built. root=' + !!dom.root + ' bubble=' + !!dom.bubble + ' window=' + !!dom.window + ' overlay=' + !!dom.overlay);

    renderChatScreen();
    updatePositions();
  }

  function updateBubbleSVG(bubble) {
    var outer = settings.widgetOuterColor;
    var inner = settings.widgetInnerColor;
    var isWhite = outer === '#FFFFFF' || outer === '#ffffff';
    bubble.style.boxShadow = isWhite
      ? '0 4px 24px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)'
      : '0 4px 24px ' + outer + '60';
    bubble.innerHTML = '<svg viewBox="0 0 1000 1000" style="width:100%;height:100%"><circle fill="' + esc(outer) + '" cx="500" cy="500" r="475"/><path fill="' + esc(inner) + '" d="' + BUBBLE_PATH + '"/></svg>';
  }

  function updateBubblePosition() {
    if (!dom.bubble) return;
    dom.bubble.style.bottom = (20 + state.bottomOffset) + 'px';
  }

  function updatePositions() {
    var isRight = settings.position === 'bottom-right';
    var pos = isRight ? 'fq-right' : 'fq-left';
    if (dom.bubble) {
      dom.bubble.className = 'fq-bubble ' + pos + (state.isOpen ? '' : ' fq-bubble-enter');
      dom.bubble.style.bottom = (20 + state.bottomOffset) + 'px';
    }
    if (dom.window) {
      var mob = isMobile();
      dom.window.className = 'fq-chat-window fq-no-scrollbar ' + pos + (mob ? ' fq-mobile' : ' fq-desktop');
      if (!mob) {
        dom.window.style.bottom = (90 + state.bottomOffset) + 'px';
        dom.window.style.transformOrigin = isRight ? 'right bottom' : 'left bottom';
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // 13. RENDER SCREENS
  // ═══════════════════════════════════════════════════════════════════
  function clearInner() {
    while (dom.windowInner.firstChild) dom.windowInner.removeChild(dom.windowInner.firstChild);
  }

  function renderChatScreen() {
    clearInner();
    state.currentScreen = 'chat';
    var c = mc();

    dom.window.style.background = c.chatBg;
    dom.window.style.borderColor = c.chatBorder;
    dom.window.style.border = '1px solid ' + c.chatBorder;

    // Header
    var header = buildHeader();
    dom.windowInner.appendChild(header);

    // Messages
    var msgs = el('div', 'fq-messages fq-no-scrollbar');
    msgs.id = 'fq-messages';
    msgs.style.background = c.msgBg;
    msgs.setAttribute('data-chat-scrollable', '');
    msgs.addEventListener('touchmove', function (e) { e.stopPropagation(); }, { passive: true });
    dom.windowInner.appendChild(msgs);
    dom.messages = msgs;

    renderMessages();

    // Input
    var inputArea = buildInput();
    dom.windowInner.appendChild(inputArea);

    // Footer
    dom.windowInner.appendChild(buildFooter());

    scrollToBottom();
  }

  // ── HEADER ──
  function buildHeader() {
    var c = mc();
    var header = el('div', 'fq-header');
    header.style.background = settings.mainColor;

    var info = el('div', 'fq-header-info');
    if (settings.storeIcon) {
      var icon = el('img', 'fq-header-icon');
      icon.src = settings.storeIcon;
      icon.alt = settings.storeName;
      info.appendChild(icon);
    }
    var textDiv = el('div');
    var name = el('h2', 'fq-header-name');
    name.textContent = settings.storeName;
    textDiv.appendChild(name);
    var statusDiv = el('div', 'fq-header-status');
    statusDiv.innerHTML = '<div class="fq-header-dot"></div><span class="fq-header-status-text">وكيل الذكاء الاصطناعي</span>';
    textDiv.appendChild(statusDiv);
    info.appendChild(textDiv);
    header.appendChild(info);

    var actions = el('div', 'fq-header-actions');
    // Download btn
    var dlBtn = el('button', 'fq-header-btn');
    dlBtn.setAttribute('aria-label', 'تحميل المحادثة');
    dlBtn.appendChild(svg('<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>', 18, 18));
    dlBtn.onclick = function () { downloadAsImage('chat'); };
    actions.appendChild(dlBtn);
    // Close btn
    var closeBtn = el('button', 'fq-header-btn');
    closeBtn.setAttribute('aria-label', 'إغلاق');
    closeBtn.appendChild(svg('<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>', 18, 18));
    closeBtn.onclick = function () { handleCloseClick(); };
    actions.appendChild(closeBtn);
    header.appendChild(actions);

    return header;
  }

  // ── MESSAGES RENDERING ──
  function renderMessages() {
    if (!dom.messages) return;
    dom.messages.innerHTML = '';
    if (state.messages.length === 0) {
      dom.messages.appendChild(buildEmptyState());
    } else {
      state.messages.forEach(function (m) {
        dom.messages.appendChild(buildMessage(m));
      });
    }
    if (state.isTyping) dom.messages.appendChild(buildTyping());
    // Scroll anchor
    var anchor = el('div');
    anchor.style.cssText = 'height:1px;flex-shrink:0;';
    dom.messages.appendChild(anchor);
    scrollToBottom();
  }

  function buildEmptyState() {
    var c = mc();
    var wrap = el('div', 'fq-empty');
    if (settings.storeLogo) {
      var img = el('img', 'fq-empty-logo');
      img.src = settings.storeLogo;
      img.alt = 'Store Logo';
      if (isDark()) img.style.filter = 'brightness(0.95)';
      wrap.appendChild(img);
    }
    var t = el('h3', 'fq-empty-title');
    t.textContent = 'مرحباً، كيف أستطيع أن أساعدك؟';
    t.style.color = c.primaryText;
    wrap.appendChild(t);
    var s = el('p', 'fq-empty-subtitle');
    s.textContent = 'نحن هنا للإجابة على جميع استفساراتك';
    s.style.color = c.secondaryText;
    wrap.appendChild(s);
    return wrap;
  }

  function buildMessage(m) {
    var c = mc();
    var isStore = m.sender === 'store';

    // Ticket success
    if (m.type === 'ticket-success') {
      var row = el('div', 'fq-msg-row fq-store');
      if (settings.storeIcon) { var av = el('img', 'fq-msg-avatar'); av.src = settings.storeIcon; av.alt = 'Store'; row.appendChild(av); }
      var content = el('div', 'fq-msg-content');
      var badge = el('div', 'fq-ticket-success');
      badge.style.background = isDark() ? '#052e16' : '#f0fdf4';
      badge.style.border = '1px solid ' + (isDark() ? '#166534' : '#bbf7d0');
      badge.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" style="flex-shrink:0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
      var span = el('span');
      span.textContent = m.text || 'تم إرسال طلبك بنجاح';
      badge.appendChild(span);
      content.appendChild(badge);
      content.appendChild(buildFeedback(m.id));
      row.appendChild(content);
      return row;
    }

    // Ticket form
    if (m.type === 'ticket-form') {
      var row = el('div', 'fq-msg-row fq-store');
      if (settings.storeIcon) { var av = el('img', 'fq-msg-avatar'); av.src = settings.storeIcon; av.alt = 'Store'; row.appendChild(av); }
      var content = el('div', 'fq-msg-content');
      content.style.maxWidth = '85%';
      var bubble = el('div', 'fq-msg-bubble');
      bubble.style.background = settings.mainColor;
      bubble.style.color = '#FFFFFF';
      var p = el('p', 'fq-msg-text');
      p.appendChild(textWithLinks(m.text));
      bubble.appendChild(p);
      content.appendChild(bubble);

      if (m.ticketFormSubmitted) {
        var successBadge = el('div', 'fq-ticket-success');
        successBadge.style.background = isDark() ? '#052e16' : '#f0fdf4';
        successBadge.style.border = '1px solid ' + (isDark() ? '#166534' : '#bbf7d0');
        successBadge.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2" style="flex-shrink:0"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>تم إرسال طلبك بنجاح</span>';
        content.appendChild(successBadge);
      } else {
        content.appendChild(buildInlineTicketForm(m));
      }
      content.appendChild(buildFeedback(m.id));
      row.appendChild(content);
      return row;
    }

    // Regular message
    var row = el('div', 'fq-msg-row ' + (isStore ? 'fq-store' : 'fq-customer'));
    if (isStore && settings.storeIcon) {
      var av = el('img', 'fq-msg-avatar'); av.src = settings.storeIcon; av.alt = 'Store'; row.appendChild(av);
    }
    var content = el('div', 'fq-msg-content');
    var bubble = el('div', 'fq-msg-bubble');
    bubble.style.background = isStore ? settings.mainColor : c.userBubbleBg;
    bubble.style.color = isStore ? '#FFFFFF' : c.userBubbleText;

    if (m.attachment) {
      if (m.attachment.type === 'image') {
        var imgWrap = el('div', 'fq-msg-attachment');
        var img = el('img');
        img.src = m.attachment.url;
        img.alt = m.attachment.name;
        imgWrap.appendChild(img);
        bubble.appendChild(imgWrap);
      } else {
        var fileDiv = el('div', 'fq-msg-file');
        fileDiv.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
        var fi = el('div');
        fi.style.cssText = 'flex:1;min-width:0;';
        fi.innerHTML = '<div class="fq-msg-file-name">' + esc(m.attachment.name) + '</div>' + (m.attachment.size ? '<div class="fq-msg-file-size">' + (m.attachment.size / 1024).toFixed(1) + ' KB</div>' : '');
        fileDiv.appendChild(fi);
        var dlA = el('a', 'fq-msg-file-dl');
        dlA.href = m.attachment.url;
        dlA.download = m.attachment.name;
        dlA.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>';
        fileDiv.appendChild(dlA);
        bubble.appendChild(fileDiv);
      }
    }
    if (m.text) {
      var p = el('p', 'fq-msg-text');
      p.appendChild(textWithLinks(m.text));
      bubble.appendChild(p);
    }
    content.appendChild(bubble);
    if (isStore) content.appendChild(buildFeedback(m.id));
    row.appendChild(content);
    return row;
  }

  function buildFeedback(msgId) {
    var c = mc();
    var wrap = el('div', 'fq-feedback');
    var feedbackState = { value: null };

    var downBtn = el('button', 'fq-feedback-btn');
    downBtn.setAttribute('aria-label', 'تقييم سلبي');
    downBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22h0a3.13 3.13 0 0 1-3-3.88Z"/></svg>';
    if (isDark()) downBtn.onmouseover = function () { this.style.background = '#334155'; };
    else downBtn.onmouseover = function () { this.style.background = '#f3f4f6'; };
    downBtn.onmouseout = function () { this.style.background = 'transparent'; };
    downBtn.onclick = function () {
      feedbackState.value = feedbackState.value === 'down' ? null : 'down';
      updateFeedbackUI();
    };

    var upBtn = el('button', 'fq-feedback-btn');
    upBtn.setAttribute('aria-label', 'تقييم إيجابي');
    upBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="#d1d5db"><path d="M7 10V22"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z"/></svg>';
    if (isDark()) upBtn.onmouseover = function () { this.style.background = '#334155'; };
    else upBtn.onmouseover = function () { this.style.background = '#f3f4f6'; };
    upBtn.onmouseout = function () { this.style.background = 'transparent'; };
    upBtn.onclick = function () {
      feedbackState.value = feedbackState.value === 'up' ? null : 'up';
      updateFeedbackUI();
    };

    function updateFeedbackUI() {
      var dSvg = downBtn.querySelector('svg');
      var uSvg = upBtn.querySelector('svg');
      dSvg.setAttribute('stroke', feedbackState.value === 'down' ? '#ef4444' : '#d1d5db');
      dSvg.setAttribute('fill', feedbackState.value === 'down' ? '#ef4444' : 'none');
      uSvg.setAttribute('stroke', feedbackState.value === 'up' ? settings.mainColor : '#d1d5db');
      uSvg.setAttribute('fill', feedbackState.value === 'up' ? settings.mainColor : 'none');
    }

    wrap.appendChild(downBtn);
    wrap.appendChild(upBtn);
    return wrap;
  }

  function buildTyping() {
    var row = el('div', 'fq-typing-row');
    if (settings.storeIcon) {
      var av = el('img', 'fq-msg-avatar'); av.src = settings.storeIcon; av.alt = 'Store'; row.appendChild(av);
    }
    var bubble = el('div', 'fq-typing-bubble');
    bubble.style.background = settings.mainColor;
    bubble.innerHTML = '<div class="fq-typing-dot"></div><div class="fq-typing-dot"></div><div class="fq-typing-dot"></div>';
    row.appendChild(bubble);
    return row;
  }

  // ── INLINE TICKET FORM ──
  function buildInlineTicketForm(msg) {
    var c = mc();
    var selectedCountry = COUNTRIES[0];
    var wrap = el('div', 'fq-inline-ticket');
    wrap.style.background = isDark() ? '#0f172a' : '#f8fafc';
    wrap.style.border = '1px solid ' + (isDark() ? '#334155' : '#e2e8f0');

    var phoneRow = el('div', 'fq-phone-row');
    phoneRow.style.border = '1.5px solid ' + (isDark() ? '#475569' : '#d1d5db');
    phoneRow.style.background = isDark() ? '#1e293b' : '#fff';

    // Country selector
    var countryWrap = el('div');
    countryWrap.style.cssText = 'position:relative;flex-shrink:0;';
    var countryBtn = el('button', 'fq-country-btn');
    countryBtn.style.borderRight = '1.5px solid ' + (isDark() ? '#334155' : '#e5e7eb');
    countryBtn.style.minWidth = '76px';
    var flagEl = flagSVG(selectedCountry.code, 18);
    countryBtn.appendChild(flagEl);
    var codeSpan = el('span', 'fq-country-code');
    codeSpan.textContent = selectedCountry.code;
    codeSpan.style.color = isDark() ? '#cbd5e1' : '#374151';
    codeSpan.style.fontSize = '12px';
    countryBtn.appendChild(codeSpan);
    var chevron = el('span', 'fq-country-chevron');
    chevron.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    countryBtn.appendChild(chevron);
    countryWrap.appendChild(countryBtn);
    phoneRow.appendChild(countryWrap);

    // Phone input
    var phoneInput = el('input', 'fq-phone-input');
    phoneInput.type = 'tel';
    phoneInput.inputMode = 'numeric';
    phoneInput.placeholder = selectedCountry.placeholder;
    phoneInput.style.color = isDark() ? '#f1f5f9' : '#1f2937';
    phoneInput.style.caretColor = settings.mainColor;
    phoneInput.style.padding = '10px';
    phoneInput.style.fontSize = '16px';
    phoneRow.appendChild(phoneInput);
    wrap.appendChild(phoneRow);

    // Error
    var errorEl = el('p', 'fq-phone-error');
    errorEl.style.display = 'none';
    wrap.appendChild(errorEl);

    // Submit
    var submitBtn = el('button', 'fq-inline-submit');
    submitBtn.style.background = settings.mainColor;
    submitBtn.style.color = '#FFFFFF';
    submitBtn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> إرسال التذكرة';

    // Dropdown
    var dropdown = null;

    countryBtn.onclick = function () {
      if (dropdown) { dropdown.remove(); dropdown = null; chevron.classList.remove('fq-open'); return; }
      chevron.classList.add('fq-open');
      dropdown = el('div', 'fq-country-dropdown');
      dropdown.style.background = isDark() ? '#1e293b' : '#FFFFFF';
      dropdown.style.border = '1px solid ' + (isDark() ? '#334155' : '#e5e7eb');
      dropdown.style.width = '200px';
      COUNTRIES.forEach(function (ctry) {
        var item = el('button', 'fq-country-item');
        if (selectedCountry.code === ctry.code) item.style.background = settings.mainColor + '0d';
        item.appendChild(flagSVG(ctry.code, 17));
        var n = el('span', 'fq-country-item-name');
        n.textContent = ctry.code;
        n.style.color = isDark() ? '#cbd5e1' : '#374151';
        item.appendChild(n);
        var d = el('span', 'fq-country-item-dial');
        d.textContent = ctry.dialCode;
        d.style.color = isDark() ? '#64748b' : '#9ca3af';
        item.appendChild(d);
        item.onmouseover = function () { if (selectedCountry.code !== ctry.code) this.style.background = isDark() ? '#334155' : '#f9fafb'; };
        item.onmouseout = function () { this.style.background = selectedCountry.code === ctry.code ? settings.mainColor + '0d' : 'transparent'; };
        item.onclick = function () {
          selectedCountry = ctry;
          flagEl.replaceWith(flagSVG(ctry.code, 18));
          flagEl = countryBtn.querySelector('.fq-flag');
          codeSpan.textContent = ctry.code;
          phoneInput.value = '';
          phoneInput.placeholder = ctry.placeholder;
          dropdown.remove();
          dropdown = null;
          chevron.classList.remove('fq-open');
          phoneInput.focus();
        };
        dropdown.appendChild(item);
      });
      countryWrap.appendChild(dropdown);
    };

    phoneInput.oninput = function () {
      phoneInput.value = phoneInput.value.replace(/[^\d\s]/g, '');
      errorEl.style.display = 'none';
    };
    phoneInput.onkeydown = function (e) { if (e.key === 'Enter') doSubmit(); };

    function doSubmit() {
      var cleaned = phoneInput.value.replace(/\D/g, '');
      var result = validatePhone(selectedCountry.code, cleaned);
      if (!result.valid) { errorEl.textContent = result.error; errorEl.style.display = 'block'; phoneInput.focus(); return; }
      errorEl.style.display = 'none';
      handleInlineTicketSubmit(cleaned, selectedCountry.dialCode, msg);
    }

    submitBtn.onclick = doSubmit;
    wrap.appendChild(submitBtn);

    // Close dropdown on outside click
    document.addEventListener('mousedown', function handler(e) {
      if (dropdown && !countryWrap.contains(e.target)) {
        dropdown.remove(); dropdown = null; chevron.classList.remove('fq-open');
      }
    });

    return wrap;
  }

  // ── INPUT AREA ──
  function buildInput() {
    var c = mc();
    var area = el('div', 'fq-input-area');
    area.style.borderTop = '1px solid ' + c.inputBorder;
    area.style.background = c.inputBg;

    // Attachment preview (hidden)
    var attachPreview = el('div', 'fq-attach-preview');
    attachPreview.style.display = 'none';
    attachPreview.style.background = isDark() ? '#0f172a' : '#f9fafb';
    attachPreview.style.border = '1px solid ' + c.inputBorder;
    area.appendChild(attachPreview);
    dom.attachPreview = attachPreview;

    // Input row
    var row = el('div', 'fq-input-row');
    row.style.background = c.inputRowBg;
    row.style.border = '1px solid ' + c.inputBorder;

    // File input (hidden)
    var fileInput = el('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*,.pdf,.doc,.docx,.txt';
    fileInput.style.display = 'none';
    fileInput.onchange = function (e) {
      var file = e.target.files[0];
      if (!file) return;
      var url = URL.createObjectURL(file);
      var type = file.type.indexOf('image') === 0 ? 'image' : 'file';
      state.attachment = { type: type, url: url, name: file.name, size: file.size };
      renderAttachPreview();
      updateSendState();
    };
    area.appendChild(fileInput);
    dom.fileInput = fileInput;

    // Attach btn
    var attachBtn = el('button', 'fq-attach-btn');
    attachBtn.setAttribute('aria-label', 'إرفاق ملف');
    attachBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>';
    attachBtn.onclick = function () { fileInput.click(); };
    row.appendChild(attachBtn);
    dom.attachBtn = attachBtn;

    // Textarea
    var textarea = el('textarea', 'fq-msg-textarea fq-no-scrollbar');
    textarea.placeholder = 'اكتب رسالتك...';
    textarea.rows = 1;
    textarea.setAttribute('dir', 'rtl');
    textarea.style.color = c.inputText;
    textarea.style.caretColor = settings.mainColor;
    textarea.oninput = function () {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
      updateSendState();
    };
    // Desktop: Enter = send, Shift+Enter = newline. Mobile: Enter = newline.
    textarea.onkeydown = function (e) {
      if (e.key === 'Enter') {
        var touch = 'ontouchstart' in window && window.innerWidth < 1024;
        if (touch) return;
        if (!e.shiftKey) { e.preventDefault(); doSend(); }
      }
    };
    row.appendChild(textarea);
    dom.textarea = textarea;

    // Send btn
    var sendBtn = el('button', 'fq-send-btn');
    sendBtn.setAttribute('aria-label', 'إرسال');
    sendBtn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
    sendBtn.disabled = true;
    sendBtn.onclick = function () { doSend(); };
    row.appendChild(sendBtn);
    dom.sendBtn = sendBtn;

    area.appendChild(row);
    updateSendState();
    return area;
  }

  function updateSendState() {
    if (!dom.sendBtn || !dom.textarea) return;
    var can = (dom.textarea.value.trim() || state.attachment) && !state.isTyping;
    dom.sendBtn.disabled = !can;
    dom.sendBtn.style.background = can ? settings.mainColor : settings.mainColor + '30';
    dom.sendBtn.style.boxShadow = can ? '0 2px 8px ' + settings.mainColor + '40' : 'none';
    dom.sendBtn.style.opacity = can ? '1' : '0.6';
  }

  function renderAttachPreview() {
    if (!dom.attachPreview || !state.attachment) return;
    dom.attachPreview.innerHTML = '';
    dom.attachPreview.style.display = 'flex';
    var att = state.attachment;
    if (att.type === 'image') {
      var img = el('img'); img.src = att.url; img.alt = att.name;
      img.style.cssText = 'width:40px;height:40px;border-radius:8px;object-fit:cover;flex-shrink:0;';
      dom.attachPreview.appendChild(img);
    } else {
      var fIcon = el('span');
      fIcon.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2" style="flex-shrink:0"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>';
      dom.attachPreview.appendChild(fIcon.firstChild);
    }
    var info = el('div');
    info.style.cssText = 'flex:1;min-width:0;';
    info.innerHTML = '<div class="fq-attach-preview-name">' + esc(att.name) + '</div>' + (att.size ? '<div class="fq-attach-preview-size">' + (att.size / 1024).toFixed(1) + ' KB</div>' : '');
    dom.attachPreview.appendChild(info);
    var rmBtn = el('button', 'fq-attach-remove');
    rmBtn.setAttribute('aria-label', 'إزالة المرفق');
    rmBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    rmBtn.onclick = function () { state.attachment = null; dom.attachPreview.style.display = 'none'; dom.fileInput.value = ''; updateSendState(); };
    dom.attachPreview.appendChild(rmBtn);
  }

  function buildFooter() {
    var c = mc();
    var footer = el('div', 'fq-footer');
    footer.style.background = c.footerBg;
    footer.style.borderTop = '1px solid ' + c.footerBorder;
    footer.innerHTML = FUQAH_SVG;
    var a = el('a', 'fq-footer-link');
    a.href = 'https://www.fuqah.ai';
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.style.color = c.footerText;
    a.innerHTML = 'مدعوم من <strong style="color:' + c.footerBrand + '">فقاعة AI</strong>';
    a.onmouseover = function () { this.style.color = isDark() ? '#cbd5e1' : '#6b7280'; };
    a.onmouseout = function () { this.style.color = c.footerText; };
    footer.appendChild(a);
    return footer;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 14. SEND MESSAGE
  // ═══════════════════════════════════════════════════════════════════
  function doSend() {
    var text = dom.textarea.value.trim();
    var att = state.attachment;
    if (!text && !att) return;

    var msg = { id: '' + Date.now(), text: text, sender: 'customer', attachment: att, timestamp: new Date() };
    state.messages.push(msg);
    state.attachment = null;
    dom.textarea.value = '';
    dom.textarea.style.height = 'auto';
    if (dom.attachPreview) dom.attachPreview.style.display = 'none';
    if (dom.fileInput) dom.fileInput.value = '';

    renderMessages();

    // Test trigger: typing "A" shows inline ticket form
    if (text === 'A') {
      state.isTyping = true;
      renderMessages();
      setInputDisabled(true);
      setTimeout(function () {
        state.isTyping = false;
        if (state.ticketCreated) {
          state.messages.push({ id: '' + (Date.now() + 1), text: 'تم إنشاء تذكرة مسبقاً لهذه المحادثة.', sender: 'store', timestamp: new Date(), type: 'ticket-success' });
        } else {
          state.messages.push({
            id: '' + (Date.now() + 1),
            text: 'للمتابعة، يرجى إدخال رقم هاتفك حتى نتمكن من إنشاء تذكرة دعم لك:',
            sender: 'store', timestamp: new Date(), type: 'ticket-form', ticketFormSubmitted: false,
          });
          state.ticketSource = 'inline';
        }
        setInputDisabled(false);
        renderMessages();
      }, 900);
      return;
    }

    // Simulate AI response
    state.isTyping = true;
    renderMessages();
    setInputDisabled(true);
    setTimeout(function () {
      state.isTyping = false;
      var response = {
        id: '' + (Date.now() + 1),
        text: att ? 'شكراً لإرسال الملف! سنقوم بمراجعته والرد عليك قريباً.' : 'شكراً لتواصلك معنا! كيف يمكنني مساعدتك اليوم؟',
        sender: 'store', timestamp: new Date(),
      };
      state.messages.push(response);
      setInputDisabled(false);
      renderMessages();
    }, 1500);
  }

  function setInputDisabled(disabled) {
    if (dom.textarea) { dom.textarea.disabled = disabled; dom.textarea.placeholder = disabled ? 'جاري الكتابة...' : 'اكتب رسالتك...'; }
    if (dom.attachBtn) dom.attachBtn.disabled = disabled;
    updateSendState();
  }

  function handleInlineTicketSubmit(phone, dialCode, msg) {
    if (state.ticketCreated) {
      state.messages.push({ id: 'dup-' + Date.now(), text: 'تم إنشاء تذكرة مسبقاً لهذه المحادثة.', sender: 'store', timestamp: new Date(), type: 'ticket-success' });
      state.messages.forEach(function (m) { if (m.type === 'ticket-form' && !m.ticketFormSubmitted) m.ticketFormSubmitted = true; });
      renderMessages();
      return;
    }
    state.ticketCreated = true;
    state.messages.forEach(function (m) { if (m.type === 'ticket-form' && !m.ticketFormSubmitted) m.ticketFormSubmitted = true; });
    renderMessages();
    setTimeout(function () { renderTicketCreatedScreen(); }, 400);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 15. CLOSE FLOW
  // ═══════════════════════════════════════════════════════════════════
  function handleCloseClick() {
    if (state.messages.length === 0) { closeChat(); return; }
    showConfirmModal();
  }

  function showConfirmModal() {
    if (dom.modalOverlay) dom.modalOverlay.remove();
    var c = mc();
    var accentColor = settings.mainColor;

    var overlay = el('div', 'fq-modal-overlay');
    overlay.onclick = function (e) { if (e.target === overlay) { overlay.remove(); dom.modalOverlay = null; } };

    var card = el('div', 'fq-modal-card');
    card.style.background = isDark() ? '#1e293b' : '#FFFFFF';

    var accent = el('div', 'fq-modal-accent');
    accent.style.background = accentColor;
    card.appendChild(accent);

    var body = el('div', 'fq-modal-body');

    // Close X
    var closeRow = el('div', 'fq-modal-close-row');
    var closeBtn = el('button', 'fq-modal-close-btn');
    closeBtn.style.color = isDark() ? '#64748b' : '#9ca3af';
    closeBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
    closeBtn.onclick = function () { overlay.remove(); dom.modalOverlay = null; };
    closeRow.appendChild(closeBtn);
    body.appendChild(closeRow);

    // Center content
    var center = el('div', 'fq-modal-center');
    var iconWrap = el('div', 'fq-modal-icon-wrap');
    iconWrap.style.background = accentColor + (isDark() ? '20' : '10');
    iconWrap.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="' + accentColor + '" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg>';
    center.appendChild(iconWrap);
    var title = el('h3', 'fq-modal-title');
    title.textContent = 'إغلاق المحادثة';
    title.style.color = isDark() ? '#f1f5f9' : '#1f2937';
    center.appendChild(title);
    var desc = el('p', 'fq-modal-desc');
    desc.textContent = 'يمكنك رفع تذكرة، إغلاق المحادثة، أو العودة لاحقاً';
    desc.style.color = isDark() ? '#94a3b8' : '#9ca3af';
    center.appendChild(desc);
    body.appendChild(center);

    // Actions
    var actions = el('div', 'fq-modal-actions');

    // Close chat
    var closeChat_ = el('button', 'fq-modal-btn');
    closeChat_.style.background = accentColor;
    closeChat_.style.color = '#FFFFFF';
    closeChat_.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><line x1="9" y1="10" x2="15" y2="10"/></svg> إغلاق المحادثة';
    closeChat_.onclick = function () { overlay.remove(); dom.modalOverlay = null; renderRatingScreen(); };
    actions.appendChild(closeChat_);

    // Return to chat
    var returnBtn = el('button', 'fq-modal-btn fq-modal-btn-secondary');
    returnBtn.style.background = isDark() ? '#0f172a' : '#f9fafb';
    returnBtn.style.borderColor = isDark() ? '#334155' : '#e5e7eb';
    returnBtn.style.color = isDark() ? '#cbd5e1' : '#4b5563';
    returnBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg> سأعود للمحادثة';
    returnBtn.onclick = function () { overlay.remove(); dom.modalOverlay = null; closeChat(); };
    actions.appendChild(returnBtn);

    // Create ticket
    var ticketBtn = el('button', 'fq-modal-btn fq-modal-btn-tertiary');
    ticketBtn.style.borderColor = isDark() ? '#334155' : '#e5e7eb';
    ticketBtn.style.color = isDark() ? '#94a3b8' : '#6b7280';
    ticketBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg> رفع تذكرة';
    ticketBtn.onclick = function () { overlay.remove(); dom.modalOverlay = null; state.ticketSource = 'form'; renderCreateTicketScreen(); };
    actions.appendChild(ticketBtn);

    body.appendChild(actions);
    card.appendChild(body);
    overlay.appendChild(card);
    document.body.appendChild(overlay);
    dom.modalOverlay = overlay;
  }

  // ═══════════════════════════════════════════════════════════════════
  // 16. RATING SCREEN
  // ═══════════════════════════════════════════════════════════════════
  function renderRatingScreen() {
    clearInner();
    state.currentScreen = 'rating';
    state.rating = 0;
    state.feedback = '';
    var c = mc();
    var accentColor = settings.mainColor;
    var pageBg = isDark() ? '#1e293b' : '#FFFFFF';
    dom.window.style.background = pageBg;

    var screen = el('div', 'fq-screen');

    // Accent
    var accent = el('div', 'fq-screen-accent');
    accent.style.background = accentColor;
    screen.appendChild(accent);

    // Header
    var header = el('div', 'fq-screen-header');
    header.style.borderBottom = '1px solid ' + (isDark() ? '#334155' : '#f3f4f6');
    var backBtn = el('button', 'fq-screen-back');
    backBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#94a3b8' : '#6b7280') + '" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    backBtn.onclick = function () { renderChatScreen(); };
    header.appendChild(backBtn);
    var title = el('h3', 'fq-screen-title');
    title.textContent = 'تقييم التجربة';
    title.style.color = isDark() ? '#f1f5f9' : '#1f2937';
    header.appendChild(title);
    screen.appendChild(header);

    // Body
    var body = el('div', 'fq-screen-body fq-no-scrollbar');
    body.setAttribute('data-chat-scrollable', '');
    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:20px 24px 16px;';

    var emoji = el('div');
    emoji.style.cssText = 'font-size:40px;line-height:1;margin-bottom:12px;';
    emoji.textContent = '⭐';
    body.appendChild(emoji);

    var t = el('h3');
    t.textContent = 'قيّم تجربتك';
    t.style.cssText = 'font-size:18px;font-weight:700;color:' + c.primaryText + ';margin-bottom:6px;';
    body.appendChild(t);

    var d = el('p');
    d.textContent = 'كيف كانت تجربتك مع ' + settings.storeName + '؟';
    d.style.cssText = 'font-size:13px;line-height:1.6;color:' + c.secondaryText + ';margin-bottom:16px;';
    body.appendChild(d);

    // Stars
    var starsDiv = el('div', 'fq-stars');
    var labels = { 1: 'سيئة جداً', 2: 'سيئة', 3: 'مقبولة', 4: 'جيدة', 5: 'ممتازة' };
    var labelEl = el('p');
    labelEl.style.cssText = 'font-size:13px;font-weight:600;color:' + accentColor + ';min-height:20px;opacity:0;margin-bottom:16px;';

    for (var i = 1; i <= 5; i++) {
      (function (star) {
        var btn = el('button', 'fq-star');
        btn.innerHTML = '<svg viewBox="0 0 24 24" fill="' + (isDark() ? '#4b5563' : '#e5e7eb') + '" stroke="' + (isDark() ? '#4b5563' : '#e5e7eb') + '" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
        btn.onclick = function () {
          state.rating = star;
          updateStarsUI();
          labelEl.textContent = labels[star] || '';
          labelEl.style.opacity = '1';
          submitBtn.disabled = false;
        };
        starsDiv.appendChild(btn);
      })(i);
    }
    body.appendChild(starsDiv);
    body.appendChild(labelEl);

    function updateStarsUI() {
      var stars = starsDiv.querySelectorAll('.fq-star svg');
      for (var j = 0; j < stars.length; j++) {
        var active = j < state.rating;
        stars[j].setAttribute('fill', active ? '#facc15' : (isDark() ? '#4b5563' : '#e5e7eb'));
        stars[j].setAttribute('stroke', active ? '#facc15' : (isDark() ? '#4b5563' : '#e5e7eb'));
      }
    }

    // Feedback
    var textareaWrap = el('div');
    textareaWrap.style.cssText = 'width:100%;margin-bottom:16px;';
    var ta = el('textarea');
    ta.placeholder = 'أخبرنا برأيك... (اختياري)';
    ta.rows = 3;
    ta.setAttribute('dir', 'rtl');
    ta.style.cssText = 'width:100%;padding:14px;border-radius:12px;resize:none;font-size:14px;border:1.5px solid ' + (isDark() ? '#334155' : '#e5e7eb') + ';outline:none;background:' + (isDark() ? '#0f172a' : '#f9fafb') + ';color:' + c.primaryText + ';font-family:inherit;line-height:1.55;';
    ta.onfocus = function () { this.style.borderColor = accentColor; };
    ta.onblur = function () { this.style.borderColor = isDark() ? '#334155' : '#e5e7eb'; };
    ta.oninput = function () { state.feedback = this.value; };
    textareaWrap.appendChild(ta);
    body.appendChild(textareaWrap);

    screen.appendChild(body);

    // Actions
    var actionsDiv = el('div', 'fq-screen-actions');
    actionsDiv.style.borderTop = '1px solid ' + (isDark() ? '#334155' : '#f3f4f6');
    actionsDiv.style.background = pageBg;

    var submitBtn = el('button', 'fq-screen-btn');
    submitBtn.textContent = 'إرسال التقييم';
    submitBtn.disabled = true;
    submitBtn.style.background = accentColor;
    submitBtn.style.color = '#FFFFFF';
    submitBtn.onclick = function () {
      if (state.rating === 0) return;
      // Show thank you
      clearInner();
      var ty = el('div', 'fq-thankyou');
      ty.style.background = pageBg;
      ty.innerHTML = '<div class="fq-thankyou-emoji">✨</div><h3 style="font-size:20px;font-weight:700;color:' + c.primaryText + ';margin-bottom:8px">شكراً لك!</h3><p style="font-size:14px;line-height:1.6;color:' + c.secondaryText + '">نقدّر وقتك ونسعى دائماً<br>لتقديم خدمة أفضل</p>';
      dom.windowInner.appendChild(ty);
      dom.windowInner.appendChild(buildFooter());
      setTimeout(function () { fullClose(); }, 1600);
    };
    actionsDiv.appendChild(submitBtn);

    var skipBtn = el('button', 'fq-screen-btn-secondary');
    skipBtn.textContent = 'تخطي وإغلاق';
    skipBtn.style.color = isDark() ? '#94a3b8' : '#9ca3af';
    skipBtn.onclick = function () { fullClose(); };
    actionsDiv.appendChild(skipBtn);

    screen.appendChild(actionsDiv);

    // Footer
    screen.appendChild(buildFooter());
    dom.windowInner.appendChild(screen);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 17. CREATE TICKET SCREEN
  // ═══════════════════════════════════════════════════════════════════
  function renderCreateTicketScreen() {
    clearInner();
    state.currentScreen = 'ticket-form';
    var c = mc();
    var accentColor = settings.mainColor;
    var pageBg = isDark() ? '#1e293b' : '#FFFFFF';
    dom.window.style.background = pageBg;

    var screen = el('div', 'fq-screen');
    var accent = el('div', 'fq-screen-accent');
    accent.style.background = accentColor;
    screen.appendChild(accent);

    // Header
    var header = el('div', 'fq-screen-header');
    header.style.borderBottom = '1px solid ' + (isDark() ? '#334155' : '#f3f4f6');
    var backBtn = el('button', 'fq-screen-back');
    backBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#94a3b8' : '#6b7280') + '" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    backBtn.onclick = function () { renderChatScreen(); };
    header.appendChild(backBtn);
    var title = el('h3', 'fq-screen-title');
    title.textContent = 'رفع تذكرة دعم';
    title.style.color = c.primaryText;
    header.appendChild(title);
    screen.appendChild(header);

    // Body
    var body = el('div', 'fq-screen-body fq-no-scrollbar');
    body.setAttribute('data-chat-scrollable', '');
    body.style.cssText = 'display:flex;flex-direction:column;padding:20px;';

    // Icon
    var iconWrap = el('div');
    iconWrap.style.cssText = 'display:flex;justify-content:center;margin-bottom:16px;';
    var iconBox = el('div');
    iconBox.style.cssText = 'width:56px;height:56px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:' + accentColor + (isDark() ? '20' : '12');
    iconBox.innerHTML = '<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="' + accentColor + '" stroke-width="1.8"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>';
    iconWrap.appendChild(iconBox);
    body.appendChild(iconWrap);

    var desc = el('p');
    desc.style.cssText = 'text-align:center;font-size:13px;color:' + c.secondaryText + ';line-height:1.7;margin-bottom:24px;';
    desc.textContent = 'أدخل رقم هاتفك وسيتواصل معك فريق ' + settings.storeName;
    body.appendChild(desc);

    if (state.ticketCreated) {
      // Already created
      var box = el('div');
      box.style.cssText = 'width:100%;border-radius:16px;padding:20px;text-align:center;background:' + (isDark() ? '#052e16' : '#f0fdf4') + ';border:1.5px solid ' + (isDark() ? '#166534' : '#bbf7d0');
      var p = el('p');
      p.style.cssText = 'font-size:14px;color:#16a34a;font-weight:600;line-height:1.7;';
      p.textContent = 'تم إنشاء تذكرة مسبقاً لهذه المحادثة.';
      box.appendChild(p);
      body.appendChild(box);

      body.appendChild(el('div')).style.cssText = 'flex:1;min-height:24px;';

      var okBtn = el('button', 'fq-screen-btn');
      okBtn.textContent = 'حسناً، شكراً';
      okBtn.style.cssText = 'background:' + accentColor + ';color:#FFF;margin-bottom:10px;width:100%;padding:14px;border-radius:12px;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:inherit;';
      okBtn.onclick = function () { renderChatScreen(); };
      body.appendChild(okBtn);
    } else {
      // Phone label
      var label = el('p');
      label.textContent = 'رقم الهاتف';
      label.style.cssText = 'font-size:13px;font-weight:600;color:' + (isDark() ? '#cbd5e1' : '#374151') + ';margin-bottom:8px;';
      body.appendChild(label);

      var selectedCountry = COUNTRIES[0];
      var phoneRow = el('div', 'fq-phone-row');
      phoneRow.style.border = '1.5px solid ' + (isDark() ? '#475569' : '#d1d5db');
      phoneRow.style.background = isDark() ? '#0f172a' : '#f9fafb';

      var countryWrap = el('div');
      countryWrap.style.cssText = 'position:relative;flex-shrink:0;';
      var countryBtn = el('button', 'fq-country-btn');
      countryBtn.style.borderRight = '1.5px solid ' + (isDark() ? '#334155' : '#e5e7eb');
      countryBtn.style.minWidth = '88px';
      var flagEl = flagSVG(selectedCountry.code, 22);
      countryBtn.appendChild(flagEl);
      var codeSpan = el('span', 'fq-country-code');
      codeSpan.textContent = selectedCountry.code;
      codeSpan.style.color = isDark() ? '#cbd5e1' : '#374151';
      countryBtn.appendChild(codeSpan);
      var chevron = el('span', 'fq-country-chevron');
      chevron.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
      countryBtn.appendChild(chevron);
      countryWrap.appendChild(countryBtn);
      phoneRow.appendChild(countryWrap);

      var phoneInput = el('input', 'fq-phone-input');
      phoneInput.type = 'tel';
      phoneInput.inputMode = 'numeric';
      phoneInput.placeholder = selectedCountry.placeholder;
      phoneInput.style.color = isDark() ? '#f1f5f9' : '#1f2937';
      phoneInput.style.caretColor = accentColor;
      phoneRow.appendChild(phoneInput);
      body.appendChild(phoneRow);

      var errorEl = el('p', 'fq-phone-error');
      errorEl.style.display = 'none';
      body.appendChild(errorEl);

      var dropdown = null;
      countryBtn.onclick = function () {
        if (dropdown) { dropdown.remove(); dropdown = null; chevron.classList.remove('fq-open'); return; }
        chevron.classList.add('fq-open');
        dropdown = el('div', 'fq-country-dropdown');
        dropdown.style.background = isDark() ? '#1e293b' : '#FFFFFF';
        dropdown.style.border = '1px solid ' + (isDark() ? '#334155' : '#e5e7eb');
        COUNTRIES.forEach(function (ctry) {
          var item = el('button', 'fq-country-item');
          if (selectedCountry.code === ctry.code) item.style.background = accentColor + '0d';
          item.appendChild(flagSVG(ctry.code, 20));
          var n = el('span', 'fq-country-item-name');
          n.textContent = ctry.code;
          n.style.color = isDark() ? '#cbd5e1' : '#374151';
          item.appendChild(n);
          var d = el('span', 'fq-country-item-dial');
          d.textContent = ctry.dialCode;
          d.style.color = isDark() ? '#64748b' : '#9ca3af';
          item.appendChild(d);
          item.onclick = function () {
            selectedCountry = ctry;
            var newFlag = flagSVG(ctry.code, 22);
            flagEl.replaceWith(newFlag);
            flagEl = newFlag;
            codeSpan.textContent = ctry.code;
            phoneInput.value = '';
            phoneInput.placeholder = ctry.placeholder;
            dropdown.remove(); dropdown = null; chevron.classList.remove('fq-open');
            phoneInput.focus();
          };
          dropdown.appendChild(item);
        });
        countryWrap.appendChild(dropdown);
      };
      document.addEventListener('mousedown', function h2(e) {
        if (dropdown && !countryWrap.contains(e.target)) { dropdown.remove(); dropdown = null; chevron.classList.remove('fq-open'); }
      });

      phoneInput.oninput = function () { phoneInput.value = phoneInput.value.replace(/[^\d\s]/g, ''); errorEl.style.display = 'none'; };
      phoneInput.onkeydown = function (e) { if (e.key === 'Enter') doSubmitTicket(); };

      body.appendChild(el('div')).style.cssText = 'flex:1;min-height:24px;';

      var submitBtn = el('button', 'fq-screen-btn');
      submitBtn.textContent = 'إرسال التذكرة';
      submitBtn.style.cssText = 'background:' + accentColor + ';color:#FFF;margin-bottom:10px;width:100%;padding:14px;border-radius:12px;font-size:14px;font-weight:700;border:none;cursor:pointer;font-family:inherit;';
      submitBtn.onclick = function () { doSubmitTicket(); };
      body.appendChild(submitBtn);

      function doSubmitTicket() {
        var cleaned = phoneInput.value.replace(/\D/g, '');
        var result = validatePhone(selectedCountry.code, cleaned);
        if (!result.valid) { errorEl.textContent = result.error; errorEl.style.display = 'block'; phoneInput.focus(); return; }
        errorEl.style.display = 'none';
        state.ticketCreated = true;
        renderTicketCreatedScreen();
      }
    }

    screen.appendChild(body);
    screen.appendChild(buildFooter());
    dom.windowInner.appendChild(screen);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 18. TICKET CREATED SCREEN
  // ═══════════════════════════════════════════════════════════════════
  function renderTicketCreatedScreen() {
    clearInner();
    state.currentScreen = 'ticket-created';
    var c = mc();
    var accentColor = settings.mainColor;
    var pageBg = isDark() ? '#1e293b' : '#FFFFFF';
    dom.window.style.background = pageBg;

    var screen = el('div', 'fq-screen');
    var accent = el('div', 'fq-screen-accent');
    accent.style.background = accentColor;
    screen.appendChild(accent);

    // Header
    var header = el('div', 'fq-screen-header');
    header.style.borderBottom = '1px solid ' + (isDark() ? '#334155' : '#f3f4f6');
    var backBtn = el('button', 'fq-screen-back');
    backBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#94a3b8' : '#6b7280') + '" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    backBtn.onclick = function () {
      if (state.ticketSource === 'form') {
        var last = state.messages[state.messages.length - 1];
        if (!last || last.type !== 'ticket-success') {
          state.messages.push({ id: 'ts-' + Date.now(), text: 'تم إرسال طلبك بنجاح', sender: 'store', timestamp: new Date(), type: 'ticket-success' });
        }
      }
      renderChatScreen();
    };
    header.appendChild(backBtn);
    var title = el('h3', 'fq-screen-title');
    title.textContent = 'تم إنشاء التذكرة';
    title.style.color = c.primaryText;
    header.appendChild(title);
    screen.appendChild(header);

    // Body
    var body = el('div', 'fq-screen-body fq-no-scrollbar');
    body.setAttribute('data-chat-scrollable', '');
    body.style.cssText = 'display:flex;flex-direction:column;align-items:center;padding:20px 24px;';

    var iconWrap = el('div');
    iconWrap.style.cssText = 'width:64px;height:64px;border-radius:50%;display:flex;align-items:center;justify-content:center;margin-bottom:20px;background:' + accentColor + (isDark() ? '20' : '12');
    iconWrap.innerHTML = '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="' + accentColor + '" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
    body.appendChild(iconWrap);

    var t1 = el('h3');
    t1.textContent = 'تم تحويل محادثتك إلى تذكرة';
    t1.style.cssText = 'font-size:17px;font-weight:700;color:' + c.primaryText + ';margin-bottom:8px;text-align:center;';
    body.appendChild(t1);
    var d1 = el('p');
    d1.innerHTML = 'سيتولى فريق ' + esc(settings.storeName) + ' متابعة طلبك<br>وسنرد عليك في أقرب وقت ممكن';
    d1.style.cssText = 'font-size:13px;line-height:1.7;color:' + c.secondaryText + ';text-align:center;margin-bottom:24px;';
    body.appendChild(d1);

    // Card
    var card = el('div', 'fq-ticket-card');
    card.style.background = isDark() ? '#0f172a' : '#f9fafb';
    card.style.border = '1.5px solid ' + (isDark() ? '#334155' : '#e5e7eb');

    var row1 = el('div', 'fq-ticket-card-row');
    row1.style.borderBottom = '1px solid ' + (isDark() ? '#334155' : '#e5e7eb');
    row1.innerHTML = '<span class="fq-ticket-label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> رقم التذكرة</span>';
    var badge = el('span', 'fq-ticket-badge');
    badge.textContent = state.ticketId;
    badge.style.background = accentColor + (isDark() ? '20' : '12');
    badge.style.color = accentColor;
    row1.appendChild(badge);
    card.appendChild(row1);

    var row2 = el('div', 'fq-ticket-card-row');
    row2.innerHTML = '<span class="fq-ticket-label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> الحالة</span>';
    var statusBadge = el('span', 'fq-ticket-status');
    statusBadge.textContent = 'مفتوحة';
    statusBadge.style.background = isDark() ? '#052e16' : '#f0fdf4';
    statusBadge.style.border = '1px solid ' + (isDark() ? '#166534' : '#bbf7d0');
    row2.appendChild(statusBadge);
    card.appendChild(row2);

    var row3 = el('div', 'fq-ticket-card-row');
    row3.innerHTML = '<span class="fq-ticket-label"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="' + (isDark() ? '#64748b' : '#9ca3af') + '" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> وقت الاستجابة</span>';
    var val = el('span', 'fq-ticket-value');
    val.textContent = 'خلال 24 ساعة';
    val.style.color = isDark() ? '#cbd5e1' : '#374151';
    row3.appendChild(val);
    card.appendChild(row3);

    body.appendChild(card);
    screen.appendChild(body);

    // Actions
    var actions = el('div', 'fq-screen-actions');
    actions.style.borderTop = '1px solid ' + (isDark() ? '#334155' : '#f3f4f6');
    actions.style.background = pageBg;

    var closeBtn = el('button', 'fq-screen-btn');
    closeBtn.textContent = 'حسناً، شكراً لك';
    closeBtn.style.background = accentColor;
    closeBtn.style.color = '#FFFFFF';
    closeBtn.style.marginBottom = '10px';
    closeBtn.onclick = function () { fullClose(); };
    actions.appendChild(closeBtn);

    var dlBtn = el('button', 'fq-dl-btn');
    dlBtn.style.border = '1.5px solid ' + (isDark() ? '#334155' : '#e5e7eb');
    dlBtn.style.color = isDark() ? '#94a3b8' : '#6b7280';
    dlBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> تحميل التذكرة';
    dlBtn.onclick = function () { downloadAsImage('ticket'); };
    actions.appendChild(dlBtn);

    screen.appendChild(actions);
    screen.appendChild(buildFooter());
    dom.windowInner.appendChild(screen);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 19. OPEN / CLOSE
  // ═══════════════════════════════════════════════════════════════════
  function openChat() {
    state.isOpen = true;
    dom.bubble.style.display = 'none';
    dom.overlay.style.display = 'block';
    dom.window.style.display = 'flex';
    dom.window.classList.add('fq-window-enter');
    dom.window.classList.remove('fq-window-exit');
    updatePositions();
    lockBody();
    if (state.currentScreen === 'chat') renderChatScreen();
  }

  function closeChat() {
    // Return to chat — hide but keep messages
    state.isOpen = false;
    dom.window.classList.add('fq-window-exit');
    dom.window.classList.remove('fq-window-enter');
    dom.overlay.style.display = 'none';
    unlockBody();
    setTimeout(function () {
      if (!state.isOpen) {
        dom.window.style.display = 'none';
        dom.bubble.style.display = 'block';
        dom.bubble.className = 'fq-bubble fq-bubble-enter ' + (settings.position === 'bottom-right' ? 'fq-right' : 'fq-left');
      }
    }, 200);
  }

  function fullClose() {
    state.isOpen = false;
    state.messages = [];
    state.ticketCreated = false;
    state.currentScreen = 'chat';
    state.conversationId = 'conv_' + Date.now() + '_' + Math.random().toString(36).slice(2, 9);
    state.ticketId = '#TKT-' + Math.floor(10000 + Math.random() * 90000);
    dom.window.classList.add('fq-window-exit');
    dom.window.classList.remove('fq-window-enter');
    dom.overlay.style.display = 'none';
    unlockBody();
    setTimeout(function () {
      if (!state.isOpen) {
        dom.window.style.display = 'none';
        dom.bubble.style.display = 'block';
        dom.bubble.className = 'fq-bubble fq-bubble-enter ' + (settings.position === 'bottom-right' ? 'fq-right' : 'fq-left');
      }
    }, 200);
  }

  function scrollToBottom() {
    if (!dom.messages) return;
    dom.messages.scrollTop = dom.messages.scrollHeight;
    requestAnimationFrame(function () { if (dom.messages) dom.messages.scrollTop = dom.messages.scrollHeight; });
    setTimeout(function () { if (dom.messages) dom.messages.scrollTop = dom.messages.scrollHeight; }, 150);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 20. FETCH SETTINGS FROM SUPABASE
  // ═══════════════════════════════════════════════════════════════════
  function fetchSettings(callback) {
    var url = API_BASE + '/chat-settings/' + STORE_ID;
    fetch(url, { headers: { Authorization: 'Bearer ' + SUPABASE_ANON_KEY } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.success && data.settings) {
          var s = data.settings;
          if (s.primaryColor) settings.mainColor = s.primaryColor;
          if (s.previewMode === 'dark') settings.mode = 'dark';
          if (s.widgetOuter) settings.widgetOuterColor = s.widgetOuter;
          if (s.widgetInner) settings.widgetInnerColor = s.widgetInner;
          if (s.position === 'left') settings.position = 'bottom-left';
          console.log('[Fuqah] Settings fetched OK: mainColor=' + settings.mainColor + ' mode=' + settings.mode + ' position=' + settings.position);
        } else {
          console.log('[Fuqah] Settings: no data from API, using defaults');
        }
        callback();
      })
      .catch(function (err) {
        console.warn('[Fuqah] Settings fetch failed (using defaults):', err.message || err);
        callback();
      });
  }

  function fetchBranding(callback) {
    var url = API_BASE + '/store-branding/' + STORE_ID;
    fetch(url, { headers: { Authorization: 'Bearer ' + SUPABASE_ANON_KEY } })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (data) {
        if (data && data.success && data.branding) {
          var b = data.branding;
          if (b.storeName) settings.storeName = b.storeName;
          if (b.logo) settings.storeLogo = b.logo;
          if (b.icon) settings.storeIcon = b.icon;
          console.log('[Fuqah] Branding fetched OK: name=' + settings.storeName + ' logo=' + !!settings.storeLogo + ' icon=' + !!settings.storeIcon);
        } else {
          console.log('[Fuqah] Branding: no data from API, using defaults');
        }
        callback();
      })
      .catch(function (err) {
        console.warn('[Fuqah] Branding fetch failed (using defaults):', err.message || err);
        callback();
      });
  }

  // ═══════════════════════════════════════════════════════════════════
  // 21. INIT
  // ═══════════════════════════════════════════════════════════════════
  function init() {
    console.log('[Fuqah] init() starting. document.body=' + !!document.body);
    loadCSS();

    var loaded = 0;
    function onLoaded() {
      loaded++;
      console.log('[Fuqah] onLoaded called (' + loaded + '/2)');
      if (loaded >= 2) {
        console.log('[Fuqah] Both fetches done. Building widget DOM...');
        buildWidget();

        // Verify critical elements exist
        if (!dom.root || !dom.bubble || !dom.window) {
          console.error('[Fuqah] FATAL: Widget DOM build failed. root=' + !!dom.root + ' bubble=' + !!dom.bubble + ' window=' + !!dom.window);
          return;
        }

        // Platform bottom bar detection
        scanBottomBar();
        setInterval(scanBottomBar, 1500);
        window.addEventListener('scroll', function () { setTimeout(scanBottomBar, 100); }, { passive: true });
        window.addEventListener('resize', function () { scanBottomBar(); updatePositions(); }, { passive: true });

        // Mark as loaded for verification
        window.__FUQAH_WIDGET_LOADED__ = true;
        window.__FUQAH_WIDGET_CONFIG__ = { storeId: STORE_ID, mainColor: settings.mainColor, mode: settings.mode, position: settings.position, storeName: settings.storeName };

        console.log('[Fuqah] Widget v3.0 ready ✓  store=' + STORE_ID + '  bubble visible at ' + settings.position);
        console.log('[Fuqah] Verify: document.getElementById("fq-bubble")=', document.getElementById('fq-bubble'));
      }
    }

    fetchSettings(onLoaded);
    fetchBranding(onLoaded);
  }

  // ═══════════════════════════════════════════════════════════════════
  // 22. PUBLIC API
  // ═══════════════════════════════════════════════════════════════════
  window.FuqahChat = {
    open: function () { if (!state.isOpen) openChat(); },
    close: function () { if (state.isOpen) closeChat(); },
    toggle: function () { state.isOpen ? closeChat() : openChat(); },
    getMessages: function () { return state.messages; },
    getStoreId: function () { return STORE_ID; },
  };

  // ═══════════════════════════════════════════════════════════════════
  // BOOT — handles script in <head> (before body) or <body>
  // ═══════════════════════════════════════════════════════════════════
  // Verification snippet — paste in DevTools console:
  // console.log({ loaded: !!window.__FUQAH_WIDGET_LOADED__, config: window.__FUQAH_WIDGET_CONFIG__, bubble: document.getElementById('fq-bubble'), container: document.getElementById('fq-chat-window') });

  if (document.body) {
    console.log('[Fuqah] Boot: body available, calling init() now');
    init();
  } else {
    console.log('[Fuqah] Boot: body NOT ready, waiting for DOMContentLoaded');
    document.addEventListener('DOMContentLoaded', function () {
      console.log('[Fuqah] Boot: DOMContentLoaded fired, calling init()');
      init();
    });
  }

})();
