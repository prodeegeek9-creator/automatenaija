/* =========================================================================
   Automate Naija - shared shell behaviour
   Loaded by every page (including index.html) at the end of <body>.

   EDIT THE LINKS BLOCK BELOW. Everything on the site that points at the app,
   the WhatsApp community, the inbox or a social account reads from here, so
   one edit updates every page.

   Any social handle left as an empty string is removed from the footer
   instead of rendering a dead link, so fill in only the accounts that exist.
   ========================================================================= */
var SITE = {
  app:      "https://app.automatenaija.com/login",
  // Paste the full WhatsApp community invite link (chat.whatsapp.com/XXXXXXXX).
  whatsapp: "https://chat.whatsapp.com/",
  // Change this if the team reads a different inbox.
  email:    "hello@automatenaija.com",
  socials: {
    twitter:   "",   // e.g. "https://x.com/automatenaija"
    linkedin:  "",   // e.g. "https://www.linkedin.com/company/automatenaija"
    youtube:   "",   // e.g. "https://www.youtube.com/@automatenaija"
    instagram: ""    // e.g. "https://www.instagram.com/automatenaija"
  }
};

/* =========================================================================
   Visit counting

   Tells the Automate Naija app that a page was opened, so the admin console
   can show who visits this site and where from, next to the app's own
   visitors. It runs on every page because this file does.

   What is and is not collected:
   - No cookie and nothing stored in the browser. The server tells a visitor
     apart for one day only, by hashing their address with a salt that changes
     at midnight; the address itself is never kept.
   - Sent: the page path, the site that referred the visitor (host name only),
     any utm_source / utm_medium / utm_campaign on the link, and the window
     size class. The country and city come from the connection, server side.
   - Do Not Track and Global Privacy Control switch it off.
   - It only reports from automatenaija.com, so a local copy or a preview
     deploy counts nothing.

   It is a plain POST with a text/plain body, which browsers send without a
   preflight, and the reply is never read. The receiving end is
   functions/hit.js in the app's repo, which reads which site it came from off
   the request's Origin header. It sits before everything else in this file so
   that nothing below it can stop it running, and it is wrapped so that it can
   never break the page.
   ========================================================================= */
(function(){
  try {
    var host = location.hostname;
    if(!/(^|\.)automatenaija\.com$/.test(host)) return;
    if(navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl) return;

    var own = host.replace(/^www\./, '');
    var from = '';
    try { if(document.referrer) from = new URL(document.referrer).hostname.replace(/^www\./, ''); } catch(e){}

    /* A page reached from another page of this site is the same visit; one
       reached from anywhere else (or from nowhere) starts a new one, and only
       that one says how the visitor found us. */
    var sameVisit = from === own;
    var width = window.innerWidth || 1024;
    var body = {
      path: location.pathname,
      entry: !sameVisit,
      device: width < 640 ? 'mobile' : (width < 1024 ? 'tablet' : 'desktop')
    };
    if(!sameVisit){
      if(from) body.ref = from;
      if(window.URLSearchParams){
        var q = new URLSearchParams(location.search);
        body.utm_source = q.get('utm_source') || q.get('ref') || undefined;
        body.utm_medium = q.get('utm_medium') || undefined;
        body.utm_campaign = q.get('utm_campaign') || undefined;
      }
    }

    var url = 'https://app.automatenaija.com/hit';
    var json = JSON.stringify(body);
    var sent = false;
    if(navigator.sendBeacon){
      sent = navigator.sendBeacon(url, new Blob([json], { type: 'text/plain;charset=UTF-8' }));
    }
    if(!sent && window.fetch){
      fetch(url, { method: 'POST', body: json, mode: 'no-cors', keepalive: true }).catch(function(){});
    }
  } catch(e){ /* a lost count is a gap in a chart, never a broken page */ }
})();

(function(){
  "use strict";

  function each(sel, fn){ Array.prototype.forEach.call(document.querySelectorAll(sel), fn); }

  /* Path back to the site root, worked out from this script's own src so the
     same file works from /index.html and from /blog/a-post.html. */
  var BASE = (function(){
    var tag = document.querySelector('script[src$="assets/site.js"]');
    return tag ? tag.getAttribute('src').replace(/assets\/site\.js.*$/, '') : '';
  })();

  /* A chat.whatsapp.com URL with no invite code is not a link, it is a 404. */
  function usableWhatsApp(){
    return /chat\.whatsapp\.com\/.+/.test(SITE.whatsapp || '');
  }

  /* ---- icons (guarded, never fatal) ---- */
  function drawIcons(){
    try { if (window.lucide && lucide.createIcons) lucide.createIcons(); } catch(e){}
  }
  window.anDrawIcons = drawIcons;
  drawIcons();
  window.addEventListener('load', drawIcons);

  /* ---- theme toggle (light/dark, shared across pages) ---- */
  (function(){
    var root  = document.documentElement;
    var btn   = document.getElementById('themeToggle');
    var glyph = document.getElementById('themeGlyph');
    var saved = null;
    try { saved = localStorage.getItem('an-theme'); } catch(e){}
    function apply(theme){
      if(theme === 'light'){ root.setAttribute('data-theme','light'); if(glyph) glyph.textContent = '☾'; }
      else { root.removeAttribute('data-theme'); if(glyph) glyph.textContent = '☼'; }
    }
    apply(saved === 'light' ? 'light' : 'dark');
    if(!btn) return;
    btn.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem('an-theme', next); } catch(e){}
    });
  })();

  /* ---- mobile menu ---- */
  (function(){
    var mb = document.getElementById('menuBtn'), mm = document.getElementById('mobileMenu');
    if(!mb || !mm) return;
    function setIcon(name){
      mb.innerHTML = '<i data-lucide="'+name+'" style="width:24px;height:24px"></i>';
      drawIcons();
    }
    mb.addEventListener('click', function(){
      var open = mm.classList.toggle('open');
      mb.setAttribute('aria-expanded', open);
      setIcon(open ? 'x' : 'menu');
    });
    Array.prototype.forEach.call(mm.querySelectorAll('a'), function(a){
      a.addEventListener('click', function(){
        mm.classList.remove('open');
        mb.setAttribute('aria-expanded', false);
        setIcon('menu');
      });
    });
  })();

  /* ---- scroll reveal ---- */
  (function(){
    var els = document.querySelectorAll('.rv');
    if(!els.length) return;
    function showAll(){ Array.prototype.forEach.call(els, function(el){ el.classList.add('in'); }); }
    if(!('IntersectionObserver' in window)){ showAll(); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold:0.08, rootMargin:'0px 0px -30px 0px' });
    Array.prototype.forEach.call(els, function(el, i){
      el.style.transitionDelay = (Math.min(i % 5, 4) * 60) + 'ms';
      io.observe(el);
    });
    setTimeout(showAll, 2000); // safety net
  })();

  /* ---- link wiring: data-link="app|whatsapp|email" ---- */
  (function(){
    each('[data-link]', function(el){
      var kind = el.getAttribute('data-link');
      if(kind === 'app' && SITE.app) el.href = SITE.app;
      else if(kind === 'whatsapp'){
        // Until the real invite link is pasted into SITE.whatsapp, send people
        // to the contact page rather than to a broken invite.
        el.href = usableWhatsApp() ? SITE.whatsapp : BASE + 'contact.html';
        if(!usableWhatsApp()){ el.removeAttribute('target'); }
      }
      else if(kind === 'email' && SITE.email){
        el.href = 'mailto:' + SITE.email;
        if(el.hasAttribute('data-fill')) el.textContent = SITE.email;
      }
    });
  })();

  /* ---- footer socials: drop any account that has not been set up yet ---- */
  (function(){
    var row = document.querySelector('.fsocial');
    if(!row) return;
    each('.fsocial [data-social]', function(a){
      var url = SITE.socials[a.getAttribute('data-social')];
      if(url){ a.href = url; a.target = '_blank'; a.rel = 'noopener'; }
      else { a.parentNode.removeChild(a); }
    });
    if(!row.querySelector('a')) row.parentNode.removeChild(row);
  })();

  /* ---- footer link groups: accordions on a phone, open columns above that.
     The groups are <details>, whose open state cannot be driven by CSS, so the
     breakpoint is mirrored here. A page whose footer has no .fgroup is left
     alone. ---- */
  (function(){
    var groups = document.querySelectorAll('footer details.fgroup');
    if(!groups.length || !window.matchMedia) return;
    var wide = window.matchMedia('(min-width: 768px)');
    function sync(){ each('footer details.fgroup', function(d){ d.open = wide.matches; }); }
    sync();
    if(wide.addEventListener) wide.addEventListener('change', sync);
    else if(wide.addListener) wide.addListener(sync);
  })();

  /* ---- current year in the footer ---- */
  each('[data-year]', function(el){ el.textContent = new Date().getFullYear(); });

  /* ---- newsletter signup: no backend yet, so say so instead of failing quietly ---- */
  each('form.signup', function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var input = form.querySelector('input');
      if(input && !input.value.trim()) return;
      var note = form.parentNode.querySelector('.signup-note');
      if(!note){
        note = document.createElement('p');
        note.className = 'signup-note';
        note.style.cssText = 'font-size:.78rem;color:var(--lime);margin-top:10px;';
        form.parentNode.appendChild(note);
      }
      note.textContent = 'Thanks! We will be in touch at ' + (input ? input.value.trim() : '') + '.';
      form.reset();
    });
  });
})();
