/* =========================================================================
   Automate Naija - the homepage, live from the app

   Fills the Arena cards (this week's builds, the builder showcase) and the
   "Live from the app" section (leaderboard, weekly quiz, squads) from one
   call to the app: SITE.live, which is functions/api/home.js in the app's
   repo. That endpoint decides what a visitor may see; ranked students come
   back as first name and last initial, with a photo only when their
   portfolio is public.

   Everything here is built with DOM methods and textContent, never as HTML:
   names and titles are typed by people. If the call fails, the static copy
   already in index.html stays and the live section stays hidden.
   ========================================================================= */
(function(){
  var url = window.SITE && SITE.live;
  if(!url || !window.fetch || !document.getElementById('liveBuild')) return;

  var APP_ORIGIN = 'https://app.automatenaija.com/';
  var LEVELS = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' };
  var TOOLS = { n8n: 'n8n', make: 'Make', zapier: 'Zapier' };

  function el(tag, props, kids){
    var node = document.createElement(tag);
    if(props) for(var k in props){
      if(k === 'text') node.textContent = props[k];
      else if(k === 'cls') node.className = props[k];
      else node.setAttribute(k, props[k]);
    }
    (kids || []).forEach(function(kid){ if(kid) node.appendChild(typeof kid === 'string' ? document.createTextNode(kid) : kid); });
    return node;
  }

  // Only the app's own addresses, whatever the feed says.
  function safe(href){ return typeof href === 'string' && href.indexOf(APP_ORIGIN) === 0 ? href : null; }

  function link(href, text, cls){
    var target = safe(href);
    return target ? el('a', { href: target, cls: cls || '', text: text }) : el('span', { cls: cls || '', text: text });
  }

  function level(l){ return LEVELS[l] || (l ? l.charAt(0).toUpperCase() + l.slice(1) : ''); }
  function tool(t){ return TOOLS[t] || t || ''; }
  function plural(n, one, many){ return n + ' ' + (n === 1 ? one : many); }

  function closesIn(iso){
    var ms = new Date(iso).getTime() - Date.now();
    if(!(ms > 0)) return '';
    var h = Math.floor(ms / 3600000);
    if(h < 1) return 'Closes within the hour';
    if(h < 24) return 'Closes in ' + plural(h, 'hour', 'hours');
    return 'Closes in ' + plural(Math.floor(h / 24), 'day', 'days');
  }

  function avatar(p, cls){
    var src = safe(p.avatar_url);
    if(src){
      var img = el('img', { cls: cls, src: src, alt: '', loading: 'lazy', decoding: 'async', width: '32', height: '32' });
      img.onerror = function(){ img.replaceWith(el('span', { cls: cls, text: p.initials || '' })); };
      return img;
    }
    return el('span', { cls: cls, text: p.initials || '' });
  }

  function fill(node, kids){
    while(node.firstChild) node.removeChild(node.firstChild);
    kids.forEach(function(kid){ if(kid) node.appendChild(kid); });
  }

  /* ---- This week's builds ---- */
  function renderBuild(data){
    var builds = data.builds || [];
    var card = document.getElementById('liveBuild');
    if(!builds.length || !card) return;
    var b = builds[0];
    var others = builds.slice(1, 5);

    var foot = el('div', { cls: 'challenge-foot' }, [
      el('b', { text: b.builders > 0 ? plural(b.builders, 'builder', 'builders') + ' shipping it' : 'Be the first to ship it' }),
      el('span', { text: plural(builds.length, 'build', 'builds') + ' this week' })
    ]);

    var more = others.length ? el('div', { cls: 'live-more' }, [
      el('b', { text: 'ALSO THIS WEEK' }),
      el('ul', null, others.map(function(o){
        return el('li', null, [el('span', { cls: 'live-more-title', text: o.title }), el('span', { cls: 'live-more-tag', text: level(o.level) + ' · ' + tool(o.tool) })]);
      }))
    ]) : null;

    var starter = data.starter && safe(data.starter.url) ? el('p', { cls: 'live-starter' }, [
      'New here? The first build is free, no plan needed: ',
      link(data.starter.url, data.starter.title + ' →')
    ]) : null;

    fill(card, [
      el('span', { cls: 'badge', text: "THIS WEEK'S BUILD" }),
      el('small', { text: closesIn(b.expires_at) }),
      el('h3', { text: b.title }),
      b.teaser ? el('p', { text: b.teaser }) : null,
      el('div', { cls: 'tags' }, [
        el('span', { text: level(b.level) }),
        el('span', { text: tool(b.tool) }),
        b.stacks_value ? el('span', { text: '+' + b.stacks_value + ' stacks' }) : null
      ]),
      foot,
      more,
      safe(b.url) ? el('a', { cls: 'newbtn', href: safe(b.url), text: "Join this week's builds" }) : null,
      starter
    ]);
  }

  /* ---- Builder showcase: real graded builds, one at a time ---- */
  function renderShowcase(data){
    var items = (data.showcase || []).filter(function(s){ return safe(s.url); });
    var card = document.getElementById('liveShowcase');
    if(!items.length || !card) return;

    var stage = el('div', { cls: 'showcase-stage' });
    var title = el('h3');
    var meta = el('p', { cls: 'showcase-meta' });
    var go = el('a', { text: 'See the build →' });
    var dots = el('div', { cls: 'showcase-dots', role: 'tablist', 'aria-label': 'Builds' });
    var current = 0, timer = null;

    function show(i){
      current = i;
      var s = items[i];
      var cut = safe(s.card_cutout_url);
      fill(stage, [cut
        ? el('img', { cls: 'showcase-cut', src: cut, alt: s.builder, decoding: 'async' })
        : avatar(s, 'showcase-ava')]);
      title.textContent = s.title;
      fill(meta, [
        el('span', null, ['Built by ', link(s.portfolio_url, s.builder)]),
        el('span', { text: ' · ' + s.score + '/100 · ' + level(s.level) + ' · ' + tool(s.tool) })
      ]);
      go.setAttribute('href', safe(s.url));
      Array.prototype.forEach.call(dots.children, function(d, j){
        d.className = 'dot' + (j === i ? ' on' : '');
        d.setAttribute('aria-selected', j === i ? 'true' : 'false');
      });
    }

    items.forEach(function(s, i){
      var d = el('button', { type: 'button', cls: 'dot', role: 'tab', 'aria-label': s.builder });
      d.addEventListener('click', function(){ show(i); restart(); });
      dots.appendChild(d);
    });

    function restart(){
      if(timer) clearInterval(timer);
      if(items.length < 2 || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(function(){ show((current + 1) % items.length); }, 6000);
    }
    card.addEventListener('mouseenter', function(){ if(timer) clearInterval(timer); timer = null; });
    card.addEventListener('mouseleave', restart);

    fill(card, [stage, el('span', { cls: 'kicker', text: 'BUILDER SHOWCASE' }), title, meta, go, items.length > 1 ? dots : null]);
    show(0);
    restart();
  }

  /* ---- Live from the app: leaderboard, quiz, squads ---- */
  function rows(list, value){
    return el('ol', { cls: 'live-rows' }, list.map(function(p){
      return el('li', { cls: 'live-row' }, [
        el('span', { cls: 'live-rank', text: '#' + p.rank }),
        avatar(p, 'live-ava'),
        link(p.url, p.name, 'live-name'),
        el('span', { cls: 'live-val', text: value(p) })
      ]);
    }));
  }

  function renderLeaders(data){
    var card = document.getElementById('liveLeaders');
    var week = (data.leaders && data.leaders.week) || [];
    var all = (data.leaders && data.leaders.all_time) || [];
    // A week only a day old would show one or two names; the all-time board
    // reads better until this week has a podium.
    var useWeek = week.length >= 3;
    var list = useWeek ? week : all;
    fill(card, [
      el('span', { cls: 'live-label', text: 'LEADERBOARD' }),
      el('h3', { text: useWeek ? 'Top builders this week' : 'All-time top builders' }),
      el('p', { text: 'Stacks come from graded builds. Ship more, climb higher.' }),
      list.length ? rows(list, function(p){ return p.stacks + ' stacks'; }) : el('p', { cls: 'live-empty', text: 'The board fills up as this week\'s builds are graded.' }),
      safe(data.links && data.links.app) ? el('a', { href: safe(data.links.app), text: 'Get on the board →' }) : null
    ]);
  }

  function renderQuiz(data){
    var card = document.getElementById('liveQuiz');
    var q = data.quiz;
    if(!q){
      fill(card, [
        el('span', { cls: 'live-label', text: 'WEEKLY QUIZ' }),
        el('h3', { text: 'A new quiz every week' }),
        el('p', { text: 'AI and automation questions, a fresh set each Monday, with its own leaderboard.' })
      ]);
      return;
    }
    var top = q.top || [];
    fill(card, [
      el('span', { cls: 'live-label', text: 'WEEKLY QUIZ' }),
      el('h3', { text: q.title }),
      el('p', { text: q.question_count + ' questions · ' + (q.players ? plural(q.players, 'builder has', 'builders have') + ' played this week' : 'nobody has played yet this week') }),
      top.length ? rows(top, function(p){ return p.score + '/' + p.total; }) : el('p', { cls: 'live-empty', text: 'Top the board: be the first to play.' }),
      safe(q.url) ? el('a', { href: safe(q.url), text: "Play this week's quiz →" }) : null
    ]);
  }

  function renderSquads(data){
    var card = document.getElementById('liveSquads');
    var squads = data.squads || [];
    var list = squads.slice(0, 5);
    fill(card, [
      el('span', { cls: 'live-label', text: 'SQUADS' }),
      el('h3', { text: squads.length ? plural(squads.length, 'squad', 'squads') + ' building together' : 'Build in a squad' }),
      el('p', { text: 'Teams of 3 to 5 who ship the weekly builds together and score as one.' }),
      list.length ? el('ol', { cls: 'live-rows' }, list.map(function(s){
        var seats = el('span', { cls: 'live-seats', 'aria-label': s.member_count + ' of 5 members' });
        for(var i = 0; i < 5; i++) seats.appendChild(el('i', { cls: i < s.member_count ? 'on' : '' }));
        return el('li', { cls: 'live-row' }, [
          el('span', { cls: 'live-rank', text: s.rank ? '#' + s.rank : '·' }),
          el('span', { cls: 'live-name', text: s.name }),
          seats
        ]);
      })) : null,
      safe(data.links && data.links.partner) ? el('a', { href: safe(data.links.partner), text: 'Find a build partner →' }) : null
    ]);
  }

  function renderStats(data){
    var s = data.stats || {};
    var node = document.getElementById('liveStats');
    if(!node) return;
    node.textContent = [
      s.builders && plural(s.builders, 'builder', 'builders'),
      s.builds_graded && plural(s.builds_graded, 'graded build', 'graded builds'),
      s.credentials && plural(s.credentials, 'verified credential', 'verified credentials'),
      s.squads && plural(s.squads, 'squad', 'squads')
    ].filter(Boolean).join(' · ');
  }

  fetch(url, { credentials: 'omit' })
    .then(function(r){ if(!r.ok) throw new Error(r.status); return r.json(); })
    .then(function(data){
      // Each part on its own, so one that trips leaves the others standing.
      [renderBuild, renderShowcase, renderLeaders, renderQuiz, renderSquads, renderStats].forEach(function(fn){
        try { fn(data); } catch(e){}
      });
      var live = document.getElementById('live');
      if(live) live.hidden = false;
    })
    .catch(function(){
      // The section stays hidden, so nothing should point at it.
      Array.prototype.forEach.call(document.querySelectorAll('a[href="#live"]'), function(a){ a.hidden = true; });
    });
})();
