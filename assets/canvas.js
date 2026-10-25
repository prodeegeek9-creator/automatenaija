/* =========================================================================
   Automate Naija - the "Canvas" homepage template (canvas.html)

   1. Background layers: tool tiles (assets/tool-logos.js) and faint icons.
   2. The live parts, from one call to SITE.live (the app's /api/home, the
      same feed assets/live.js reads for index.html): this week's builds, the
      execution log, the boards, the credential card and the numbers on the
      workflow. Built with DOM methods and textContent only, since names and
      titles are typed by people, and only links into the app are followed.
      If the call fails, the page keeps its static copy and hides the parts
      that are nothing without data.
   3. The wires between the workflow's nodes, drawn from where the nodes are.
   4. The Automate level picker, carried through to the app's checkout.
   ========================================================================= */
(function(){
  'use strict';

  var APP_ORIGIN = 'https://app.automatenaija.com/';
  var LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' };
  var TOOLS = { n8n: ['n8n', 'var(--n8n)', 'n'], make: ['Make', 'var(--make)', 'M'], zapier: ['Zapier', 'var(--zapier)', 'Z'] };
  var NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve'];

  function $(id){ return document.getElementById(id); }
  function el(tag, cls, text){
    var n = document.createElement(tag);
    if(cls) n.className = cls;
    if(text != null) n.textContent = text;
    return n;
  }
  function icon(name, cls){ var i = el('i', cls || ''); i.setAttribute('data-lucide', name); return i; }
  function drawIcons(){ if(window.anIcons) window.anIcons(document); }
  // Only the app's own addresses, whatever the feed says.
  function safe(href){ return typeof href === 'string' && href.indexOf(APP_ORIGIN) === 0 ? href : null; }
  function link(href, cls, text){
    var target = safe(href);
    var n = el(target ? 'a' : 'span', cls, text);
    if(target) n.href = target;
    return n;
  }
  function plural(n, one, many){ return n + ' ' + (n === 1 ? one : many); }
  function ago(iso){
    var d = Math.round((Date.now() - new Date(iso).getTime()) / 864e5);
    if(!(d >= 0)) return '';
    if(d === 0) return 'today';
    if(d === 1) return 'yesterday';
    if(d < 14) return d + ' days ago';
    if(d < 60) return Math.round(d / 7) + ' weeks ago';
    return Math.round(d / 30) + ' months ago';
  }
  function avatar(p){
    var src = safe(p.card_cutout_url) || safe(p.avatar_url);
    if(src){
      var img = el('img', 'av'); img.src = src; img.alt = ''; img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', function(){ img.replaceWith(el('span', 'av', p.initials || '')); });
      return img;
    }
    return el('span', 'av', p.initials || '');
  }

  /* ---- 1. Background layers ---- */
  // [tool, left (% of width) or null, top (px), size (px), rotation, classes, right (px, phones)]
  var HERO_TILES = [
    ['n8n', 32.5, 92, 58, -8, ''], ['make', 44.5, 122, 50, 7, ''], ['zapier', 55, 70, 54, -5, ''],
    ['whatsapp', 2.2, 168, 54, 6, 'edge'], ['googlesheets', 4.2, 340, 44, -6, 'edge far'], ['googlecalendar', 4.6, 262, 36, 6, 'edge far'],
    ['gmail', 93.6, 112, 50, 8, 'edge'], ['telegram', 95.2, 300, 44, -7, 'edge far'],
    ['supabase', 69, 14, 38, 5, 'far'], ['airtable', 81, 22, 40, -4, 'far'],
    ['n8n', null, 14, 40, -8, 'phone', 22], ['make', null, 30, 34, 7, 'phone', 72], ['zapier', null, 10, 36, -5, 'phone', 118], ['whatsapp', null, 40, 30, 6, 'phone', 164]
  ];
  var FINAL_TILES = [
    ['stripe', 12, 70, 52, -7, ''], ['notion', 7, 250, 44, 6, 'far'], ['claude', 20, 330, 48, 5, ''],
    ['hubspot', 84, 80, 50, 7, ''], ['googledrive', 90, 250, 44, -6, 'far'], ['googlegemini', 78, 320, 48, -4, ''],
    ['telegram', 30, 40, 38, 8, 'far'], ['gmail', 68, 36, 40, -8, 'far']
  ];
  // [icon, left %, top (px, or a % string), size, rotation]
  var BG_ICONS = {
    week:    [['webhook', -1.5, 70, 120, -12], ['calendar-clock', 94, 40, 96, 10], ['git-branch', 96, '62%', 110, -8]],
    live:    [['database', 70, 60, 150, 8], ['bot', 86, 150, 110, -10], ['workflow', -2, '55%', 130, 6]],
    pricing: [['credit-card', 72, 70, 130, -8], ['receipt-text', 88, 170, 96, 10], ['repeat', -1.5, '70%', 110, -6]],
    tutors:  [['brain-circuit', 76, 60, 140, 6], ['code-xml', 92, 160, 100, -10]],
    faq:     [['message-circle', -1.5, 80, 120, -8], ['send', 95, '65%', 100, 12]]
  };

  function tiles(id, list){
    var box = $(id), logos = window.AN_TOOLS || {};
    if(!box) return;
    list.forEach(function(t, i){
      var tool = logos[t[0]];
      if(!tool) return;
      var tile = el('span', 'tile ' + t[5]);
      tile.style.width = tile.style.height = t[3] + 'px';
      if(t[1] != null) tile.style.left = t[1] + '%'; else tile.style.right = t[6] + 'px';
      tile.style.top = t[2] + 'px';
      tile.style.setProperty('--r', t[4] + 'deg');
      tile.style.setProperty('--d', (6 + (i % 4)) + 's');
      tile.style.setProperty('--delay', (-(i * 1.3)) + 's');
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      // Notion's mark is black: it takes the text colour so it reads in dark mode too.
      path.setAttribute('fill', tool.hex === '#000000' ? 'currentColor' : tool.hex);
      path.setAttribute('d', tool.d);
      svg.appendChild(path);
      tile.appendChild(svg);
      box.appendChild(tile);
    });
  }
  tiles('heroTiles', HERO_TILES);
  tiles('finalTiles', FINAL_TILES);
  Array.prototype.forEach.call(document.querySelectorAll('.bgi'), function(box){
    (BG_ICONS[box.getAttribute('data-set')] || []).forEach(function(c){
      var i = icon(c[0]);
      i.style.cssText = 'left:' + c[1] + '%;top:' + (typeof c[2] === 'number' ? c[2] + 'px' : c[2]) +
        ';width:' + c[3] + 'px;height:' + c[3] + 'px;transform:rotate(' + c[4] + 'deg)';
      box.appendChild(i);
    });
  });
  drawIcons();

  /* ---- 3. Wires between the workflow's nodes ---- */
  var wireLabels = null;
  function drawWires(){
    var flow = $('flow');
    if(!flow) return;
    var nodes = Array.prototype.slice.call(flow.querySelectorAll(':scope > .node'));
    Array.prototype.forEach.call(flow.querySelectorAll('.wlabel, svg.wires'), function(n){ n.remove(); });
    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('class', 'wires');
    svg.setAttribute('aria-hidden', 'true');
    var box = flow.getBoundingClientRect();
    for(var i = 0; i < nodes.length - 1; i++){
      var a = nodes[i].getBoundingClientRect(), b = nodes[i + 1].getBoundingClientRect();
      var stacked = b.top >= a.bottom - 4, d, x1, y1, x2, y2, lx, ly;
      if(stacked){
        x1 = a.left + a.width / 2 - box.left; y1 = a.bottom - box.top;
        x2 = b.left + b.width / 2 - box.left; y2 = b.top - box.top;
        var my = (y1 + y2) / 2;
        d = 'M' + x1 + ' ' + y1 + ' C ' + x1 + ' ' + my + ', ' + x2 + ' ' + my + ', ' + x2 + ' ' + y2;
        lx = x1 + 70; ly = my;
      } else {
        x1 = a.right - box.left; y1 = a.top + a.height / 2 - box.top;
        x2 = b.left - box.left; y2 = b.top + b.height / 2 - box.top;
        var mx = (x1 + x2) / 2;
        d = 'M' + x1 + ' ' + y1 + ' C ' + mx + ' ' + y1 + ', ' + mx + ' ' + y2 + ', ' + x2 + ' ' + y2;
        lx = mx; ly = (y1 + y2) / 2 - 18;
      }
      ['wire', 'wire-run'].forEach(function(cls){
        var p = document.createElementNS(NS, 'path');
        p.setAttribute('class', cls); p.setAttribute('d', d);
        svg.appendChild(p);
      });
      if(wireLabels && wireLabels[i]){
        var label = el('span', 'wlabel', wireLabels[i]);
        label.setAttribute('aria-hidden', 'true');
        label.style.left = lx + 'px'; label.style.top = ly + 'px';
        flow.appendChild(label);
      }
    }
    flow.insertBefore(svg, flow.firstChild);
  }
  var resizeTimer = null;
  window.addEventListener('resize', function(){ clearTimeout(resizeTimer); resizeTimer = setTimeout(drawWires, 120); });
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(drawWires);
  drawWires();

  /* ---- 4. Automate level picker ---- */
  (function(){
    var inputs = document.querySelectorAll('input[name="automate-level"]');
    var cta = $('automateCta');
    if(!inputs.length || !cta) return;
    var base = (window.SITE && SITE.app) || 'https://app.automatenaija.com/login';
    function pick(input){
      var label = input.getAttribute('data-label');
      $('automateNow').textContent = input.getAttribute('data-now');
      $('automateWas').textContent = input.getAttribute('data-was');
      $('automateNote').textContent = label + ', first-100 price';
      $('automateCtaText').textContent = 'Continue with ' + label;
      cta.href = base + (base.indexOf('?') === -1 ? '?' : '&') + 'plan=automate&level=' + encodeURIComponent(input.value);
    }
    Array.prototype.forEach.call(inputs, function(input){ input.addEventListener('change', function(){ pick(input); }); });
    // Deep links like canvas.html#pricing?level=expert, as on index.html.
    var wanted = (location.search + location.hash).match(/level=([a-z]+)/i);
    var preset = Array.prototype.filter.call(inputs, function(i){ return wanted ? i.value === wanted[1].toLowerCase() : i.checked; })[0] || inputs[0];
    preset.checked = true;
    pick(preset);
  })();

  /* ---- the community screenshot falls back to an illustration ---- */
  (function(){
    var img = $('commShot'), chat = $('commChat');
    if(!img || !chat) return;
    function fallback(){ img.remove(); chat.hidden = false; }
    if(img.complete && img.naturalWidth === 0) fallback();
    else img.addEventListener('error', fallback);
  })();

  /* ---- a tutor photo that fails leaves the initials behind it ---- */
  Array.prototype.forEach.call(document.querySelectorAll('.person .ph img'), function(img){
    img.addEventListener('error', function(){ img.remove(); });
  });

  /* ---- 2. The live parts ---- */
  var url = window.SITE && SITE.live;
  if(!url || !window.fetch){ $('weekEmpty').hidden = false; return; }

  fetch(url, { credentials: 'omit' })
    .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function(){
      $('weekEmpty').hidden = false;
      // The section stays hidden, so nothing should point at it.
      Array.prototype.forEach.call(document.querySelectorAll('a[href="#live"]'), function(a){ a.hidden = true; });
    });

  function render(d){
    var builds = d.builds || [], s = d.stats || {};
    // Each part on its own, so one that trips leaves the others standing.
    [renderHero, renderWeek, renderLive, renderCredential].forEach(function(fn){
      try { fn(d, builds, s); } catch(e){}
    });
    drawIcons();
    drawWires();
  }

  function closesIn(iso){
    var ms = new Date(iso).getTime() - Date.now();
    if(!(ms > 0)) return null;
    var m = Math.floor(ms / 60000);
    return { d: Math.floor(m / 1440), h: Math.floor(m % 1440 / 60), m: m % 60 };
  }

  function renderHero(d, builds, s){
    var chip = [plural(builds.length, 'build', 'builds') + ' open'];
    if(s.builders) chip.push(plural(s.builders, 'builder', 'builders'));
    $('heroChip').textContent = 'Live · ' + chip.join(' · ');

    var start = d.starter && safe(d.starter.url);
    if(start){
      Array.prototype.forEach.call(document.querySelectorAll('.js-start'), function(a){ a.href = start; });
      $('starter').href = start;
      $('starterTitle').textContent = d.starter.title;
    }

    var first = builds[0];
    if(first){
      $('flowBuild').textContent = first.title;
      var left = closesIn(first.expires_at);
      $('flowClose').textContent = !left ? 'Open this week'
        : 'Closes in ' + (left.d ? left.d + 'd ' + left.h + 'h' : left.h ? left.h + 'h ' + left.m + 'm' : left.m + 'm');
    }
    wireLabels = [
      s.builders ? plural(s.builders, 'builder', 'builders') : null,
      builds.length ? plural(builds.length, 'build', 'builds') + ' open' : null,
      s.builds_graded ? s.builds_graded + ' graded' : null,
      s.credentials ? plural(s.credentials, 'credential', 'credentials') : null
    ];

    var last = (d.showcase || [])[0];
    if(last){
      $('lastRun').textContent = last.builder + ' · ' + last.title + ' · ' + last.score + '/100 · ' + ago(last.graded_at);
      $('runbar').hidden = false;
    }
  }

  function renderWeek(d, builds){
    if(!builds.length){ $('weekEmpty').hidden = false; return; }
    var word = NUMBER_WORDS[builds.length] || String(builds.length);
    $('weekH').textContent = word + ' real business ' + (builds.length === 1 ? 'problem' : 'problems') + '. Pick one and ship it.';

    var cd = $('cd'), wrap = $('countdown');
    function tick(){
      var left = closesIn(builds[0].expires_at);
      if(!left){ wrap.hidden = true; return; }
      cd.textContent = '';
      [[left.d, 'd'], [left.h, 'h'], [left.m, 'm']].forEach(function(p, i){
        if(i) cd.appendChild(document.createTextNode(' '));
        cd.appendChild(document.createTextNode(String(p[0]).padStart(2, '0')));
        cd.appendChild(el('em', null, p[1]));
      });
      wrap.hidden = false;
    }
    tick();
    setInterval(tick, 60000);

    var lanes = $('lanes');
    [['beginner', 'new to automation'], ['intermediate', 'built a few'], ['expert', 'shipping for clients']].forEach(function(L){
      var list = builds.filter(function(b){ return b.level === L[0]; });
      if(!list.length) return;
      var lane = el('div', 'lane'), head = el('div', 'lane-h');
      head.appendChild(el('b', null, LEVELS[L[0]]));
      head.appendChild(el('span', null, list.length + ' open · ' + L[1]));
      lane.appendChild(head);
      list.forEach(function(b){
        var target = safe(b.url);
        var card = el(target ? 'a' : 'div', 'card');
        if(target) card.href = target;
        var row1 = el('div', 'row1'), t = TOOLS[b.tool] || [b.tool || '', 'var(--muted)', '·'];
        var tool = el('span', 'tool'), mark = el('i', null, t[2]);
        mark.style.setProperty('--tc', t[1]);
        tool.appendChild(mark); tool.appendChild(document.createTextNode(t[0]));
        row1.appendChild(tool);
        if(b.is_featured) row1.appendChild(el('span', 'feat', 'THIS WEEK'));
        card.appendChild(row1);
        card.appendChild(el('h3', null, b.title));
        if(b.teaser) card.appendChild(el('p', null, b.teaser));
        var row2 = el('div', 'row2');
        row2.appendChild(el('span', null, (b.stacks_value ? '+' + b.stacks_value + ' stacks · ' : '') +
          (b.builders ? b.builders + ' building' : 'be the first')));
        var access = el('span', 'lock');
        if(b.is_free) access.textContent = 'Free';
        else { access.appendChild(icon('lock')); access.appendChild(document.createTextNode('Members')); }
        row2.appendChild(access);
        card.appendChild(row2);
        lane.appendChild(card);
      });
      lanes.appendChild(lane);
    });
  }

  function rows(list, id, value, empty){
    var ol = $(id);
    ol.textContent = '';
    if(!list.length){ var li = el('li'); li.appendChild(el('span', 'empty', empty)); ol.appendChild(li); return; }
    list.forEach(function(p, i){
      var li = el('li');
      li.appendChild(el('span', 'rk', '#' + (p.rank || i + 1)));
      li.appendChild(avatar(p));
      li.appendChild(link(p.url, null, p.name));
      li.appendChild(el('span', 'v', value(p)));
      ol.appendChild(li);
    });
  }

  function renderLive(d, builds, s){
    var shows = d.showcase || [];
    var sum = $('summary');
    [[s.builders, 'Builders'], [s.builds_graded, 'Graded builds'], [s.credentials, 'Credentials issued'], [s.squads, 'Squads']].forEach(function(x){
      var c = el('div');
      c.appendChild(el('b', null, String(x[0] || 0)));
      c.appendChild(el('span', null, x[1]));
      sum.appendChild(c);
    });

    var log = $('log');
    shows.forEach(function(x){
      var tr = el('tr');
      var st = el('td', 'c-st'), pill = el('span', 'st');
      pill.appendChild(icon('check')); pill.appendChild(document.createTextNode('Success'));
      st.appendChild(pill); tr.appendChild(st);
      var who = el('td'), name = link(x.portfolio_url, 'who');
      name.appendChild(avatar(x)); name.appendChild(document.createTextNode(x.builder));
      who.appendChild(name); tr.appendChild(who);
      var wf = el('td', 'wf c-wf');
      wf.appendChild(link(x.url, null, x.title));
      wf.appendChild(el('small', null, (LEVELS[x.level] || x.level) + ' · ' + (TOOLS[x.tool] || [x.tool])[0]));
      tr.appendChild(wf);
      var sc = el('td'), score = el('span', 'score'), bar = el('i');
      bar.style.setProperty('--s', Math.max(0, Math.min(100, Number(x.score) || 0)) + '%');
      score.appendChild(bar); score.appendChild(document.createTextNode(x.score));
      sc.appendChild(score); tr.appendChild(sc);
      tr.appendChild(el('td', 'when c-when', ago(x.graded_at)));
      log.appendChild(tr);
    });

    // Leaderboard: this week once it has a podium, all time until then.
    var leaders = d.leaders || {};
    var tabs = document.querySelectorAll('.tabs button');
    function show(range){
      Array.prototype.forEach.call(tabs, function(b){ b.setAttribute('aria-pressed', b.getAttribute('data-range') === range ? 'true' : 'false'); });
      rows(leaders[range] || [], 'leaders', function(p){ return p.stacks + ' stacks'; },
        range === 'week' ? "This week's board fills up as builds are graded." : 'No graded builds yet.');
      drawIcons();
    }
    Array.prototype.forEach.call(tabs, function(b){ b.addEventListener('click', function(){ show(b.getAttribute('data-range')); }); });
    show((leaders.week || []).length >= 3 ? 'week' : 'all_time');

    var q = d.quiz;
    if(q){
      $('quizH').textContent = 'Weekly quiz · ' + q.question_count + ' questions';
      if(safe(q.url)) $('quizGo').href = q.url;
      rows(q.top || [], 'quiz', function(p){ return p.score + '/' + p.total; }, 'Nobody has played yet this week.');
      $('quizF').textContent = (q.players ? plural(q.players, 'builder has', 'builders have') + ' played this week.' : 'Be the first to play this week.') + ' New questions every Monday.';
    } else {
      $('quizPanel').hidden = true;
    }

    if(d.links && safe(d.links.partner)) $('partnerGo').href = d.links.partner;
    var sq = $('squads');
    (d.squads || []).slice(0, 5).forEach(function(x){
      var li = el('li');
      li.appendChild(el('span', 'rk', x.rank ? '#' + x.rank : '·'));
      li.appendChild(el('span', 'av', x.name.split(/\s+/).map(function(w){ return w.charAt(0); }).join('').slice(0, 2).toUpperCase()));
      li.appendChild(el('span', null, x.name));
      var seats = el('span', 'seats');
      seats.setAttribute('aria-label', x.member_count + ' of 5 members');
      for(var k = 0; k < 5; k++) seats.appendChild(el('i', k < x.member_count ? 'on' : ''));
      li.appendChild(seats);
      sq.appendChild(li);
    });

    $('live').hidden = false;
  }

  function renderCredential(d){
    var shows = (d.showcase || []).filter(function(x){ return safe(x.url); });
    var c = shows.filter(function(x){ return safe(x.card_cutout_url); })[0] || shows[0];
    if(!c) return;
    $('credName').textContent = c.builder;
    $('credTitle').textContent = c.title;
    $('credScore').textContent = c.score + ' / 100';
    $('credLevel').textContent = LEVELS[c.level] || c.level;
    $('credTool').textContent = (TOOLS[c.tool] || [c.tool])[0];
    $('credDate').textContent = new Date(c.graded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    $('credGo').href = c.url;
    var photo = $('credPhoto');
    photo.textContent = c.initials || '';
    var src = safe(c.card_cutout_url) || safe(c.avatar_url);
    if(src){
      var img = el('img', safe(c.card_cutout_url) ? '' : 'full');
      img.src = src; img.alt = c.builder; img.loading = 'lazy'; img.decoding = 'async';
      img.addEventListener('error', function(){ img.remove(); });
      photo.appendChild(img);
    }
    $('cred').hidden = false;
  }
})();
