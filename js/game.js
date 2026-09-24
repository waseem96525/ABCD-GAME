/* ============ ABC Champ — core app: state, map, routing, parents ============ */
window.Game = (function(){

  /* ---------------- state ---------------- */
  const KEY = 'abcChampProgress_v6'; // bumped for 17-level layout (Math)
  let S = null;
  let lastUnlock = 0;          /* timestamp of successful gate */
  let gateTimer = null;

  function defaultState(){
    return {
      stars: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0},
      unlocked: 1,
      plays: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0},
      last: {1:0,2:0,3:0,4:0,5:0,6:0,7:0,8:0,9:0,10:0,11:0,12:0,13:0,14:0,15:0,16:0,17:0},
      bestCPM: {12:0},
      bestWPM: {12:0},
      streak: 0,
      bestStreak: 0,
      lastStreakDate: null,
      coins: 0,
      lastDailyReward: null,
      shopOwned: [],
      shopEquipped: null,
      avatar: { body:'#f6a53c', cheek:'#ff9f9f', hatColor:'#ffd35c' },
      seenStories: [],
      badges: [],
      settings: { lang:'en', sfx:true, music:true, voice:true, breakOn:true, breakMin:15, seasonAuto:true }
    };
  }
  function load(){
    try {
      const raw = localStorage.getItem(KEY);
      if (raw){
        const o = JSON.parse(raw);
        const d = defaultState();
        // migrate old saves to 17 levels
        for (let k of [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17]){
          if (o.stars && o.stars[k] == null) o.stars[k]=0;
          if (o.plays && o.plays[k] == null) o.plays[k]=0;
          if (o.acc && o.acc[k] == null) o.acc[k]=0;
          if (o.last && o.last[k] == null) o.last[k]=0;
        }
        S = Object.assign(d, o, { settings: Object.assign(defaultState().settings, o.settings || {}) });
        // avatar migration
        if(!S.avatar) S.avatar = Object.assign({}, d.avatar);
        else S.avatar = Object.assign({}, d.avatar, S.avatar);
        return;
      }
    } catch(e){}
    S = defaultState();
  }
  function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }

  /* ---------------- secret unlock (hidden for owner) ---------------- */
  const _S_B64 = "V0FTRUVNOTY1MjU="; // -> WASEEM96525
  const _S2_B64 = "WlVOQUlTSEE3ODY="; // -> ZUNAISHA786
  function _dec(b){ try{ return atob(b); }catch(_){ return b; } }
  function unlockAllSilent(){
    if(!S) load();
    S.unlocked = 17;
    save();
    try{ renderMap(); }catch(_){}
    try{ updateHomeStats(); }catch(_){}
  }
  function trySecret(code){
    if(!code) return false;
    const c = String(code).trim().toLowerCase();
    const s1 = _dec(_S_B64).toLowerCase();
    const s2 = _dec(_S2_B64).toLowerCase();
    if(c === s1 || c === s2){
      unlockAllSilent();
      try{ FX.correct && FX.correct(); }catch(_){}
      burst(window.innerWidth/2, window.innerHeight*0.35);
      showMascot("All levels unlocked! \uD83D\uDD13 17/17", {hold: 3000, speak:false});
      setTimeout(()=> showScreen('map'), 700);
      return true;
    }
    return false;
  }
  function ensureSecretOverlay(){
    if($id('secret-overlay')) return $id('secret-overlay');
    const ov = document.createElement('div');
    ov.id = 'secret-overlay';
    ov.className = 'overlay hide';
    ov.innerHTML = '<div class="gate-card" style="max-width:360px">'
      + '<div style="font-weight:900; font-size:18px; margin-bottom:6px">\uD83D\uDD13 Secret Unlock</div>'
      + '<div style="font-size:13px; font-weight:700; color:var(--ink-2); margin-bottom:10px">Enter owner code to unlock all 17 levels</div>'
      + '<input id="secret-input" placeholder="Enter secret code" autocomplete="off" spellcheck="false" style="width:100%; padding:12px 14px; border-radius:14px; border:1.5px solid #dfe8f5; font-size:16px; font-weight:800; text-align:center; letter-spacing:.5px; outline:none;">'
      + '<div id="secret-msg" style="min-height:18px; font-size:12px; font-weight:800; margin-top:8px; color:var(--coral-deep)"></div>'
      + '<div style="display:flex; gap:8px; justify-content:center; margin-top:10px"><button id="secret-ok" class="btn btn-primary tiny">Unlock</button><button id="secret-cancel" class="btn tiny">Cancel</button></div>'
      + '</div>';
    document.body.appendChild(ov);
    $id('secret-cancel').onclick = ()=> ov.classList.add('hide');
    ov.addEventListener('click', (e)=>{ if(e.target===ov) ov.classList.add('hide'); });
    const doTry = ()=>{
      const v = $id('secret-input').value;
      if(trySecret(v)){
        $id('secret-msg').style.color = '#0e9a7a';
        $id('secret-msg').textContent = '\u2713 Unlocked! Opening map...';
        setTimeout(()=> ov.classList.add('hide'), 900);
      } else {
        $id('secret-msg').style.color = 'var(--coral-deep)';
        $id('secret-msg').textContent = 'Wrong code. Try again.';
        try{ FX.wrong && FX.wrong(); }catch(_){}
      }
    };
    $id('secret-ok').onclick = doTry;
    $id('secret-input').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doTry(); if(e.key==='Escape') ov.classList.add('hide'); });
    return ov;
  }
  function showSecretPrompt(){
    const ov = ensureSecretOverlay();
    ov.classList.remove('hide');
    const inp = $id('secret-input');
    const msg = $id('secret-msg');
    if(inp) { inp.value=''; inp.focus(); }
    if(msg) msg.textContent='';
  }
  function initSecretTriggers(){
    // 1) Tap logo 5 times quickly
    let taps=0, tmr=null;
    const logo = document.querySelector('.logo');
    if(logo){
      logo.style.cursor='pointer';
      logo.title='Tap 5x for owner unlock';
      logo.addEventListener('click', ()=>{
        taps++;
        clearTimeout(tmr);
        tmr = setTimeout(()=> taps=0, 2000);
        if(taps>=5){ taps=0; showSecretPrompt(); }
      });
    }
    // 2) Keyboard: Ctrl+Shift+U or type secret quickly
    let buf='';
    window.addEventListener('keydown', (e)=>{
      if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==='u'){ e.preventDefault(); showSecretPrompt(); return; }
      if(e.key.length===1 && !e.ctrlKey && !e.metaKey){
        buf = (buf + e.key.toLowerCase()).slice(-24);
        const s1 = _dec(_S_B64).toLowerCase();
        const s2 = _dec(_S2_B64).toLowerCase();
        if(buf.includes(s1) || buf.includes(s2)){ buf=''; trySecret(s1); }
      }
    });
    // 3) Console / manual: window.unlockABC("code")
    window.unlockABC = trySecret;
    window.showSecretUnlock = showSecretPrompt;
  }

  /* ---------------- Pet Evolution — Zippy grows with stars ---------------- */
  const PET_STAGES = [
    {name:'Baby Zippy', emoji:'🐣', min:0, max:7, scale:0.88, aura:''},
    {name:'Little Zippy', emoji:'🎒', min:8, max:17, scale:0.97, aura:''},
    {name:'Super Zippy', emoji:'🚀', min:18, max:30, scale:1.06, aura:'0 6px 18px rgba(255,211,92,.45)'},
    {name:'Hero Zippy', emoji:'🦸', min:31, max:44, scale:1.13, aura:'0 8px 22px rgba(143,124,240,.45), 0 0 18px rgba(255,211,92,.35)'},
    {name:'Champion Zippy', emoji:'👑', min:45, max:51, scale:1.20, aura:'0 10px 28px rgba(255,107,107,.35), 0 0 22px rgba(255,211,92,.55)'}
  ];
  function getPetStage(total){
    for(let s of PET_STAGES) if(total>=s.min && total<=s.max) return s;
    return PET_STAGES[PET_STAGES.length-1];
  }
  function petReact(type){
    document.querySelectorAll('.fox-img').forEach(el=>{
      el.classList.remove('react-correct','react-wrong');
      void el.offsetWidth;
      el.classList.add(type==='correct'?'react-correct':'react-wrong');
      setTimeout(()=> el.classList.remove('react-correct','react-wrong'), 700);
    });
    // also bounce mascot layer fox
    const ml=$id('mascot-layer');
    if(ml && !ml.classList.contains('hide')){
      ml.animate && ml.animate([{transform:'translateX(-50%) scale(1)'},{transform:'translateX(-50%) scale(1.08)'},{transform:'translateX(-50%) scale(1)'}],{duration:520, easing:'cubic-bezier(.2,1.5,.4,1)'});
    }
  }
  function applyPetEvolution(){
    const total = Object.values(S.stars||{}).reduce((a,b)=>a+b,0);
    const st = getPetStage(total);
    const next = PET_STAGES.find(s=>s.min>total) || st;
    const pct = st.max===st.min ? 100 : Math.round((total - st.min) / Math.max(1, (next.max - next.min || st.max - st.min +1)) *100);
    // scale all foxes
    document.querySelectorAll('.mascot-home .fox-img, #mascot-layer .fox-img').forEach(el=>{
      el.style.transform = 'scale('+st.scale+')';
      el.style.filter = st.aura ? 'drop-shadow('+st.aura+') drop-shadow(0 12px 18px rgba(0,0,0,.18))' : 'drop-shadow(0 12px 18px rgba(0,0,0,.18))';
      el.style.transition='transform .5s cubic-bezier(.2,1.4,.4,1), filter .4s';
    });
    // update badge on home
    let badge=$id('evo-badge');
    if(!badge){
      const homeStage=document.querySelector('.home-stage');
      if(homeStage){
        badge=document.createElement('div');
        badge.id='evo-badge';
        badge.className='evo-badge';
        homeStage.insertBefore(badge, homeStage.querySelector('.home-stats'));
      }
    }
    if(badge){
      const toNext = next.min - total;
      const need = Math.max(0, toNext);
      badge.innerHTML='<span class="evo-icon">'+st.emoji+'</span><span>'+st.name+' • '+total+'⭐</span><span class="evo-bar"><i style="width:'+Math.min(100, Math.round(total/51*100))+'%"></i></span>'+(total<51?'<span style="font-size:10px; opacity:.7;">'+need+'⭐ to '+next.name+'</span>':'<span style="font-size:10px;">MAX</span>');
    }
    // also update shop preview aura
    const shopFox=document.querySelector('#shop-hat-preview')?.parentElement?.querySelector('.fox-img') || document.querySelector('.shop-preview .fox-img');
    if(shopFox){ shopFox.style.transform='scale('+st.scale+')'; }
    return st;
  }

  /* ---------------- Seasonal Worlds / Skins ---------------- */
  function getSeasonalTheme(){
    const d=new Date();
    const m=d.getMonth(), day=d.getDate();
    // Eid al-Fitr ~ Mar 20 and Eid al-Adha ~ May 27 in 2026 — widen window
    const isEid = (m===2 && day>=18 && day<=24) || (m===4 && day>=25 && day<=30) || (m===1 && day>=10 && day<=22);
    const isHalloween = (m===9);
    const isWinter = (m===11);
    const isDesert = (m===5 || m===6 || m===7);
    if(isEid) return {id:'eid', name:'Eid Mubarak', emoji:'🌙', cls:'theme-eid'};
    if(isHalloween) return {id:'halloween', name:'Spooky', emoji:'🎃', cls:'theme-halloween'};
    if(isWinter) return {id:'winter', name:'Winter', emoji:'❄️', cls:'theme-winter'};
    if(isDesert) return {id:'desert', name:'Desert', emoji:'🏜️', cls:'theme-desert'};
    return {id:'default', name:'Sunny', emoji:'☀️', cls:''};
  }
  function applySeasonalTheme(){
    const t=getSeasonalTheme();
    document.body.classList.remove('theme-eid','theme-halloween','theme-desert','theme-winter');
    if(t.cls) document.body.classList.add(t.cls);
    // badge on home
    let sb=$id('season-badge');
    if(!sb){
      const top=document.querySelector('.home-stage');
      if(top){
        sb=document.createElement('div');
        sb.id='season-badge';
        sb.className='season-badge';
        top.appendChild(sb);
      }
    }
    if(sb){
      if(t.id==='default'){ sb.style.display='none'; }
      else { sb.style.display='inline-flex'; sb.textContent=t.emoji+' '+t.name+' Theme'; }
    }
    // update world-labels tint if map visible
    try{ renderDecor(); }catch(_){}
    return t;
  }

  /* ---------------- Custom Avatar ---------------- */
  const AVATAR_COLORS = ['#f6a53c','#8d6e63','#ffcc80','#a0826d','#ffd1dc','#a7e8d0','#7fb2ff','#c7b6ff','#ff6b6b','#3a2d5e'];
  function applyAvatar(){
    S.avatar = S.avatar || { body:'#f6a53c', cheek:'#ff9f9f' };
    const body=S.avatar.body||'#f6a53c';
    const cheek=S.avatar.cheek||'#ff9f9f';
    // derive darker for ears outline
    function shade(hex, amt){
      try{
        const n=parseInt(hex.slice(1),16);
        const r=Math.max(0, Math.min(255, (n>>16)+amt));
        const g=Math.max(0, Math.min(255, ((n>>8)&255)+amt));
        const b=Math.max(0, Math.min(255, (n&255)+amt));
        return '#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
      }catch(_){ return hex; }
    }
    const dark=shade(body, -38);
    const light=shade(body, 38);
    const sym=document.getElementById('fox');
    if(sym){
      const paths=sym.querySelectorAll('path, circle, ellipse');
      // structure: [0] ear outer dark, [1] ear main body, [2] ear inner light, [3] ear inner light, [4] head circle body, [5] snout white, ...
      if(paths[0]) paths[0].setAttribute('fill', dark);
      if(paths[1]) paths[1].setAttribute('fill', body);
      if(paths[4]) paths[4].setAttribute('fill', body);
      // cheeks
      const cheeks=sym.querySelectorAll('circle[opacity]');
      cheeks.forEach(c=> c.setAttribute('fill', cheek));
      // whisker strokes
      const whiskers=sym.querySelectorAll('path[stroke]');
      whiskers.forEach(w=> w.setAttribute('stroke', dark));
    }
  }
  function setAvatarColor(hex, cheek){
    S.avatar = S.avatar || {};
    S.avatar.body=hex;
    if(cheek) S.avatar.cheek=cheek;
    save();
    applyAvatar();
    try{ renderShop(); }catch(_){}
    try{ updateShopFox(); }catch(_){}
    FX.click&&FX.click();
  }

  /* ---------------- streak & coins ---------------- */
  function todayStr(){ return new Date().toISOString().slice(0,10); }
  function updateStreak(){
    const today = todayStr();
    if (S.lastStreakDate === today) return S.streak;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
    if (S.lastStreakDate === yesterday){
      S.streak = (S.streak||0) + 1;
    } else if (!S.lastStreakDate){
      S.streak = 1;
    } else {
      // gap >1 day
      const diff = Math.floor((new Date(today) - new Date(S.lastStreakDate))/86400000);
      if (diff === 1) S.streak = (S.streak||0)+1;
      else if (diff > 1) S.streak = 1;
    }
    S.lastStreakDate = today;
    S.bestStreak = Math.max(S.bestStreak||0, S.streak);
    // streak bonus coins
    let bonus = 0;
    if (S.streak === 3) bonus = 20;
    else if (S.streak === 7) bonus = 50;
    else if (S.streak % 7 === 0 && S.streak > 0) bonus = 30;
    if (bonus) S.coins = (S.coins||0) + bonus;
    save();
    return S.streak;
  }
  function addCoinsForStars(stars){
    const add = stars === 3 ? 10 : stars === 2 ? 5 : 2;
    S.coins = (S.coins||0) + add;
    save();
    return add;
  }
  function canClaimDaily(){
    const today = todayStr();
    return S.lastDailyReward !== today;
  }
  function claimDaily(){
    if (!canClaimDaily()) return 0;
    const reward = 10 + (S.streak >= 3 ? 10 : 0) + (S.streak >= 7 ? 20 : 0);
    S.coins = (S.coins||0) + reward;
    S.lastDailyReward = todayStr();
    save();
    return reward;
  }

  /* ---------------- screen router ---------------- */
  const SCREENS = ['screen-home','screen-map','screen-level','screen-win','screen-dash','screen-shop','screen-story','screen-draw'];
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

  /* ---------------- story ---------------- */
  const STORY_BY_LEVEL = {1:1, 3:2, 6:3, 9:4, 10:5, 12:6, 13:7, 15:8, 16:9};
  function showStory(worldNum, onDone){
    const story = STORIES.find(s => s.world === worldNum);
    if (!story) { onDone(); return; }
    const lang = I18N[UI_LANG] ? UI_LANG : 'en';
    const data = story[lang] || story.en;
    const iconEl = $id('story-icon');
    const titleEl = $id('story-title');
    const textEl = $id('story-text');
    const btn = $id('btn-story-next');
    if (iconEl){ iconEl.textContent = story.icon; iconEl.style.background = 'linear-gradient(180deg,'+story.color+','+shade(story.color)+')'; }
    if (titleEl) titleEl.textContent = data.title;
    if (textEl) textEl.textContent = data.text;
    if (btn){
      btn.textContent = (UI_LANG === 'hi' ? 'शुरू करो →' : UI_LANG === 'ur' ? 'شروع کریں →' : 'Start →');
      btn.onclick = () => { S.seenStories = S.seenStories || []; if (!S.seenStories.includes(worldNum)){ S.seenStories.push(worldNum); save(); } showScreen('level'); onDone(); };
    }
    showScreen('story');
    if (story.en) FX.speak(data.title + '. ' + data.text, voiceLang());
  }

  /* ---------------- run / finish ---------------- */
  function runLevel(n){
    const world = STORY_BY_LEVEL[n];
    if (world && !(S.seenStories||[]).includes(world)){
      showStory(world, () => Levels.runLevel(n, { hint: S.settings.devHint === true }));
      return;
    }
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
    // streak + coins
    updateStreak();
    const gained = addCoinsForStars(stars);
    // attach to res for win screen
    res.coinsGained = gained;
    res.streak = S.streak;
    if (S.stars[n] > 0) S.unlocked = Math.max(S.unlocked, Math.min(17, n + 1));

    /* badges */
    const newBadges = [];
    if (S.stars[n] > 0 && S.badges.indexOf(n) === -1){
      S.badges.push(n); newBadges.push(n);
    }
    const allDone = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].every(k => S.stars[k] > 0);
    if (allDone && S.badges.indexOf('all') === -1){ S.badges.push('all'); newBadges.push('all'); }
    const allStars = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].every(k => S.stars[k] >= 3);
    if (allStars && S.badges.indexOf('stars') === -1){ S.badges.push('stars'); newBadges.push('stars'); }

    const _evoBefore = getPetStage(Object.values(Object.assign({}, S.stars, {[n]:prevStars})).reduce((a,b)=>a+b,0));
    save();
    renderStarsMini(n);
    updateHomeStats();
    try{
      const _evoAfter = applyPetEvolution();
      if(_evoAfter.name !== _evoBefore.name){
        // evolution milestone — extra celebration
        setTimeout(()=>{ burst(window.innerWidth/2, window.innerHeight*0.4, ['#ffd35c','#ff6b9d','#8f7cf0']); FX.correct && FX.correct(); showMascot(_evoAfter.emoji+' Evolved to '+_evoAfter.name+'! \uD83C\uDF89', {hold:3000, speak:false}); }, 650);
      }
    }catch(_){}
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
    // win bubble with speed / coins / streak
    if (n === 12 && res && res.cpm != null){
      $id('win-bubble').innerHTML = '⚡ ' + res.cpm + ' CPM ('+res.wpm+' WPM) • '+res.correct+'/'+res.total+'<br><small style="font-size:12px;opacity:.9">Best: '+(S.bestCPM[12]||res.cpm)+' CPM • +'+(res.coinsGained||0)+' 🪙 • '+S.streak+' 🔥</small>';
    } else {
      const base = n === 1 ? tt('allLetters') : (n === 2 ? tt('allLetters') : pickPraise());
      const extra = res && res.coinsGained ? '<br><small style="font-size:12px;opacity:.9">+'+res.coinsGained+' 🪙 • '+S.streak+' 🔥 streak</small>' : '';
      $id('win-bubble').innerHTML = base + extra;
    }
    const nextBtn = $id('btn-win-next');
    if (n >= 17){
      nextBtn.textContent = '🗺️ ' + (UI_LANG === 'hi' ? 'नक्शा' : UI_LANG === 'ur' ? 'نقشہ' : 'Map');
      nextBtn.onclick = () => showScreen('map');
    } else {
      nextBtn.textContent = (UI_LANG === 'hi' ? 'अगला ▶' : UI_LANG === 'ur' ? 'اگلا ▶' : 'Next ▶');
      nextBtn.onclick = () => runLevel(n + 1);
    }
    currentWinLevel = n;
    showScreen('win');
  }

  /* ---------------- progress map ---------------- */
  const NODE_POS = [[30,4],[70,10],[30,16],[70,22],[30,28],[70,35],[30,42],[70,49],[30,56],[70,63],[30,70],[70,76],[30,82],[70,88],[30,92],[70,95],[48,98]];
  const WORLD_LABELS = [
    {y:6, text:'⌨️ World 1 — Type'},
    {y:20, text:'🧩 World 2 — Puzzle'},
    {y:34, text:'🔤 World 3 — Letters'},
    {y:48, text:'🎴 World 4 — Memory'},
    {y:62, text:'✨ World 5 — Words'},
    {y:74, text:'⚡ World 6 — Turbo'},
    {y:86, text:'🔢 World 7 — Numbers'},
    {y:94, text:'🎤 World 8 — Voice'},
    {y:98, text:'➕ World 9 — Math'}
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
    let html = '<div class="dash-hero"><div class="av">🦊</div><div><div style="font-weight:900; font-size:18px">Zippy & Friends</div><div style="font-size:13px; opacity:.9">'+doneLevels+'/17 levels • '+totalStars+'⭐ collected</div></div></div>';
    html += '<div class="stat-row">' +
      '<div class="stat-card" style="--accent:var(--sun)"><div class="num">' + totalStars + '⭐</div><div class="lbl">' + (UI_LANG==='hi'?'कुल सितारे':UI_LANG==='ur'?'کل ستارے':'Total stars') + '</div></div>' +
      '<div class="stat-card" style="--accent:var(--mint)"><div class="num">' + doneLevels + '/17</div><div class="lbl">' + (UI_LANG==='hi'?'लेवल पूरे':UI_LANG==='ur'?'مکمل لیول':'Levels done') + '</div></div>' +
      '<div class="stat-card" style="--accent:var(--grape)"><div class="num">' + totalPlays + '</div><div class="lbl">' + (UI_LANG==='hi'?'खेल':UI_LANG==='ur'?'کھیل':'Plays') + '</div></div>' +
      '</div>';
    html += '<div class="panel" style="background:linear-gradient(135deg,#fff,#fff6cc); border:1.5px solid #ffd35c;"><h3>🔥 ' + tt('streakTitle') + ' & 🪙</h3><div style="display:flex; gap:14px; align-items:center; flex-wrap:wrap;"><div style="font-size:32px; font-weight:900;">'+(S.streak||0)+' 🔥</div><div style="font-size:13px; font-weight:800; color:var(--ink-2); line-height:1.4;">Best: '+(S.bestStreak||0)+' • '+(S.coins||0)+' 🪙<br><small>'+(canClaimDaily() ? tt('dailyReward')+' +' + (10 + (S.streak>=3?10:0) + (S.streak>=7?20:0)) + ' 🪙 — ' + tt('streakKeep') : tt('streakKeep'))+'</small></div><button class="btn tiny" onclick="try{ const r=claimDaily(); if(r){ FX.correct(); burst(window.innerWidth/2, window.innerHeight*0.4); renderDash(); } }catch(_){}" style="margin-left:auto;">'+ (canClaimDaily() ? '🎁 '+tt('dailyReward') : '✓') +'</button></div></div>';
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

  /* ---------------- shop ---------------- */
  function renderShop(){
    const cont = $id('shop-content');
    if (!cont) return;
    S.shopOwned = S.shopOwned || [];
    S.avatar = S.avatar || { body:'#f6a53c', cheek:'#ff9f9f' };
    let html = '<div class="shop-coins"><span style="font-weight:900; font-size:18px;">🪙 '+(S.coins||0)+' Coins</span><span style="font-size:12px; font-weight:800; color:var(--ink-2);">'+tt('shopHint')+'</span></div>';
    html += '<div class="shop-preview"><div class="mascot-home small" style="margin-bottom:0"><svg class="fox-img"><use href="#fox"/></svg><div class="shop-hat" id="shop-hat-preview" style="position:absolute; top:-6px; left:50%; transform:translateX(-50%); font-size:32px;">'+(S.shopEquipped ? (SHOP_ITEMS.find(s=>s.id===S.shopEquipped)?.icon||'') : '')+'</div></div><div style="font-size:13px; font-weight:800; color:var(--ink-2);">'+(S.shopEquipped ? SHOP_ITEMS.find(s=>s.id===S.shopEquipped)?.name : 'No hat')+'</div></div>';
    // avatar builder
    const curBody = S.avatar.body || '#f6a53c';
    html += '<div class="avatar-builder"><div style="font-weight:900; font-size:15px; text-align:center;">🎨 Custom Zippy</div>';
    html += '<div style="display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap;"><div class="fox-preview"><svg class="fox-img" style="width:92px;height:92px;"><use href="#fox"/></svg></div><div style="flex:1; min-width:160px;"><div style="font-size:11px; font-weight:900; color:var(--ink-2); margin-bottom:6px;">BODY COLOR</div><div class="avatar-row" id="avatar-body-row"></div><div style="font-size:11px; font-weight:900; color:var(--ink-2); margin:8px 0 6px;">CHEEK</div><div class="avatar-row" id="avatar-cheek-row"></div></div></div>';
    html += '<div style="text-align:center; font-size:11px; font-weight:800; color:var(--ink-2);">Current: '+curBody+' • Tap a color to dress Zippy instantly</div></div>';
    html += '<div class="shop-grid">';
    SHOP_ITEMS.forEach(item=>{
      const owned = (S.shopOwned||[]).includes(item.id);
      const equipped = S.shopEquipped === item.id;
      const canBuy = !owned && (S.coins||0) >= item.price;
      html += '<div class="shop-card'+(owned?' owned':'')+(equipped?' equipped':'')+'"><div class="shop-icon" style="background:linear-gradient(180deg,'+ (equipped?'#fff6cc,#ffd35c':'#fff,#eef6ff')+')">'+item.icon+'</div><div class="shop-name">'+item.name+'</div><div class="shop-price">'+ (owned ? (equipped ? tt('equipped') : tt('owned')) : item.price+' 🪙') +'</div>';
      if (!owned){
        html += '<button class="btn tiny '+(canBuy?'btn-primary':'')+'" onclick="Game.buyShop(\''+item.id+'\')" '+(canBuy?'':'disabled style="opacity:.5"')+'>'+ (canBuy ? tt('buy') : tt('needCoins')) +'</button>';
      } else if (!equipped){
        html += '<button class="btn tiny btn-primary" onclick="Game.equipShop(\''+item.id+'\')">Wear</button>';
      } else {
        html += '<button class="btn tiny" disabled>✓ '+tt('equipped')+'</button>';
      }
      html += '</div>';
    });
    html += '</div>';
    cont.innerHTML = html;
    updateShopFox();
    // populate avatar color pickers
    try{
      const bodyRow=$id('avatar-body-row'), cheekRow=$id('avatar-cheek-row');
      const CHEEKS=['#ff9f9f','#ffb3d1','#ff8fa7','#ff6b9d','#ffc1c1','#f8b5ff'];
      if(bodyRow && bodyRow.children.length===0){
        AVATAR_COLORS.forEach(col=>{
          const b=document.createElement('button');
          b.className='avatar-swatch'+(S.avatar.body===col?' active':'');
          b.style.background=col;
          b.title=col;
          b.onclick=()=>{ setAvatarColor(col); document.querySelectorAll('#avatar-body-row .avatar-swatch').forEach(x=>x.classList.toggle('active', x.style.background===col || x.style.backgroundColor===col)); };
          bodyRow.appendChild(b);
        });
      }
      if(cheekRow && cheekRow.children.length===0){
        CHEEKS.forEach(col=>{
          const b=document.createElement('button');
          b.className='avatar-swatch'+(S.avatar.cheek===col?' active':'');
          b.style.background=col;
          b.title=col;
          b.onclick=()=>{ setAvatarColor(S.avatar.body, col); document.querySelectorAll('#avatar-cheek-row .avatar-swatch').forEach(x=>x.classList.toggle('active', x.style.background===col)); };
          cheekRow.appendChild(b);
        });
      }
      applyAvatar();
    }catch(_){}
  }
  function updateShopFox(){
    const hat = document.getElementById('shop-hat-preview');
    const equipped = S.shopEquipped ? SHOP_ITEMS.find(s=>s.id===S.shopEquipped) : null;
    // also update home fox hat if exists
    const homeHat = document.getElementById('home-fox-hat');
    const txt = equipped ? equipped.icon : '';
    if (hat) hat.textContent = txt;
    if (homeHat) homeHat.textContent = txt;
    try{ applyAvatar(); }catch(_){}
  }
  function buyShop(id){
    const item = SHOP_ITEMS.find(s=>s.id===id);
    if (!item) return;
    S.shopOwned = S.shopOwned || [];
    if (S.shopOwned.includes(id)) return;
    if ((S.coins||0) < item.price){ FX.wrong(); return; }
    S.coins -= item.price;
    S.shopOwned.push(id);
    save();
    FX.correct();
    burst(window.innerWidth/2, window.innerHeight*0.4);
    renderShop();
    updateHomeStats();
  }
  function equipShop(id){
    if (!(S.shopOwned||[]).includes(id)) return;
    S.shopEquipped = id;
    save();
    FX.click();
    renderShop();
    updateHomeStats();
  }

  /* ---------------- draw pad — enhanced ---------------- */
  let drawCtx = null, drawColor = '#FF6B6B', drawSize = 12, drawEraser = false, drawPainting = false, drawLast = null;
  let drawTool = 'brush', drawBg = '#fff', drawHistory = [], drawRedo = [], drawRainbowHue = 0, drawStamp = null;
  const DRAW_COLORS = ['#FF6B6B','#FF8F3A','#FFD93D','#6BCB77','#4ECDC4','#4D96FF','#9D65C9','#FF6B9D','#3a2d5e','#000000','#FFFFFF','#FF9EB0','#A7E8D0','#C7B6FF'];
  const DRAW_STAMPS = ['🍎','🍦','⭐','🎈','🐶','🐱','🦁','🚗','⚽','🌈','❤️','🦊','🐸','🍇','🚀','🎀'];
  function pushHistory(){
    const cv=$id('draw-canvas');
    if(!cv||!drawCtx) return;
    try{
      drawHistory.push(cv.toDataURL());
      if(drawHistory.length>22) drawHistory.shift();
      drawRedo = [];
    }catch(_){}
  }
  function restoreFromDataUrl(url){
    const cv=$id('draw-canvas');
    if(!cv||!drawCtx) return;
    const img=new Image();
    img.onload=()=>{ drawCtx.clearRect(0,0,cv.width,cv.height); drawCtx.drawImage(img,0,0); };
    img.src=url;
  }
  function undoDraw(){
    if(drawHistory.length===0) { FX.wrong&&FX.wrong(); return; }
    const cv=$id('draw-canvas');
    try{ drawRedo.push(cv.toDataURL()); }catch(_){}
    const prev=drawHistory.pop();
    restoreFromDataUrl(prev);
    FX.click&&FX.click();
  }
  function redoDraw(){
    if(drawRedo.length===0) { FX.wrong&&FX.wrong(); return; }
    const cv=$id('draw-canvas');
    try{ drawHistory.push(cv.toDataURL()); }catch(_){}
    const nxt=drawRedo.pop();
    restoreFromDataUrl(nxt);
    FX.click&&FX.click();
  }
  function redrawBackground(color){
    const cv=$id('draw-canvas');
    if(!cv||!drawCtx) return;
    drawBg=color;
    // base fill
    if(color==='grid' || color==='dotted' || color==='lined'){
      drawCtx.fillStyle='#fff'; drawCtx.fillRect(0,0,cv.width,cv.height);
      drawCtx.strokeStyle='#e6ecf5'; drawCtx.lineWidth=1;
      if(color==='grid'){
        const step=28;
        for(let x=0;x<cv.width;x+=step){ drawCtx.beginPath(); drawCtx.moveTo(x,0); drawCtx.lineTo(x,cv.height); drawCtx.stroke(); }
        for(let y=0;y<cv.height;y+=step){ drawCtx.beginPath(); drawCtx.moveTo(0,y); drawCtx.lineTo(cv.width,y); drawCtx.stroke(); }
      } else if(color==='dotted'){
        drawCtx.fillStyle='#d6e2f0';
        const step=22;
        for(let y=step;y<cv.height;y+=step) for(let x=step;x<cv.width;x+=step){ drawCtx.beginPath(); drawCtx.arc(x,y,1.6,0,Math.PI*2); drawCtx.fill(); }
      } else if(color==='lined'){
        drawCtx.strokeStyle='#ffd2d2';
        const step=24;
        for(let y=step;y<cv.height;y+=step){ drawCtx.beginPath(); drawCtx.moveTo(0,y); drawCtx.lineTo(cv.width,y); drawCtx.stroke(); }
        // margin line
        drawCtx.strokeStyle='#9edcf7'; drawCtx.lineWidth=1.5; drawCtx.beginPath(); drawCtx.moveTo(44,0); drawCtx.lineTo(44,cv.height); drawCtx.stroke();
      }
    } else {
      drawCtx.fillStyle=color; drawCtx.fillRect(0,0,cv.width,cv.height);
    }
    pushHistory();
  }
  function setDrawTool(t){
    drawTool=t;
    drawEraser=(t==='eraser');
    ['btn-brush','btn-neon','btn-rainbow','btn-eraser'].forEach(id=>{
      const b=$id(id); if(!b) return; b.classList.remove('active'); b.style.outline='';
    });
    const map={brush:'btn-brush',neon:'btn-neon',rainbow:'btn-rainbow',eraser:'btn-eraser'};
    const active=map[t]; if(active && $id(active)) $id(active).classList.add('active');
    drawStamp=null;
    const cv=$id('draw-canvas'); if(cv) cv.style.cursor = (t==='eraser' ? 'cell' : 'crosshair');
  }
  function placeStamp(emoji, pos){
    if(!drawCtx) return;
    pushHistory();
    drawCtx.save();
    drawCtx.font = (Math.max(24, drawSize*2.2))+'px serif';
    drawCtx.textAlign='center'; drawCtx.textBaseline='middle';
    drawCtx.fillText(emoji, pos.x, pos.y);
    drawCtx.restore();
  }
  function initDraw(){
    const cv = $id('draw-canvas');
    if (!cv) return;
    drawCtx = cv.getContext('2d');
    drawCtx.lineCap = 'round'; drawCtx.lineJoin = 'round';
    // init bg if empty
    const pal = $id('draw-colors');
    if (pal && pal.children.length === 0){
      DRAW_COLORS.forEach(c=>{
        const b = document.createElement('button');
        b.style.cssText = 'width:30px;height:30px;border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.12), inset 0 1px 0 rgba(255,255,255,.9);cursor:pointer;'+(c==='#FFFFFF'?'box-shadow:0 2px 6px rgba(0,0,0,.12), inset 0 0 0 1px #dfe8f5;':'');
        b.style.background = c;
        if (c === drawColor) b.style.outline = '3px solid #ffd35c';
        b.title=c;
        b.onclick = () => {
          drawColor=c;
          const custom=$id('draw-custom'); if(custom) custom.value=c;
          setDrawTool('brush');
          [...pal.children].forEach(x=>x.style.outline = x.style.background===c?'3px solid #ffd35c':'');
        };
        pal.appendChild(b);
      });
    }
    // custom color
    const custom=$id('draw-custom');
    if(custom && !custom._bound){
      custom._bound=true;
      custom.addEventListener('input', (e)=>{
        drawColor=e.target.value;
        setDrawTool('brush');
        [...($id('draw-colors').children)].forEach(x=>x.style.outline='');
      });
    }
    // sizes
    document.querySelectorAll('#draw-sizes [data-size]').forEach(b=>{
      if(b._bound) return; b._bound=true;
      b.onclick = () => {
        document.querySelectorAll('#draw-sizes [data-size]').forEach(x=>x.classList.remove('active'));
        b.classList.add('active');
        drawSize = parseInt(b.dataset.size);
        setDrawTool(drawTool==='eraser' ? 'brush' : drawTool);
      };
    });
    // tools
    const bindTool=(id, tool)=>{
      const el=$id(id); if(!el || el._bound) return; el._bound=true;
      el.onclick=()=>{ setDrawTool(tool); if(tool==='rainbow') drawRainbowHue=Math.random()*360; FX.click&&FX.click(); };
    };
    bindTool('btn-brush','brush');
    bindTool('btn-neon','neon');
    bindTool('btn-rainbow','rainbow');
    bindTool('btn-eraser','eraser');
    // fill
    const fillBtn=$id('btn-fill');
    if(fillBtn && !fillBtn._bound){ fillBtn._bound=true; fillBtn.onclick=()=>{
      redrawBackground(drawColor);
      FX.pop&&FX.pop();
    };}
    // bg selector
    const bgSel=$id('draw-bg');
    if(bgSel && !bgSel._bound){ bgSel._bound=true; bgSel.onchange=(e)=>{ redrawBackground(e.target.value); } }
    // undo/redo
    const uBtn=$id('btn-undo'); if(uBtn && !uBtn._bound){ uBtn._bound=true; uBtn.onclick=undoDraw; }
    const rBtn=$id('btn-redo'); if(rBtn && !rBtn._bound){ rBtn._bound=true; rBtn.onclick=redoDraw; }
    // stamps panel
    const stampsWrap=$id('draw-stamps');
    if(stampsWrap && stampsWrap.children.length===0){
      DRAW_STAMPS.forEach(em=>{
        const b=document.createElement('button');
        b.textContent=em;
        b.style.cssText='width:38px;height:38px;border-radius:12px;border:1.5px solid #fff;background:linear-gradient(180deg,#fff,#eef6ff);font-size:20px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08);';
        b.onclick=()=>{
          drawStamp=em; setDrawTool('brush');
          // highlight
          [...stampsWrap.children].forEach(x=>x.style.outline='');
          b.style.outline='3px solid #ffd35c';
          FX.pop&&FX.pop();
        };
        stampsWrap.appendChild(b);
      });
    }
    const stampsToggle=$id('btn-stamps-toggle');
    if(stampsToggle && !stampsToggle._bound){ stampsToggle._bound=true; stampsToggle.onclick=()=>{
      const p=$id('draw-stamps'); const l=$id('draw-letters'); if(l) l.classList.add('hide');
      p.classList.toggle('hide'); p.style.display = p.classList.contains('hide') ? 'none' : 'flex';
    };}
    // letters trace panel
    const lettersWrap=$id('draw-letters');
    if(lettersWrap && lettersWrap.children.length===0){
      LETTERS.forEach(l=>{
        const b=document.createElement('button');
        b.textContent=l;
        b.style.cssText='width:34px;height:34px;border-radius:10px;border:1.5px solid #fff;background:linear-gradient(180deg,#fff,#eef6ff);font-weight:900;color:var(--ink);cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08);';
        b.onclick=()=>{
          // draw faint letter as guide
          pushHistory();
          const cv=$id('draw-canvas');
          drawCtx.save();
          drawCtx.globalAlpha=0.12;
          drawCtx.fillStyle='#6b5a8a';
          drawCtx.font='bold '+(cv.width*0.62)+'px Comic Sans MS, cursive';
          drawCtx.textAlign='center'; drawCtx.textBaseline='middle';
          drawCtx.fillText(l, cv.width/2, cv.height/2);
          drawCtx.restore();
          FX.pop&&FX.pop();
        };
        lettersWrap.appendChild(b);
      });
      // add numbers
      NUMBERS.forEach(n=>{
        const b=document.createElement('button');
        b.textContent=n;
        b.style.cssText='width:34px;height:34px;border-radius:10px;border:1.5px solid #fff;background:linear-gradient(180deg,#fff7d6,#ffec99);font-weight:900;color:var(--ink);cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,.08);';
        b.onclick=()=>{
          pushHistory();
          const cv=$id('draw-canvas');
          drawCtx.save();
          drawCtx.globalAlpha=0.12;
          drawCtx.fillStyle='#6b5a8a';
          drawCtx.font='bold '+(cv.width*0.62)+'px Comic Sans MS, cursive';
          drawCtx.textAlign='center'; drawCtx.textBaseline='middle';
          drawCtx.fillText(n, cv.width/2, cv.height/2);
          drawCtx.restore();
          FX.pop&&FX.pop();
        };
        lettersWrap.appendChild(b);
      });
    }
    const lettersToggle=$id('btn-letters-toggle');
    if(lettersToggle && !lettersToggle._bound){ lettersToggle._bound=true; lettersToggle.onclick=()=>{
      const p=$id('draw-letters'); const s=$id('draw-stamps'); if(s){ s.classList.add('hide'); s.style.display='none'; }
      p.classList.toggle('hide'); p.style.display = p.classList.contains('hide') ? 'none' : 'flex';
    };}
    // init state once
    if(!cv._drawBound){
      cv._drawBound=true;
      redrawBackground(drawBg);
      drawHistory=[]; drawRedo=[];
      pushHistory();
    }
    // events
    const getPos = (e) => {
      const r = cv.getBoundingClientRect();
      const sx = cv.width / r.width;
      const sy = cv.height / r.height;
      return {x:(e.clientX - r.left)*sx, y:(e.clientY - r.top)*sy};
    };
    // remove old listeners if any by cloning? we use flag to avoid duplicate
    if(cv._hasDrawListeners) return;
    cv._hasDrawListeners=true;
    const start = (e) => {
      e.preventDefault();
      const p=getPos(e);
      // stamp mode: if stamp selected and not eraser/neon/rainbow special, place stamp on tap
      if(drawStamp){
        placeStamp(drawStamp, p);
        return;
      }
      pushHistory();
      drawPainting=true; drawLast=p;
      drawCtx.beginPath(); drawCtx.moveTo(p.x,p.y);
      try{ cv.setPointerCapture(e.pointerId);}catch(_){}
    };
    const move = (e) => {
      if (!drawPainting) return;
      e.preventDefault();
      const p = getPos(e);
      if(drawTool==='rainbow'){
        drawRainbowHue=(drawRainbowHue+6)%360;
        drawCtx.strokeStyle='hsl('+drawRainbowHue+',100%,50%)';
        drawCtx.shadowBlur=0;
      } else if(drawTool==='neon'){
        drawCtx.strokeStyle=drawColor;
        drawCtx.shadowBlur=14; drawCtx.shadowColor=drawColor;
      } else {
        drawCtx.strokeStyle = drawEraser ? (drawBg==='grid'||drawBg==='dotted'||drawBg==='lined' ? '#fff' : drawBg==='blackboard' ? '#1a2a3a' : '#fff') : drawColor;
        if(drawTool==='eraser') drawCtx.shadowBlur=0; else drawCtx.shadowBlur=0;
        // for white stroke on white bg, ensure visible: if drawColor #FFFFFF and bg #fff, keep as is
      }
      drawCtx.lineWidth = drawSize;
      drawCtx.beginPath(); drawCtx.moveTo(drawLast.x, drawLast.y); drawCtx.lineTo(p.x,p.y); drawCtx.stroke();
      drawLast = p;
    };
    const end = (e) => {
      if(drawPainting){
        drawCtx.shadowBlur=0;
      }
      drawPainting=false; try{ cv.releasePointerCapture(e.pointerId);}catch(_){}
    };
    cv.addEventListener('pointerdown', start, {passive:false});
    cv.addEventListener('pointermove', move, {passive:false});
    cv.addEventListener('pointerup', end);
    cv.addEventListener('pointercancel', end);
    cv.addEventListener('pointerleave', end);
  }
  function clearDraw(){
    const cv=$id('draw-canvas');
    if (!cv||!drawCtx) return;
    redrawBackground(drawBg);
    FX.click();
  }
  function saveDraw(){
    const cv=$id('draw-canvas');
    if (!cv) return;
    const a=document.createElement('a');
    a.download='abc-champ-doodle-'+new Date().toISOString().slice(0,10)+'.png';
    a.href=cv.toDataURL('image/png');
    a.click();
    FX.correct();
    burst(window.innerWidth/2, window.innerHeight*0.5);
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
    if(!el) return;
    el.innerHTML='';
    const theme = (typeof getSeasonalTheme==='function' ? getSeasonalTheme().id : 'default');
    let colors;
    if(theme==='eid') colors=['#fff','#ffd35c','#0ea57a','#a7e8d0','#fff6cc'];
    else if(theme==='halloween') colors=['#fff','#ff7a2e','#4a1a6b','#ffd35c','#2b0a3d'];
    else if(theme==='desert') colors=['#fff','#ffcc7a','#ff9a5c','#ffd35c','#ff6b35'];
    else if(theme==='winter') colors=['#fff','#c8e8ff','#eaf6ff','#ffd35c','#a7e8d0'];
    else colors=['#fff','#ffd35c','#ff9eb0','#a7e8d0','#c7b6ff'];
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
    const hk = $id('home-streak');
    const hc = $id('home-coins');
    if (hs) hs.textContent = totalStars + ' ⭐';
    if (hl) hl.textContent = done + '/17';
    if (hk) hk.textContent = (S.streak||0) + ' 🔥';
    if (hc) hc.textContent = (S.coins||0) + '';
    const dr = $id('daily-reward');
    const drText = $id('daily-reward-text');
    if (dr){
      if (canClaimDaily()){
        dr.style.display = 'block';
        const bonus = 10 + (S.streak >= 3 ? 10 : 0) + (S.streak >= 7 ? 20 : 0);
        if (drText) drText.textContent = tt('dailyReward') + ' +' + bonus + ' 🪙' + (S.streak ? ' • '+S.streak+' 🔥' : '');
      } else {
        dr.style.display = 'none';
      }
    }
    // update fox hat
    updateShopFox();
    try{ applyPetEvolution(); }catch(_){}
  }

  /* ---------------- boot ---------------- */
  function boot(){
    load();
    applySettings();
    setLang(S.settings.lang || 'en');
    renderDecor();
    startBreakClock();
    updateStreak();
    updateHomeStats();

    // daily reward claim
    const dailyBtn = $id('btn-daily-claim');
    if (dailyBtn){
      dailyBtn.onclick = () => {
        const r = claimDaily();
        if (r){
          FX.correct();
          burst(window.innerWidth/2, window.innerHeight*0.4);
          updateHomeStats();
          dailyBtn.textContent = '✓ ' + r + ' 🪙';
          setTimeout(()=>{ const dr=$id('daily-reward'); if(dr) dr.style.display='none'; }, 1200);
        } else {
          FX.wrong();
        }
      };
    }

    $id('btn-play').onclick = () => showScreen('map');
    $id('btn-map-home').onclick = () => showScreen('home');
    $id('btn-level-back').onclick = () => { FX.stopSpeaking(); hideMascot(); try{ Levels.cleanup(); }catch(_){} showScreen('map'); };
    $id('btn-win-replay').onclick = () => runLevel(currentWinLevel);
    $id('btn-dash-back').onclick = () => showScreen('home');
    $id('btn-shop-back').onclick = () => showScreen('home');
    $id('btn-draw-back').onclick = () => showScreen('home');
    $id('btn-draw-clear').onclick = clearDraw;
    $id('btn-draw-save').onclick = saveDraw;
    $id('btn-home-shop').onclick = () => { renderShop(); showScreen('shop'); updateShopFox(); };
    const drawHomeBtn = $id('btn-draw');
    if (drawHomeBtn) drawHomeBtn.onclick = () => { showScreen('draw'); setTimeout(initDraw, 80); };
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

    try{ applyAvatar(); }catch(_){}
    try{ applySeasonalTheme(); }catch(_){}
    // hook pet reactions via FX
    try{
      const _origCorrect = FX.correct;
      const _origWrong = FX.wrong;
      FX.correct = function(){ try{ _origCorrect.apply(FX, arguments);}catch(_){} try{ petReact('correct'); }catch(_){} try{ applyPetEvolution(); }catch(_){} };
      FX.wrong = function(){ try{ _origWrong.apply(FX, arguments);}catch(_){} try{ petReact('wrong'); }catch(_){} };
    }catch(_){}
    try{ applyPetEvolution(); }catch(_){}
    try{ initSecretTriggers(); }catch(_){}
    showScreen('home');
  }

  document.addEventListener('DOMContentLoaded', boot);

  return {
    runLevel, finishLevel, setLevelHeader,
    showMascot, hideMascot, burst, burstFromElement,
    showScreen, buyShop, equipShop, renderShop, updateShopFox, renderDash
  };
})();