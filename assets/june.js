/* =========================================================================
   June, the Automate Naija Q&A bot. Shared by every homepage template
   (index.html, canvas.html): each page carries June's markup (#juneLauncher,
   #junePanel, #juneBody, #juneSuggest, #juneForm, #juneInput, #juneClose)
   and its own styles; this file is the knowledge and the behaviour, so a
   price or an answer changes in one place.
   ========================================================================= */
/* Answers are matched locally against JUNE_KB below. To hook June up to a
   real AI model later, replace the body of getJuneAnswer() with a call to
   your API (e.g. fetch a backend endpoint), keeping the same signature:
   it receives the raw user text and must return the reply string. ---- */
(function(){
  var JUNE_KB = [
    { k: ['hi','hello','hey','good morning','good afternoon','good evening','yo'],
      a: "Hey, I'm June 👋 I can answer questions about Automate Naija: pricing, the Learn and Automate tracks, the community, challenges, credentials and opportunities. What do you want to know?" },
    { k: ['what is automate naija','about automate naija','what do you do','what is this','who are you','your name','what are you'],
      a: "Automate Naija is a hub for AI & automation builders in Nigeria. It's where you learn practical automation skills, build real projects in the Automation Arena, collaborate with other builders, and build a portfolio that proves what you can do." },
    { k: ['price','pricing','cost','how much','fee','fees'],
      a: "Pricing is simple:\n• Learn: ₦10,000, paid once, and the course is yours to keep\n• Automate: starts from ₦8,000, and there's a limited-time discount open for the first 100 subscribers:\n   – Beginner: ₦8,000 → ₦5,000\n   – Intermediate: ₦12,000 → ₦8,000\n   – Expert: ₦20,000 → ₦10,000\n• Optional hosted n8n instance: ₦3,000/month\nThe community itself is completely free to join." },
    { k: ['free','community free','is it free','cost to join'],
      a: "Yes, joining the community is 100% free. You only pay for a course: Learn is a one-time ₦10,000, and the Automate build track starts from ₦8,000, with the first 100 subscribers paying as little as ₦5,000." },
    { k: ['learn','learn track','learn program','course','syllabus','curriculum','when does learn','no experience','no code','never coded','new to this'],
      a: "Learn AI Automation is open now: 13 weeks for complete beginners, covering Zapier, Make and n8n one tool at a time, then APIs, payments, AI and building for clients, ending in a capstone for a real business. Every class has notes, resources and a practice task, plus live classes with your cohort. It's ₦10,000, paid once, and it's yours to keep. Sign up and open Learn in the app to see the full outline before you pay." },
    { k: ['automate track','automate program','6-week','6 week','already know'],
      a: "The Automate track is a 6-week build cycle with three levels, starting from ₦8,000: Beginner, Intermediate and Expert. You get Automation Arena challenges, a portfolio, verified credentials, a squad to build with, and a place on the weekly leaderboard. Right now the first 100 subscribers get Beginner at ₦5,000, Intermediate at ₦8,000 and Expert at ₦10,000." },
    { k: ['discount','promo','offer','first 100','limited time','deal','cheaper','level','levels','tier','beginner','intermediate','expert'],
      a: "There's a limited-time discount open for the first 100 subscribers on the Automate track:\n• Beginner: ₦8,000 → ₦5,000\n• Intermediate: ₦12,000 → ₦8,000\n• Expert: ₦20,000 → ₦10,000\nOnce the 100 spots are gone, prices go back to normal." },
    { k: ['coding experience','need to code','need coding','experience','complete beginner','from scratch','starting out'],
      a: "No coding experience needed. The Automate track has a Beginner level built for people starting out at ₦5,000 for the first 100 subscribers (normally ₦8,000), plus Intermediate and Expert levels for people who already know a tool like n8n or Make. Or start from zero with Learn: 13 weeks, ₦10,000 paid once." },
    { k: ['tool','tools','tech stack','stack','what will i learn','n8n','make.com','whatsapp api','openai','supabase'],
      a: "You'll work with real automation tools: n8n, WhatsApp APIs, OpenAI, Supabase and Make, all taught through actual builds, not isolated tutorials." },
    { k: ['job','jobs','paid work','hire','hiring','opportunit','freelance','money','income','get paid'],
      a: "We don't run a job board, so I won't promise you postings. What you get is proof that wins work: every graded build lands on your public portfolio and can become a verified credential that a client or employer checks for themselves, with your score and the real work behind it. The WhatsApp community is where builders find collaborators." },
    { k: ['arena','challenge','compete','competition'],
      a: "The Automation Arena is where you ship real builds for real businesses. New builds drop every week at three levels, in n8n, Make and Zapier. Each one is graded, earns stacks and counts towards the leaderboard. This week's builds are on this page, in the Arena section." },
    { k: ['credential','certificate','proof','badge'],
      a: "Every graded Arena challenge can become a Verifiable Builder Credential, tied to a real graded submission, shareable on LinkedIn or your portfolio, showing your score, the tools used and the actual work behind it." },
    { k: ['tutor','instructor','teach','who teaches','mentor'],
      a: "Your tutors are working builders, not just lecturers: Oginni Oluwafemi (n8n & AI Agents), Oluwabunmi Josephine (Automation & Integrations), Abdulhafeez Adebayo (Client Work & Deployment), Ogechukwu Okochukwu (Automations & Integrations) and Linda Okike (Backend & Automations)." },
    { k: ['whatsapp','discord','community chat','join community','group'],
      a: "Join the free Automate Naija WhatsApp community: it's the fastest way to get help, find collaborators and hear about new challenges first. You'll find the link in the Community section of this page." },
    { k: ['sign up','signup','register','join','login','log in','how do i start','get started'],
      a: "Head to the Pricing section and pick your Automate level (Beginner, Intermediate or Expert) to get started. 'Login/SignUp' at the top of the page takes you straight to the app to create your account. For Learn, sign up and open Learn in the app: you'll see the whole outline, and one ₦10,000 payment unlocks it. Already have an account? Use the 'Log in' button in the nav." },
    { k: ['hosted n8n','hosting','instance'],
      a: "An optional hosted n8n instance is available for ₦3,000/month, and the first 30 days are free. Full details at https://app.automatenaija.com/n8n — you'll need a free Automate Naija account, because the workspace is set up for a specific person." },
    { k: ['contact','support','help','reach you','email'],
      a: "Best way to reach the team is through the Automate Naija WhatsApp community: someone will point you in the right direction fast." },
    { k: ['thank','thanks','thank you','appreciate'],
      a: "Anytime! If anything else comes to mind, just ask." },
    { k: ['bye','goodbye','see you'],
      a: "Catch you later, happy building! 👋" }
  ];

  var JUNE_FALLBACK = "I don't have a direct answer for that yet. I'm running on a fixed script for now, but I'll soon be upgraded with full AI so I can answer absolutely anything. In the meantime, try asking about pricing, the Learn/Automate tracks, the Arena, credentials, tutors or opportunities.";

  var JUNE_SUGGESTIONS = [
    "What's the pricing?",
    "Is there a discount?",
    "Do I need coding experience?",
    "Can I find paid work here?",
    "What tools will I learn?"
  ];

  function normalize(s){
    return (s || '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  function getJuneAnswer(rawText){
    var text = normalize(rawText);
    if(!text) return "Ask me anything about Automate Naija: pricing, tracks, the Arena, community or opportunities.";
    var best = null, bestScore = 0;
    for(var i = 0; i < JUNE_KB.length; i++){
      var entry = JUNE_KB[i];
      var score = 0;
      for(var j = 0; j < entry.k.length; j++){
        if(text.indexOf(entry.k[j]) !== -1) score += entry.k[j].length;
      }
      if(score > bestScore){ bestScore = score; best = entry; }
    }
    return best ? best.a : JUNE_FALLBACK;
  }

  var launcher = document.getElementById('juneLauncher');
  var panel = document.getElementById('junePanel');
  var closeBtn = document.getElementById('juneClose');
  var body = document.getElementById('juneBody');
  var suggestWrap = document.getElementById('juneSuggest');
  var form = document.getElementById('juneForm');
  var input = document.getElementById('juneInput');
  if(!launcher || !panel || !form || !input || !body) return;

  function scrollToBottom(){ body.scrollTop = body.scrollHeight; }

  function addMessage(text, who){
    var el = document.createElement('div');
    el.className = 'june-msg ' + who;
    el.textContent = text;
    body.appendChild(el);
    scrollToBottom();
  }

  function renderSuggestions(){
    suggestWrap.innerHTML = '';
    JUNE_SUGGESTIONS.forEach(function(q){
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'june-chip';
      chip.textContent = q;
      chip.addEventListener('click', function(){ sendMessage(q); });
      suggestWrap.appendChild(chip);
    });
  }

  function sendMessage(text){
    text = (text || '').trim();
    if(!text) return;
    addMessage(text, 'user');
    input.value = '';

    var typing = document.createElement('div');
    typing.className = 'june-typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    body.appendChild(typing);
    scrollToBottom();

    var delay = 380 + Math.random() * 420;
    setTimeout(function(){
      typing.remove();
      addMessage(getJuneAnswer(text), 'bot');
    }, delay);
  }

  var started = false;
  function openPanel(){
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    launcher.classList.add('hide');
    if(!started){
      started = true;
      addMessage("Hi, I'm June! I'm Automate Naija's assistant: ask me about pricing, the Learn/Automate tracks, the Arena, credentials, tutors or opportunities.", 'bot');
      renderSuggestions();
    }
    setTimeout(function(){ input.focus(); }, 50);
  }
  function closePanel(){
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    launcher.classList.remove('hide');
  }

  launcher.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  form.addEventListener('submit', function(e){
    e.preventDefault();
    sendMessage(input.value);
  });
})();
