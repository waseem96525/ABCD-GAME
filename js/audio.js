/* ============ ABC Champ — audio engine (Web Audio + Speech) ============ */
const FX = (function(){
  let ctx = null;
  let audioReady = false;
  let musicOn = true, sfxOn = true, voiceOn = true;
  let musicTimer = null, musicBeat = 0, musicLast = 0;
  const beatDur = 0.42;

  function ensure(){
    if (!ctx){
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return !!ctx;
  }

  function tone(freq, opts){
    if (!sfxOn) return;
    if (!ensure()) return;
    const o = opts || {};
    const type = o.type || 'sine';
    const dur = o.dur || 0.3;
    const gain = o.gain != null ? o.gain : 0.2;
    const delay = o.delay || 0;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide){ osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur); }
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  /* ---------- sound effects ---------- */
  function click(){ tone(880, {type:'triangle', dur:0.07, gain:0.12}); }
  function pop(){ tone(660, {type:'triangle', dur:0.12, gain:0.2, slide:990}); }
  function sparkle(){
    [988, 1319, 1760, 2637].forEach((f,i)=> tone(f, {type:'triangle', dur:0.35, gain:0.14, delay:i*0.06}));
  }
  function correct(){
    [523.25, 659.25, 783.99, 1046.5].forEach((f,i)=> tone(f, {type:'triangle', dur:0.3, gain:0.18, delay:i*0.07}));
    [1568, 2093].forEach((f,i)=> tone(f, {type:'sine', dur:0.45, gain:0.06, delay:0.28 + i*0.02}));
  }
  function wrong(){
    tone(392, {type:'sine', dur:0.28, gain:0.12});
    tone(330, {type:'sine', dur:0.34, gain:0.12, delay:0.16});
    tone(294, {type:'sine', dur:0.4, gain:0.1, delay:0.32});
  }
  function win(){
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f,i)=> tone(f, {type:'triangle', dur:0.4, gain:0.2, delay:i*0.1}));
    [261.63, 329.63, 392.0, 523.25].forEach(f=> tone(f, {type:'sine', dur:1.2, gain:0.05, delay:0.05}));
    [1568, 2093, 2637].forEach((f,i)=> tone(f, {type:'triangle', dur:0.5, gain:0.15, delay:0.5 + i*0.12}));
  }
  function starPop(){ [1318.5, 1760].forEach((f,i)=> tone(f, {type:'triangle', dur:0.4, gain:0.18, delay:i*0.09})); }

  /* ---------- music ---------- */
  const melody = [
    523.25, 587.33, 659.25, 523.25, 659.25, 783.99, 0, 587.33,
    659.25, 783.99, 880, 659.25, 587.33, 523.25, 0, 0
  ];
  const chords = [
    [261.63, 329.63, 392.0],
    [220.0, 261.63, 329.63],
    [174.61, 220.0, 261.63],
    [196.0, 246.94, 293.66]
  ];

  function padChord(notes, dur){
    notes.forEach(f => tone(f, {type:'sine', dur, gain:0.035}));
  }

  function musicTick(){
    if (!musicOn || !ctx) return;
    const n = melody[musicBeat % melody.length];
    if (n) tone(n, {type:'triangle', dur:beatDur*0.9, gain:0.045});
    if (musicBeat % 8 === 0) padChord(chords[(musicBeat/8) % chords.length], beatDur*4);
    musicBeat++;
    musicLast += beatDur;
    const wait = Math.max(0, (musicLast - ctx.currentTime) * 1000);
    musicTimer = setTimeout(musicTick, wait);
  }
  function startMusic(){
    if (!ensure() || !musicOn) return;
    if (musicTimer) return;
    musicBeat = 0;
    musicLast = ctx.currentTime + 0.05;
    musicTick();
  }
  function stopMusic(){
    if (musicTimer){ clearTimeout(musicTimer); musicTimer = null; }
  }
  function setMusic(on){
    musicOn = on;
    if (on){ if (audioReady) startMusic(); }
    else stopMusic();
  }
  function setSfx(on){ sfxOn = on; }
  function setVoice(on){ voiceOn = on; }

  /* call once from a user gesture to unlock audio & start music */
  function unlock(){
    if (!ensure()) return;
    audioReady = true;
    if (musicOn) startMusic();
  }

  /* ---------- speech ---------- */
  function speak(text, langKey){
    if (!voiceOn) return;
    if (!('speechSynthesis' in window)) return;
    try {
      const u = new SpeechSynthesisUtterance(text);
      const langMap = { hi:'hi-IN', ur:'ur-PK', en:'en-US' };
      const wantLang = langMap[langKey] || 'en-US';
      const wantBase = wantLang.split('-')[0].toLowerCase();
      const voices = window.speechSynthesis.getVoices();
      const pick = voices.find(v => v.lang && v.lang.toLowerCase().startsWith(wantBase))
                || voices.find(v => v.lang && v.lang.toLowerCase().startsWith('en'))
                || voices.find(v => v.lang && v.lang.toLowerCase() === 'en-us')
                || voices[0];
      if (pick) u.voice = pick;
      u.lang = wantLang;
      u.pitch = 1.25;
      u.rate = 0.92;
      u.volume = 1;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch(e){ /* speech not available */ }
  }
  function stopSpeaking(){ if ('speechSynthesis' in window) window.speechSynthesis.cancel(); }
  if ('speechSynthesis' in window){
    const load = () => window.speechSynthesis.getVoices();
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }

  /* keep speech alive on long text-less UI (some browsers pause) */
  setInterval(function(){
    if ('speechSynthesis' in window && window.speechSynthesis.pending && !window.speechSynthesis.speaking){
      window.speechSynthesis.resume();
    }
  }, 250);

  return {
    ensure, click, pop, sparkle, correct, wrong, win, starPop, unlock,
    setMusic, setSfx, setVoice, startMusic, stopMusic, speak, stopSpeaking,
    isSfxOn: () => sfxOn
  };
})();
window.FX = FX;