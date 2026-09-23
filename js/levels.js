/* ============ ABC Champ — Levels 1-11 question engine ============ */
const Levels = (function(){
  const body = () => $id('level-body');
  let levelNum = 0, qList = [], qIndex = 0;
  let correctFirst = 0, firstTry = true, busy = false;
  let timerId = null, timeLeft = 0, timerTotal = 0;
  let selChip = null;

  const QUIZ_SECONDS = 20;

  /* keyboard state */
  let kbIndex = 0;

  /* turbo state */
  let turboActive = false, turboScore = 0, turboTotal = 0, turboStart = 0, turboLeft = 30, turboTarget = 'A', turboTimer = null;

  /* memory state */
  let memFlipped = [], memMatched = new Set(), memMoves = 0, memLock = false;

  /* ---------------- question generation ---------------- */
  function makeQ(t){
    const rndLetter = () => LETTERS[Math.floor(Math.random()*26)];
    if (t === 'reco'){
      const answer = rndLetter();
      const distract = pickRand(LETTERS, 3, answer);
      return { type:'reco', answer, options: shuffle([answer].concat(distract)),
               word: LETTER_DATA[answer].word, emoji: LETTER_DATA[answer].emoji };
    }
    if (t === 'listen'){
      const answer = rndLetter();
      let distract = pickRand(LETTERS, levelNum === 7 ? 4 : 3, answer);
      return { type:'listen', answer, options: shuffle([answer].concat(distract)),
               word: LETTER_DATA[answer].word, emoji: LETTER_DATA[answer].emoji };
    }
    if (t === 'missing'){
      const start = Math.floor(Math.random()*23);
      const seq = [LETTERS[start], LETTERS[start+1], LETTERS[start+2], LETTERS[start+3]];
      const blankPos = 1 + Math.floor(Math.random()*2);
      const answer = seq[blankPos];
      const distract = pickRand(LETTERS, 2, answer);
      return { type:'missing', seq, blank:blankPos, answer, options: shuffle([answer].concat(distract)) };
    }
    if (t === 'word'){
      const w = WORD_POOL[Math.floor(Math.random()*WORD_POOL.length)];
      const target = w.word.split('');
      return { type:'word', word:w.word, emoji:w.emoji, target };
    }
    if (t === 'case'){
      const upper = rndLetter();
      const lower = upper.toLowerCase();
      const distract = pickRand(LETTERS.map(l=>l.toLowerCase()), 3, lower);
      return { type:'case', upper, lower, answer:lower, options: shuffle([lower].concat(distract)) };
    }
    if (t === 'sort'){
      const start = Math.floor(Math.random()*22);
      const target = [LETTERS[start], LETTERS[start+1], LETTERS[start+2], LETTERS[start+3], LETTERS[start+4]];
      const shuffled = shuffle(target.slice());
      if (shuffled.join('') === target.join('')) return makeQ('sort');
      return { type:'sort', target, shuffled };
    }
    if (t === 'spell'){
      const w = SPELL_POOL[Math.floor(Math.random()*SPELL_POOL.length)];
      const target = w.word.split('');
      const shuffled = shuffle(target.slice());
      if (shuffled.join('') === target.join('')) return makeQ('spell');
      return { type:'spell', word:w.word, emoji:w.emoji, target, shuffled };
    }
    if (t === 'count'){
      const count = 2 + Math.floor(Math.random()*7); // 2-8 for nice display
      const emoji = COUNT_EMOJIS[Math.floor(Math.random()*COUNT_EMOJIS.length)];
      const answer = String(count);
      const pool = NUMBERS.filter(n=>n!=='0');
      const distract = pickRand(pool, 3, answer);
      return { type:'count', count, emoji, answer, options: shuffle([answer].concat(distract)) };
    }
    if (t === 'phonics'){
      const answer = rndLetter();
      const alt = pickRand(LETTERS, 3, answer);
      return { type:'phonics', answer, word: LETTER_DATA[answer].word, emoji: LETTER_DATA[answer].emoji, options: shuffle([answer].concat(alt)) };
    }
    if (t === 'mathAdd'){
      const a = 1 + Math.floor(Math.random()*5);
      const b = 1 + Math.floor(Math.random()*5);
      const answer = String(a + b);
      const emoji = MATH_EMOJIS[Math.floor(Math.random()*MATH_EMOJIS.length)];
      const pool = ['1','2','3','4','5','6','7','8','9','10'];
      const distract = pickRand(pool, 3, answer);
      return { type:'mathAdd', a, b, answer, emoji, options: shuffle([answer].concat(distract)) };
    }
    if (t === 'mathSub'){
      const a = 5 + Math.floor(Math.random()*5); // 5-9
      const b = 1 + Math.floor(Math.random()*4); // 1-4
      if (b >= a) return makeQ('mathSub');
      const answer = String(a - b);
      const emoji = MATH_EMOJIS[Math.floor(Math.random()*MATH_EMOJIS.length)];
      const pool = ['0','1','2','3','4','5','6','7','8'];
      const distract = pickRand(pool, 3, answer);
      return { type:'mathSub', a, b, answer, emoji, options: shuffle([answer].concat(distract)) };
    }
  }

  function buildQuestions(n){
    const map = {
      3:{types:['reco'], count:8},
      4:{types:['listen'], count:8},
      5:{types:['missing'], count:8},
      6:{types:['word'], count:8},
      7:{types:['reco','listen','missing','word'], count:10},
      8:{types:['case'], count:8},
      10:{types:['sort'], count:6},
      11:{types:['spell'], count:6},
      14:{types:['count'], count:8},
      15:{types:['phonics'], count:8},
      16:{types:['mathAdd'], count:8},
      17:{types:['mathSub'], count:8}
    };
    if (n === 1 || n === 2 || n === 9 || n === 12 || n === 13) return []; // keyboard, trace, memory, turbo, number trace are single boards
    const cfg = map[n];
    if (!cfg) return [];
    const list = [];
    for (let i=0;i<cfg.count;i++) list.push(makeQ(cfg.types[Math.floor(Math.random()*cfg.types.length)]));
    return list;
  }

  /* ---------------- flow ---------------- */
  function next(){
    updateDots();
    qIndex++;
    if (qIndex >= qList.length){ stopTimer(); finish(); return; }
    render();
  }

  function finish(){
    const pct = qList.length ? correctFirst / qList.length : 0;
    window.Game.finishLevel(levelNum, { correct: correctFirst, total: qList.length, pct });
  }

  function correctAnswer(){
    if (firstTry) correctFirst++;
    FX.correct();
    window.Game.showMascot(pickPraise(), { speak:true });
    busy = true;
    stopTimer();
    window.setTimeout(next, 1100);
  }

  function wrongAnswer(){
    firstTry = false;
    FX.wrong();
    if (!busy) window.Game.showMascot(tt('tryAgain'));
  }

  /* ---------------- UI ---------------- */
  function updateDots(){
    const dots = document.querySelectorAll('.dot');
    dots.forEach((d,i) => d.classList.toggle('done', i < qIndex));
    dots.forEach((d,i) => d.classList.toggle('active', i === qIndex));
  }

  function card(){ return document.querySelector('#q-card'); }

  function levelAccent(){
    const m = LEVELS_META[levelNum-1];
    return m ? m.color : '#8f7cf0';
  }

  function render(){
    const q = qList[qIndex];
    firstTry = true;
    selChip = null;
    busy = false;
    const cardEl = card();
    if (!cardEl) return;
    updateDots();
    cardEl.style.setProperty('--card-accent', levelAccent());
    let html = '';
    if (levelNum === 7) html += '<div class="timer-bar"><div class="timer-fill" id="timer-fill"></div></div>';
    if (!q) return;
    if (q.type === 'reco'){
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#ffb62e,#ff8f3a)">🖼️</div><div><b>'+tt('whichLetter')+'</b><p>'+q.word+' starts with…</p></div></div>';
      html += '<div class="big-pic">' + q.emoji + '</div>';
      html += '<div class="pic-word">' + q.word + '</div>';
      html += '<div class="option-row">' + q.options.map(o => '<button class="opt" data-a="'+o+'">'+o+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      window.Game.hideMascot();
      FX.speak(tt('whichLetter') + ' ' + q.word, voiceLang());
    } else if (q.type === 'listen'){
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#5fd4a8,#1fc99a)">👂</div><div><b>'+tt('tapTheLetter')+'</b><p>Listen carefully!</p></div></div>';
      html += '<button class="listen-btn" id="btn-replay">🔊 ' + tt('listenBtn') + '</button>';
      html += '<div class="option-row">' + q.options.map(o => '<button class="opt" data-a="'+o+'">'+o+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      $id('btn-replay').onclick = () => speakQuestion(q);
      window.Game.hideMascot();
      speakQuestion(q);
    } else if (q.type === 'missing'){
      html += '<div class="action-line">' + tt('fillMissing') + '</div>';
      html += '<div class="slot-row">';
      q.seq.forEach((s,i) => {
        html += i === q.blank ? '<div class="slot hint" id="m-slot"></div>' : '<div class="slot filled">'+s+'</div>';
      });
      html += '</div>';
      html += '<div class="action-line" style="font-size:14px; font-weight:800; color:var(--ink-2)">' + tt('dragMissing') + '</div>';
      html += '<div class="drag-chips">' + q.options.map(o => '<div class="drag-chip" data-l="'+o+'">'+o+'</div>').join('') + '</div>';
      cardEl.innerHTML = html;
      setupDrag(q);
      window.Game.hideMascot();
      FX.speak(tt('fillMissing') + '. ', voiceLang());
      q.seq.forEach((s,i) => window.setTimeout(() => FX.speak(i === q.blank ? '?' : s, voiceLang()), 700 + i*700));
      window.setTimeout(() => FX.speak(tt('dragMissing'), voiceLang()), 700 + q.seq.length*700);
    } else if (q.type === 'word'){
      html += '<div class="big-pic">' + q.emoji + '</div>';
      html += '<div class="action-line">' + tt('buildWord') + ' <span style="color:var(--coral-deep)">'+q.word+'</span></div>';
      html += '<div class="word-boxes">' + q.target.map(() => '<div class="slot"></div>').join('') + '</div>';
      html += '<div class="spell-hint">' + tt('buildTap') + '</div>';
      html += '<div class="option-row">' + shuffle(q.target.slice()).map(l => '<button class="word-chip" data-l="'+l+'">'+l+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      window.Game.hideMascot();
      FX.speak(tt('buildWord') + ' ' + q.word, voiceLang());
    } else if (q.type === 'case'){
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#ff7fa3,#ff4d7a)">🔤</div><div><b>'+tt('caseMatch')+'</b><p>'+tt('caseTap')+' '+q.upper+'</p></div></div>';
      html += '<div class="big-pic" style="font-size:64px; font-weight:900; color:'+levelAccent()+'">'+q.upper+'</div>';
      html += '<div class="action-line" style="font-size:14px; color:var(--ink-2)">'+tt('caseTap')+' <b style="color:'+levelAccent()+'">'+q.upper+'</b></div>';
      html += '<div class="option-row">' + q.options.map(o => '<button class="opt" data-a="'+o+'" style="font-size:36px">'+o+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      window.Game.hideMascot();
      FX.speak(q.upper + ' small ' + q.lower, voiceLang());
    } else if (q.type === 'sort'){
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#7ed957,#4caf2b)">↕️</div><div><b>'+tt('sortTitle')+'</b><p>'+tt('sortHint')+'</p></div></div>';
      html += '<div class="sort-row" id="sort-row">' + q.shuffled.map(l => '<div class="sort-chip" data-l="'+l+'">'+l+'</div>').join('') + '</div>';
      html += '<button class="btn btn-primary" id="btn-sort-check" style="margin-top:6px">✓ Check</button>';
      cardEl.innerHTML = html;
      window.Game.hideMascot();
      setupSort(q);
      FX.speak(tt('sortTitle'), voiceLang());
    } else if (q.type === 'spell'){
      html += '<div class="big-pic">' + q.emoji + '</div>';
      html += '<div class="action-line">'+tt('spellTitle')+' <span style="color:'+levelAccent()+'">'+q.word+'</span></div>';
      html += '<div class="word-boxes">' + q.target.map(()=>'<div class="slot"></div>').join('') + '</div>';
      html += '<button class="mic-btn" id="spell-mic" style="width:64px;height:64px;font-size:24px; margin:6px auto;">🎤</button>';
      html += '<div id="spell-mic-status" style="font-size:12px; font-weight:800; color:var(--ink-2); background:rgba(255,255,255,.9); padding:5px 12px; border-radius:40px; border:1px solid rgba(255,255,255,.9); display:inline-block;">'+tt('spellVoice')+'</div>';
      html += '<div class="spell-hint" style="margin-top:6px;">'+tt('spellHint')+' • '+q.word.length+' letters — or tap letters</div>';
      html += '<div class="option-row" style="margin-top:8px;">' + q.shuffled.map(l => '<button class="word-chip" data-l="'+l+'">'+l+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      window.Game.hideMascot();
      setupSpellVoice(q);
      FX.speak(tt('spellTitle')+' '+q.word, voiceLang());
    } else if (q.type === 'count'){
      const emojis = Array(q.count).fill(q.emoji).join(' ');
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#4ECDC4,#2ec4b6)">🧮</div><div><b>'+tt('countTitle')+'</b><p>'+tt('countHint')+'</p></div></div>';
      html += '<div class="big-pic" style="font-size:42px; line-height:1.4; max-width:300px; word-spacing:8px;">' + emojis + '</div>';
      html += '<div class="action-line" style="font-size:16px;">'+q.count+' '+q.emoji+' — '+tt('countHint')+'</div>';
      html += '<div class="option-row">' + q.options.map(o => '<button class="opt" data-a="'+o+'" style="font-size:32px">'+o+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      window.Game.hideMascot();
      FX.speak(q.count + ' ' + q.emoji, voiceLang());
    } else if (q.type === 'phonics'){
      const hasMic = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#FF6B9D,#ff3b6b)">🎤</div><div><b>'+tt('phonicsTitle')+'</b><p>'+tt('phonicsHint')+' — '+q.answer+'</p></div></div>';
      html += '<div class="big-pic">' + q.emoji + '</div>';
      html += '<div class="pic-word">' + q.word + ' — <span style="color:'+levelAccent()+'">'+q.answer+'</span></div>';
      html += '<button class="mic-btn" id="mic-btn" title="'+tt('phonicsTap')+'">🎤</button>';
      html += '<div id="mic-status" style="font-size:13px; font-weight:800; color:var(--ink-2); background:rgba(255,255,255,.9); padding:6px 12px; border-radius:40px; border:1px solid rgba(255,255,255,.9); margin-top:6px;">'+tt('phonicsTap')+'</div>';
      if (hasMic){
        html += '<div class="phonics-fallback" id="phonics-fallback" style="display:none; margin-top:8px;"><div style="font-size:12px; font-weight:800; color:var(--ink-2);">'+tt('phonicsNoMic')+'</div><div class="option-row" style="margin-top:6px;">' + q.options.map(o => '<button class="opt" data-a="'+o+'">'+o+'</button>').join('') + '</div></div>';
      } else {
        html += '<div class="phonics-fallback" id="phonics-fallback" style="margin-top:8px;"><div style="font-size:12px; font-weight:800; color:var(--ink-2);">'+tt('phonicsNoMic')+'</div><div class="option-row" style="margin-top:6px;">' + q.options.map(o => '<button class="opt" data-a="'+o+'">'+o+'</button>').join('') + '</div></div>';
      }
      cardEl.innerHTML = html;
      window.Game.hideMascot();
      if (hasMic){
        setupPhonics(q);
        FX.speak(q.answer + ' for ' + q.word, voiceLang());
      } else {
        cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      }
    } else if (q.type === 'mathAdd'){
      const aEm = Array(q.a).fill(q.emoji).join(' ');
      const bEm = Array(q.b).fill(q.emoji).join(' ');
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#6BCB77,#2ec4a6)">➕</div><div><b>'+tt('mathAddTitle')+'</b><p>'+tt('mathAddHint')+'</p></div></div>';
      html += '<div class="big-pic" style="font-size:28px; line-height:1.4;"><span style="background:rgba(255,255,255,.9); padding:8px 12px; border-radius:14px; border:1.5px solid rgba(255,255,255,.9);">'+aEm+'</span> <span style="font-size:28px; font-weight:900; color:var(--ink);">+</span> <span style="background:rgba(255,255,255,.9); padding:8px 12px; border-radius:14px; border:1.5px solid rgba(255,255,255,.9);">'+bEm+'</span> <span style="font-weight:900;">= ?</span></div>';
      html += '<div class="action-line">'+q.a+' + '+q.b+' = ?</div>';
      html += '<div class="option-row">' + q.options.map(o => '<button class="opt" data-a="'+o+'" style="font-size:32px">'+o+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      window.Game.hideMascot();
      FX.speak(q.a + ' plus ' + q.b, voiceLang());
    } else if (q.type === 'mathSub'){
      const aEm = Array(q.a).fill(q.emoji).join(' ');
      const bEm = Array(q.b).fill(q.emoji).join(' ');
      html += '<div class="intro-card"><div class="ic" style="background:linear-gradient(180deg,#FF6B6B,#ff3b6b)">➖</div><div><b>'+tt('mathSubTitle')+'</b><p>'+tt('mathSubHint')+'</p></div></div>';
      html += '<div class="big-pic" style="font-size:28px; line-height:1.4;"><span style="background:rgba(255,255,255,.9); padding:8px 12px; border-radius:14px; border:1.5px solid rgba(255,255,255,.9);">'+aEm+'</span> <span style="font-size:28px; font-weight:900; color:var(--ink);">−</span> <span style="background:rgba(255,255,255,.7); padding:8px 12px; border-radius:14px; border:1.5px dashed #ffb3bb; opacity:.9;">'+bEm+'</span> <span style="font-weight:900;">= ?</span></div>';
      html += '<div class="action-line">'+q.a+' − '+q.b+' = ?</div>';
      html += '<div class="option-row">' + q.options.map(o => '<button class="opt" data-a="'+o+'" style="font-size:32px">'+o+'</button>').join('') + '</div>';
      cardEl.innerHTML = html;
      cardEl.querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      window.Game.hideMascot();
      FX.speak(q.a + ' minus ' + q.b, voiceLang());
    }
    if (levelNum === 7) startTimer();
  }

  let phonicsRec = null;
  function setupPhonics(q){
    const btn = document.getElementById('mic-btn');
    const status = document.getElementById('mic-status');
    const fallback = document.getElementById('phonics-fallback');
    const hasMic = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!hasMic){
      if (fallback) fallback.style.display = 'flex';
      card().querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
      return;
    }
    // fallback tap options also work
    if (fallback){
      card().querySelectorAll('.opt').forEach(b => b.onclick = () => pickLetter(q, b));
    }
    let listening = false;
    btn.onclick = () => {
      if (listening || busy) return;
      const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!Rec){
        if (fallback) fallback.style.display = 'flex';
        return;
      }
      try{
        if (phonicsRec) try{ phonicsRec.abort(); }catch(_){}
        phonicsRec = new Rec();
        phonicsRec.lang = (voiceLang() === 'ur' ? 'ur-PK' : voiceLang() === 'hi' ? 'hi-IN' : 'en-US');
        phonicsRec.interimResults = false;
        phonicsRec.maxAlternatives = 3;
        listening = true;
        btn.classList.add('listening');
        if (status) status.textContent = tt('phonicsListening');
        FX.speak(q.answer, voiceLang());
        phonicsRec.onresult = (e) => {
          const transcripts = Array.from(e.results[0]).map(r=>r.transcript.toLowerCase()).join(' ');
          const ans = q.answer.toLowerCase();
          const word = q.word.toLowerCase();
          const said = transcripts.includes(ans) || transcripts.includes(word) || transcripts.trim() === ans;
          if (said){
            btn.classList.remove('listening');
            listening = false;
            // visual correct
            btn.style.background = 'linear-gradient(180deg,#5fd4a8,#1fc99a)';
            window.Game.burstFromElement(btn);
            correctAnswer();
          } else {
            btn.classList.remove('listening');
            listening = false;
            if (status) status.textContent = 'Heard: "'+transcripts.split(' ')[0]+'" — '+tt('tryAgain');
            FX.wrong();
            if (fallback) fallback.style.display = 'flex';
            window.Game.showMascot(tt('tryAgain'));
          }
        };
        phonicsRec.onerror = () => {
          listening = false;
          btn.classList.remove('listening');
          if (status) status.textContent = tt('tryAgain');
          if (fallback) fallback.style.display = 'flex';
        };
        phonicsRec.onend = () => {
          listening = false;
          btn.classList.remove('listening');
          if (status && status.textContent === tt('phonicsListening')) status.textContent = tt('phonicsTap');
        };
        phonicsRec.start();
        // auto-stop after 4s
        setTimeout(()=>{ try{ phonicsRec.stop(); }catch(_){} }, 4000);
      } catch(err){
        listening = false;
        btn.classList.remove('listening');
        if (fallback) fallback.style.display = 'flex';
      }
    };
  }

  let spellRec = null;
  function setupSpellVoice(q){
    const btn = document.getElementById('spell-mic');
    const status = document.getElementById('spell-mic-status');
    if (!btn) return;
    const hasMic = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    if (!hasMic){
      if (status) status.textContent = tt('phonicsNoMic');
      return;
    }
    btn.onclick = () => {
      if (busy) return;
      const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
      try{
        if (spellRec) try{ spellRec.abort(); }catch(_){}
        spellRec = new Rec();
        spellRec.lang = (voiceLang() === 'ur' ? 'ur-PK' : voiceLang() === 'hi' ? 'hi-IN' : 'en-US');
        spellRec.interimResults = false;
        spellRec.maxAlternatives = 3;
        btn.classList.add('listening');
        if (status) status.textContent = tt('spellListening');
        // hint: speak the word slowly
        spellRec.onresult = (e) => {
          const trans = Array.from(e.results[0]).map(r=>r.transcript.toLowerCase()).join(' ');
          const clean = trans.replace(/[^a-z]/g, ''); // remove spaces/punct
          const target = q.target.join('').toLowerCase();
          const spaced = trans.replace(/\s+/g, '').toLowerCase();
          const said = clean === target || spaced === target || trans.includes(target) || trans.replace(/\s/g,'').includes(target);
          btn.classList.remove('listening');
          if (said){
            if (status) status.textContent = tt('spellHeard')+': "'+trans.split(' ').slice(0,3).join(' ')+'" ✓';
            // auto-fill word boxes
            const boxes = card().querySelectorAll('.word-boxes .slot');
            q.target.forEach((ch,i)=>{
              const b = boxes[i];
              if (b){ b.classList.add('filled'); b.textContent = ch; }
            });
            // hide used chips
            card().querySelectorAll('.word-chip').forEach(c=>{ c.style.visibility='hidden'; c.classList.add('used'); });
            window.Game.burstFromElement(card());
            FX.correct();
            // mark placedWord to complete
            placedWord = q.target.length;
            correctAnswer();
          } else {
            if (status) status.textContent = tt('spellHeard')+': "'+trans.split(' ').slice(0,3).join(' ')+'" — '+tt('tryAgain');
            FX.wrong();
            // keep tap fallback
          }
        };
        spellRec.onerror = () => {
          btn.classList.remove('listening');
          if (status) status.textContent = tt('tryAgain') + ' — tap letters';
        };
        spellRec.onend = () => {
          btn.classList.remove('listening');
          if (status && status.textContent === tt('spellListening')) status.textContent = tt('spellVoice');
        };
        spellRec.start();
        setTimeout(()=>{ try{ spellRec.stop(); }catch(_){} }, 4000);
      } catch(err){
        btn.classList.remove('listening');
        if (status) status.textContent = tt('tryAgain');
      }
    };
  }

  function speakQuestion(q){
    const say = tt('tapTheLetter') + '\u2026 ' + q.answer;
    FX.speak(say, voiceLang());
    window.setTimeout(() => FX.speak(q.answer, voiceLang()), 1800);
  }

  function pickLetter(q, btn){
    if (busy) return;
    const ans = q.answer || q.lower;
    if (btn.dataset.a === ans){
      btn.classList.add('correct');
      window.Game.burstFromElement(btn);
      FX.sparkle();
      correctAnswer();
    } else {
      btn.classList.add('wrong');
      window.setTimeout(() => btn.classList.remove('wrong'), 450);
      wrongAnswer();
    }
  }

  /* ---------------- drag (missing letter) ---------------- */
  function setupDrag(q){
    const chips = card().querySelectorAll('.drag-chip');
    const slot = card().querySelector('#m-slot');
    chips.forEach(chip => {
      chip.addEventListener('click', () => selectChip(chip));
      chip.addEventListener('pointerdown', e => {
        if (busy) return;
        e.preventDefault();
        startDrag(chip, e);
      });
    });
    if (slot) slot.addEventListener('click', () => placeChip(q));

    function selectChip(chip){
      if (busy) return;
      if (selChip === chip){ selChip = null; chip.classList.remove('hint'); return; }
      if (selChip) selChip.classList.remove('hint');
      selChip = chip; chip.classList.add('hint');
    }
    function placeChip(q){
      if (busy) return;
      if (!selChip) return;
      const letter = selChip.dataset.l;
      selChip.classList.remove('hint');
      selChip = null;
      answerMissing(q, letter);
    }
  }

  function startDrag(chip, e){
    const r = chip.getBoundingClientRect();
    const offX = e.clientX - r.left, offY = e.clientY - r.top;
    chip.classList.add('dragging');
    const slot = card().querySelector('#m-slot');
    const move = ev => {
      chip.style.left = (ev.clientX - offX) + 'px';
      chip.style.top = (ev.clientY - offY) + 'px';
      if (slot){
        const sr = slot.getBoundingClientRect();
        slot.classList.toggle('dragover', inRect(ev, sr));
      }
    };
    const up = ev => {
      document.removeEventListener('pointermove', move);
      document.removeEventListener('pointerup', up);
      chip.style.left = ''; chip.style.top = '';
      chip.classList.remove('dragging');
      if (slot){ slot.classList.remove('dragover'); const sr = slot.getBoundingClientRect();
        if (inRect(ev, sr)){ answerMissing(q, chip.dataset.l); return; } }
      if (selChip === chip){ selChip = null; }
    };
    document.addEventListener('pointermove', move);
    document.addEventListener('pointerup', up);
  }

  function inRect(ev, r){
    return ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom;
  }

  function answerMissing(q, letter){
    if (busy) return;
    if (letter === q.answer){
      const slot = card().querySelector('#m-slot');
      if (slot){
        slot.classList.remove('hint','dragover');
        slot.classList.add('filled');
        slot.textContent = letter;
      }
      window.Game.burstFromElement(slot || card());
      correctAnswer();
    } else {
      wrongAnswer();
    }
  }

  /* ---------------- word building ---------------- */
  let placedWord = 0;
  function setupWord(){
    const q = qList[qIndex];
    const boxes = card().querySelectorAll('.word-boxes .slot');
    card().querySelectorAll('.word-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        if (busy) return;
        const letter = chip.dataset.l;
        const t = q.target;
        if (letter === t[placedWord]){
          placedWord++;
          chip.style.visibility = 'hidden';
          chip.classList.add('used');
          const box = boxes[placedWord-1];
          box.classList.add('filled');
          box.textContent = letter;
          FX.pop();
          if (placedWord === t.length){
            window.Game.burstFromElement(card());
            correctAnswer();
          } else {
            if (Math.random() < 0.3) window.Game.showMascot(pickPraise());
          }
        } else {
          wrongAnswer();
          chip.classList.add('wrong');
          window.setTimeout(() => chip.classList.remove('wrong'), 450);
        }
      });
    });
  }

  /* ---------------- sort ---------------- */
  function setupSort(q){
    const row = document.getElementById('sort-row');
    row.querySelectorAll('.sort-chip').forEach(chip => {
      chip.addEventListener('pointerdown', e => {
        if (busy) return;
        const r = chip.getBoundingClientRect();
        chip.classList.add('dragging');
        chip.setPointerCapture(e.pointerId);
        const move = ev => {
          chip.style.left = (ev.clientX - r.left - r.width/2) + 'px';
          chip.style.top = '0px';
          const chips = [...row.children];
          const x = ev.clientX;
          let closest = null, minDist = Infinity;
          chips.forEach(c => {
            if (c === chip) return;
            const cr = c.getBoundingClientRect();
            const cx = cr.left + cr.width/2;
            const d = Math.abs(x - cx);
            if (d < minDist){ minDist = d; closest = c; }
          });
          if (closest && minDist < 40){
            const rect = closest.getBoundingClientRect();
            if (x < rect.left + rect.width/2) row.insertBefore(chip, closest);
            else row.insertBefore(chip, closest.nextSibling);
          }
        };
        const up = () => {
          chip.classList.remove('dragging');
          chip.style.left = ''; chip.style.top = '';
          try{ chip.releasePointerCapture(e.pointerId);}catch(_){}
          row.removeEventListener('pointermove', move);
          row.removeEventListener('pointerup', up);
        };
        row.addEventListener('pointermove', move);
        row.addEventListener('pointerup', up);
      });
    });
    document.getElementById('btn-sort-check').onclick = () => {
      if (busy) return;
      const current = [...row.children].map(c => c.dataset.l).join('');
      const target = q.target.join('');
      if (current === target){
        row.querySelectorAll('.sort-chip').forEach(c => c.style.background = 'linear-gradient(180deg,#e8fbf2,#c8f5e2)');
        window.Game.burstFromElement(row);
        correctAnswer();
      } else {
        wrongAnswer();
        row.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:400});
      }
    };
  }

  /* ---------------- memory flip ---------------- */
  function renderMemory(){
    memFlipped = []; memMatched = new Set(); memMoves = 0; memLock = false;
    const cardEl = card();
    cardEl.innerHTML = '';
    const picks = shuffle(LETTERS).slice(0,4);
    const pairs = shuffle([...picks, ...picks]);
    const grid = document.createElement('div');
    grid.className = 'memory-grid';
    pairs.forEach((letter, idx) => {
      const c = document.createElement('div');
      c.className = 'mem-card';
      c.dataset.letter = letter;
      c.dataset.idx = idx;
      c.innerHTML = '<div class="back">?</div><div class="front"><div style="font-size:28px">'+letter+'</div><div style="font-size:22px">'+(LETTER_DATA[letter]?.emoji||'')+'</div></div>';
      c.onclick = () => flipCard(c);
      grid.appendChild(c);
    });
    const head = document.createElement('div');
    head.className = 'intro-card';
    head.style.marginBottom = '6px';
    head.innerHTML = '<div class="ic" style="background:linear-gradient(180deg,#7fb2ff,#5a8de6)">🎴</div><div><b>'+tt('memoryTitle')+'</b><p>'+tt('memoryTap')+' • '+pairs.length/2+' pairs</p></div>';
    const movesEl = document.createElement('div');
    movesEl.id = 'mem-moves';
    movesEl.style.cssText = 'font-size:13px; font-weight:800; color:var(--ink-2); background:rgba(255,255,255,.9); padding:6px 12px; border-radius:40px; border:1px solid rgba(255,255,255,.9);';
    movesEl.textContent = 'Moves: 0';
    cardEl.appendChild(head);
    cardEl.appendChild(movesEl);
    cardEl.appendChild(grid);
  }

  function flipCard(cardEl){
    if (memLock || cardEl.classList.contains('flipped') || memMatched.has(cardEl.dataset.idx)) return;
    FX.pop();
    cardEl.classList.add('flipped');
    memFlipped.push(cardEl);
    if (memFlipped.length === 2){
      memLock = true;
      memMoves++;
      const mEl = document.getElementById('mem-moves');
      if (mEl) mEl.textContent = 'Moves: ' + memMoves;
      const [a,b] = memFlipped;
      if (a.dataset.letter === b.dataset.letter){
        window.setTimeout(() => {
          a.classList.add('matched'); b.classList.add('matched');
          memMatched.add(a.dataset.idx); memMatched.add(b.dataset.idx);
          window.Game.burstFromElement(a);
          FX.correct();
          memFlipped = []; memLock = false;
          if (memMatched.size === 8){
            const pct = memMoves <= 8 ? 0.92 : memMoves <= 12 ? 0.65 : 0.42;
            const correct = memMatched.size/2;
            window.setTimeout(() => window.Game.finishLevel(9, { correct, total:4, pct }), 600);
          } else {
            window.Game.showMascot(pickPraise(), {speak:false});
          }
        }, 420);
      } else {
        window.setTimeout(() => {
          a.classList.remove('flipped'); b.classList.remove('flipped');
          a.classList.add('wrong'); b.classList.add('wrong');
          FX.wrong();
          window.setTimeout(()=>{a.classList.remove('wrong'); b.classList.remove('wrong');}, 400);
          memFlipped = []; memLock = false;
        }, 820);
      }
    }
  }

  /* ---------------- keyboard type (Level 1) ---------------- */
  function renderKeyboard(){
    const cardEl = card();
    cardEl.innerHTML = '';
    const cur = LETTERS[kbIndex];
    const info = LETTER_DATA[cur];
    const head = document.createElement('div');
    head.className = 'intro-card';
    head.innerHTML = '<div class="ic" style="background:linear-gradient(180deg,#FF6B6B,#ff3b3b)">⌨️</div><div><b>'+tt('typeTitle')+'</b><p>'+tt('typeHint')+' — '+cur+'</p></div>';
    const display = document.createElement('div');
    display.className = 'kbd-display';
    display.id = 'kbd-display';
    display.innerHTML = cur + '<small>'+info.word+' '+info.emoji+'</small>';
    display.style.color = LEVELS_META[0].color;
    const hint = document.createElement('div');
    hint.className = 'kbd-hint';
    hint.id = 'kbd-hint';
    hint.textContent = (window.innerWidth < 600 ? tt('typeHintMobile') : tt('typeHint')) + ' : '+cur;
    const grid = document.createElement('div');
    grid.className = 'kbd-grid';
    grid.id = 'kbd-grid';
    // alphabetical order A-Z for kids
    LETTERS.forEach(l => {
      const k = document.createElement('button');
      k.className = 'kbd-key';
      k.textContent = l;
      k.dataset.k = l;
      if (l === cur) k.classList.add('hint');
      k.onclick = () => handleKbdPress(l, k);
      grid.appendChild(k);
    });
    const prog = document.createElement('div');
    prog.style.cssText = 'font-size:13px; font-weight:800; color:var(--ink-2); background:rgba(255,255,255,.9); padding:6px 12px; border-radius:40px; border:1px solid rgba(255,255,255,.9);';
    prog.id = 'kbd-prog';
    prog.textContent = (kbIndex+1)+' / 26';
    cardEl.appendChild(head);
    cardEl.appendChild(display);
    cardEl.appendChild(hint);
    cardEl.appendChild(grid);
    cardEl.appendChild(prog);

    // physical keyboard listener
    if (!window._kbdHandler){
      window._kbdHandler = (e) => {
        if (levelNum !== 1) return;
        const k = e.key.toUpperCase();
        if (!/^[A-Z]$/.test(k)) return;
        const btn = document.querySelector('.kbd-key[data-k="'+k+'"]');
        handleKbdPress(k, btn);
      };
      window.addEventListener('keydown', window._kbdHandler);
    }
    // speak current
    FX.speak(cur + ' for ' + info.word, voiceLang());
  }

  function handleKbdPress(k, btnEl){
    if (levelNum !== 1 || busy) return;
    const cur = LETTERS[kbIndex];
    if (k === cur){
      if (btnEl) { btnEl.classList.add('correct'); window.Game.burstFromElement(btnEl); }
      FX.correct();
      if (navigator.vibrate) try{ navigator.vibrate(40);}catch(_){}
      window.Game.showMascot(pickPraise(), {speak:false});
      // flash display
      const disp = document.getElementById('kbd-display');
      if (disp) { disp.style.background = 'linear-gradient(180deg,#e8fbf2,#c8f5e2)'; disp.style.borderColor = '#1fc99a'; }
      busy = true;
      window.setTimeout(() => {
        kbIndex++;
        busy = false;
        if (kbIndex >= 26){
          window.removeEventListener('keydown', window._kbdHandler);
          window._kbdHandler = null;
          window.Game.finishLevel(1, { correct:26, total:26, pct:1 });
        } else {
          renderKeyboard();
        }
      }, 700);
    } else {
      if (btnEl){ btnEl.classList.add('wrong'); setTimeout(()=>btnEl.classList.remove('wrong'), 400); }
      FX.wrong();
      window.Game.showMascot(tt('tryAgain'));
    }
  }

  /* ---------------- turbo type (Level 12) ---------------- */
  function renderTurbo(){
    const cardEl = card();
    cardEl.innerHTML = '';
    turboActive = false;
    turboScore = 0; turboTotal = 0; turboLeft = 30;
    turboTarget = LETTERS[Math.floor(Math.random()*26)];

    const head = document.createElement('div');
    head.className = 'intro-card';
    head.innerHTML = '<div class="ic" style="background:linear-gradient(180deg,#00D1FF,#0090ff)">⚡</div><div><b>'+tt('turboTitle')+'</b><p>'+tt('turboHint')+' — 30s</p></div>';
    const stats = document.createElement('div');
    stats.style.cssText = 'display:flex;gap:10px;justify-content:center;flex-wrap:wrap;';
    stats.innerHTML = '<div class="mini-stat"><i class="s" style="background:linear-gradient(180deg,#00D1FF,#0090ff)">⏱️</i><span id="turbo-time">30s</span></div><div class="mini-stat"><i class="l" style="background:linear-gradient(180deg,#5fd4a8,#1fc99a)">⚡</i><span id="turbo-score">0</span></div><div class="mini-stat"><i class="s" style="background:linear-gradient(180deg,#FF6B6B,#ff3b3b)">CPM</i><span id="turbo-cpm">0</span></div>';
    const display = document.createElement('div');
    display.className = 'kbd-display';
    display.id = 'turbo-display';
    display.style.cssText = 'width:140px;height:140px;border-radius:28px;display:grid;place-items:center;font-size:72px;font-weight:900;color:var(--ink);background:linear-gradient(180deg,#fff,#fff6cc);border:3px solid #00D1FF;box-shadow:0 8px 0 #0090cc, 0 14px 22px rgba(0,144,204,.18);position:relative;';
    display.textContent = turboTarget;
    const hint = document.createElement('div');
    hint.className = 'kbd-hint';
    hint.id = 'turbo-hint';
    hint.textContent = tt('turboGo');
    const grid = document.createElement('div');
    grid.className = 'kbd-grid';
    grid.id = 'turbo-grid';
    LETTERS.forEach(l => {
      const k = document.createElement('button');
      k.className = 'kbd-key';
      k.textContent = l;
      k.dataset.k = l;
      k.onclick = () => handleTurboPress(l, k);
      grid.appendChild(k);
    });
    const startBtn = document.createElement('button');
    startBtn.className = 'btn btn-primary';
    startBtn.id = 'turbo-start';
    startBtn.textContent = '▶ Start — 30s';
    startBtn.style.marginTop = '8px';
    startBtn.onclick = startTurbo;

    cardEl.appendChild(head);
    cardEl.appendChild(stats);
    cardEl.appendChild(display);
    cardEl.appendChild(hint);
    cardEl.appendChild(grid);
    cardEl.appendChild(startBtn);

    // physical keyboard for turbo
    if (!window._turboHandler){
      window._turboHandler = (e) => {
        if (levelNum !== 12 || !turboActive) return;
        const k = e.key.toUpperCase();
        if (!/^[A-Z]$/.test(k)) return;
        const btn = document.querySelector('#turbo-grid .kbd-key[data-k="'+k+'"]');
        handleTurboPress(k, btn);
      };
      window.addEventListener('keydown', window._turboHandler);
    }
  }

  function startTurbo(){
    const btn = document.getElementById('turbo-start');
    if (btn) btn.style.display = 'none';
    turboActive = true;
    turboScore = 0; turboTotal = 0; turboLeft = 30;
    turboStart = Date.now();
    const targetEl = document.getElementById('turbo-display');
    if (targetEl) targetEl.textContent = turboTarget;
    updateTurboStats();
    turboTimer = setInterval(() => {
      turboLeft -= 0.1;
      const tEl = document.getElementById('turbo-time');
      if (tEl) tEl.textContent = Math.ceil(turboLeft) + 's';
      const fill = document.getElementById('turbo-time-fill');
      if (fill) fill.style.width = (turboLeft/30*100) + '%';
      updateTurboStats();
      if (turboLeft <= 0){
        clearInterval(turboTimer); turboTimer = null;
        endTurbo();
      }
    }, 100);
    // timer bar
    const bar = document.createElement('div');
    bar.className = 'timer-bar';
    bar.style.marginTop = '6px';
    bar.innerHTML = '<div class="timer-fill" id="turbo-time-fill" style="width:100%"></div>';
    const cardEl = card();
    cardEl.insertBefore(bar, cardEl.children[2]);
    FX.speak(tt('turboGo'), voiceLang());
  }

  function handleTurboPress(k, btnEl){
    if (!turboActive || busy) return;
    turboTotal++;
    const cur = turboTarget;
    if (k === cur){
      turboScore++;
      if (btnEl){ btnEl.classList.add('correct'); setTimeout(()=>btnEl.classList.remove('correct'), 300); window.Game.burstFromElement(btnEl); }
      FX.pop();
      // next target
      let next;
      do { next = LETTERS[Math.floor(Math.random()*26)]; } while (next === cur);
      turboTarget = next;
      const disp = document.getElementById('turbo-display');
      if (disp){ disp.textContent = next; disp.animate([{transform:'scale(1)'},{transform:'scale(1.12)'},{transform:'scale(1)'}],{duration:220}); }
    } else {
      if (btnEl){ btnEl.classList.add('wrong'); setTimeout(()=>btnEl.classList.remove('wrong'), 350); }
      FX.wrong();
    }
    updateTurboStats();
  }

  function updateTurboStats(){
    const elapsed = turboActive ? (Date.now() - turboStart)/1000 : 0.1;
    const cpm = elapsed > 0 ? Math.round((turboScore / elapsed) * 60) : 0;
    const wpm = Math.round(cpm / 5);
    const cEl = document.getElementById('turbo-cpm');
    const sEl = document.getElementById('turbo-score');
    if (cEl) cEl.textContent = cpm + ' CPM';
    if (sEl) sEl.textContent = turboScore + ' ('+wpm+' WPM)';
    // store live for finish
    window._turboCPM = cpm;
    window._turboWPM = wpm;
  }

  function endTurbo(){
    turboActive = false;
    const elapsed = 30 - Math.max(0, turboLeft);
    const cpm = elapsed > 0 ? Math.round((turboScore / elapsed) * 60) : 0;
    const wpm = Math.round(cpm/5);
    const acc = turboTotal ? Math.round(turboScore / turboTotal * 100) : 0;
    // stars based on CPM: 40+ =>3, 25+ =>2, else 1 (kid-friendly)
    let stars, pct;
    if (cpm >= 38){ stars=3; pct=0.92; }
    else if (cpm >= 22){ stars=2; pct=0.62; }
    else { stars=1; pct=0.38; }
    // save best
    try{
      const best = parseInt(localStorage.getItem('turboBestCPM')||'0');
      if (cpm > best) localStorage.setItem('turboBestCPM', String(cpm));
    }catch(_){}
    // show result in card before finish
    const cardEl = card();
    if (cardEl){
      cardEl.innerHTML += '<div style="margin-top:10px; background:rgba(255,255,255,.96); border-radius:16px; padding:12px; border:1.5px solid rgba(255,255,255,.9); box-shadow:var(--shadow-soft); text-align:center;"><div style="font-weight:900; font-size:18px;">'+turboScore+' correct • '+acc+'% • '+cpm+' CPM ('+wpm+' WPM)</div><div style="font-size:12px; font-weight:800; color:var(--ink-2); margin-top:4px;">Best: '+(localStorage.getItem('turboBestCPM')||cpm)+' CPM</div></div>';
    }
    // cleanup handler after short delay so finish screen not affected
    setTimeout(()=>{
      if (window._turboHandler){ window.removeEventListener('keydown', window._turboHandler); window._turboHandler=null; }
      window.Game.finishLevel(12, { correct: turboScore, total: Math.max(1, turboTotal), pct, cpm, wpm, acc });
    }, 1200);
  }

  /* ---------------- timer (quiz) ---------------- */
  function startTimer(){
    stopTimer();
    timeLeft = QUIZ_SECONDS;
    timerTotal = QUIZ_SECONDS;
    const fill = $id('timer-fill');
    if (fill) fill.style.width = '100%';
    timerId = window.setInterval(() => {
      timeLeft -= 0.1;
      if (fill) fill.style.width = Math.max(0, timeLeft/timerTotal*100) + '%';
      if (timeLeft <= 0){ stopTimer(); timeUp(); }
    }, 100);
  }
  function stopTimer(){ if (timerId){ clearInterval(timerId); timerId = null; } }
  function timeUp(){
    if (busy) return;
    busy = true;
    firstTry = false;
    FX.wrong();
    window.Game.showMascot(tt('timeUp'));
    window.setTimeout(next, 1000);
  }

  /* ---------------- entry ---------------- */
  function runLevel(n, opts){
    levelNum = n;
    qIndex = 0;
    correctFirst = 0;
    firstTry = true;
    busy = false;
    placedWord = 0;
    stopTimer();
    if (turboTimer){ clearInterval(turboTimer); turboTimer=null; }
    turboActive = false;
    window.Game.setLevelHeader(n);

    body().innerHTML = '';

    if (n === 1){
      kbIndex = 0;
      const dots = document.createElement('div');
      dots.className = 'progress-dots';
      dots.id = 'dots';
      let h=''; for(let i=0;i<26;i++) h += '<div class="dot"></div>';
      dots.innerHTML = h;
      // light up first
      body().appendChild(dots);
      const c = document.createElement('div');
      c.className = 'q-card';
      c.id = 'q-card';
      body().appendChild(c);
      body().style.alignItems = 'stretch';
      body().style.justifyContent = 'center';
      const updateKbDots = () => {
        document.querySelectorAll('.dot').forEach((d,i)=> d.classList.toggle('done', i < kbIndex));
        document.querySelectorAll('.dot').forEach((d,i)=> d.classList.toggle('active', i === kbIndex));
      };
      // wrap renderKeyboard to also update dots
      const origRenderKb = renderKeyboard;
      const wrapped = () => { origRenderKb(); updateKbDots(); };
      // monkey patch for this level session
      const prev = window._kbUpdateDots;
      window._kbUpdateDots = updateKbDots;
      renderKeyboard();
      updateKbDots();
      // override handle to update dots
      const origHandle = handleKbdPress;
      // we will update dots inside handle via interval – simplest: poll
      const iv = setInterval(()=>{ if(levelNum!==1){ clearInterval(iv); return;} updateKbDots(); }, 300);
      return;
    }

    if (n === 2){
      Trace.init({
        body: body(),
        hint: !!(opts && opts.hint),
        onLetterDone: () => {},
        onDone: () => window.Game.finishLevel(2, { correct: 26, total: 26, pct: 1 }),
        onCelebrate: (x,y) => window.Game.burst(x,y,['#ffdd55','#ff7e6b','#5fd4a8','#8f7cf0'])
      });
      body().style.alignItems = 'stretch';
      return;
    }

    if (n === 13){
      // Number Trace 0-9 (manual Next as in Trace)
      const dots = document.createElement('div');
      dots.className = 'progress-dots';
      dots.id = 'dots';
      let h=''; for(let i=0;i<10;i++) h += '<div class="dot"></div>';
      dots.innerHTML = h;
      dots.firstChild && dots.firstChild.classList.add('active');
      body().appendChild(dots);
      const c = document.createElement('div');
      c.className = 'q-card';
      c.id = 'q-card';
      body().appendChild(c);
      body().style.alignItems = 'stretch';
      body().style.justifyContent = 'center';
      Trace.init({
        body: body(),
        charset: NUMBERS,
        hint: !!(opts && opts.hint),
        onLetterDone: (idx) => {
          document.querySelectorAll('.dot').forEach((d,i)=>{
            d.classList.toggle('done', i < idx+1);
            d.classList.toggle('active', i === idx+1);
          });
        },
        onDone: () => window.Game.finishLevel(13, { correct: 10, total: 10, pct: 1 }),
        onCelebrate: (x,y) => window.Game.burst(x,y,['#FF9F1C','#FFD93D','#4ECDC4'])
      });
      return;
    }

    if (n === 9){
      const dots = document.createElement('div');
      dots.className = 'progress-dots';
      dots.id = 'dots';
      dots.innerHTML = '<div class="dot done" style="opacity:1; background:var(--grape)"></div><div class="dot"></div><div class="dot"></div><div class="dot"></div>';
      body().appendChild(dots);
      const c = document.createElement('div');
      c.className = 'q-card';
      c.id = 'q-card';
      body().appendChild(c);
      body().style.alignItems = 'stretch';
      body().style.justifyContent = 'center';
      renderMemory();
      return;
    }

    if (n === 12){
      const dots = document.createElement('div');
      dots.className = 'progress-dots';
      dots.id = 'dots';
      dots.innerHTML = '<div class="dot active"></div><div class="dot"></div><div class="dot"></div>';
      body().appendChild(dots);
      const c = document.createElement('div');
      c.className = 'q-card';
      c.id = 'q-card';
      body().appendChild(c);
      body().style.alignItems = 'stretch';
      body().style.justifyContent = 'center';
      renderTurbo();
      return;
    }

    qList = buildQuestions(n);

    const dots = document.createElement('div');
    dots.className = 'progress-dots';
    dots.id = 'dots';
    let dotsHtml = '';
    for (let i=0;i<qList.length;i++) dotsHtml += '<div class="dot"></div>';
    dots.innerHTML = dotsHtml;
    body().appendChild(dots);

    const card = document.createElement('div');
    card.className = 'q-card';
    card.id = 'q-card';
    body().appendChild(card);

    body().style.alignItems = 'stretch';
    body().style.justifyContent = 'center';

    render();
  }

  // add word/spell tap handler on render for word type
  const _render = render;
  render = function(){
    _render();
    const q = qList[qIndex];
    if (q && (q.type === 'word' || q.type === 'spell')){
      placedWord = 0;
      setupWord();
    }
  };

  function cleanup(){
    if (turboTimer){ clearInterval(turboTimer); turboTimer=null; }
    turboActive=false;
    if (phonicsRec){ try{ phonicsRec.abort(); }catch(_){} phonicsRec=null; }
    if (spellRec){ try{ spellRec.abort(); }catch(_){} spellRec=null; }
  }

  return { runLevel, cleanup };
})();
window.Levels = Levels;
