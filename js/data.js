/* ============ ABC Champ — static game data ============ */

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const LETTER_DATA = {
  A:{word:'Apple',    emoji:'🍎', hindi:'सेब'},
  B:{word:'Ball',     emoji:'🎈', hindi:'गेंद'},
  C:{word:'Cat',      emoji:'🐱', hindi:'बिल्ली'},
  D:{word:'Dog',      emoji:'🐶', hindi:'कुत्ता'},
  E:{word:'Elephant', emoji:'🐘', hindi:'हाथी'},
  F:{word:'Fish',     emoji:'🐟', hindi:'मछली'},
  G:{word:'Grapes',   emoji:'🍇', hindi:'अंगूर'},
  H:{word:'Hat',      emoji:'🎩', hindi:'टोपी'},
  I:{word:'Ice cream',emoji:'🍦', hindi:'आइसक्रीम'},
  J:{word:'Juice',    emoji:'🧃', hindi:'जूस'},
  K:{word:'Kite',     emoji:'🪁', hindi:'पतंग'},
  L:{word:'Lion',     emoji:'🦁', hindi:'शेर'},
  M:{word:'Mango',    emoji:'🥭', hindi:'आम'},
  N:{word:'Nest',     emoji:'🪺', hindi:'घोंसला'},
  O:{word:'Orange',   emoji:'🍊', hindi:'संतरा'},
  P:{word:'Penguin',  emoji:'🐧', hindi:'पेंगुइन'},
  Q:{word:'Queen',    emoji:'👑', hindi:'रानी'},
  R:{word:'Rabbit',   emoji:'🐰', hindi:'खरगोश'},
  S:{word:'Sun',      emoji:'☀️', hindi:'सूरज'},
  T:{word:'Train',    emoji:'🚂', hindi:'ट्रेन'},
  U:{word:'Umbrella', emoji:'☂️', hindi:'छाता'},
  V:{word:'Van',      emoji:'🚐', hindi:'वैन'},
  W:{word:'Watermelon',emoji:'🍉', hindi:'तरबूज'},
  X:{word:'X-ray',    emoji:'🦴', hindi:'एक्स-रे'},
  Y:{word:'Yo-yo',    emoji:'🪀', hindi:'यो-यो'},
  Z:{word:'Zebra',    emoji:'🦓', hindi:'ज़ेबरा'}
};

const LETTER_INFO = LETTERS.map(l => ({letter:l, ...LETTER_DATA[l]}));

/* Simple words for Level 5 (Word Building) */
const WORD_POOL = [
  {word:'CAT', emoji:'🐱'},
  {word:'DOG', emoji:'🐶'},
  {word:'SUN', emoji:'☀️'},
  {word:'CUP', emoji:'☕'},
  {word:'HAT', emoji:'🎩'},
  {word:'BED', emoji:'🛏️'},
  {word:'CAR', emoji:'🚗'},
  {word:'BUS', emoji:'🚌'},
  {word:'BALL',emoji:'⚽'},
  {word:'FISH',emoji:'🐟'},
  {word:'TREE',emoji:'🌳'},
  {word:'STAR',emoji:'⭐'}
];
const SPELL_POOL = [
  {word:'BOOK', emoji:'📚'},
  {word:'FROG', emoji:'🐸'},
  {word:'LION', emoji:'🦁'},
  {word:'BIRD', emoji:'🐦'},
  {word:'CLOUD',emoji:'☁️'},
  {word:'HOUSE',emoji:'🏠'},
  {word:'APPLE',emoji:'🍎'},
  {word:'GRAPE',emoji:'🍇'},
  {word:'PLANT',emoji:'🌱'},
  {word:'SMILE',emoji:'😊'},
  {word:'WATER',emoji:'💧'},
  {word:'HEART',emoji:'❤️'}
];

/* -------------------- Level names / icons (12 levels — Type first, Trace kept as #2, Turbo last) -------------------- */
const LEVELS_META = [
  {name:'Type & Learn',  icon:'⌨️', color:'#FF6B6B'},
  {name:'Trace & Write', icon:'✏️', color:'#ff7e6b'},
  {name:'Picture Match', icon:'🖼️', color:'#ffb62e'},
  {name:'Listen & Tap',  icon:'👂', color:'#5fd4a8'},
  {name:'Missing Letter',icon:'🧩', color:'#8f7cf0'},
  {name:'Word Builder',  icon:'🧱', color:'#4fc3f7'},
  {name:'Quiz Champ',    icon:'🏆', color:'#ff8a5c'},
  {name:'Big & Small',   icon:'🔤', color:'#ff7fa3'},
  {name:'Memory Flip',   icon:'🎴', color:'#7fb2ff'},
  {name:'Sort the Line', icon:'↕️', color:'#7ed957'},
  {name:'Spell Star',    icon:'✨', color:'#b983ff'},
  {name:'Turbo Type',    icon:'⚡', color:'#00D1FF'}
];

const BADGES = [
  {id:1, icon:'⌨️', name:'Keyboard Star'},
  {id:2, icon:'🖍️', name:'Alphabet Artist'},
  {id:3, icon:'🍎', name:'Picture Pro'},
  {id:4, icon:'👂', name:'Super Listener'},
  {id:5, icon:'🧩', name:'Puzzle Pal'},
  {id:6, icon:'🧱', name:'Word Wizard'},
  {id:7, icon:'🏆', name:'Quiz Champion'},
  {id:8, icon:'🔤', name:'Case Master'},
  {id:9, icon:'🎴', name:'Memory Star'},
  {id:10,icon:'↕️', name:'Sorting Pro'},
  {id:11,icon:'✨', name:'Spell Star'},
  {id:12,icon:'⚡', name:'Turbo Typer'},
  {id:'all', icon:'🏅', name:'Adventure Star'},
  {id:'stars', icon:'⭐', name:'Shiny Champion'}
];

/* -------------------- i18n strings -------------------- */
const I18N = {
  en:{
    play:'Play',
    tip:'Tap the big button to start your adventure!',
    homeBubble:'Hi! I\u2019m Zippy the Fox! Let\u2019s learn A B C!',
    mapTitle:'Adventure Map',
    tap:'Tap it!',
    typeTitle:'Type the letter!',
    typeHint:'Press the key on your keyboard',
    typeHintMobile:'Tap the key below',
    turboTitle:'Turbo Type!',
    turboHint:'Type as fast as you can!',
    turboGo:'GO!',
    turboTime:'Time',
    turboSpeed:'Speed',
    turboCPM:'CPM',
    turboWPM:'WPM',
    turboBest:'Best',
    whichLetter:'Which letter?',
    tapTheLetter:'Tap the letter',
    tapTheWord:'Tap the letter that spells',
    fillMissing:'What\u2019s missing?',
    dragMissing:'Drag the letter into the box!',
    buildWord:'Make the word!',
    buildTap:'Tap the letters in order!',
    pressStart:'Press the button to hear it!',
    listenBtn:'Press to listen',
    ready:'Ready? Let\u2019s go!',
    traceMe:'Trace the letter!',
    traceTip:'Use your finger to draw on the letter',
    caseMatch:'Match Big & Small!',
    caseTap:'Tap the small letter for',
    memoryTitle:'Find the pairs!',
    memoryTap:'Flip two cards',
    sortTitle:'Put in order!',
    sortHint:'Drag to arrange A → Z',
    spellTitle:'Spell the word!',
    spellHint:'Arrange the letters',
    praises:['Great job!','Awesome!','Wonderful!','Super!','You\u2019re a star!','Fantastic!','Keep it up!','So smart!'],
    tryAgain:'Try again, you\u2019re close!',
    levelWon:'Level Won!',
    allLetters:'You traced all 26 letters!',
    newBadge:'New sticker unlocked!',
    starsGot:'stars',
    breakTitle:'Let\u2019s take a break!',
    breakMsg:'Stretch, drink some water & rest your eyes.',
    breakBtn:'I\u2019m ready!',
    parentGate:'For grown-ups! Press & hold the star\u2026',
    wrongWord:'Almost! Try the next letter.',
    timeUp:'Time\u2019s up!',
    go:'Go!'
  },
  hi:{
    play:'खेलें',
    tip:'बड़ा बटन दबाओ और मज़े करो!',
    homeBubble:'नमस्ते! मैं ज़िप्पी द फॉक्स! चलो A B C सीखें!',
    mapTitle:'सफ़र का नक्शा',
    tap:'दबाओ!',
    typeTitle:'अक्षर टाइप करो!',
    typeHint:'कीबोर्ड पर बटन दबाओ',
    typeHintMobile:'नीचे बटन दबाओ',
    turboTitle:'तेज़ टाइप!',
    turboHint:'जितनी तेज़ हो सके टाइप करो!',
    turboGo:'चलो!',
    turboTime:'समय',
    turboSpeed:'गति',
    turboCPM:'CPM',
    turboWPM:'WPM',
    turboBest:'सर्वश्रेष्ठ',
    whichLetter:'कौन सा अक्षर?',
    tapTheLetter:'यह अक्षर दबाओ',
    tapTheWord:'यह अक्षर दबाओ जो बनाता है',
    fillMissing:'क्या गुम है?',
    dragMissing:'अक्षर को डिब्बे में रखो!',
    buildWord:'शब्द बनाओ!',
    buildTap:'अक्षर क्रम से दबाओ!',
    pressStart:'सुनने के लिए दबाओ!',
    listenBtn:'सुनने के लिए दबाओ',
    ready:'तैयार? चलो शुरू करें!',
    traceMe:'अक्षर पर लिखो!',
    traceTip:'अपनी उंगली से अक्षर के ऊपर लिखो',
    caseMatch:'बड़ा-छोटा मिलाओ!',
    caseTap:'इसका छोटा अक्षर चुनो',
    memoryTitle:'जोड़ी ढूंढो!',
    memoryTap:'दो पत्ते पलटो',
    sortTitle:'क्रम में लगाओ!',
    sortHint:'A से Z तक खींचो',
    spellTitle:'शब्द बनाओ!',
    spellHint:'अक्षर सजाओ',
    praises:['शाबाश!','बहुत अच्छे!','शानदार!','सुपर!','तुम तारा हो!','बहुत बढ़िया!','जारी रखो!','कितने स्मार्ट हो!'],
    tryAgain:'फिर कोशिश करो, तुम पास ही हो!',
    levelWon:'लेवल जीत गए!',
    allLetters:'तुमने पूरे 26 अक्षर लिखे!',
    newBadge:'नया स्टिकर मिला!',
    starsGot:'सितारे',
    breakTitle:'थोड़ा आराम करो!',
    breakMsg:'पानी पियो और आँखों को आराम दो।',
    breakBtn:'मैं तैयार हूँ!',
    parentGate:'बड़ों के लिए! सितारा दबाकर रखो\u2026',
    wrongWord:'लगभग सही! अगला अक्षर दबाओ।',
    timeUp:'समय खत्म!',
    go:'चलो!'
  }
};

/* -------------------- helpers -------------------- */
function $id(id){ return document.getElementById(id); }
function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function pickRand(arr, n, exclude){
  const pool = arr.filter(x => x !== exclude);
  const out = [];
  while (out.length < Math.min(n, pool.length)){
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}

/* language helpers */
let UI_LANG = 'en';
function tt(key){
  const dict = I18N[UI_LANG] || I18N.en;
  return dict[key] != null ? dict[key] : (I18N.en[key] != null ? I18N.en[key] : key);
}
function pickPraise(){
  const arr = (I18N[UI_LANG] || I18N.en).praises;
  return arr[Math.floor(Math.random() * arr.length)];
}
function speechTextForLetter(letter){
  return UI_LANG === 'hi' ? 'अक्षर ' + letter : 'letter ' + letter;
}