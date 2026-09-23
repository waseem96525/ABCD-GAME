/* ============ ABC Champ — core app: state, map, routing, parents ============ */
window.Game = (function(){

  /* ---------------- state ---------------- */
  const KEY = 'abcChampProgress_v5'; // bumped for 15-level layout (Phonics)
  let S = null;
  let lastUnlock = 0;          /* timestamp of successful gate */
  let gateTimer = null;

  function defaultState(){
    return {
      stars: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0},
      unlocked: 1,
      plays: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0},
      acc: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0},
      last: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0},
      bestCPM: {12:0},
      bestWPM: {12:0},
      badges: [],
      settings: { lang:'en', sfx:true, music:true, voice:true, breakOn:true, breakMin:15 }
    };
  }
  function load(){
    try {
      const raw = localStorage.getItem(KEY);
      if (raw){
        const o = JSON.parse(raw);
        const d = defaultState();
        // migrate old saves to 15 levels
        for (let k of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]){
          if (o.stars && o.stars[k] == null) o.stars[k]=0;
          if (o.plays && o.plays[k] == null) o.plays[k]=0;
          if (o.acc && o.acc[k] == null) o.acc[k]=0;
          if (o.last && o.last[k] == null) o.last[k]=0;
        }
        S = Object.assign(d, o, { settings: Object.assign(defaultState().settings, o.settings || {}) });
        return;
      }
    } catch(e){}
    S = defaultState();
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

  /* ---------------- screen router ---------------- */
  const SCREENS = ['screen-home','screen-map','screen-level','screen-win','screen-dash'];
  let currentScreen = 'screen-home';
  function showScreen(name){
    if (currentScreen === 'level' && name !== 'level'){
      try{ Levels.cleanup(); }catch(_){}
      FX.stopSpeaking();
      hideMascot();
    }
    currentScreen = name;
    SCREENS.forEach(id => $id(id).classList.toggle('active', id === 'screen-' + name));
    if (name === 'map') renderMap();
    if (name === 'home') updateHomeStats();
  }

  /* ---------------- mascot feedback layer ---------------- */
  let mascotTimer = null;
  function showMascot(text, opts){
    opts = opts || {};
    const layer = $id('mascot-layer');
    const bubble = $id('mascot-bubble');
    bubble.textContent = text;
    layer.classList.remove('hide');
    if (opts.speak !== false) FX.speak(text, voiceLang());
    clearTimeout(mascotTimer);
    mascotTimer = setTimeout(hideMascot, opts.hold || 2000);
  }
  function hideMascot(){
    const layer = $id('mascot-layer');
    if (layer) layer.classList.add('hide');
    clearTimeout(mascotTimer);
  }

  /* ---------------- confetti ---------------- */
  function burst(x, y, colors){
    const layer = $id('confetti-layer');
    const palette = colors || ['#ffdd55','#ff7e6b','#5fd4a8','#8f7cf0','#4fc3f7'];
    for (let i=0;i<42;i++){
      const p = document.createElement('div');
      p.className = 'cnf';
      const size = 6 + Math.random()*10;
      p.style.width = size + 'px';
      p.style.height = (size*1.4) + 'px';
      p.style.background = palette[i % palette.length];
      p.style.left = (x - 10 + Math.random()*20) + 'px';
      p.style.transform = 'rotate(' + Math.floor(Math.random()*360) + 'deg)';
      const dur = 1.1 + Math.random()*1.3;
      p.style.animationDuration = dur + 's';
      p.style.animationDelay = (Math.random()*0.3) + 's';
      layer.appendChild(p);
      setTimeout(() => p.remove(), (dur + 0.5)*1000);
    }
  }
  function burstFromElement(el){
    if (!el) return;
    const r = el.getBoundingClientRect();
    burst(r.left + r.width/2, r.top + r.height/2);
  }

  /* ---------------- level header ---------------- */
  function setLevelHeader(n){
    const m = LEVELS_META[n-1];
    $id('level-title').textContent = m.icon + ' L' + n + ' \u00b7 ' + m.name;
    renderStarsMini(n);
  }
  function renderStarsMini(n){
    const cont = $id('level-stars');
    const got = S.stars[n] || 0;
    let h = '';
    for (let i=0;i<3;i++){
      h += '<span style="' + (i<got ? '' : 'filter:grayscale(1);opacity:.35') + '">⭐</span>';
    }
    cont.innerHTML = h;
  }

  /* ---------------- run / finish ---------------- */
  function runLevel(n){
    showScreen('level');
    Levels.runLevel(n, { hint: S.settings.devHint === true });
  }

  function starsFor(n, pct){
    if (n === 1) return 3;
    if (pct >= 0.85) return 3;
    if (pct >= 0.55) return 2;
    return 1;
  }

  function finishLevel(n, res){
    const stars = starsFor(n, res.pct);
    const prevStars = S.stars[n] || 0;
    S.stars[n] = Math.max(prevStars, stars);
    const pctBase = Math.round((res.pct||0)*100);
    S.acc[n] = Math.max(S.acc[n]||0, pctBase);
    S.plays[n] = (S.plays[n]||0) + 1;
    S.last[n] = Date.now();
    // turbo best speed
    if (n === 12 && res.cpm != null){
      S.bestCPM = S.bestCPM || {12:0};
      S.bestWPM = S.bestWPM || {12:0};
      if ((res.cpm||0) > (S.bestCPM[12]||0)) S.bestCPM[12] = res.cpm;
      if ((res.wpm||0) > (S.bestWPM[12]||0)) S.bestWPM[12] = res.wpm;
      try{ const lb = parseInt(localStorage.getItem('turboBestCPM')||'0'); if ((res.cpm||0) > lb) localStorage.setItem('turboBestCPM', String(res.cpm)); }catch(_){}
    }
    if (S.stars[n] > 0) S.unlocked = Math.max(S.unlocked, Math.min(15, n + 1));

    /* badges */
    const newBadges = [];
    if (S.stars[n] > 0 && S.badges.indexOf(n) === -1){
      S.badges.push(n); newBadges.push(n);
    }
    const allDone = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].every(k => S.stars[k] > 0);
    if (allDone && S.badges.indexOf('all') === -1){ S.badges.push('all'); newBadges.push('all'); }
    const allStars = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15].every(k => S.stars[k] >= 3);
    if (allStars && S.badges.indexOf('stars') === -1){ S.badges.push('stars'); newBadges.push('stars'); }

    save();
    renderStarsMini(n);
    updateHomeStats();
    showWin(n, stars, newBadges, prevStars !== stars, res);
  }

  function showWin(n, stars, newBadges, improved, res){
    FX.win();
    const cont = $id('win-stars');
    cont.innerHTML = '';
    for (let i=0;i<3;i++){
      const d = document.createElement('div');
      d.className = 'star-ico';
      d.textContent = '⭐';
      cont.appendChild(d);
      (function(dd, idx){
        window.setTimeout(() => {
          dd.classList.add('got');
          if (idx < stars) FX.starPop();
        }, 350 + idx*420);
      })(d, i);
    }
    $id('win-title').textContent = (n === 1 ? '✏️ ' : LEVELS_META[n-1].icon + ' ') + tt('levelWon');
    const badgeEl = $id('win-badge');
    if (newBadges.length){
      const b = BADGES.find(x => String(x.id) === String(newBadges[0]));
      badgeEl.innerHTML = '<span class="sticker">' + (b?b.icon:'🎉') + '</span> <span>' + tt('newBadge') + '<br>' + (b?b.name:'') + '</span>';
      badgeEl.classList.remove('hide');
    } else {
      badgeEl.classList.add('hide');
    }
    const bigBurst = () => burst(window.innerWidth/2, window.innerHeight*0.35);
    window.setTimeout(bigBurst, 300);
    window.setTimeout(bigBurst, 900);
    // turbo custom bubble with speed
    if (n === 12 && res && res.cpm != null){
      $id('win-bubble').innerHTML = '⚡ ' + res.cpm + ' CPM ('+res.wpm+' WPM) • '+res.correct+'/'+res.total+'<br><small style="font-size:12px;opacity:.9">Best: '+(S.bestCPM[12]||res.cpm)+' CPM</small>';
    } else {
      $id('win-bubble').textContent = n === 1 ? tt('allLetters') : (n === 2 ? tt('allLetters') : pickPraise());
    }
    const nextBtn = $id('btn-win-next');
    if (n >= 15){
      nextBtn.textContent = '🗺️ ' + (UI_LANG === 'hi' ? 'नक्शा' : UI_LANG === 'ur' ? 'نقشہ' : 'Map');
      nextBtn.onclick = () => showScreen('map');
    } else {
      nextBtn.textContent = (UI_LANG === 'hi' ? 'अगला ▶' : 'Next ▶');
      nextBtn.onclick = () => runLevel(n + 1);
    }
    currentWinLevel = n;
    showScreen('win');
  }

  /* ---------------- progress map ---------------- */
  const NODE_POS = [[30,4],[70,10],[30,17],[70,23],[30,30],[70,37],[30,44],[70,51],[30,58],[70,65],[30,72],[70,78],[30,84],[70,90],[48,97]];
  const WORLD_LABELS = [
    {y:7, text:'⌨️ World 1 — Type'},
    {y:21, text:'🧩 World 2 — Puzzle'},
    {y:35, text:'🔤 World 3 — Letters'},
    {y:49, text:'🎴 World 4 — Memory'},
    {y:63, text:'✨ World 5 — Words'},
    {y:76, text:'⚡ World 6 — Turbo'},
    {y:88, text:'🔢 World 7 — Numbers'},
    {y:96, text:'🎤 World 8 — Voice'}
  ];
  function renderMap(){
    const pathEl = $id('map-path');
    pathEl.innerHTML = '';
    const svg = $id('map-line');
    const pts = NODE_POS;
    const d = splinePath(pts);
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.innerHTML = '<path d="'+d+'" stroke="#ffffff" stroke-opacity="0.6" stroke-width="9" fill="none" stroke-linecap="round"/>' +
                    '<path d="'+d+'" stroke="#ffd35c" stroke-width="4" stroke-dasharray="3 5" fill="none" stroke-linecap="round"/>';
    // world labels
    WORLD_LABELS.forEach(w => {
      const lbl = document.createElement('div');
      lbl.className = 'world-label';
      lbl.style.top = w.y + '%';
      lbl.textContent = w.text;
      pathEl.appendChild(lbl);
    });
    pts.forEach((p, i) => {
      const node = document.createElement('div');
      node.className = 'node' + (i+1 <= S.unlocked ? '' : ' locked');
      node.style.left = p[0] + '%';
      node.style.top = p[1] + '%';
      const m = LEVELS_META[i];
      if (!m) return;
      const got = S.stars[i+1] || 0;
      const starsHtml = '<div class="node-stars">' +
        (i+1<=S.unlocked ? Array.from({length:3}, (_,k) => k<got ? '⭐' : '<span class="off">★</span>').join('') : '🔒') + '</div>';
      // island base
      const island = '<div class="island"></div>';
      node.innerHTML =
        '<div class="orb" style="background:linear-gradient(180deg,'+m.color+','+shade(m.color)+')">' +
        (i+1<=S.unlocked ? m.icon : '🔒') + '</div>' + island +
        '<div class="node-name">' + (i+1) + '. ' + m.name + '</div>' + starsHtml;
      if (i+1 <= S.unlocked && got === 0) node.innerHTML += '<div class="ping"></div>';
      node.onclick = () => {
        if (i+1 <= S.unlocked){
          FX.click();
          runLevel(i+1);
        } else {
          FX.wrong();
          showMascot(UI_LANG==='hi' ? 'पहले लेवल ' + i + ' पूरा करो!' : UI_LANG==='ur' ? 'پہلے لیول ' + i + ' مکمل کریں!' : 'Finish level ' + (i) + ' first!');
        }
      };
      pathEl.appendChild(node);
    });
  }

  function shade(hex){
    const n = parseInt(hex.slice(1), 16);
    const r = Math.max(0, (n>>16) - 40), g = Math.max(0, ((n>>8)&255) - 40), b = Math.max(0, (n&255) - 40);
    return '#' + ((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
  }

  function splinePath(pts){
    const d = ['M ' + pts[0][0] + ',' + pts[0][1]];
    for (let i=0;i<pts.length-1;i++){
      const p0 = pts[Math.max(0,i-1)], p1 = pts[i], p2 = pts[i+1], p3 = pts[Math.min(pts.length-1,i+2)];
      const c1x = p1[0] + (p2[0]-p0[0])/6, c1y = p1[1] + (p2[1]-p0[1])/6;
      const c2x = p2[0] - (p3[0]-p1[0])/6, c2y = p2[1] - (p3[1]-p1[1])/6;
      d.push('C ' + c1x + ',' + c1y + ' ' + c2x + ',' + c2y + ' ' + p2[0] + ',' + p2[1]);
    }
    return d.join(' ');
  }

  /* ---------------- parental gate ---------------- */
  function openGate(){
    if (Date.now() - lastUnlock < 10*60*1000){
      showSettings();
      return;
    }
    $id('gate-overlay').classList.remove('hide');
    const fill = $id('gate-fill');
    fill.style.width = '0';
    const star = $id('gate-hold');
    let t0 = 0;
    function down(){
      t0 = Date.now();
      gateTimer = setInterval(() => {
        const pct = Math.min(100, (Date.now()-t0)/1500*100);
        fill.style.width = pct + '%';
        if (pct >= 100){
          clearInterval(gateTimer);
          lastUnlock = Date.now();
          $id('gate-overlay').classList.add('hide');
          showSettings();
        }
      }, 30);
    }
    function up(){
      clearInterval(gateTimer);
      fill.style.width = '0';
    }
    star.onpointerdown = down;
    window.onpointerup = up;
    $id('gate-cancel').onclick = () => {
      window.onpointerup = null;
      $id('gate-overlay').classList.add('hide');
    };
  }

  /* ---------------- settings ---------------- */
  function applySettings(){
    const st = S.settings;
    FX.setSfx(st.sfx);
    FX.setMusic(st.music);
    FX.setVoice(st.voice);
    window.__voiceEnabled = st.voice;
    $id('set-sfx').checked = st.sfx;
    $id('set-music').checked = st.music;
    $id('set-voice').checked = st.voice;
    $id('set-break').checked = st.breakOn;
    document.querySelectorAll('.mini-toggle [data-min]').forEach(b => b.classList.toggle('active', Number(b.dataset.min) === st.breakMin));
  }
  function showSettings(){
    applySettings();
    $id('settings-modal').classList.remove('hide');
  }

  /* ---------------- dashboard ---------------- */
  function renderDash(){
    const cont = $id('dash-content');
    const totalStars = Object.values(S.stars).reduce((a,b)=>a+b,0);
    const doneLevels = Object.values(S.stars).filter(v=>v>0).length;
    const totalPlays = Object.values(S.plays).reduce((a,b)=>a+b,0);
    let html = '<div class="dash-hero"><div class="av">🦊</div><div><div style="font-weight:900; font-size:18px">Zippy & Friends</div><div style="font-size:13px; opacity:.9">'+doneLevels+'/15 levels • '+totalStars+'⭐ collected</div></div></div>';
    html += '<div class="stat-row">' +
      '<div class="stat-card" style="--accent:var(--sun)"><div class="num">' + totalStars + '⭐</div><div class="lbl">' + (UI_LANG==='hi'?'कुल सितारे':UI_LANG==='ur'?'کل ستارے':'Total stars') + '</div></div>' +
      '<div class="stat-card" style="--accent:var(--mint)"><div class="num">' + doneLevels + '/15</div><div class="lbl">' + (UI_LANG==='hi'?'लेवल पूरे':UI_LANG==='ur'?'مکمل لیول':'Levels done') + '</div></div>' +
      '<div class="stat-card" style="--accent:var(--grape)"><div class="num">' + totalPlays + '</div><div class="lbl">' + (UI_LANG==='hi'?'खेल':UI_LANG==='ur'?'کھیل':'Plays') + '</div></div>' +
      '</div>';
    html += '<div class="panel"><h3>🗺️ ' + (UI_LANG==='hi'?'हर लेवल':UI_LANG==='ur'?'ہر لیول':'Every level') + '</h3>';
    LEVELS_META.forEach((m,i) => {
      const n = i+1;
      const acc = S.acc[n]||0;
      const plays = S.plays[n]||0;
      const last = S.last[n] ? new Date(S.last[n]).toLocaleDateString() : '—';
      const st = S.stars[n]||0;
      let extra = '';
      if (n === 12 && S.bestCPM && S.bestCPM[12]){
        extra = '<div class="plays-note" style="color:var(--grape-deep)">⚡ Best: '+S.bestCPM[12]+' CPM • '+S.bestWPM[12]+' WPM</div>';
      }
      html += '<div class="level-row">' +
        '<div class="emo">' + m.icon + '</div>' +
        '<div class="nm">' + n + '. ' + m.name +
          '<div class="plays-note">' + (UI_LANG==='hi'?'खेल ':UI_LANG==='ur'?'کھیل ':'played ') + plays + 'x \u00b7 ' + last + '</div>'+extra+'</div>' +
        '<div class="bar"><i style="width:' + acc + '%"></i></div>' +
        '<div class="st">' + (st? '⭐'.repeat(st) : '☆☆☆') + '</div>' +
        '</div>';
    });
    html += '</div>';
    html += '<div class="panel"><h3>🏅 ' + (UI_LANG==='hi'?'स्टिकर':UI_LANG==='ur'?'اسٹیکرز':'Stickers') + '</h3><div class="badges-grid">';
    BADGES.forEach(b => {
      const owned = S.badges.indexOf(String(b.id)) !== -1 || S.badges.indexOf(b.id) !== -1;
      html += '<div class="sticker' + (owned?' owned':'') + '"><div class="ic">' + (owned?b.icon:'❓') + '</div>' + b.name + '</div>';
    });
    html += '</div></div>';
    html += '<p style="text-align:center;color:#8aa0bd;font-size:13px">ABC Champ \u00b7 Made for kids \u00b7 No ads \u00b7 Works offline \u00b7 COPPA-friendly</p>';
    html += "<p style=\"text-align:center; font-size:13px; font-weight:900; color:#3a2d5e; margin-top:10px; background:linear-gradient(180deg,#fff,#fff6cc); padding:8px 14px; border-radius:40px; border:1.5px solid #ffd35c; display:inline-block; width:100%;\">💖 THIS GAME IS MADE BY ZUNAISHA'S FATHER WASEEM 💖</p>";
    cont.innerHTML = html;
  }

  /* ---------------- win replay target ---------------- */
  let currentWinLevel = 1;

  /* ---------------- break reminder ---------------- */
  let activeSeconds = 0, breakTimer = null, breakCount = 0;
  function startBreakClock(){
    setInterval(() => {
      if (!S.settings.breakOn) { activeSeconds = 0; return; }
      if (document.hidden) return;
      if (currentScreen !== 'level'){ activeSeconds = 0; return; }
      if ($id('break-overlay').classList.contains('hide')) activeSeconds++;
      if (activeSeconds >= S.settings.breakMin*60){
        activeSeconds = 0;
        FX.stopSpeaking();
        $id('break-overlay').classList.remove('hide');
        breakCount = 15;
        $id('break-count').textContent = breakCount;
        clearInterval(breakTimer);
        breakTimer = setInterval(() => {
          breakCount--;
          $id('break-count').textContent = breakCount;
          if (breakCount <= 0) closeBreak();
        }, 1000);
      }
    }, 1000);
  }
  function closeBreak(){
    clearInterval(breakTimer);
    $id('break-overlay').classList.add('hide');
  }

  /* ---------------- language ---------------- */
  function setLang(lang){
    UI_LANG = lang;
    S.settings.lang = lang;
    save();
    updateLangUI();
  }
  function updateLangUI(){
    $id('home-bubble').textContent = tt('homeBubble');
    $id('home-tip').textContent = tt('tip');
    document.querySelectorAll('.lang-row .chip, .mini-toggle [data-lang]').forEach(c => c.classList.toggle('active', c.dataset.lang === UI_LANG));
  }

  /* ---------------- decor ---------------- */
  function renderDecor(){
    const el = $id('bg-decor');
    const colors = ['#fff','#ffd35c','#ff9eb0','#a7e8d0','#c7b6ff'];
    for (let i=0;i<14;i++){
      const s = document.createElement('span');
      const sz = 14 + Math.random()*34;
      s.style.width = s.style.height = sz + 'px';
      s.style.left = Math.random()*100 + '%';
      s.style.top = Math.random()*100 + '%';
      s.style.background = colors[i % colors.length];
      s.style.animationDelay = (Math.random()*8) + 's';
      s.style.animationDuration = (6 + Math.random()*8) + 's';
      el.appendChild(s);
    }
    for (let i=0;i<3;i++){
      const c = document.createElement('span');
      c.className = 'cloud';
      c.style.top = (8 + i*18) + '%';
      c.style.left = (-20 - i*10) + '%';
      c.style.width = (90 + Math.random()*40) + 'px';
      c.style.height = '28px';
      c.style.animationDelay = (i*6) + 's';
      c.style.animationDuration = (18 + i*6) + 's';
      el.appendChild(c);
    }
  }

  function updateHomeStats(){
    const totalStars = Object.values(S.stars).reduce((a,b)=>a+b,0);
    const done = Object.values(S.stars).filter(v=>v>0).length;
    const hs = $id('home-stars');
    const hl = $id('home-levels');
    if (hs) hs.textContent = totalStars + ' ⭐';
    if (hl) hl.textContent = done + '/15';
  }

  /* ---------------- boot ---------------- */
  function boot(){
    load();
    applySettings();
    setLang(S.settings.lang || 'en');
    renderDecor();
    startBreakClock();

    $id('btn-play').onclick = () => showScreen('map');
    $id('btn-map-home').onclick = () => showScreen('home');
    $id('btn-level-back').onclick = () => { FX.stopSpeaking(); hideMascot(); try{ Levels.cleanup(); }catch(_){} showScreen('map'); };
    $id('btn-win-replay').onclick = () => runLevel(currentWinLevel);
    $id('btn-dash-back').onclick = () => showScreen('home');
    $id('btn-home-settings').onclick = openGate;
    $id('btn-dash').onclick = () => { $id('settings-modal').classList.add('hide'); renderDash(); showScreen('dash'); };

    document.querySelectorAll('.lang-row .chip, .mini-toggle [data-lang]').forEach(c => c.addEventListener('click', () => setLang(c.dataset.lang)));

    $id('set-sfx').onchange = e => { S.settings.sfx = e.target.checked; applySettings(); save(); };
    $id('set-music').onchange = e => { S.settings.music = e.target.checked; applySettings(); save(); };
    $id('set-voice').onchange = e => { S.settings.voice = e.target.checked; applySettings(); save(); };
    $id('set-break').onchange = e => { S.settings.breakOn = e.target.checked; save(); };
    document.querySelectorAll('.mini-toggle [data-min]').forEach(b => b.addEventListener('click', () => {
      S.settings.breakMin = Number(b.dataset.min);
      applySettings(); save();
    }));
    $id('btn-break-now').onclick = closeBreak;
    $id('btn-settings-done').onclick = () => $id('settings-modal').classList.add('hide');

    /* reset progress (two-step) */
    let resetArmed = false, resetTimer = null;
    $id('btn-reset').onclick = () => {
      if (!resetArmed){
        resetArmed = true;
        $id('btn-reset').textContent = UI_LANG==='hi'?'फिर दबाओ':'Tap again!';
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => { resetArmed = false; $id('btn-reset').textContent = 'Reset'; }, 2500);
        return;
      }
      localStorage.removeItem(KEY);
      S = defaultState();
      save();
      applySettings();
      $id('settings-modal').classList.add('hide');
      showScreen('home');
    };

    /* unlock audio on first interaction */
    const unlock = () => {
      FX.unlock();
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('pointerdown', unlock);
    window.addEventListener('touchstart', unlock);

    showScreen('home');
  }

  document.addEventListener('DOMContentLoaded', boot);

  return {
    runLevel, finishLevel, setLevelHeader,
    showMascot, hideMascot, burst, burstFromElement,
    showScreen
  };
})();