/* ============ ABC Champ — Level 1: Trace & Write (canvas) — Manual complete ============ */
const Trace = (function(){
  const W = 560, H = 420;
  const BRUSH = 28;
  const THRESH = 0.62;           // must fill ~62% to enable Next — "trace completely"
  const BRUSH_COLORS = ['#ff7e6b','#ffb62e','#5fd4a8','#8f7cf0','#4fc3f7','#ff8eb8'];

  let wrapper = null, box = null, ghostCv = null, paintCv = null;
  let ghostX = null, paintX = null, maskCv = null, maskX = null;
  let bbox = null, maskCount = 0;
  let index = 0, painting = false, cooling = false, fin = false;
  let last = {x:0,y:0}, brushIdx = 0, lastCheck = 0;
  let opts = {};
  let nextBtn = null, progFill = null, progText = null, progWrap = null;

  function fontPx(){ return '900 320px "Comic Sans MS","Segoe UI",cursive,sans-serif'; }
  function letter(){ return LETTERS[index]; }

  function tagRow(){
    const row = document.createElement('div');
    row.className = 'trace-letter-tag';
    row.id = 'trace-tag';
    row.innerHTML = '<i>✏️</i><span></span>';
    return row;
  }
  function updateTag(){
    const el = document.getElementById('trace-tag');
    if (!el) return;
    el.querySelector('span').textContent = tt('traceMe') + '  ' + (index + 1) + ' / 26  •  ' + letter();
    el.querySelector('i').textContent = letter();
  }

  function buildCanvas(){
    box = document.createElement('div');
    box.className = 'trace-box';
    box.style.cssText = 'position:relative;width:100%;max-width:560px;margin:0 auto;aspect-ratio:560/420;background:#fff;border-radius:22px;box-shadow:0 10px 24px rgba(31,64,120,.12), inset 0 1px 0 #fff; overflow:hidden; border:1.5px solid rgba(255,255,255,.9);';
    if (!CSS.supports('aspect-ratio','1 / 1')){
      box.style.height = '0';
      box.style.paddingBottom = (H/W*100) + '%';
    }
    ghostCv = document.createElement('canvas');
    paintCv = document.createElement('canvas');
    [ghostCv, paintCv].forEach(c => {
      c.width = W; c.height = H;
      c.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;touch-action:none;display:block;';
      box.appendChild(c);
    });
    ghostCv.style.zIndex = '1';
    paintCv.style.zIndex = '2';
    paintCv.style.cursor = 'crosshair';
    wrapper.appendChild(box);

    // progress bar under canvas
    progWrap = document.createElement('div');
    progWrap.style.cssText = 'width:100%;max-width:560px;margin:8px auto 0;display:flex;flex-direction:column;align-items:center;gap:6px;';
    progWrap.innerHTML = '<div style="width:100%;height:10px;background:#eef2f8;border-radius:20px;overflow:hidden;border:1px solid rgba(255,255,255,.9);box-shadow:inset 0 1px 3px rgba(0,0,0,.06);"><div id="trace-prog-fill" style="height:100%;width:0%;background:linear-gradient(90deg,#5fd4a8,#ffd35c);border-radius:20px;transition:width .25s ease;"></div></div><div id="trace-prog-text" style="font-size:13px;font-weight:900;color:var(--ink-2);background:rgba(255,255,255,.9);padding:5px 12px;border-radius:40px;border:1px solid rgba(255,255,255,.9);">Trace the dotted letter fully!</div>';
    wrapper.appendChild(progWrap);
    progFill = document.getElementById('trace-prog-fill');
    progText = document.getElementById('trace-prog-text');

    requestAnimationFrame(() => {
      if (index < LETTERS.length) buildLetter(LETTERS[index]);
    });

    paintCv.addEventListener('pointerdown', onDown, {passive:false});
    paintCv.addEventListener('pointermove', onMove, {passive:false});
    paintCv.addEventListener('pointerup', onUp);
    paintCv.addEventListener('pointercancel', onUp);
    paintCv.addEventListener('pointerleave', onUp);
    paintCv.addEventListener('touchstart', e => e.preventDefault(), {passive:false});
  }

  function buildControls(){
    const ctrls = document.createElement('div');
    ctrls.className = 'trace-controls';
    ctrls.style.cssText = 'display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:10px;';
    const listen = document.createElement('button');
    listen.className = 'listen-btn';
    listen.innerHTML = '🔊 ' + (UI_LANG === 'hi' ? 'सुनो' : 'Listen');
    listen.title = 'Listen';
    listen.onclick = e => { e.stopPropagation(); FX.ensure(); sayLetter(); };
    ctrls.appendChild(listen);

    const clearBtn = document.createElement('button');
    clearBtn.className = 'btn tiny';
    clearBtn.textContent = UI_LANG === 'hi' ? '🧹 साफ़' : '🧹 Clear';
    clearBtn.title = 'Clear';
    clearBtn.onclick = () => {
      if (cooling || fin) return;
      FX.click();
      clearPaint();
      updateProgress(0);
    };
    ctrls.appendChild(clearBtn);

    nextBtn = document.createElement('button');
    nextBtn.className = 'btn btn-primary';
    nextBtn.id = 'trace-next';
    nextBtn.textContent = (UI_LANG === 'hi' ? 'अगला →' : 'Next →');
    nextBtn.disabled = true;
    nextBtn.style.opacity = '0.45';
    nextBtn.style.pointerEvents = 'none';
    nextBtn.onclick = () => {
      if (nextBtn.disabled || cooling || fin) return;
      completeLetter();
    };
    ctrls.appendChild(nextBtn);

    if (opts.hint) {
      const hint = document.createElement('button');
      hint.className = 'hint-btn';
      hint.textContent = '✨ ' + (UI_LANG === 'hi' ? 'मदद करो' : 'Help me');
      hint.onclick = () => {
        // fill quickly to enable Next (for testing) – still requires Next press
        quickFill();
      };
      ctrls.appendChild(hint);
    }
    wrapper.appendChild(ctrls);
  }

  function clearPaint(){
    if (!paintX) return;
    paintX.clearRect(0,0,W,H);
    updateProgress(0);
  }

  function quickFill(){
    // for hint: fake a decent stroke to show how it works, then enable Next
    if (!paintX || !maskX) return;
    // draw a thick line across center to simulate tracing
    paintX.save();
    paintX.globalAlpha = 0.9;
    paintX.fillStyle = BRUSH_COLORS[brushIdx % BRUSH_COLORS.length];
    paintX.beginPath();
    paintX.arc(W/2, H*0.54, 90, 0, Math.PI*2);
    paintX.fill();
    paintX.restore();
    const r = getCoverageRatio();
    updateProgress(r);
  }

  function buildLetter(l){
    if (!ghostCv || !paintCv) return;
    ghostX = ghostCv.getContext('2d');
    paintX = paintCv.getContext('2d');
    maskCv = document.createElement('canvas');
    maskCv.width = W; maskCv.height = H;
    maskX = maskCv.getContext('2d');

    ghostX.clearRect(0,0,W,H);
    paintX.clearRect(0,0,W,H);
    maskX.clearRect(0,0,W,H);

    ghostX.save();
    ghostX.font = fontPx();
    ghostX.textAlign = 'center';
    ghostX.textBaseline = 'middle';
    ghostX.fillStyle = 'rgba(150,178,224,.16)';
    ghostX.fillText(l, W/2, H*0.54);
    ghostX.strokeStyle = 'rgba(112,146,205,.42)';
    ghostX.lineWidth = 7;
    ghostX.lineJoin = 'round';
    ghostX.setLineDash([10, 10]);
    ghostX.strokeText(l, W/2, H*0.54);
    ghostX.setLineDash([]);
    ghostX.fillStyle = 'rgba(255,255,255,.95)';
    ghostX.font = '900 16px "Comic Sans MS",cursive';
    ghostX.fillText('↖ trace me', W*0.18, H*0.18);
    ghostX.restore();

    maskX.font = fontPx();
    maskX.textAlign = 'center';
    maskX.textBaseline = 'middle';
    maskX.fillStyle = '#000';
    maskX.fillText(l, W/2, H*0.54);

    computeMask();
    updateTag();
    updateProgress(0);
    if (nextBtn){
      nextBtn.disabled = true;
      nextBtn.style.opacity = '0.45';
      nextBtn.style.pointerEvents = 'none';
    }
  }

  function computeMask(){
    const d = maskX.getImageData(0,0,W,H).data;
    let minX=W, minY=H, maxX=-1, maxY=-1, count=0;
    for (let y=0; y<H; y++){
      for (let x=0; x<W; x++){
        if (d[(y*W+x)*4+3] > 20){
          count++;
          if (x<minX) minX=x;
          if (x>maxX) maxX=x;
          if (y<minY) minY=y;
          if (y>maxY) maxY=y;
        }
      }
    }
    const pad = 6;
    bbox = {
      minX: Math.max(0, minX - pad),
      minY: Math.max(0, minY - pad),
      maxX: Math.min(W-1, maxX + pad),
      maxY: Math.min(H-1, maxY + pad)
    };
    maskCount = count;
  }

  function cssToLogical(e){
    const r = box.getBoundingClientRect();
    const scaleX = W / r.width;
    const scaleY = H / r.height;
    return { x: (e.clientX - r.left) * scaleX, y: (e.clientY - r.top) * scaleY };
  }

  function brush(cx, cy, size){
    paintX.beginPath();
    paintX.fillStyle = BRUSH_COLORS[brushIdx % BRUSH_COLORS.length];
    paintX.shadowColor = 'rgba(0,0,0,.07)';
    paintX.shadowBlur = 5;
    paintX.arc(cx, cy, size, 0, Math.PI*2);
    paintX.fill();
    paintX.shadowBlur = 0;
  }

  function lineTo(a, b){
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const steps = Math.max(1, Math.ceil(dist / 4));
    for (let i = 0; i <= steps; i++){
      const t = i / steps;
      const x = a.x + (b.x - a.x)*t;
      const y = a.y + (b.y - a.y)*t;
      const jitter = 0.9 + Math.random()*0.2;
      brush(x, y, BRUSH * jitter);
    }
  }

  function getCoverageRatio(){
    if (!bbox || maskCount === 0) return 0;
    const x0 = bbox.minX, y0 = bbox.minY;
    const w = bbox.maxX - bbox.minX + 1, h = bbox.maxY - bbox.minY + 1;
    if (w <= 0 || h <= 0) return 0;
    const d = paintX.getImageData(x0, y0, w, h).data;
    let painted = 0;
    for (let i=3; i < d.length; i+=4){
      if (d[i] > 20) painted++;
    }
    const ratio = painted / maskCount;
    window.__traceRatio = ratio;
    return ratio;
  }

  function updateProgress(ratio){
    if (!progFill || !progText || !nextBtn) return;
    const pct = Math.round(Math.min(100, ratio * 100));
    progFill.style.width = pct + '%';
    if (pct < 15){
      progText.textContent = UI_LANG === 'hi' ? 'अक्षर पर लिखो…' : 'Trace the dotted letter fully!';
      progText.style.color = 'var(--ink-2)';
    } else if (pct < THRESH*100){
      progText.textContent = pct + '% — ' + (UI_LANG === 'hi' ? 'और थोड़ा!' : 'keep going!');
      progText.style.color = 'var(--ink-2)';
    } else {
      progText.textContent = '✓ ' + pct + '% — ' + (UI_LANG === 'hi' ? 'तैयार! Next दबाओ →' : 'Great! Tap Next →');
      progText.style.color = 'var(--mint-deep)';
    }
    const ready = ratio >= THRESH;
    nextBtn.disabled = !ready;
    nextBtn.style.opacity = ready ? '1' : '0.45';
    nextBtn.style.pointerEvents = ready ? 'auto' : 'none';
    if (ready){
      nextBtn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:320, easing:'ease-out'});
    }
  }

  function completeLetter(){
    if (cooling || fin) return;
    // double-check threshold – if not reached, shake Next and nudge
    const ratio = getCoverageRatio();
    if (ratio < THRESH){
      if (nextBtn) nextBtn.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});
      updateProgress(ratio);
      FX.wrong();
      return;
    }
    cooling = true;
    painting = false;
    FX.ensure();
    FX.starPop();
    FX.sparkle();
    if (navigator.vibrate) try{ navigator.vibrate(60); }catch(_){ }
    const r = box.getBoundingClientRect();
    const sx = r.left + r.width/2;
    const sy = r.top + r.height*0.54;
    if (opts.onCelebrate) opts.onCelebrate(sx, sy);
    if (opts.onLetterDone) opts.onLetterDone(index);
    forceSay(pickPraise());
    ghostX.save();
    ghostX.globalAlpha = 0.88;
    ghostX.fillStyle = BRUSH_COLORS[brushIdx % BRUSH_COLORS.length];
    ghostX.font = fontPx();
    ghostX.textAlign = 'center';
    ghostX.textBaseline = 'middle';
    ghostX.fillText(letter(), W/2, H*0.54);
    ghostX.restore();

    setTimeout(() => {
      cooling = false;
      index++;
      if (index >= LETTERS.length){
        fin = true;
        if (opts.onDone) opts.onDone();
      } else {
        buildLetter(LETTERS[index]);
        brushIdx++;
        setTimeout(sayLetter, 300);
      }
    }, 900);
  }

  function sayLetter(){
    const info = LETTER_DATA[letter()];
    if (!info) return;
    if (UI_LANG === 'hi'){
      FX.speak(letter() + '. ' + letter() + ' for ' + info.hindi, 'hi');
    } else {
      FX.speak(letter() + '. ' + letter() + ' for ' + info.word, 'en');
    }
  }
  function forceSay(t){
    if (window.__voiceEnabled !== false){
      FX.speak(t, UI_LANG === 'hi' ? 'hi' : 'en');
    }
  }

  function onDown(e){
    if (cooling || fin) return;
    e.preventDefault();
    FX.ensure();
    painting = true;
    last = cssToLogical(e);
    try { paintCv.setPointerCapture(e.pointerId); } catch(_){}
    brush(last.x, last.y, BRUSH);
    updateProgress(getCoverageRatio());
  }
  function onMove(e){
    if (!painting) return;
    e.preventDefault();
    const p = cssToLogical(e);
    lineTo(last, p);
    last = p;
    // throttle progress update
    const now = performance.now();
    if (now - lastCheck > 80){
      lastCheck = now;
      updateProgress(getCoverageRatio());
    }
  }
  function onUp(e){
    if (!painting) return;
    e.preventDefault();
    painting = false;
    try { paintCv.releasePointerCapture(e.pointerId); } catch(_){}
    updateProgress(getCoverageRatio());
  }

  function init(options){
    opts = Object.assign({ onLetterDone:null, onDone:null, onCelebrate:null, hint:false }, options);
    index = 0; cooling = false; fin = false; brushIdx = 0; lastCheck = 0;
    const body = opts.body;
    body.innerHTML = '';
    wrapper = document.createElement('div');
    wrapper.className = 'trace-stage';
    const tip = document.createElement('div');
    tip.className = 'sub-tip';
    tip.textContent = tt('traceTip');
    wrapper.appendChild(tip);
    const tag = tagRow();
    wrapper.appendChild(tag);
    body.appendChild(wrapper);
    buildCanvas();
    buildControls();
    buildLetter(LETTERS[0]);
    setTimeout(sayLetter, 400);
    updateProgress(0);
    return { done: () => fin };
  }

  return { init };
})();

window.__voiceEnabled = true;
