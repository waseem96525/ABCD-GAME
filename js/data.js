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

const NUMBERS = '0123456789'.split('');
const NUMBER_DATA = {
  '0':{word:'Zero',  emoji:'0️⃣', hindi:'शून्य'},
  '1':{word:'One',   emoji:'1️⃣', hindi:'एक'},
  '2':{word:'Two',   emoji:'2️⃣', hindi:'दो'},
  '3':{word:'Three', emoji:'3️⃣', hindi:'तीन'},
  '4':{word:'Four',  emoji:'4️⃣', hindi:'चार'},
  '5':{word:'Five',  emoji:'5️⃣', hindi:'पाँच'},
  '6':{word:'Six',   emoji:'6️⃣', hindi:'छह'},
  '7':{word:'Seven', emoji:'7️⃣', hindi:'सात'},
  '8':{word:'Eight', emoji:'8️⃣', hindi:'आठ'},
  '9':{word:'Nine',  emoji:'9️⃣', hindi:'नौ'}
};
const COUNT_EMOJIS = ['🍎','⭐','🐶','🎈','🍦','🚗','🍇','🐱'];
const MATH_EMOJIS = ['🍎','⭐','🐶','🎈','🍦','🚗','🍇','🐱','⚽','🐟'];

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

/* -------------------- Level names / icons (17 levels — Type first, Trace + Math + Numbers + Phonics) -------------------- */
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
  {name:'Turbo Type',    icon:'⚡', color:'#00D1FF'},
  {name:'Number Trace',  icon:'🔢', color:'#FF9F1C'},
  {name:'Count with Zippy', icon:'🧮', color:'#4ECDC4'},
  {name:'Say the Sound', icon:'🎤', color:'#FF6B9D'},
  {name:'Add with Zippy',icon:'➕', color:'#6BCB77'},
  {name:'Take Away',     icon:'➖', color:'#FF6B6B'}
];

const SHOP_ITEMS = [
  {id:'hat1',  name:'Cool Cap',     icon:'🧢', price:30, type:'hat'},
  {id:'hat2',  name:'Magic Hat',    icon:'🎩', price:50, type:'hat'},
  {id:'hat3',  name:'Crown',        icon:'👑', price:80, type:'hat'},
  {id:'hat4',  name:'Graduation',   icon:'🎓', price:60, type:'hat'},
  {id:'acc1',  name:'Star Glasses', icon:'🤓', price:40, type:'acc'},
  {id:'acc2',  name:'Bow Tie',      icon:'🎀', price:35, type:'acc'},
  {id:'bg1',   name:'Rainbow BG',   icon:'🌈', price:45, type:'bg'},
  {id:'bg2',   name:'Space BG',     icon:'🚀', price:70, type:'bg'}
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
  {id:13,icon:'🔢', name:'Number Ninja'},
  {id:14,icon:'🧮', name:'Counting Star'},
  {id:15,icon:'🎤', name:'Phonics Star'},
  {id:16,icon:'➕', name:'Addition Star'},
  {id:17,icon:'➖', name:'Subtraction Star'},
  {id:'all', icon:'🏅', name:'Adventure Star'},
  {id:'stars', icon:'⭐', name:'Shiny Champion'}
];

const STORIES = [
  { world:1, icon:'🌲', color:'#6BCB77', en:{title:'The Magic Keyboard', text:'Zippy finds a glowing keyboard in the forest. Every key sings a letter!'}, hi:{title:'जादुई कीबोर्ड', text:'ज़िप्पी को जंगल में एक चमकता कीबोर्ड मिला। हर बटन एक अक्षर गाता है!'}, ur:{title:'جادوئی کی بورڈ', text:'زپی کو جنگل میں ایک چمکتا کی بورڈ ملا۔ ہر بٹن ایک حرف گاتا ہے!'} },
  { world:2, icon:'🏔️', color:'#FF9F1C', en:{title:'Puzzle Cave', text:'Deep in the cave, letters are jumbled. Help Zippy put them back!'}, hi:{title:'पहेली गुफा', text:'गुफा में अक्षर बिखरे हैं। ज़िप्पी की मदद करो!'}, ur:{title:'پہیلی غار', text:'غار میں حروف بکھرے ہیں۔ زپی کی مدد کریں!'} },
  { world:3, icon:'📚', color:'#4D96FF', en:{title:'Alphabet Fairy', text:'The fairy teaches big and small letters — Aa Bb Cc!'}, hi:{title:'वर्णमाला परी', text:'परी बड़े और छोटे अक्षर सिखाती है — Aa Bb Cc!'}, ur:{title:'حروف کی پری', text:'پری بڑے اور چھوٹے حروف سکھاتی ہے — Aa Bb Cc!'} },
  { world:4, icon:'🍄', color:'#9D65C9', en:{title:'Mushroom Memory', text:'Flip the cards and match the pairs with Zippy!'}, hi:{title:'मशरूम याददाश्त', text:'पत्ते पलटो और जोड़ी बनाओ!'}, ur:{title:'مشروم یادداشت', text:'پتے پلٹیں اور جوڑی بنائیں!'} },
  { world:5, icon:'🏗️', color:'#FF6B9D', en:{title:'Word Workshop', text:'Zippy builds words letter by letter — CAT, DOG, STAR!'}, hi:{title:'शब्द कार्यशाला', text:'ज़िप्पी अक्षरों से शब्द बनाता है — CAT, DOG, STAR!'}, ur:{title:'لفظ ورکشاپ', text:'زپی حروف سے الفاظ بناتا ہے — CAT, DOG, STAR!'} },
  { world:6, icon:'🚀', color:'#00D1FF', en:{title:'Turbo Tunnel', text:'Type as fast as you can — the tunnel is rushing!'}, hi:{title:'तेज़ सुरंग', text:'जितनी तेज़ हो सके टाइप करो — सुरंग तेज़ है!'}, ur:{title:'تیز سرنگ', text:'جتنی تیز ہو سکے ٹائپ کریں — سرنگ تیز ہے!'} },
  { world:7, icon:'🔢', color:'#FFD93D', en:{title:'Number Land', text:'Count stars, trace numbers — 1, 2, 3 with Zippy!'}, hi:{title:'संख्या देश', text:'तारे गिनो, नंबर लिखो — 1, 2, 3!'}, ur:{title:'نمبر لینڈ', text:'ستارے گنیں، نمبر لکھیں — 1، 2، 3!'} },
  { world:8, icon:'🎤', color:'#FF6B6B', en:{title:'Voice Stage', text:'Say the sounds out loud — the mic is listening!'}, hi:{title:'आवाज़ मंच', text:'आवाज़ बोलो — माइक सुन रहा है!'}, ur:{title:'آواز اسٹیج', text:'آواز بولیں — مائک سن رہا ہے!'} },
  { world:9, icon:'🧮', color:'#4ECDC4', en:{title:'Math Market', text:'Add and subtract with apples and stars at the market!'}, hi:{title:'गणित बाज़ार', text:'सेब और तारों से जोड़-घटाव करो!'}, ur:{title:'ریاضی بازار', text:'سیب اور ستاروں سے جمع تفریق کریں!'} }
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
    spellVoice:'🎤 Say the spelling',
    spellListening:'Listening… spell it!',
    spellHeard:'Heard',
    numberTrace:'Trace the number!',
    numberTip:'Use finger to draw',
    countTitle:'How many?',
    countHint:'Tap the correct number',
    phonicsTitle:'Say the Sound!',
    phonicsHint:'Tap mic & say the letter',
    phonicsTap:'🎤 Tap & Say',
    phonicsListening:'Listening…',
    phonicsNoMic:'Mic not available — tap to answer instead',
    mathAddTitle:'Add them!',
    mathAddHint:'How many altogether?',
    mathSubTitle:'Take away!',
    mathSubHint:'How many left?',
    streakTitle:'Daily Streak',
    streakDays:'day streak',
    streakBonus:'Bonus!',
    streakKeep:'Play tomorrow to keep it!',
    shopTitle:'Zippy Shop',
    shopHint:'Spend 🪙 to dress Zippy!',
    owned:'Owned',
    equipped:'Wearing',
    buy:'Buy',
    needCoins:'Need more 🪙',
    dailyReward:'Daily Reward',
    urduHint:'Urdu mode — same letters, Urdu voice!',
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
    spellVoice:'🎤 बोलकर बताओ',
    spellListening:'सुन रहे हैं…',
    spellHeard:'सुना',
    numberTrace:'नंबर पर लिखो!',
    numberTip:'उंगली से लिखो',
    countTitle:'कितने हैं?',
    countHint:'सही संख्या चुनो',
    phonicsTitle:'आवाज़ बोलो!',
    phonicsHint:'माइक दबाओ और बोलो',
    phonicsTap:'🎤 बोलो',
    phonicsListening:'सुन रहे हैं…',
    phonicsNoMic:'माइक नहीं — टैप करके जवाब दो',
    mathAddTitle:'जोड़ो!',
    mathAddHint:'कुल कितने?',
    mathSubTitle:'घटाओ!',
    mathSubHint:'कितने बचे?',
    streakTitle:'रोज़ का सिलसिला',
    streakDays:'दिन लगातार',
    streakBonus:'बोनस!',
    streakKeep:'कल खेलो तो जारी रहेगा!',
    shopTitle:'ज़िप्पी दुकान',
    shopHint:'🪙 से ज़िप्पी को सजाओ!',
    owned:'खरीदा',
    equipped:'पहना हुआ',
    buy:'खरीदो',
    needCoins:'और 🪙 चाहिए',
    dailyReward:'रोज़ का इनाम',
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
  },
  ur:{
    play:'کھیلیں',
    tip:'بڑا بٹن دبائیں اور مزے کریں!',
    homeBubble:'ہیلو! میں زپی ہوں! چلو A B C سیکھیں!',
    mapTitle:'ایڈونچر نقشہ',
    tap:'دبائیں!',
    typeTitle:'حرف ٹائپ کریں!',
    typeHint:'کی بورڈ پر بٹن دبائیں',
    typeHintMobile:'نیچے بٹن دبائیں',
    turboTitle:'تیز ٹائپ!',
    turboHint:'جتنی تیز ہو سکے ٹائپ کریں!',
    turboGo:'چلو!',
    turboTime:'وقت',
    turboSpeed:'رفتار',
    turboCPM:'CPM',
    turboWPM:'WPM',
    turboBest:'بہترین',
    whichLetter:'کون سا حرف؟',
    tapTheLetter:'حرف دبائیں',
    tapTheWord:'حرف دبائیں جو بناتا ہے',
    fillMissing:'کیا غائب ہے؟',
    dragMissing:'حرف کو ڈبے میں رکھیں!',
    buildWord:'لفظ بنائیں!',
    buildTap:'حروف کو ترتیب سے دبائیں!',
    pressStart:'سننے کے لیے دبائیں!',
    listenBtn:'سننے کے لیے دبائیں',
    ready:'تیار؟ چلو شروع کریں!',
    traceMe:'حرف پر لکھیں!',
    traceTip:'اپنی انگلی سے حرف پر لکھیں',
    caseMatch:'بڑا چھوٹا ملائیں!',
    caseTap:'چھوٹا حرف چنیں',
    memoryTitle:'جوڑی ڈھونڈیں!',
    memoryTap:'دو پتے پلٹیں',
    sortTitle:'ترتیب میں لگائیں!',
    sortHint:'A سے Z تک کھینچیں',
    spellTitle:'ہجے کریں!',
    spellHint:'حروف سجائیں',
    spellVoice:'🎤 ہجے بولیں',
    spellListening:'سن رہے ہیں…',
    spellHeard:'سنا',
    numberTrace:'نمبر پر لکھیں!',
    numberTip:'انگلی سے لکھیں',
    countTitle:'کتنے ہیں؟',
    countHint:'صحیح تعداد چنیں',
    phonicsTitle:'آواز بولیں!',
    phonicsHint:'مائک دبائیں اور حرف بولیں',
    phonicsTap:'🎤 بولیں',
    phonicsListening:'سن رہے ہیں…',
    phonicsNoMic:'مائک نہیں — ٹیپ کر کے جواب دیں',
    mathAddTitle:'جمع کریں!',
    mathAddHint:'کل کتنے؟',
    mathSubTitle:'تفریق کریں!',
    mathSubHint:'کتنے باقی؟',
    streakTitle:'روزانہ سلسلہ',
    streakDays:'دن مسلسل',
    streakBonus:'بونس!',
    streakKeep:'کل کھیلیں تو جاری رہے گا!',
    shopTitle:'زپی شاپ',
    shopHint:'🪙 سے زپی کو سجائیں!',
    owned:'خریدا',
    equipped:'پہنا ہوا',
    buy:'خریدیں',
    needCoins:'مزید 🪙 چاہیے',
    dailyReward:'روزانہ انعام',
    urduHint:'اردو موڈ — وہی حروف، اردو آواز!',
    praises:['شاباش!','بہت اچھے!','شاندار!','سپر!','تم ستارہ ہو!','بہت بڑھیا!','جاری رکھو!','کتنے ہوشیار ہو!'],
    tryAgain:'دوبارہ کوشش کریں، آپ قریب ہیں!',
    levelWon:'لیول جیت لیا!',
    allLetters:'آپ نے تمام 26 حروف لکھ لیے!',
    newBadge:'نیا اسٹیکر ملا!',
    starsGot:'ستارے',
    breakTitle:'تھوڑا آرام کریں!',
    breakMsg:'پانی پیئیں اور آنکھوں کو آرام دیں۔',
    breakBtn:'میں تیار ہوں!',
    parentGate:'بڑوں کے لیے! ستارہ دبا کر رکھیں…',
    wrongWord:'تقریباً صحیح! اگلا حرف دبائیں۔',
    timeUp:'وقت ختم!',
    go:'چلو!'
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
  if (UI_LANG === 'hi') return 'अक्षर ' + letter;
  if (UI_LANG === 'ur') return 'حرف ' + letter;
  return 'letter ' + letter;
}
function voiceLang(){ return UI_LANG; }