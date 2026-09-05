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
